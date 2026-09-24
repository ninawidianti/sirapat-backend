'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('follow_ups', {
      follow_up_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      meeting_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'meetings',
          key: 'meeting_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      task: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      user_id: { // Menggantikan pic_id, berelasi ke tabel users
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'user_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      deadline: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      priority: {
        type: Sequelize.ENUM('Tinggi', 'Sedang', 'Rendah'),
        allowNull: false,
        defaultValue: 'Sedang'
      },
      status: {
        type: Sequelize.ENUM('Belum Mulai', 'Dikerjakan', 'Selesai', 'Evaluasi'),
        allowNull: false,
        defaultValue: 'Belum Mulai'
      },
      created_by: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'user_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('follow_ups');
  }
};