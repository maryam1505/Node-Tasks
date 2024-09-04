import express from "express";
import db from "../db.js";
import multer from "multer";
import path from "path";

const router = express.Router();

router.get("/files", (req, res) => {
  const sql = "SELECT * FROM files";
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching files:", err.message);
      return res.status(500).json({ message: "Server error" });
    }

    res.status(200).json(results);
  });
});

// Set up multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/files/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

router.post("/upload_file", upload.single("file"), (req, res) => {
  const file = req.file;

  if (!file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  const { originalname, path: filePath, size, mimetype } = file;
  const { uploaded_by } = req.body;

  const sql = `
    INSERT INTO files (file_name, file_path, file_size, file_format, uploaded_by, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
  `;

  db.query(
    sql,
    [originalname, filePath, size, mimetype, uploaded_by],
    (err, result) => {
      if (err) {
        console.error("Error inserting file data:", err.message);
        return res.status(500).json({ message: "Server error" });
      }

      res.status(201).json({ message: "File uploaded successfully", fileId: result.insertId });
    }
  );
});

router.put("update_file", upload.single("file"), (req, res) => {

});

export default router;