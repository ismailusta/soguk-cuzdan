import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { describe, it } from "node:test";
import { signBody, verifyWebhookSign } from "../lib/cryptomus";
import { rateLimit } from "../lib/rate-limit";

describe("cryptomus webhook sign", () => {
  it("accepts a valid signature", () => {
    const apiKey = "test-api-key";
    const payload: Record<string, unknown> = {
      order_id: "SC-abc",
      status: "paid",
      amount: "100.00",
    };
    const body = JSON.stringify(payload).replace(/\//g, "\\/");
    const sign = signBody(body, apiKey);
    assert.equal(verifyWebhookSign({ ...payload, sign }, apiKey), true);
  });

  it("rejects a bad signature", () => {
    assert.equal(
      verifyWebhookSign(
        { order_id: "x", status: "paid", sign: "deadbeef" },
        "key"
      ),
      false
    );
  });

  it("signBody is stable md5(base64+key)", () => {
    const body = '{"a":1}';
    const key = "k";
    const expected = createHash("md5")
      .update(Buffer.from(body).toString("base64") + key)
      .digest("hex");
    assert.equal(signBody(body, key), expected);
  });
});

describe("rateLimit", () => {
  it("allows then blocks", () => {
    const key = `test-${Date.now()}-${Math.random()}`;
    assert.equal(rateLimit(key, 2, 60_000).ok, true);
    assert.equal(rateLimit(key, 2, 60_000).ok, true);
    assert.equal(rateLimit(key, 2, 60_000).ok, false);
  });
});
