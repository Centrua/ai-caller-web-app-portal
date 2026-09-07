"use strict"

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('conversations', 'next_action', {
      type: Sequelize.TEXT,
      allowNull: true,
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('conversations', 'next_action')
  },
}
