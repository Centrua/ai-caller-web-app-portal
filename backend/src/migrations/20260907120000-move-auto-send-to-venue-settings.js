"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Drop the legacy column from venues. No backfill.
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn('venues', 'auto_send_replies', { transaction })
    })
  },

  async down(queryInterface, Sequelize) {
    // Recreate the column with default false.
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn(
        'venues',
        'auto_send_replies',
        {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
        { transaction }
      )
    })
  }
};
