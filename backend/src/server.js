const express = require("express");
const cors = require("cors");
const path = require("path");
const { initDB } = require("./database/db");

const app = express();
const PORT = process.env.PORT || 3001;
const CORS_ORIGINS = process.env.CORS_ORIGINS;

const corsOptions = CORS_ORIGINS
  ? {
      origin: CORS_ORIGINS.split(",").map(origin => origin.trim())
    }
  : true;

app.use(cors(corsOptions));
app.use(express.json());

const authRoutes = require("./routes/auth.routes");
const apiIndexRoutes = require("./routes/index");

app.use("/api", apiIndexRoutes);
app.use("/api/auth", authRoutes);

initDB();

app.get("/api/status", (req, res) => {
  res.json({ status: "Efetivo360 API rodando 🚀 (JSON DB)" });
});

const frontendPath = path.resolve(__dirname, "../../frontend");
app.use(express.static(frontendPath));

app.get("/", (req, res) => {
  res.redirect("/login/index.html");
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
