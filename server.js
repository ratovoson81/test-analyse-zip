const express = require("express");
const path = require("path");

const uploadRoutes = require("./routes/upload");

const app = express();
const PORT = 3000;

app.use(express.static("public"));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/extracted", express.static(path.join(__dirname, "extracted")));

app.use("/upload", uploadRoutes);

app.listen(PORT, () => {
  console.log(`✅ Server started : http://localhost:${PORT}`);
});
