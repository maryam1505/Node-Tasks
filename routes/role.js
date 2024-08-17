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
  const { role_name } = req.body;

  if (!role_name) {
    return res.status(400).json({ error: "role_name is required" });
  }

  const sql = "INSERT INTO roles (role_name) VALUES (?)";
  db.query(sql, [role_name], (err, results) => {
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
  const { role_name } = req.body;

  if (!role_name) {
    return res.status(400).json({ error: "role_name is required" });
  }

  const sql = "UPDATE roles SET role_name = ? WHERE id = ?";
  db.query(sql, [role_name, roleId], (err, results) => {
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
