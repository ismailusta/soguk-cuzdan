import { postgresAdapter } from "@payloadcms/db-postgres";
import { nodemailerAdapter } from "@payloadcms/email-nodemailer";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { en } from "@payloadcms/translations/languages/en";
import { tr } from "@payloadcms/translations/languages/tr";
import path from "path";
import { buildConfig } from "payload";
import { fileURLToPath } from "url";
import sharp from "sharp";

import { Media } from "./collections/Media";
import { Customers } from "./collections/Customers";
import { HeroBanners } from "./collections/HeroBanners";
import { Orders } from "./collections/Orders";
import { Products } from "./collections/Products";
import { Users } from "./collections/Users";
import { SiteSettings } from "./globals/SiteSettings";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const payloadSecret = process.env.PAYLOAD_SECRET?.trim();
if (!payloadSecret) {
  throw new Error(
    "PAYLOAD_SECRET tanımlı olmalı (.env). Üretimde uzun rastgele bir değer kullanın."
  );
}
if (
  process.env.NODE_ENV === "production" &&
  (payloadSecret.length < 32 ||
    payloadSecret === "change-me-to-a-long-random-string")
) {
  throw new Error(
    "Üretimde PAYLOAD_SECRET en az 32 karakter olmalı ve varsayılan değeri kullanmamalı."
  );
}

function resolveDatabaseUrl(): string {
  const raw =
    process.env.DATABASE_URL ||
    "postgresql://postgres:postgres@localhost:5432/soguk_payload";
  // Supabase pooler + Node pg: avoid SELF_SIGNED_CERT_IN_CHAIN
  if (/supabase\.com/i.test(raw) && !/[?&]sslmode=/i.test(raw)) {
    return `${raw}${raw.includes("?") ? "&" : "?"}sslmode=no-verify`;
  }
  return raw;
}

const databaseUrl = resolveDatabaseUrl();
const isSupabase = /supabase\.com/i.test(databaseUrl);

const smtpUser = process.env.SMTP_USER?.trim() || "support@kriptostore.com";
const smtpPass = process.env.SMTP_PASS?.trim();
const smtpHost = process.env.SMTP_HOST?.trim() || "smtp.hostinger.com";
const smtpPort = Number(process.env.SMTP_PORT || "465");
const smtpFrom = process.env.SMTP_FROM?.trim() || smtpUser;

const email = smtpPass
  ? await nodemailerAdapter({
      defaultFromAddress: smtpFrom,
      defaultFromName: "Kriptostore",
      skipVerify: process.env.SMTP_SKIP_VERIFY === "true",
      transportOptions: {
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      },
    })
  : undefined;

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    meta: {
      titleSuffix: "· Kriptostore",
    },
  },
  collections: [Users, Customers, Media, Products, Orders, HeroBanners],
  globals: [SiteSettings],
  editor: lexicalEditor(),
  secret: payloadSecret,
  ...(email ? { email } : {}),
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
  db: postgresAdapter({
    pool: {
      connectionString: databaseUrl,
      ...(isSupabase ||
      process.env.NODE_ENV === "production" ||
      process.env.DATABASE_SSL === "true"
        ? { ssl: { rejectUnauthorized: false } }
        : {}),
    },
    // Create/update tables on boot (needed for first Supabase deploy).
    // Set PAYLOAD_DATABASE_PUSH=false later once migrations are in place.
    push: process.env.PAYLOAD_DATABASE_PUSH !== "false",
  }),
  sharp,
  // Admin panel UI language (Account → Language)
  i18n: {
    supportedLanguages: { tr, en },
    fallbackLanguage: "tr",
  },
  // Content locales — TR/EN switcher in document edit view
  localization: {
    locales: [
      { label: { tr: "Türkçe", en: "Turkish" }, code: "tr" },
      { label: { tr: "İngilizce", en: "English" }, code: "en" },
    ],
    defaultLocale: "tr",
    fallback: true,
  },
});
