// Generates the QR code that customers scan at the table.
// Usage: node scripts/generate-qr.mjs https://your-restaurant.vercel.app/menu
import QRCode from "qrcode";
import path from "node:path";

const url = process.argv[2];

if (!url) {
  console.error("Usage: node scripts/generate-qr.mjs <menu-url> [output-file]");
  console.error("Example: node scripts/generate-qr.mjs https://your-restaurant.vercel.app/menu");
  process.exit(1);
}

const outputFile = process.argv[3] ?? path.join("public", "menu-qr.png");

await QRCode.toFile(outputFile, url, {
  width: 1024,
  margin: 2,
  color: { dark: "#000000", light: "#ffffff" },
});

console.log(`QR code for ${url} saved to ${outputFile}`);
