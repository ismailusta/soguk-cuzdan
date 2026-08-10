import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getPayloadClient } from "@/lib/payload";
import { CUSTOMER_COOKIE, mapCustomer } from "@/lib/customer-auth";
import {
  customerAlreadyReviewed,
  customerPurchasedProduct,
  getApprovedReviewsForProduct,
  summarizeReviews,
} from "@/lib/reviews";

async function getCustomer() {
  const jar = await cookies();
  const token = jar.get(CUSTOMER_COOKIE)?.value;
  if (!token) return null;

  const payload = await getPayloadClient();
  const { user } = await payload.auth({
    headers: new Headers({
      Authorization: `JWT ${token}`,
    }),
  });

  if (!user || user.collection !== "customers") return null;
  return user;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");
    if (!productId) {
      return NextResponse.json({ error: "productId gerekli." }, { status: 400 });
    }

    const reviews = await getApprovedReviewsForProduct(productId);
    const summary = summarizeReviews(reviews);

    let canReview = false;
    let alreadyReviewed = false;
    let loggedIn = false;

    const user = await getCustomer();
    if (user) {
      loggedIn = true;
      alreadyReviewed = await customerAlreadyReviewed(user.id, productId);
      const purchased = await customerPurchasedProduct(
        { id: user.id, email: user.email },
        productId
      );
      canReview = purchased && !alreadyReviewed;
    }

    return NextResponse.json({
      reviews,
      summary,
      canReview,
      alreadyReviewed,
      loggedIn,
      user: user ? mapCustomer(user as never) : null,
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Değerlendirmeler alınamadı.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCustomer();
    if (!user) {
      return NextResponse.json(
        { error: "Yorum için giriş yapmalısınız." },
        { status: 401 }
      );
    }

    const body = (await request.json()) as {
      productId?: string | number;
      rating?: number;
      title?: string;
      body?: string;
      authorName?: string;
      locale?: string;
    };

    const productId = body.productId;
    const rating = Number(body.rating);
    const text = String(body.body || "").trim();
    const title = String(body.title || "").trim().slice(0, 120);
    const authorName = String(
      body.authorName || user.name || user.email.split("@")[0] || "Müşteri"
    )
      .trim()
      .slice(0, 80);
    const locale = body.locale === "en" ? "en" : "tr";

    if (!productId) {
      return NextResponse.json({ error: "productId gerekli." }, { status: 400 });
    }
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Puan 1–5 arasında olmalı." },
        { status: 400 }
      );
    }
    if (text.length < 10) {
      return NextResponse.json(
        { error: "Yorum en az 10 karakter olmalı." },
        { status: 400 }
      );
    }
    if (text.length > 2000) {
      return NextResponse.json(
        { error: "Yorum en fazla 2000 karakter olabilir." },
        { status: 400 }
      );
    }

    const purchased = await customerPurchasedProduct(
      { id: user.id, email: user.email },
      productId
    );
    if (!purchased) {
      return NextResponse.json(
        {
          error:
            "Yalnızca bu ürünü satın almış hesaplar değerlendirme yazabilir.",
        },
        { status: 403 }
      );
    }

    if (await customerAlreadyReviewed(user.id, productId)) {
      return NextResponse.json(
        { error: "Bu ürün için zaten bir değerlendirmeniz var." },
        { status: 409 }
      );
    }

    const payload = await getPayloadClient();
    const numericId = Number(productId);
    const product = await payload.findByID({
      collection: "products",
      id: numericId,
      depth: 0,
      overrideAccess: true,
    });
    if (!product) {
      return NextResponse.json({ error: "Ürün bulunamadı." }, { status: 404 });
    }

    const doc = await payload.create({
      collection: "product-reviews",
      data: {
        product: numericId,
        rating,
        title: title || undefined,
        body: text,
        authorName,
        customer: user.id,
        status: "pending",
        source: "user",
        locale,
        verifiedPurchase: true,
      },
      overrideAccess: true,
    });

    return NextResponse.json({
      ok: true,
      id: doc.id,
      status: doc.status,
      message: "Değerlendirmeniz alındı; onay sonrası yayınlanır.",
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Değerlendirme kaydedilemedi.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
