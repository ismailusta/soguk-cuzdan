import { postgresAdapter } from "@payloadcms/db-postgres";
import { nodemailerAdapter } from "@payloadcms/email-nodemailer";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { s3Storage } from "@payloadcms/storage-s3";
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

const s3Bucket = process.env.S3_BUCKET?.trim();
const s3AccessKeyId = process.env.S3_ACCESS_KEY_ID?.trim();
const s3SecretAccessKey = process.env.S3_SECRET_ACCESS_KEY?.trim();
const s3Endpoint = process.env.S3_ENDPOINT?.trim();
const s3Region = process.env.S3_REGION?.trim() || "eu-west-2";
const s3PublicUrl = process.env.S3_PUBLIC_URL?.trim()?.replace(/\/$/, "");
const s3Enabled = Boolean(
  s3Bucket && s3AccessKeyId && s3SecretAccessKey && s3Endpoint
);

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
  // Server-path uploads (fallback). Client uploads bypass Hostinger body limits.
  upload: {
    abortOnLimit: true,
    limits: {
      fileSize: 50 * 1024 * 1024, // 50MB
    },
    uploadTimeout: 120_000,
    useTempFiles: true,
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
  plugins: [
    s3Storage({
      enabled: s3Enabled,
      // Browser → S3 directly (Hostinger/proxy body limits kill ~10MB+ videos).
      // Bucket CORS must allow PUT from the admin origin.
      clientUploads: true,
      collections: {
        media: s3PublicUrl
          ? {
              disablePayloadAccessControl: true,
              generateFileURL: ({ filename, prefix }) => {
                if (!filename) return "";
                const key = prefix ? `${prefix}/${filename}` : filename;
                return `${s3PublicUrl}/${key}`;
              },
            }
          : true,
      },
      bucket: s3Bucket || "media",
      config: {
        credentials: {
          accessKeyId: s3AccessKeyId || "",
          secretAccessKey: s3SecretAccessKey || "",
        },
        region: s3Region,
        endpoint: s3Endpoint,
        forcePathStyle: process.env.S3_FORCE_PATH_STYLE !== "false",
      },
    }),
  ],
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
