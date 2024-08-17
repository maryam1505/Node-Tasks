import express from "express";
import db from "../db.js";

const router = express.Router();

router.post("/create", (req, res) => {
  const {
    fname,
    lname,
    guardian,
    dob,
    age,
    designation,
    department,
    image,
    country,
    city,
    address,
  } = req.body;

  if (
    !fname ||
    !lname ||
    !dob ||
    !designation ||
    !department ||
    !guardian ||
    !age ||
    !image ||
    !country ||
    !city ||
    !address
  ) {
    return res.status(400).json({ message: "Required fields are missing" });
  }

  const sqlQuery = `
    INSERT INTO users 
    (fname, lname, guardian, dob, age, designation, department, image, country, city, address, created_at, updated_at) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
  `;

  const values = [
    fname,
    lname,
    guardian,
    dob,
    age,
    designation,
    department,
    image,
    country,
    city,
    address,
  ];

  db.query(sqlQuery, values, (err, results) => {
    if (err) {
      console.error("Error inserting employee:", err.message);
      return res.status(500).json({ message: "Server error" });
    }

    res
      .status(201)
      .json({ message: "User added successfully", userId: results.insertId });
  });
});

router.get("/get", (req, res) => {
  const sqlQuery = "SELECT * FROM users";

  db.query(sqlQuery, (err, results) => {
    if (err) {
      console.error("Error fetching users:", err.message);
      return res.status(500).json({ message: "Server error" });
    }

    res.status(200).json(results);
  });
});

router.put("/update/:id", (req, res) => {
  const userId = req.params.id;
  const {
    fname,
    lname,
    guardian,
    dob,
    age,
    designation,
    department,
    image,
    country,
    city,
    address,
  } = req.body;

  if (
    !fname ||
    !lname ||
    !dob ||
    !designation ||
    !department ||
    !guardian ||
    !age ||
    !image ||
    !country ||
    !city ||
    !address
  ) {
    return res.status(400).json({ message: "Required fields are missing" });
  }

  const sqlQuery = `
    UPDATE users
    SET fname = ?, lname = ?, guardian = ?, dob = ?, age = ?, designation = ?, department = ?, image = ?, country = ?, city = ?, address = ?, updated_at = NOW()
    WHERE id = ?
  `;

  const values = [
    fname,
    lname,
    guardian,
    dob,
    age,
    designation,
    department,
    image,
    country,
    city,
    address,
    userId,
  ];

  db.query(sqlQuery, values, (err, results) => {
    if (err) {
      console.error("Error updating user:", err.message);
      return res.status(500).json({ message: "Server error" });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User updated successfully" });
  });
});

router.delete("/delete/:id", (req, res) => {
  const userId = req.params.id;

  const sqlQuery = "DELETE FROM users WHERE id = ?";

  db.query(sqlQuery, [userId], (err, results) => {
    if (err) {
      console.error("Error deleting user:", err.message);
      return res.status(500).json({ message: "Server error" });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User deleted successfully" });
  });
});

export default router;
