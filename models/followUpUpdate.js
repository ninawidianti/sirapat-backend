'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class FollowUpUpdate extends Model {
    static associate(models) {
      // Relasi ke tabel follow_ups
      FollowUpUpdate.belongsTo(models.FollowUp, {
        foreignKey: 'follow_up_id',
        as: 'follow_up',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      });

      // Relasi ke tabel users
      FollowUpUpdate.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      });
    }
  }

  FollowUpUpdate.init(
    {
      update_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      follow_up_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      status: {
        type: DataTypes.ENUM('Belum Mulai', 'Dikerjakan', 'Selesai', 'Evaluasi'),
        allowNull: false,
        defaultValue: 'Belum Mulai'
      },
      progress: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      }
    },
    {
      sequelize,
      modelName: 'FollowUpUpdate',
      tableName: 'follow_up_updates',
      timestamps: false // Karena menggunakan kolom 'updated_at' khusus tanpa 'createdAt'
    }
  );

  return FollowUpUpdate;
};