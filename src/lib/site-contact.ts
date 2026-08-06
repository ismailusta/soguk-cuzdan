export type SiteContact = {
  companyLegalName: string;
  contactEmail: string;
  contactPhone: string;
  whatsapp: string;
  supportHours: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  productOrigin: string;
};

export const DEFAULT_SITE_CONTACT: SiteContact = {
  companyLegalName: "Kriptostore LLC",
  contactEmail: "support@kriptostore.com",
  contactPhone: "",
  whatsapp: "",
  supportHours: "Pzt–Cum 10:00–18:00 (TR)",
  addressLine1: "5830 E 2ND ST, STE 7000 #37465",
  addressLine2: "",
  city: "Casper",
  state: "WY",
  postalCode: "82609",
  country: "United States",
  productOrigin:
    "Satılan ürünler orijinal donanım kripto cüzdanlarıdır (Ledger, Trezor, SafePal vb.); yetkili dağıtım kanallarından temin edilip Türkiye’ye perakende satılır.",
};

export function formatAddress(c: SiteContact): string {
  const lines = [
    c.addressLine1,
    c.addressLine2,
    [c.city, c.state, c.postalCode].filter(Boolean).join(", "),
    c.country,
  ].filter(Boolean);
  return lines.join("\n");
}

export function formatAddressOneLine(c: SiteContact): string {
  return formatAddress(c).replace(/\n/g, ", ");
}
