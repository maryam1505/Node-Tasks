import express from "express";
import db from "../db.js";
import multer from "multer";
import path from "path";

const router = express.Router();

router.get("/get", (req, res) => {
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

router.post("/upload", upload.single("file"), (req, res) => {
  const file = req.file;

  if (!file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  const { originalname, path: filePath, size, mimetype } = file;
  const { uploaded_by } = req.body;

  const sql = `
    INSERT INTO files (file_name, file_path, file_size, file_format, uploaded_by, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, NOW(), NOW())
    `;

  db.query(
    sql,
    [originalname, filePath, size, mimetype, uploaded_by],
    (err, result) => {
      if (err) {
        console.error("Error inserting file data:", err.message);
        return res.status(500).json({ message: "Server error" });
      }

      res.status(201).json({
        message: "File uploaded successfully",
        fileId: result.insertId,
      });
    }
  );
});

router.put("/update/:id", upload.single("file"), (req, res) => {
  const file = req.file;
  const { status, uploaded_by, user_id, role_id } = req.body;
  const fileId = req.params.id;

  if (file) {
    const { originalname, path: filePath, size, mimetype } = file;

    // Update file metadata
    const updateFileQuery = `
      UPDATE files
      SET file_name = ?, file_path = ?, file_size = ?, file_format = ?, uploaded_by = ?, updated_at = NOW()
      WHERE id = ?
    `;
    db.query(
      updateFileQuery,
      [originalname, filePath, size, mimetype, uploaded_by, fileId],
      (err, result) => {
        if (err) {
          console.error("Error updating file data:", err.message);
          return res.status(500).json({ message: "Server error" });
        }

        // Check if status update is needed
        if (status) {
          return handleStatusUpdate(status, fileId, user_id, role_id, res);
        }

        return res.status(200).json({ message: "File updated successfully" });
      }
    );
  } else if (status) {
    // If no file is uploaded but status is provided
    return handleStatusUpdate(status, fileId, user_id, role_id, res);
  } else {
    return res.status(400).json({ message: "No file or status provided" });
  }
});

// Helper function to handle status update
function handleStatusUpdate(status, fileId, user_id, role_id, res) {
  const updateStatusQuery = `
    UPDATE files
    SET status = ?, updated_at = NOW()
    WHERE id = ?
  `;

  db.query(updateStatusQuery, [status, fileId], (err) => {
    if (err) {
      console.error("Error updating status:", err.message);
      return res.status(500).json({ message: "Server error" });
    }

    // If status is "approved", handle approval logic
    if (status === "approved") {
      if (!user_id || !role_id) {
        return res.status(400).json({ message: "Required fields are missing" });
      }

      // Check if approval exists
      const checkApprovalQuery = `
        SELECT * FROM approvals WHERE user_id = ? AND role_id = ? AND application_id = ?
      `;
      db.query(
        checkApprovalQuery,
        [user_id, role_id, fileId],
        (err, results) => {
          if (err) {
            console.error("Error checking approvals:", err.message);
            return res.status(500).json({ message: "Server error" });
          }

          if (results.length === 0) {
            // Insert new approval if not found
            const insertApprovalQuery = `
            INSERT INTO approvals (user_id, role_id, application_id, created_at, updated_at)
            VALUES (?, ?, ?, NOW(), NOW())
          `;
            db.query(insertApprovalQuery, [user_id, role_id, fileId], (err) => {
              if (err) {
                console.error("Error inserting into approvals:", err.message);
                return res.status(500).json({ message: "Server error" });
              }
              return res
                .status(200)
                .json({ message: "File and approval updated successfully" });
            });
          } else {
            return res
              .status(200)
              .json({ message: "File updated, approval already exists" });
          }
        }
      );
    } else {
      return res
        .status(200)
        .json({ message: "File status updated successfully" });
    }
  });
}

export default router;
