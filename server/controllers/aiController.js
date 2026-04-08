const Joi = require('joi');
const Log = require('../models/Log');
const { detectErrors, getSuggestions, explainCode, executeCode } = require('../services/aiService');

const aiSchema = Joi.object({
  code: Joi.string().min(1).max(50000).required(),
  language: Joi.string().min(2).max(40).required(),
});

const validatePayload = (body) => {
  const { error, value } = aiSchema.validate(body, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const messages = error.details.map((detail) => detail.message);
    const err = new Error('Validation error');
    err.statusCode = 400;
    err.details = messages;
    throw err;
  }

  return value;
};

const logResponse = async ({ userId, action, language, code, aiResponse }) => {
  await Log.create({ userId, action, language, code, aiResponse });
};

const detectErrorsHandler = async (req, res, next) => {
  try {
    const { code, language } = validatePayload(req.body);
    const response = await detectErrors({ code, language });

    await logResponse({
      userId: req.user.id,
      action: 'detect-errors',
      language,
      code,
      aiResponse: response,
    });

    res.json({ result: response });
  } catch (err) {
    if (err.details) {
      return res.status(400).json({ message: err.message, errors: err.details });
    }
    return next(err);
  }
};

const suggestHandler = async (req, res, next) => {
  try {
    const { code, language } = validatePayload(req.body);
    const response = await getSuggestions({ code, language });

    await logResponse({
      userId: req.user.id,
      action: 'suggest',
      language,
      code,
      aiResponse: response,
    });

    res.json({ result: response });
  } catch (err) {
    if (err.details) {
      return res.status(400).json({ message: err.message, errors: err.details });
    }
    return next(err);
  }
};

const explainHandler = async (req, res, next) => {
  try {
    const { code, language } = validatePayload(req.body);
    const response = await explainCode({ code, language });

    await logResponse({
      userId: req.user.id,
      action: 'explain',
      language,
      code,
      aiResponse: response,
    });

    res.json({ result: response });
  } catch (err) {
    if (err.details) {
      return res.status(400).json({ message: err.message, errors: err.details });
    }
    return next(err);
  }
};

const runCodeHandler = async (req, res, next) => {
  try {
    const { code, language } = validatePayload(req.body);
    const execution = await executeCode({ code, language });

    return res.json(execution);
  } catch (err) {
    if (err.details) {
      return res.status(400).json({ message: err.message, errors: err.details });
    }
    return next(err);
  }
};

module.exports = {
  detectErrorsHandler,
  suggestHandler,
  explainHandler,
  runCodeHandler,
};
