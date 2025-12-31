require("dotenv").config();
const express = require("express");
const cors = require("cors");


const app = express();

//app.use(cors());
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://your-frontend.onrender.com",
    ],
    credentials: true,
  })
);

app.use(express.json());

const authRoutes = require("./routes/auth.routes");
app.use("/api/auth", authRoutes);

app.listen(5000, () => {
  console.log("Server running on port 5000");
});


const teamRoutes = require("./routes/team.routes");

app.use("/api/teams", teamRoutes);
const boardRoutes = require("./routes/board.routes");
app.use("/api/boards", boardRoutes);
const taskRoutes = require("./routes/task.routes");


app.use("/api/teams", teamRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/boards", require("./routes/board.routes"));

