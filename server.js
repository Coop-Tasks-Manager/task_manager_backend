require("dotenv").config();
const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);

app.listen(5000, () => {
  console.log("Server running on port 5000");
});


const teamRoutes = require("./routes/team.routes");

app.use("/api/teams", teamRoutes);
const boardRoutes = require("./routes/board.routes");

app.use("/api/boards", boardRoutes);
const taskRoutes = require("./routes/task.routes");

app.use("/api/tasks", taskRoutes);
