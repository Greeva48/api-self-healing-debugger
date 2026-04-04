const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const executor = require("./services/executor");
const analyzer = require("./services/analyzer");
const fixer = require("./services/fixer");
const retry = require("./services/retry");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Root route
app.get("/", (req, res) => {
  res.send("API Debugger is running 🚀");
});

app.post("/debug", async (req, res) => {
  const { url, method } = req.body;

  try {
    // Step 1: Execute initial request
    const initialResponse = await executor(url, method);

    // If success → return directly
    if (initialResponse.success) {
      return res.json({
        message: "Request successful",
        data: initialResponse.data
      });
    }

    // Step 2: Analyze error
    const analysis = analyzer(
      initialResponse.error,
      initialResponse.status
    );

    // Step 3: Fix request (UPDATED ✅)
    const fixedRequest = fixer(analysis.issue, { url, method });

    // Step 4: Retry request
    const retryResult = await retry(
      fixedRequest.url,
      fixedRequest.method
    );

    // Step 5: Final response
    return res.json({
      originalUrl: url,
      fixedUrl: fixedRequest.url,
      initialError: initialResponse,
      analysis,
      retryResult,
      evaluation: retryResult.success
        ? "Fixed successfully"
        : "Still failing"
    });

  } catch (err) {
    return res.status(500).json({
      error: "Internal server error",
      details: err.message
    });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});