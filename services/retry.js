const executorAgent = require("./executor");

async function retryAgent(config) {
  return await executorAgent(config);
}

module.exports = retryAgent;