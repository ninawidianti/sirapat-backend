'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Mengubah definisi kolom role agar menerima nilai 'pimpinan'
    await queryInterface.changeColumn('users', 'role', {
      type: Sequelize.ENUM('admin', 'peserta', 'pimpinan'),
      defaultValue: 'peserta',
      allowNull: false
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('users', 'role', {
      type: Sequelize.ENUM('admin', 'peserta'),
      defaultValue: 'peserta',
      allowNull: false
    });
  }
};