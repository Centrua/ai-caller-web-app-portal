'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('lead_inquiries', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      grant_id: { type: Sequelize.STRING },
      thread_id: { type: Sequelize.STRING },
      original_message_id: { type: Sequelize.STRING },
      lead_info: { type: Sequelize.JSONB },
      status: { type: Sequelize.STRING, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('lead_inquiries')
  }
}
