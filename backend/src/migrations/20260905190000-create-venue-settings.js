"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('venue_settings', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      venue_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true,
        references: { model: 'venues', key: 'id' },
        onDelete: 'CASCADE'
      },
      auto_send_replies: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      auto_approve_drafts: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      require_approval: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('venue_settings');
  }
};
