'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Committee extends Model {
    static associate(models) {
      // Relasi Many-to-Many ke User via tabel pivot committee_members
      Committee.belongsToMany(models.User, {
        through: 'committee_members',
        foreignKey: 'committee_id',
        otherKey: 'user_id',
        as: 'members'
      });
    }
  }

  Committee.init(
    {
      committee_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },

      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'Committee',
      tableName: 'committees',
      timestamps: true, // Sequelize akan otomatis mengelola createdAt dan updatedAt
    }
  );

  return Committee;
};