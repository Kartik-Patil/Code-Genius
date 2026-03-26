const Joi = require('joi');
const CodeHistory = require('../models/CodeHistory');

const saveSchema = Joi.object({
  code: Joi.string().min(1).max(50000).required(),
  language: Joi.string().min(2).max(40).required(),
  aiResponse: Joi.object({
    errors: Joi.string().allow('').default(''),
    suggestions: Joi.string().allow('').default(''),
    explanation: Joi.string().allow('').default(''),
  })
    .default({ errors: '', suggestions: '', explanation: '' })
    .optional(),
});

const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
});

const validateSchema = (schema, payload) => {
  const { error, value } = schema.validate(payload, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const messages = error.details.map((detail) => detail.message);
    return { error: messages };
  }

  return { value };
};

const saveHistory = async (req, res, next) => {
  try {
    const validated = validateSchema(saveSchema, req.body);
    if (validated.error) {
      return res.status(400).json({ message: 'Validation error', errors: validated.error });
    }

    const aiResponse = validated.value.aiResponse || { errors: '', suggestions: '', explanation: '' };

    const historyItem = await CodeHistory.create({
      userId: req.user.id,
      code: validated.value.code,
      language: validated.value.language,
      aiErrors: aiResponse.errors,
      aiSuggestions: aiResponse.suggestions,
      aiExplanation: aiResponse.explanation,
    });

    return res.status(201).json({
      message: 'History saved successfully.',
      item: historyItem,
    });
  } catch (err) {
    return next(err);
  }
};

const getHistory = async (req, res, next) => {
  try {
    const validated = validateSchema(paginationSchema, req.query);
    if (validated.error) {
      return res.status(400).json({ message: 'Validation error', errors: validated.error });
    }

    const page = Number(validated.value.page || 1);
    const limit = 20;
    const offset = (page - 1) * limit;

    const { count: total, rows: items } = await CodeHistory.findAndCountAll({
      where: { userId: req.user.id },
      order: [['savedAt', 'DESC']],
      limit,
      offset,
    });

    return res.json({
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
      items,
    });
  } catch (err) {
    return next(err);
  }
};

const deleteHistory = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate id is a number
    if (!/^\d+$/.test(id)) {
      return res.status(400).json({ message: 'Invalid history id.' });
    }

    const deleted = await CodeHistory.destroy({
      where: { id: parseInt(id, 10), userId: req.user.id },
    });

    if (!deleted) {
      return res.status(404).json({ message: 'History item not found.' });
    }

    return res.json({ message: 'History item deleted successfully.' });
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  saveHistory,
  getHistory,
  deleteHistory,
};
