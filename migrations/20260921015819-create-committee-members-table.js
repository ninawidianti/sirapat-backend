  'use strict';

  /** @type {import('sequelize-cli').Migration} */
  module.exports = {
    async up(queryInterface, Sequelize) {
      await queryInterface.createTable('committee_members', {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER
        },
        committee_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'committees',
            key: 'committee_id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        },
        user_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'Users', // Pastikan nama tabel user di database sesuai (misal: 'Users' atau 'users')
            key: 'user_id'  // Pastikan nama primary key user di tabel kamu
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        },
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
        }
      });
    },

    async down(queryInterface, Sequelize) {
      await queryInterface.dropTable('committee_members');
    }
  };