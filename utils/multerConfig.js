const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const destPath = path.join(__dirname, "..", "public", "images");
    console.log("Saving file to:", destPath);
    cb(null, destPath);
  },
  filename: (req, file, cb) => {
    const filename = `${file.fieldname}-${Date.now()}${path.extname(
      file.originalname
    )}`;
    console.log("Filename:", filename);
    cb(null, filename);
  },
});

const upload = multer({ storage: storage });

module.exports = upload;
