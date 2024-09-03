import db from "../db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from 'dotenv';
dotenv.config();

export const login = (req, res) => {
  const { email, password } = req.body;

  const sql = "SELECT * FROM users WHERE email = ?";

  try {
    db.query(sql, [email], async (err, results) => {
      if (err) {
        return res.status(500).json({ error: "Internal server error" });
      }

      if (results.length === 0) {
        return res.status(401).json({ error: "Authentication failed" });
      }

      const user = results[0];

      const passwordMatch = await bcrypt.compare(password, user.password);

      if (!passwordMatch) {
        return res.status(401).json({ error: "Incorrect Password" });
      }

      const token = jwt.sign(
        { id: user.id, email: user.email },
        "jwtSecretKey",
        { expiresIn: "1h" }
      );

      res.json({ message: "Login successful", token });
    });
  } catch (error) {
    return res.status(500).json({ error: "An error occurred during login" });
  }
};

export const logout = (req, res) => {
  res.json({ message: "Logged out successfully!" });
};
