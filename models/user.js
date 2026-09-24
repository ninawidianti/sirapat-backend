'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {

    static associate(models) {
      User.hasMany(models.MeetingParticipant, {
        foreignKey: 'user_id',
        as: 'participants'
      });

      User.hasMany(models.FollowUpUpdate, {
        foreignKey: 'user_id',
        as: 'follow_up_updates'
      });

      // Relasi Many-to-Many ke Kepanitiaan (Committee) via tabel pivot committee_members
      User.belongsToMany(models.Committee, {
        through: 'committee_members',
        foreignKey: 'user_id',
        otherKey: 'committee_id',
        as: 'kepanitiaan'
      });
    }

  }

  User.init(
    {
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },

      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },

      nip: {
        type: DataTypes.STRING(30),
        allowNull: false,
        unique: true,
      },

      email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
      },

      password: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },

      role: {
        type: DataTypes.ENUM('Admin', 'Peserta'),
        allowNull: false,
        defaultValue: 'Peserta',
      },

      bidang: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },

      jabatan: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },

      phone: {
        type: DataTypes.STRING(20),
        allowNull: true,
        defaultValue: null,
      },

      status: {
        type: DataTypes.ENUM('Aktif', 'Tidak Aktif'),
        allowNull: false,
        defaultValue: 'Aktif',
      },

      signature_url: {
        type: DataTypes.STRING(255),
        allowNull: true,
        defaultValue: null,
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
      modelName: 'User',
      tableName: 'users',

      // Menyesuaikan nama timestamp dengan database
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  return User;
};