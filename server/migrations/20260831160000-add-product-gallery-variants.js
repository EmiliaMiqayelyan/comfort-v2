'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('products');
    if (table.gallery_variants) return;

    await queryInterface.addColumn('products', 'gallery_variants', {
      type: Sequelize.JSON,
      allowNull: true,
      defaultValue: [],
    });
  },

  async down(queryInterface) {
    const table = await queryInterface.describeTable('products');
    if (!table.gallery_variants) return;

    await queryInterface.removeColumn('products', 'gallery_variants');
  },
};
