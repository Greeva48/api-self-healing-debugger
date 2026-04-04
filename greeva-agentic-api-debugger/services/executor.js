const axios = require("axios");

async function executorAgent(config) {
  try {
    const response = await axios(config);

    return {
      success: true,
      data: response.data,
      status: response.status
    };

  } catch (error) {
    return {
      success: false,
      error: error.response?.data || error.message,
      status: error.response?.status || 500
    };
  }
}

module.exports = executorAgent;