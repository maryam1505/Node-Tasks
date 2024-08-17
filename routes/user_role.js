import express from "express";
import db from "../db.js";

const router = express.Router();

router.post("/assign_UserRole", (req, res) => {
  const { userId, roleId } = req.body;

  if (!userId || !roleId) {
    return res.status(400).json({ error: "userId and roleId are required" });
  }

  const sql = "INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)";
  db.query(sql, [userId, roleId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ message: "Role assigned successfully" });
  });
});

router.delete("/delete_UserRole", (req, res) => {
  const { userId, roleId } = req.body;

  if (!userId || !roleId) {
    return res.status(400).json({ error: "userId and roleId are required" });
  }

  const sql = "DELETE FROM user_roles WHERE user_id = ? AND role_id = ?";
  db.query(sql, [userId, roleId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(200).json({ message: "Role removed successfully" });
  });
});

router.get('/get_UserRoles/:userId', (req, res) => {
  const userId = req.params.userId;

  const sql = `
    SELECT roles.role_name
    FROM user_roles
    JOIN roles ON user_roles.role_id = roles.id
    WHERE user_roles.user_id = ?
  `;
  db.query(sql, [userId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(200).json(results);
  });
});
export default router;