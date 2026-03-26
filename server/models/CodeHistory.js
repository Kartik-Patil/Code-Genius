const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const CodeHistory = sequelize.define(
  'CodeHistory',
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER.UNSIGNED,
      field: 'user_id',
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    code: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        len: [1, 50000],
      },
    },
    language: {
      type: DataTypes.STRING(40),
      allowNull: false,
    },
    aiErrors: {
      type: DataTypes.TEXT,
      field: 'ai_errors',
      defaultValue: '',
    },
    aiSuggestions: {
      type: DataTypes.TEXT,
      field: 'ai_suggestions',
      defaultValue: '',
    },
    aiExplanation: {
      type: DataTypes.TEXT,
      field: 'ai_explanation',
      defaultValue: '',
    },
    savedAt: {
      type: DataTypes.DATE,
      field: 'saved_at',
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: 'code_history',
    timestamps: false,
    indexes: [
      { fields: ['user_id'] },
      { fields: ['saved_at'] },
    ],
  }
);

// Virtual getter to match old aiResponse format
CodeHistory.prototype.toJSON = function () {
  const values = { ...this.get() };
  values.aiResponse = {
    errors: values.aiErrors || '',
    suggestions: values.aiSuggestions || '',
    explanation: values.aiExplanation || '',
  };
  delete values.aiErrors;
  delete values.aiSuggestions;
  delete values.aiExplanation;
  return values;
};

module.exports = CodeHistory;
