'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Meeting extends Model {
    static associate(models) {
      Meeting.hasMany(models.MeetingParticipant, {
        foreignKey: 'meeting_id',
        as: 'participants'
      });
      Meeting.belongsTo(models.User, {
        foreignKey: 'created_by',
        as: 'creator'
      });
      // Relasi baru: Pimpinan yang menyetujui dokumen rapat
      Meeting.belongsTo(models.User, {
        foreignKey: 'approved_by',
        as: 'approver'
      });
      Meeting.hasOne(models.Minute, {
        foreignKey: 'meeting_id',
        as: 'minute'
      });
    }
  }

  Meeting.init(
    {
      meeting_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      meeting_code: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true,
      },
      title: {
        type: DataTypes.STRING(200),
        allowNull: false,
      },
      agenda: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      start_time: {
        type: DataTypes.TIME,
        allowNull: false,
      },
      end_time: {
        type: DataTypes.TIME,
        allowNull: false,
      },
      location: {
        type: DataTypes.STRING(200),
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: null,
      },
      status: {
        type: DataTypes.ENUM('Terjadwal', 'Selesai', 'Batal'),
        allowNull: false,
        defaultValue: 'Terjadwal',
      },

      // KOLOM BARU: Status Persetujuan oleh Pimpinan
      approval_status: {
        type: DataTypes.ENUM('Draft', 'Menunggu Verifikasi', 'Menunggu TTD', 'Approved', 'Rejected'),
        allowNull: false,
        defaultValue: 'Draft',
      },
      approved_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
      },
      approved_at: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
      },

      created_by: {
        type: DataTypes.INTEGER,
        allowNull: false,
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
      modelName: 'Meeting',
      tableName: 'meetings',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  return Meeting;
};