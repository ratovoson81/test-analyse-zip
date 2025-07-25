const fs = require("fs");
const pdfParse = require("pdf-parse");
const path = require("path");

const pdfCache = new Map();

async function extractTextFromPDF(filePath, retries = 3) {
  const cacheKey = `${filePath}-${fs.statSync(filePath).mtime.getTime()}`;
  if (pdfCache.has(cacheKey)) return pdfCache.get(cacheKey);

  const strategies = [
    { normalizeWhitespace: false, disableCombineTextItems: false },
    { normalizeWhitespace: true, disableCombineTextItems: true },
  ];

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      if (!fs.existsSync(filePath)) throw new Error("Fichier inexistant.");
      const stats = fs.statSync(filePath);
      if (stats.size === 0) throw new Error("Fichier vide.");

      const buffer = fs.readFileSync(filePath);
      if (buffer.length === 0) throw new Error("Buffer vide.");

      for (const options of strategies) {
        try {
          const data = await pdfParse(buffer, options);
          const text = (data.text || "").trim();
          if (text.length > 0) {
            pdfCache.set(cacheKey, text);
            if (pdfCache.size > 50)
              pdfCache.delete(pdfCache.keys().next().value);
            return text;
          }
        } catch (_) {
          continue; // Essayer la stratégie suivante
        }
      }

      throw new Error("Aucune stratégie n'a réussi.");
    } catch (err) {
      if (attempt === retries) throw err;
      await new Promise((res) => setTimeout(res, 1000 * attempt)); // backoff
    }
  }
}

module.exports = {
  extractTextFromPDF,
};
