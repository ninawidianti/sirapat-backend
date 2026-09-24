'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'signature_url', {
      type: Sequelize.STRING(255),
      allowNull: true,
      defaultValue: null,
      after: 'status'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('users', 'signature_url');
  }
};