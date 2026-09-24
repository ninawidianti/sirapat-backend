'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('attendances', {
      attendance_id: {
        type: Sequelize.INTEGER(11),
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      participant_id: {
        type: Sequelize.INTEGER(11),
        allowNull: false,
        references: {
          model: 'meeting_participants', // Nama tabel referensi
          key: 'participant_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      attendance_status: {
        type: Sequelize.ENUM('Belum Konfirmasi', 'Hadir', 'Izin', 'Sakit', 'Absen'),
        allowNull: false,
        defaultValue: 'Belum Konfirmasi',
      },
      confirmation_time: {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: null,
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
        defaultValue: null,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('attendances');
  }
};