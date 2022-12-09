import express from "express";
import routes from "api";

async function startServer() {
  const port = process.env.PORT || 3000;

  const app = express();

  /**
   * Health Check endpoints
   */
  app.get("/status", (req, res) => {
    res.status(200).end();
  });
  app.head("/status", (req, res) => {
    res.status(200).end();
  });

  // Transforms the raw string of req.body into json
  app.use(express.json());

  // Load API routes
  app.use("/api", routes());

  app.listen(port, () =>
    console.log(`
🚀 Server ready at: http://localhost:${port} ⭐️`)
  );
}
