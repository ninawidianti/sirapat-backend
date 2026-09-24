'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('minutes', {
      minutes_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      meeting_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'meetings', // Nama tabel meetings di database
          key: 'meeting_id', // Primary key pada tabel meetings
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      discussion: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      decisions: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      invitation_img: {
        type: Sequelize.STRING(255),
        allowNull: true,
        defaultValue: null,
      },
      documentation_img: {
        type: Sequelize.STRING(255),
        allowNull: true,
        defaultValue: null,
      },
      created_by: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users', // Nama tabel user di database
          key: 'user_id', // Primary key pada tabel users
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('minutes');
  },
};