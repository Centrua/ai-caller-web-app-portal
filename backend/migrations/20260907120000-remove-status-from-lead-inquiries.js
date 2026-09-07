"use strict";

/**
 * Migration to remove the `status` column from `lead_inquiries`.
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Remove the status column if it exists
    await queryInterface.removeColumn('lead_inquiries', 'status');
  },

  async down(queryInterface, Sequelize) {
    // Add the status column back
    await queryInterface.addColumn('lead_inquiries', 'status', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },
};
