require("dotenv").config();
const express = require("express");
const axios = require("axios");
const router = express.Router();

router.post("/", async (req, res) => {
  const { summary } = req.body;
  console.log("Incoming summary:", summary);

  try { 
    const response = await axios.post(
      "https://api.cohere.ai/v1/generate",
      {
        model: "command",
        prompt: `You are a financial assistant. Analyze the following user's monthly budget and expenses JSON. Return a response in JSON let it just be an array of object (this will be an array of objects) look to give advice for each category the avice should be efficient and smart ,before giving advice make sure to check the spent and budget if budget > spent then all is good just say something i can do with the extra money or you can drop some friendly advice but if spent > budget then you have to give a proper finicial advice..please dont make mistakes check the spent and budget very well because you keep makinng the mistake of switching budget and spent check my json add confirm before giving me a response{"category","spent","budget","advice"} . Speak to the user as a helpful assistant. and also don't give me any other response if it's not with my json data,and give only 1 response. dont forget in my json data its spent before budget so dont mix them up. Here's the budget:\n\n${JSON.stringify(
          summary,
          null,
          2
        )}`,
        max_tokens: 500,
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.COHERE_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const insight = response.data.generations[0].text;
    res.status(200).json({ insight });
  } catch (err) {
    console.error(
      "Error calling Cohere API:",
      err.response?.data || err.message
    );
    res.status(500).json({ error: "Failed to get AI insight" });
  }
});

module.exports = router;
