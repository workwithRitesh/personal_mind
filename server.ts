import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { YoutubeTranscript } from "youtube-transcript";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // YouTube Transcript Proxy
  app.get("/api/youtube-transcript", async (req, res) => {
    const videoUrl = req.query.url as string;
    if (!videoUrl) {
      return res.status(400).json({ error: "Missing url parameter" });
    }

    try {
      const transcript = await YoutubeTranscript.fetchTranscript(videoUrl);
      res.json(transcript);
    } catch (error) {
      console.error("YouTube Transcript Error:", error);
      res.status(500).json({ error: "Failed to fetch transcript" });
    }
  });

  // News Proxy
  app.get("/api/news", async (req, res) => {
    const category = req.query.category || "general";
    const apiKey = process.env.GNEWS_API_KEY || "dd65e6d8a394fbd81682701b23821033";
    const url = `https://gnews.io/api/v4/top-headlines?category=${category}&lang=en&country=us&max=10&apikey=${apiKey}`;
    
    try {
      const response = await fetch(url);
      const data = await response.json();
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: "News fetch failed" });
    }
  });

  // Exchange Rate Proxy
  app.get("/api/exchange-rates", async (req, res) => {
    const base = req.query.base || "USD";
    const apiKey = process.env.EXCHANGERATE_API_KEY || "ebf947267f7810b4845bc807";
    const url = `https://v6.exchangerate-api.com/v6/${apiKey}/latest/${base}`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: "Exchange rate fetch failed" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
