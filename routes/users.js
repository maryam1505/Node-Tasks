import express from "express";
import db from "../db.js";
import multer from 'multer';
import path from 'path';
import bcrypt from 'bcryptjs';

const router = express.Router();

// Set up multer for handling file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); 
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + "_" +  Date.now() + path.extname(file.originalname)); 
  },
});

const upload = multer({ storage });


// Creating a user
router.post("/create",  upload.single('image'), async (req, res) => {
  
  const {
    fname,
    lname,
    guardian,
    dob,
    age,
    designation,
    department,
    country,
    city,
    address,
    email,
    password,
  } = req.body;

  if (
    !fname ||
    !lname ||
    !dob ||
    !designation ||
    !department ||
    !guardian ||
    !age ||
    !req.file ||
    !country ||
    !city ||
    !address ||
    !email ||
    !password
  ) {
    return res.status(400).json({ message: "Required fields are missing" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const image = req.file.filename;

  const sqlQuery = `
    INSERT INTO users 
    (fname, lname, guardian, dob, age, designation, department, image, country, city, address, email, password, created_at, updated_at) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?, NOW(), NOW())
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
    email,
    hashedPassword,
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


// Getting all users
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

// Getting user by id
router.get("/get/:id", (req, res) => {
  const userId = req.params.id; 
  const sqlQuery = "SELECT * FROM users WHERE id = ?"; 

  db.query(sqlQuery, [userId], (err, results) => {
    if (err) {
      console.error("Error fetching user:", err.message);
      return res.status(500).json({ message: "Server error" });
    }

    // Check if a user was found
    if (results.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(results[0]); 
  });
});

router.put("/update/:id", upload.single('image'), async (req, res) => {
  const userId = req.params.id;
  const {
    fname,
    lname,
    guardian,
    dob,
    age,
    designation,
    department,
    country,
    city,
    address,
    email,
    password,
  } = req.body;
  
  const image = req.file ? req.file.filename : req.body.existingImage;


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
    !address ||
    !email 
  ) {
    return res.status(400).json({ message: "Required fields are missing" });
  }

  let sqlQuery = `
    UPDATE users
    SET fname = ?, lname = ?, guardian = ?, dob = ?, age = ?, designation = ?, department = ?, image = ?, country = ?, city = ?, address = ?, email = ?, updated_at = NOW()
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

  if (password) {
    const hashedPassword = await bcrypt.hash(password, 10);
    sqlQuery += `, password = ?`;
    values.splice(values.length - 1, 0, hashedPassword); 
  }

  sqlQuery += ` WHERE id = ?`;

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