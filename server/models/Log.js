const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Log = sequelize.define(
  'Log',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    action: {
      type: DataTypes.ENUM('detect-errors', 'suggest', 'explain'),
      allowNull: false,
    },
    language: {
      type: DataTypes.STRING(40),
      allowNull: false,
    },
    code: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    aiResponse: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    tableName: 'logs',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: false,
    indexes: [
      { fields: ['userId'] },
      { fields: ['action'] },
    ],
  }
);

module.exports = Log;
