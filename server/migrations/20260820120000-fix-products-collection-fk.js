'use strict';

/** Make products.collection_id nullable and restore FK with ON DELETE SET NULL. */
module.exports = {
  async up(queryInterface, Sequelize) {
    const [fks] = await queryInterface.sequelize.query(`
      SELECT CONSTRAINT_NAME
      FROM information_schema.KEY_COLUMN_USAGE
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'products'
        AND COLUMN_NAME = 'collection_id'
        AND REFERENCED_TABLE_NAME = 'collections'
    `);

    for (const row of fks) {
      await queryInterface.sequelize.query(
        `ALTER TABLE products DROP FOREIGN KEY \`${row.CONSTRAINT_NAME}\``,
      );
    }

    await queryInterface.changeColumn('products', 'collection_id', {
      type: Sequelize.CHAR(36),
      allowNull: true,
      defaultValue: null,
    });

    await queryInterface.addConstraint('products', {
      fields: ['collection_id'],
      type: 'foreign key',
      name: 'fk_products_collection',
      references: {
        table: 'collections',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint('products', 'fk_products_collection');

    await queryInterface.sequelize.query(`
      UPDATE products SET collection_id = (
        SELECT id FROM collections ORDER BY created_at ASC LIMIT 1
      ) WHERE collection_id IS NULL
    `);

    await queryInterface.changeColumn('products', 'collection_id', {
      type: Sequelize.CHAR(36),
      allowNull: false,
    });

    await queryInterface.addConstraint('products', {
      fields: ['collection_id'],
      type: 'foreign key',
      name: 'fk_products_collection',
      references: {
        table: 'collections',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });
  },
};
