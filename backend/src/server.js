const express = require("express");
const cors = require("cors");
const { initDB } = require("./database/db");

const app = express();

app.use(cors());
app.use(express.json());
const authRoutes = require("./routes/auth.routes");
app.use("/api/auth", authRoutes);


initDB();

app.get("/api/status", (req, res) => {
  res.json({ status: "Efetivo360 API rodando 🚀 (JSON DB)" });
});

app.listen(3001, () => {
  console.log("Servidor rodando na porta 3001");
});

