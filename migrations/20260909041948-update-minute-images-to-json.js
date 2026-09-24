'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Mengubah tipe data kolom invitation_img menjadi JSON
    await queryInterface.changeColumn('minutes', 'invitation_img', {
      type: Sequelize.JSON,
      allowNull: true,
      defaultValue: []
    });

    // Mengubah tipe data kolom documentation_img menjadi JSON
    await queryInterface.changeColumn('minutes', 'documentation_img', {
      type: Sequelize.JSON,
      allowNull: true,
      defaultValue: []
    });
  },

  async down(queryInterface, Sequelize) {
    // Rollback: Mengembalikan tipe data ke STRING jika migrasi dibatalkan
    await queryInterface.changeColumn('minutes', 'invitation_img', {
      type: Sequelize.STRING(255),
      allowNull: true,
      defaultValue: null
    });

    await queryInterface.changeColumn('minutes', 'documentation_img', {
      type: Sequelize.STRING(255),
      allowNull: true,
      defaultValue: null
    });
  }
};