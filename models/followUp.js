'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class FollowUp extends Model {
    static associate(models) {
      FollowUp.belongsTo(models.Meeting, {
        foreignKey: 'meeting_id',
        as: 'meeting'
      });

      // Relasi PIC (user_id) ke User
      FollowUp.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user'
      });

      // Relasi Pembuat (created_by) ke User
      FollowUp.belongsTo(models.User, {
        foreignKey: 'created_by',
        as: 'creator'
      });

      FollowUp.hasMany(models.FollowUpUpdate, {
        foreignKey: 'follow_up_id',
        as: 'updates'
      });
    }
  }

  FollowUp.init(
    {
      follow_up_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      meeting_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      task: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      // DIKEMBALIKAN KE INTEGER (1 PIC)
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      deadline: {
        type: DataTypes.DATEONLY,
        allowNull: false
      },
      priority: {
        type: DataTypes.ENUM('Tinggi', 'Sedang', 'Rendah'),
        allowNull: false,
        defaultValue: 'Sedang'
      },
      status: {
        type: DataTypes.ENUM('Belum Mulai', 'Dikerjakan', 'Selesai', 'Evaluasi'),
        allowNull: false,
        defaultValue: 'Belum Mulai'
      },
      created_by: {
        type: DataTypes.INTEGER,
        allowNull: false
      }
    },
    {
      sequelize,
      modelName: 'FollowUp',
      tableName: 'follow_ups',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    }
  );

  return FollowUp;
};