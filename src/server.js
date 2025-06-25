import "dotenv/config";
import express from "express";
import normalizeRouter from './routes/normalize.route.js'

const app = express();

// Middleware
app.use(express.json({limit: '50mb'})); 
// Aumenta o limite de tamanho do corpo da requisição

// rotas
app.get("/", (req, res) => res.send("Normalizer Service is running!"));
app.use("/api", normalizeRouter);

// Inicia o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
})