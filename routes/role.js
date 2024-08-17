import express from "express";
import db from "../db.js";

const router = express.Router();

router.get("/roles", (req, res) => {
  const sql = "SELECT * FROM roles";
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching roles:", err.message);
      return res.status(500).json({ message: "Server error" });
    }

    res.status(200).json(results);
  });
});

router.post("/create_role", (req, res) => {
  const { title, description } = req.body;

  if (!title || !description) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const sql = "INSERT INTO roles (title,description) VALUES (?,?)";
  db.query(sql, [title, description], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res
      .status(201)
      .json({ message: "Role created successfully", roleId: results.insertId });
  });
});

router.delete("/delete_role/:id", (req, res) => {
  const roleId = req.params.id;

  const sql = "DELETE FROM roles WHERE id = ?";
  db.query(sql, [roleId], (err, results) => {
    if (err) {
      console.error("Error deleting role:", err.message);
      return res.status(500).json({ message: "Server error" });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ message: "Role not found" });
    }

    res.status(200).json({ message: "Role deleted successfully" });
  });
});

router.put("/update_role/:id", (req, res) => {
  const roleId = req.params.id;
  const { title, description } = req.body;

  if (!title) {
    return res.status(400).json({ error: "title is required" });
  }

  const sql = "UPDATE roles SET title = ?, description = ? WHERE id = ?";
  db.query(sql, [title, roleId, description], (err, results) => {
    if (err) {
      console.error("Error updating role:", err.message);
      return res.status(500).json({ message: "Server error" });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ message: "Role not found" });
    }

    res.status(200).json({ message: "Role updated successfully" });
  });
});

export default router;
