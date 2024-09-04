import express from "express";
import bodyParser from "body-parser";
import session from 'express-session';
import MySQLStore from 'express-mysql-session';
import db from "./db.js";
import cors from "cors";

import userRoutes from "./routes/users.js";
import userRoles from "./routes/user_role.js";
import Roles  from "./routes/role.js";
import authRoutes from "./routes/auth.js";
import Files from "./routes/files.js";


// Create a session store
const sessionStore = new MySQLStore({}, db);

const app = express();
const PORT = 5001;


// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(session({
  key: 'session_cookie_name',
  secret: 'your_session_secret',
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false },
}));

// Static files
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/auth', authRoutes);
app.use("/users", userRoutes);
app.use("/", userRoles);
app.use("/", Roles);
app.use("/", Files);

// Start the server
app.listen(PORT, () =>
  console.log(`Server running on port: http://localhost:${PORT}`)
);