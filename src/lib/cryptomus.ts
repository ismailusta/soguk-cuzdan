import { createHash } from "crypto";

const API_URL = "https://api.cryptomus.com/v1/payment";

function getConfig() {
  const merchant = process.env.CRYPTOMUS_MERCHANT_ID;
  const apiKey = process.env.CRYPTOMUS_PAYMENT_API_KEY;
  if (!merchant || !apiKey) {
    throw new Error(
      "CRYPTOMUS_MERCHANT_ID ve CRYPTOMUS_PAYMENT_API_KEY tanımlı olmalı."
    );
  }
  return { merchant, apiKey };
}

export function signBody(body: string, apiKey: string): string {
  const base64 = Buffer.from(body).toString("base64");
  return createHash("md5").update(base64 + apiKey).digest("hex");
}

/** Cryptomus webhook: MD5(base64(jsonWithoutSign) + apiKey), slash-escaped JSON */
export function verifyWebhookSign(
  payload: Record<string, unknown>,
  apiKey: string
): boolean {
  const received = payload.sign;
  if (typeof received !== "string") return false;

  const clone: Record<string, unknown> = { ...payload };
  delete clone.sign;

  const variants = [
    JSON.stringify(clone).replace(/\//g, "\\/"),
    JSON.stringify(clone),
  ];

  return variants.some((body) => signBody(body, apiKey) === received);
}

export type CreateInvoiceParams = {
  amount: string;
  currency: string;
  orderId: string;
  urlReturn: string;
  urlSuccess: string;
  urlCallback: string;
};

export type CryptomusInvoiceResult = {
  uuid: string;
  url: string;
  order_id: string;
};

type CryptomusResponse = {
  state: number;
  result?: {
    uuid: string;
    url: string;
    order_id: string;
  };
  message?: string;
  errors?: unknown;
};

export async function createInvoice(
  params: CreateInvoiceParams
): Promise<CryptomusInvoiceResult> {
  const { merchant, apiKey } = getConfig();

  const payload = {
    amount: params.amount,
    currency: params.currency,
    order_id: params.orderId,
    url_return: params.urlReturn,
    url_success: params.urlSuccess,
    url_callback: params.urlCallback,
    is_payment_multiple: false,
    lifetime: 3600,
  };

  const body = JSON.stringify(payload);
  const sign = signBody(body, apiKey);

  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      merchant,
      sign,
    },
    body,
  });

  const data = (await res.json()) as CryptomusResponse;

  if (!res.ok || data.state !== 0 || !data.result) {
    throw new Error(
      data.message ||
        `Cryptomus invoice oluşturulamadı (HTTP ${res.status}).`
    );
  }

  return {
    uuid: data.result.uuid,
    url: data.result.url,
    order_id: data.result.order_id,
  };
}
