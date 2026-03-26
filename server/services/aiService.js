const Groq = require('groq-sdk');

const model = process.env.GROQ_MODEL || 'llama3-70b-8192';

let groqClient = null;

const getGroqClient = () => {
  if (groqClient) return groqClient;

  if (!process.env.GROQ_API_KEY) {
    const err = new Error('GROQ_API_KEY is not configured on the server.');
    err.statusCode = 500;
    throw err;
  }

  groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });
  return groqClient;
};

const getContent = (response) => {
  return response?.choices?.[0]?.message?.content?.trim() || 'No response generated.';
};

const askGroq = async (systemPrompt, userPrompt) => {
  const completion = await getGroqClient().chat.completions.create({
    model,
    temperature: 0.2,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
  });

  return getContent(completion);
};

const detectErrors = async ({ code, language }) => {
  const systemPrompt =
    'You are an expert programming mentor. Identify syntax and logic issues clearly for beginners. Respond in bullet points with severity labels.';
  const userPrompt = `Language: ${language}\n\nCode:\n${code}`;
  return askGroq(systemPrompt, userPrompt);
};

const getSuggestions = async ({ code, language }) => {
  const systemPrompt =
    'You are an expert programming mentor. Suggest practical code improvements for readability, performance, and maintainability in beginner-friendly language.';
  const userPrompt = `Language: ${language}\n\nCode:\n${code}`;
  return askGroq(systemPrompt, userPrompt);
};

const explainCode = async ({ code, language }) => {
  const systemPrompt =
    'You are a patient instructor. Explain what this code does step by step in simple language, and include key concepts being used.';
  const userPrompt = `Language: ${language}\n\nCode:\n${code}`;
  return askGroq(systemPrompt, userPrompt);
};

module.exports = {
  detectErrors,
  getSuggestions,
  explainCode,
};
