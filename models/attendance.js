'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Attendance extends Model {
    static associate(models) {
      if (models.MeetingParticipant) {
        Attendance.belongsTo(models.MeetingParticipant, {
          foreignKey: 'participant_id',
          as: 'participant',
        });
      }
    }
  }

  Attendance.init(
    {
      attendance_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      participant_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      attendance_status: {
        type: DataTypes.ENUM('Belum Konfirmasi', 'Hadir', 'Izin', 'Sakit', 'Absen'),
        allowNull: false,
        defaultValue: 'Belum Konfirmasi',
      },
      confirmation_time: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      // created_at dan updated_at SUDAH DIHAPUS DARI SINI
    },
    {
      sequelize,
      modelName: 'Attendance',
      tableName: 'attendances',
      timestamps: false, // Menandakan tabel ini memang tidak memakai kolom timestamps bawaan
    }
  );

  return Attendance;
};