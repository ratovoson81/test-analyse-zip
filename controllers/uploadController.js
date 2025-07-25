const fs = require("fs");
const path = require("path");
const unzipper = require("unzipper");
const dayjs = require("dayjs");

const { extractTextFromPDF } = require("../utils/pdfUtils");
const REQUIREMENTS = require("../constants/requirements").requiredDocs;

function parseDateFromText(text) {
  const match = text.match(
    /(valide|valable) jusqu['’]au (\d{2}\/\d{2}\/\d{4})/i
  );
  return match ? dayjs(match[2], "DD/MM/YYYY") : null;
}

async function processFilesSequentially(files, extractPath, requirements) {
  const now = dayjs();
  const result = {};

  for (const [key, label] of Object.entries(requirements)) {
    console.log(`🔍 Traitement de: ${label}`);

    try {
      const file = files.find((f) => f.toLowerCase().includes(key));
      if (!file) {
        result[label] = { status: "manquant" };
        continue;
      }

      const filePath = path.join(extractPath, file);
      if (path.extname(filePath).toLowerCase() !== ".pdf") {
        result[label] = { status: "not_pdf" };
        continue;
      }

      const text = await extractTextFromPDF(filePath);
      if (!text || text.trim().length === 0) {
        result[label] = { status: "empty_or_unreadable" };
        continue;
      }

      if (key === "dc1") {
        result[label] = { status: "valide" };
        continue;
      }

      if (key === "note_interne") {
        result[label] = { status: "valide" };
        continue;
      }

      const date = parseDateFromText(text);
      if (date) {
        result[label] = {
          status: date.isBefore(now) ? "expiré" : "valide",
          validUntil: date.format("YYYY-MM-DD"),
        };
      } else {
        result[label] = { status: "date_not_found" };
      }
    } catch (err) {
      result[label] = { status: "error", error: err.message };
    }
  }

  return result;
}

exports.handleUpload = async (req, res) => {
  const zipPath = req.file.path;
  const extractPath = path.join(__dirname, "../extracted");

  try {
    if (!fs.existsSync(extractPath)) fs.mkdirSync(extractPath);

    // Clean extract dir
    for (const file of fs.readdirSync(extractPath)) {
      fs.unlinkSync(path.join(extractPath, file));
    }

    // Extract zip
    await new Promise((resolve, reject) => {
      fs.createReadStream(zipPath)
        .pipe(unzipper.Extract({ path: extractPath }))
        .on("close", resolve)
        .on("error", reject);
    });

    const files = fs.readdirSync(extractPath);
    if (files.length === 0) {
      return res
        .status(400)
        .json({ error: "Aucun fichier trouvé dans le ZIP" });
    }

    const result = await processFilesSequentially(
      files,
      extractPath,
      REQUIREMENTS
    );
    res.json(result);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Erreur lors du traitement", details: error.message });
  } finally {
    try {
      fs.unlinkSync(zipPath);
    } catch (err) {
      console.warn(
        "Impossible de supprimer le fichier ZIP temporaire :",
        err.message
      );
    }
  }
};
