import db from "../db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
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

      // Fetch user roles
      const rolesQuery = `
        SELECT r.title 
        FROM roles r 
        INNER JOIN user_roles ur ON ur.role_id = r.id 
        WHERE ur.user_id = ?
      `;

      const roles = roleResults.map((role) => role.title);

      const token = jwt.sign(
        { id: user.id, email: user.email, roles },
        "jwtSecretKey",
        { expiresIn: "1h" }
      );

      // Store user information in session
      req.session.user = {
        id: user.id,
        email: user.email,
        roles,
        fullName: `${user.fname} ${user.lname}`,
        profileImage: user.image,
      };

      res.json({ message: "Login successful", token });
    });
  } catch (error) {
    return res.status(500).json({ error: "An error occurred during login" });
  }
};

export const logout = (req, res) => {
  res.json({ message: "Logged out successfully!" });
};

export const session = (req,res) => {
  if (!req.session.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const { id, email, roles, fullName, profileImage } = req.session.user;
  
  res.json({ id, email, roles, fullName, profileImage });
};