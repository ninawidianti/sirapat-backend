'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class MeetingParticipant extends Model {
    static associate(models) {
      // MeetingParticipant -> Meeting
      MeetingParticipant.belongsTo(models.Meeting, {
        foreignKey: 'meeting_id',
        as: 'meeting'
      });

      // MeetingParticipant -> User
      MeetingParticipant.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user'
      });

      // MeetingParticipant -> Attendance
      MeetingParticipant.hasOne(models.Attendance, {
        foreignKey: 'participant_id',
        as: 'attendance'
      });
    }
  }

  MeetingParticipant.init(
    {
      participant_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      meeting_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      invitation_status: {
        type: DataTypes.ENUM('Diundang', 'Dibatalkan'),
        allowNull: false,
        defaultValue: 'Diundang',
      },
      status_kehadiran: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: 'Belum Hadir',
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'MeetingParticipant',
      tableName: 'meeting_participants',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at', // Sudah diperbaiki
    }
  );

  return MeetingParticipant;
};