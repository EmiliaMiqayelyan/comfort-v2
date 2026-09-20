'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('product_options', {
      id: { type: Sequelize.CHAR(36), primaryKey: true },
      product_id: {
        type: Sequelize.CHAR(36),
        allowNull: false,
        references: { model: 'products', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      key: { type: Sequelize.STRING(80), allowNull: false },
      label: { type: Sequelize.JSON, allowNull: false },
      ui_type: {
        type: Sequelize.ENUM('buttons', 'swatches'),
        allowNull: false,
        defaultValue: 'buttons',
      },
      sort_order: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.addIndex('product_options', ['product_id'], {
      name: 'product_options_product_id',
    });
    await queryInterface.addIndex('product_options', ['product_id', 'key'], {
      name: 'product_options_product_key',
      unique: true,
    });

    await queryInterface.createTable('product_option_values', {
      id: { type: Sequelize.CHAR(36), primaryKey: true },
      option_id: {
        type: Sequelize.CHAR(36),
        allowNull: false,
        references: { model: 'product_options', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      label: { type: Sequelize.JSON, allowNull: false },
      value: { type: Sequelize.STRING(160), allowNull: false },
      hex: { type: Sequelize.STRING(20), allowNull: true },
      swatch_url: { type: Sequelize.STRING(500), allowNull: true },
      sort_order: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.addIndex('product_option_values', ['option_id'], {
      name: 'product_option_values_option_id',
    });

    await queryInterface.createTable('product_variants', {
      id: { type: Sequelize.CHAR(36), primaryKey: true },
      product_id: {
        type: Sequelize.CHAR(36),
        allowNull: false,
        references: { model: 'products', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      sku: { type: Sequelize.STRING(80), allowNull: false, unique: true },
      image_url: { type: Sequelize.STRING(500), allowNull: true },
      thumb_url: { type: Sequelize.STRING(500), allowNull: true },
      images: { type: Sequelize.JSON, allowNull: true },
      texture_map_url: { type: Sequelize.STRING(500), allowNull: true },
      texture_preview_url: { type: Sequelize.STRING(500), allowNull: true },
      price: { type: Sequelize.INTEGER, allowNull: true },
      availability: {
        type: Sequelize.ENUM('in_stock', 'limited', 'preorder'),
        allowNull: true,
      },
      height: { type: Sequelize.DECIMAL(10, 2), allowNull: true },
      width: { type: Sequelize.DECIMAL(10, 2), allowNull: true },
      depth: { type: Sequelize.DECIMAL(10, 2), allowNull: true },
      length: { type: Sequelize.DECIMAL(10, 2), allowNull: true },
      is_default: { type: Sequelize.TINYINT(1), allowNull: false, defaultValue: 0 },
      sort_order: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.addIndex('product_variants', ['product_id'], {
      name: 'product_variants_product_id',
    });

    await queryInterface.createTable('product_variant_options', {
      variant_id: {
        type: Sequelize.CHAR(36),
        allowNull: false,
        references: { model: 'product_variants', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      option_value_id: {
        type: Sequelize.CHAR(36),
        allowNull: false,
        references: { model: 'product_option_values', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.addConstraint('product_variant_options', {
      fields: ['variant_id', 'option_value_id'],
      type: 'primary key',
      name: 'product_variant_options_pkey',
    });

    await queryInterface.addIndex('product_variant_options', ['option_value_id'], {
      name: 'product_variant_options_option_value_id',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('product_variant_options');
    await queryInterface.dropTable('product_variants');
    await queryInterface.dropTable('product_option_values');
    await queryInterface.dropTable('product_options');
  },
};
