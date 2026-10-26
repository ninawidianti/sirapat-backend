'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Tambah kolom status persetujuan
    await queryInterface.addColumn('meetings', 'approval_status', {
      type: Sequelize.ENUM('Draft', 'Pending_Approval', 'Approved', 'Rejected'),
      defaultValue: 'Draft',
      allowNull: false
    });

    // 2. Tambah kolom pimpinan yang menyetujui
    await queryInterface.addColumn('meetings', 'approved_by', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'user_id' // Sesuaikan jika primary key di tabel users kamu bernama 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    // 3. Tambah kolom waktu persetujuan
    await queryInterface.addColumn('meetings', 'approved_at', {
      type: Sequelize.DATE,
      allowNull: true
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('meetings', 'approval_status');
    await queryInterface.removeColumn('meetings', 'approved_by');
    await queryInterface.removeColumn('meetings', 'approved_at');
  }
};