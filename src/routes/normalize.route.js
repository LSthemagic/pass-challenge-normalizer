import { Router } from "express";
import { runNormalizationPipeline } from "../strategies/orchestrator.js";

const router = Router();

router.post("/normalize", async (req, res) => {
  try {
    const { provider, rawData } = req.body;
    if (!rawData || !provider) {
      return res.status(400).json({ error: "As chaves 'provider' e 'rawData' são obrigatórias." });
    }
    const result = await runNormalizationPipeline(rawData, provider);
    return res.status(200).json(result);

  } catch (err) {
    console.error("🚨 Erro na rota /normalize:", err);
    const errorMessage = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ error: "Erro interno no servidor.", details: errorMessage });
  }
});

export default router;