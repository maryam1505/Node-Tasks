import express from "express";
import bodyParser from "body-parser";
import userRoutes from "./routes/users.js";
import userRoles from "./routes/user_role.js";
import Roles  from "./routes/role.js";
import cors from "cors";

const app = express();
const PORT = 5001;

app.use(cors());
app.use(bodyParser.json());
app.use("/users", userRoutes);
app.use("/", userRoles);
app.use("/", Roles);
app.use('/uploads', express.static('uploads'));


app.listen(PORT, () =>
  console.log(`Server running on port: http://localhost:${PORT}`)
);
