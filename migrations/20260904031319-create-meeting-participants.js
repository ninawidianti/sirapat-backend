'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('meeting_participants', {
      participant_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      meeting_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'meetings', // Nama tabel induk rapat di database
          key: 'meeting_id'  // Primary key pada tabel meetings
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',    // Nama tabel pengguna di database
          key: 'user_id'     // Primary key pada tabel users
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      invitation_status: {
        type: Sequelize.ENUM('Diundang', 'Dibatalkan'),
        allowNull: false,
        defaultValue: 'Diundang'
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('meeting_participants');
  }
};