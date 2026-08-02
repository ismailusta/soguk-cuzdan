import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const productsPath = join(__dirname, "..", "data", "products.json");

const pairs = [
  [/для криптовалюти/gi, ""],
  [/для криптовалют/gi, ""],
  [/холодний гаманець/gi, "soğuk cüzdan"],
  [/крипто-?\s*гаманець/gi, "soğuk cüzdan"],
  [/апаратний\s+/gi, ""],
  [/апаратни[йі]\s+/gi, ""],
  [/гаманець/gi, "cüzdan"],
  [/гаманця/gi, "cüzdan"],
  [/чохол/gi, "kılıf"],
  [/захисний\s+/gi, ""],
  [/резервна картка/gi, "yedek kart"],
  [/резервне nfc сховище/gi, "NFC yedek"],
  [/мнемонічний планшет/gi, "seed tablet"],
  [/мнемоническая пластина/gi, "seed plaka"],
  [/металлическая пластина/gi, "metal seed plaka"],
  [/металлические пластины/gi, "metal seed plakalar"],
  [/металеві пластини/gi, "metal seed plakalar"],
  [/металева капсула/gi, "metal kapsül"],
  [/метал для сід-фрази/gi, "seed metal plaka"],
  [/метал для зберігання сід-фрази/gi, "seed saklama metal plaka"],
  [/для хранения seed-фразы/gi, "seed saklama"],
  [/для зберігання сід-фрази/gi, "seed saklama"],
  [/для зберігання сід-ф/gi, "seed saklama"],
  [/сід-фраз[иі]?/gi, "seed phrase"],
  [/сід фрази/gi, "seed phrase"],
  [/seed-фразы/gi, "seed phrase"],
  [/гравірувальна ручка/gi, "gravür kalemi"],
  [/водонепроникна/gi, "su geçirmez"],
  [/водостійка/gi, "su geçirmez"],
  [/вогнестійка/gi, "ateşe dayanıklı"],
  [/оригінал/gi, "orijinal"],
  [/набір/gi, "set"],
  [/комплект/gi, "set"],
  [/чорний/gi, "siyah"],
  [/чорна/gi, "siyah"],
  [/білий/gi, "beyaz"],
  [/сірий/gi, "gri"],
  [/срібний/gi, "gümüş"],
  [/фіолетовий/gi, "mor"],
  [/зелений/gi, "yeşil"],
  [/прозорий/gi, "şeffaf"],
  [/прозора/gi, "şeffaf"],
  [/космічний чорний/gi, "cosmic black"],
  [/зіркове срібло/gi, "stellar silver"],
  [/з nfc/gi, "NFC'li"],
  [/на \d+ картки/gi, ""],
  [/капсюл[аи]/gi, "kapsül"],
  [/капсула/gi, "kapsül"],
  [/шкіряний/gi, "deri"],
  [/алюмінієвий картхолдер гаманець для карток і грошей із захистом rfid/gi, "RFID alüminyum kartlık cüzdan"],
  [/тонкий текстурований шкіряний картхолдер-гаманець для карток/gi, "İnce dokulu deri kartlık cüzdan"],
  [/тонкий шкіряний картхолдер-гаманець для карток та грошей, rfid захищений/gi, "İnce deri RFID kartlık cüzdan"],
  [/шкіряний картхолдер-гаманець для карток та грошей, rfid захищений, з відділом для airtag/gi, "AirTag'li deri RFID kartlık cüzdan"],
  [/для карток та грошей/gi, ""],
  [/rfid захищений/gi, "RFID korumalı"],
  [/із захистом rfid/gi, "RFID korumalı"],
  [/з відділом для airtag/gi, "AirTag bölmeli"],
  [/безпечне зберігання к.*/gi, "güvenli saklama"],
  [/сенсорний апаратни.*/gi, "dokunmatik"],
  [/сенсорний екран/gi, "dokunmatik ekran"],
  [/без логотипу/gi, "logosuz"],
  [/слів/gi, "kelime"],
  [/слова/gi, "kelime"],
  [/уцінка/gi, "indirimli"],
  [/для відновлення/gi, "kurtarma için"],
  [/відновлення/gi, "kurtarma"],
  [/для ключа/gi, "anahtar için"],
  [/для нанесення/gi, ""],
  [/тексту та познач.*/gi, ""],
  [/з автоматич.*/gi, ""],
  [/з гравировальной ручкой/gi, "gravür kalemli"],
  [/з гравірувальною ручкою/gi, "gravür kalemli"],
  [/кріпёжный болт/gi, "montaj cıvatalı"],
  [/крепёжный болт/gi, "montaj cıvatalı"],
  [/штуки/gi, "adet"],
  [/шт\b/gi, "adet"],
  [/для ledger/gi, "Ledger için"],
  [/для safepal/gi, "SafePal için"],
  [/для trezor/gi, "Trezor için"],
  [/для tangem/gi, "Tangem için"],
  [/для відбивання.*/gi, "seed damgalama için"],
  [/нумерацією/gi, "numaralı"],
  [/нержавіючих металевих шайб/gi, "paslanmaz metal pul"],
  [/набір із/gi, "set"],
  [/набір металевих буквених штампів.*/gi, "Seed phrase metal damga seti"],
  [/титановий набір для сід-фрази/gi, "Titanyum seed phrase seti"],
  [/з м.*/gi, ""],
];

const colorMap = {
  "pastel pink": "Pastel Pink",
  "matte black": "Matte Black",
  "onyx black": "Onyx Black",
  "cosmic purple": "Cosmic Purple",
  "emerald green": "Emerald Green",
  "matcha green": "Matcha Green",
  "oxidate green": "Oxidate Green",
  "cherry red": "Cherry Red",
  "ferro fuchsia": "Ferro Fuchsia",
  "midnight black": "Midnight Black",
  "polar white": "Polar White",
};

function cleanTitle(raw) {
  let t = String(raw || "").trim();
  for (const [re, to] of pairs) t = t.replace(re, to);
  // Cyrillic leftovers → drop parenthetical cyrillic color notes often duplicated
  t = t.replace(/\([^)]*[А-Яа-яІіЇїЄєЁёҐґ][^)]*\)/g, "");
  // Remove remaining cyrillic words
  t = t.replace(/[А-Яа-яІіЇїЄєЁёҐґ]+/g, " ");
  t = t.replace(/\s+/g, " ").replace(/\s*[-–,]\s*/g, " — ").replace(/[—\s]+$/g, "").trim();
  t = t.replace(/^—\s*/, "").replace(/\s*—\s*$/, "").trim();
  // Capitalize first letter
  if (t) t = t.charAt(0).toUpperCase() + t.slice(1);
  return t || raw;
}

function toEnglishName(name, brand) {
  // Model names are mostly EN already after cleanup
  let en = name
    .replace(/soğuk cüzdan/gi, "cold wallet")
    .replace(/kılıf/gi, "case")
    .replace(/yedek kart/gi, "backup card")
    .replace(/seed tablet/gi, "seed tablet")
    .replace(/seed plaka/gi, "seed plate")
    .replace(/metal seed plaka/gi, "metal seed plate")
    .replace(/metal kapsül/gi, "metal capsule")
    .replace(/gravür kalemi/gi, "engraving pen")
    .replace(/siyah/gi, "black")
    .replace(/beyaz/gi, "white")
    .replace(/gri/gi, "gray")
    .replace(/gümüş/gi, "silver")
    .replace(/mor/gi, "purple")
    .replace(/yeşil/gi, "green")
    .replace(/şeffaf/gi, "transparent")
    .replace(/orijinal/gi, "original")
    .replace(/set/gi, "set")
    .replace(/deri/gi, "leather")
    .replace(/kartlık cüzdan/gi, "cardholder wallet")
    .replace(/su geçirmez/gi, "waterproof")
    .replace(/ateşe dayanıklı/gi, "fireproof")
    .replace(/indirimli/gi, "discounted")
    .replace(/logosuz/gi, "no logo")
    .replace(/kelime/gi, "words")
    .replace(/için/gi, "for");
  en = en.replace(/\s+/g, " ").trim();
  return en || `${brand} product`;
}

function trDescription(name, brand) {
  return `${name} — ${brand} soğuk cüzdan / aksesuar. Türkiye teslimatı, ödeme Cryptomus ile kripto üzerinden.`;
}

function enDescription(nameEn, brand) {
  return `${nameEn} — ${brand} cold wallet / accessory. Ships in Turkey. Pay with crypto via Cryptomus.`;
}

const products = JSON.parse(readFileSync(productsPath, "utf-8"));

for (const p of products) {
  const nameTr = cleanTitle(p.name);
  p.name = nameTr;
  p.nameEn = toEnglishName(nameTr, p.brand);
  p.shortDescription = `${p.brand} soğuk cüzdan / aksesuar`;
  p.shortDescriptionEn = `${p.brand} cold wallet / accessory`;
  p.description = trDescription(nameTr, p.brand);
  p.descriptionEn = enDescription(p.nameEn, p.brand);
  p.features = ["Donanım cüzdan kategorisi", p.brand, p.inStock ? "Stokta" : "Stok yok"];
  p.featuresEn = ["Hardware wallet category", p.brand, p.inStock ? "In stock" : "Out of stock"];
}

writeFileSync(productsPath, JSON.stringify(products, null, 2) + "\n");
console.log("Translated", products.length, "products → TR + EN fields");
console.log("Samples:");
for (const p of products.slice(0, 8)) {
  console.log(" TR:", p.name);
  console.log(" EN:", p.nameEn);
}
