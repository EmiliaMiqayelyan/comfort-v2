'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('collections', 'sku', {
      type: Sequelize.STRING(80),
      allowNull: true,
      unique: true,
    });
    await queryInterface.addColumn('collections', 'images', {
      type: Sequelize.JSON,
      allowNull: true,
    });
    await queryInterface.addColumn('collections', 'gallery_variants', {
      type: Sequelize.JSON,
      allowNull: true,
    });
    await queryInterface.addColumn('collections', 'model_url', {
      type: Sequelize.STRING(500),
      allowNull: true,
    });
    await queryInterface.addColumn('collections', 'video_url', {
      type: Sequelize.STRING(500),
      allowNull: true,
    });
    await queryInterface.addColumn('collections', 'height', {
      type: Sequelize.DECIMAL(10, 2),
      defaultValue: 0,
    });
    await queryInterface.addColumn('collections', 'width', {
      type: Sequelize.DECIMAL(10, 2),
      defaultValue: 0,
    });
    await queryInterface.addColumn('collections', 'depth', {
      type: Sequelize.DECIMAL(10, 2),
      defaultValue: 0,
    });
    await queryInterface.addColumn('collections', 'length', {
      type: Sequelize.DECIMAL(10, 2),
      defaultValue: 0,
    });
    await queryInterface.addColumn('collections', 'material', {
      type: Sequelize.STRING(160),
      allowNull: true,
    });
    await queryInterface.addColumn('collections', 'finish', {
      type: Sequelize.STRING(160),
      allowNull: true,
    });
    await queryInterface.addColumn('collections', 'colors', {
      type: Sequelize.JSON,
      allowNull: true,
    });
    await queryInterface.addColumn('collections', 'textures', {
      type: Sequelize.JSON,
      allowNull: true,
    });
    await queryInterface.addColumn('collections', 'specs', {
      type: Sequelize.JSON,
      allowNull: true,
    });
    await queryInterface.addColumn('collections', 'downloads', {
      type: Sequelize.JSON,
      allowNull: true,
    });
    await queryInterface.addColumn('collections', 'price', {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    });
    await queryInterface.addColumn('collections', 'featured', {
      type: Sequelize.TINYINT(1),
      defaultValue: 0,
    });
    await queryInterface.addColumn('collections', 'availability', {
      type: Sequelize.ENUM('in_stock', 'limited', 'preorder'),
      defaultValue: 'in_stock',
    });

    await queryInterface.createTable('product_collections', {
      product_id: {
        type: Sequelize.CHAR(36),
        allowNull: false,
        references: { model: 'products', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      collection_id: {
        type: Sequelize.CHAR(36),
        allowNull: false,
        references: { model: 'collections', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.addConstraint('product_collections', {
      fields: ['product_id', 'collection_id'],
      type: 'primary key',
      name: 'product_collections_pkey',
    });

    await queryInterface.addIndex('product_collections', ['collection_id'], {
      name: 'product_collections_collection_id',
    });

    await queryInterface.sequelize.query(`
      INSERT INTO product_collections (product_id, collection_id, created_at)
      SELECT id, collection_id, CURRENT_TIMESTAMP
      FROM products
      WHERE collection_id IS NOT NULL
    `);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('product_collections');
    await queryInterface.removeColumn('collections', 'availability');
    await queryInterface.removeColumn('collections', 'featured');
    await queryInterface.removeColumn('collections', 'price');
    await queryInterface.removeColumn('collections', 'downloads');
    await queryInterface.removeColumn('collections', 'specs');
    await queryInterface.removeColumn('collections', 'textures');
    await queryInterface.removeColumn('collections', 'colors');
    await queryInterface.removeColumn('collections', 'finish');
    await queryInterface.removeColumn('collections', 'material');
    await queryInterface.removeColumn('collections', 'length');
    await queryInterface.removeColumn('collections', 'depth');
    await queryInterface.removeColumn('collections', 'width');
    await queryInterface.removeColumn('collections', 'height');
    await queryInterface.removeColumn('collections', 'video_url');
    await queryInterface.removeColumn('collections', 'model_url');
    await queryInterface.removeColumn('collections', 'gallery_variants');
    await queryInterface.removeColumn('collections', 'images');
    await queryInterface.removeColumn('collections', 'sku');
  },
};
