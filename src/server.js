import "dotenv/config";
import express from "express";
import normalizeRouter from "./routes/normalize.route.js";

const app = express();
app.use(express.json({ limit: "50mb" }));

app.get("/", (req, res) => res.send("Serviço de Normalização está no ar!"));
app.use("/api", normalizeRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em com sucesso!`);
});