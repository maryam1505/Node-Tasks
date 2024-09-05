import db from "../db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export const login = (req, res) => {
  const { email, password } = req.body;
  const sql = "SELECT * FROM users WHERE email = ?";

  // Query to find user by email
  db.query(sql, [email], async (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Internal server error" });
    }

    // If no user found with the provided email
    if (results.length === 0) {
      return res.status(401).json({ error: "Authentication failed" });
    }

    const user = results[0];

    try {
      // Compare the provided password with the hashed password in the database
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return res.status(401).json({ error: "Incorrect Password" });
      }

      const rolesQuery = `
        SELECT r.id as role_id, r.title as role_title 
        FROM roles r 
        INNER JOIN user_roles ur ON ur.role_id = r.id 
        WHERE ur.user_id = ?
      `;

      db.query(rolesQuery, [user.id], (roleErr, roleResults) => {
        if (roleErr) {
          return res.status(500).json({ error: "Error fetching roles" });
        }

        // const roles = roleResults.map((role) => role.title);
        const roles = roleResults.map((role) => ({
          id: role.role_id,
          title: role.role_title
        }));

        // Generate JWT with user info and roles
        const token = jwt.sign(
          { id: user.id, email: user.email, roles },
          "jwtSecretKey",
          { expiresIn: "1h" }
        );

        // Send token to client
        res.json({ message: "Login successful", token });
      });
    } catch (error) {
      return res.status(500).json({ error: "An error occurred during login" });
    }
  });
};


export const logout = (req, res) => {
  res.json({ message: "Logged out successfully!" });
};

// export const session = (req,res) => {
//   if (!req.session.user) {
//     return res.status(401).json({ message: 'Unauthorized' });
//   }

//   const { id, email, roles, fullName, profileImage } = req.session.user;

//   res.json({ id, email, roles, fullName, profileImage });
// };
