'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('categories');
    if (table.parent_id) return;

    await queryInterface.addColumn('categories', 'parent_id', {
      type: Sequelize.CHAR(36),
      allowNull: true,
    });

    await queryInterface.addConstraint('categories', {
      fields: ['parent_id'],
      type: 'foreign key',
      name: 'categories_parent_id_fk',
      references: { table: 'categories', field: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
  },

  async down(queryInterface) {
    const table = await queryInterface.describeTable('categories');
    if (!table.parent_id) return;

    await queryInterface.removeConstraint('categories', 'categories_parent_id_fk').catch(() => undefined);
    await queryInterface.removeColumn('categories', 'parent_id');
  },
};
