'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      id: { type: Sequelize.CHAR(36), primaryKey: true },
      name: { type: Sequelize.STRING(120), allowNull: false },
      email: { type: Sequelize.STRING(190), allowNull: false, unique: true },
      password_hash: { type: Sequelize.STRING(255), allowNull: false },
      role: {
        type: Sequelize.ENUM('admin', 'manager', 'editor', 'translator', 'dealer'),
        defaultValue: 'editor',
      },
      avatar: { type: Sequelize.STRING(500), allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP') },
    });

    await queryInterface.createTable('categories', {
      id: { type: Sequelize.CHAR(36), primaryKey: true },
      slug: { type: Sequelize.STRING(160), allowNull: false, unique: true },
      name: { type: Sequelize.JSON, allowNull: false },
      description: { type: Sequelize.JSON, allowNull: true },
      image: { type: Sequelize.STRING(500), allowNull: true },
      parent_id: {
        type: Sequelize.CHAR(36),
        allowNull: true,
        references: { model: 'categories', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP') },
    });

    await queryInterface.createTable('collections', {
      id: { type: Sequelize.CHAR(36), primaryKey: true },
      slug: { type: Sequelize.STRING(160), allowNull: false, unique: true },
      name: { type: Sequelize.JSON, allowNull: false },
      description: { type: Sequelize.JSON, allowNull: true },
      image: { type: Sequelize.STRING(500), allowNull: true },
      style: { type: Sequelize.STRING(80), allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP') },
    });

    await queryInterface.createTable('products', {
      id: { type: Sequelize.CHAR(36), primaryKey: true },
      slug: { type: Sequelize.STRING(160), allowNull: false, unique: true },
      sku: { type: Sequelize.STRING(80), allowNull: false, unique: true },
      name: { type: Sequelize.JSON, allowNull: false },
      description: { type: Sequelize.JSON, allowNull: true },
      category_id: {
        type: Sequelize.CHAR(36),
        allowNull: false,
        references: { model: 'categories', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      collection_id: {
        type: Sequelize.CHAR(36),
        allowNull: true,
        references: { model: 'collections', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      images: { type: Sequelize.JSON, defaultValue: null },
      model_url: { type: Sequelize.STRING(500), allowNull: true },
      video_url: { type: Sequelize.STRING(500), allowNull: true },
      height: { type: Sequelize.DECIMAL(10, 2), defaultValue: 0 },
      width: { type: Sequelize.DECIMAL(10, 2), defaultValue: 0 },
      depth: { type: Sequelize.DECIMAL(10, 2), defaultValue: 0 },
      length: { type: Sequelize.DECIMAL(10, 2), defaultValue: 0 },
      material: { type: Sequelize.STRING(160), allowNull: true },
      finish: { type: Sequelize.STRING(160), allowNull: true },
      colors: { type: Sequelize.JSON, defaultValue: null },
      textures: { type: Sequelize.JSON, defaultValue: null },
      specs: { type: Sequelize.JSON, defaultValue: null },
      downloads: { type: Sequelize.JSON, defaultValue: null },
      price: { type: Sequelize.INTEGER, defaultValue: 0 },
      featured: { type: Sequelize.TINYINT(1), defaultValue: 0 },
      availability: {
        type: Sequelize.ENUM('in_stock', 'limited', 'preorder'),
        defaultValue: 'in_stock',
      },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP') },
    });

    await queryInterface.createTable('projects', {
      id: { type: Sequelize.CHAR(36), primaryKey: true },
      slug: { type: Sequelize.STRING(160), allowNull: false, unique: true },
      title: { type: Sequelize.JSON, allowNull: false },
      description: { type: Sequelize.JSON, allowNull: true },
      location: { type: Sequelize.JSON, allowNull: true },
      year: { type: Sequelize.SMALLINT, allowNull: true },
      images: { type: Sequelize.JSON, defaultValue: null },
      before_image: { type: Sequelize.STRING(500), allowNull: true },
      after_image: { type: Sequelize.STRING(500), allowNull: true },
      video_url: { type: Sequelize.STRING(500), allowNull: true },
      product_ids: { type: Sequelize.JSON, defaultValue: null },
      category: { type: Sequelize.STRING(80), allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP') },
    });

    await queryInterface.createTable('blog_posts', {
      id: { type: Sequelize.CHAR(36), primaryKey: true },
      slug: { type: Sequelize.STRING(160), allowNull: false, unique: true },
      title: { type: Sequelize.JSON, allowNull: false },
      excerpt: { type: Sequelize.JSON, allowNull: true },
      content: { type: Sequelize.JSON, allowNull: true },
      cover_image: { type: Sequelize.STRING(500), allowNull: true },
      category: { type: Sequelize.STRING(80), allowNull: true },
      tags: { type: Sequelize.JSON, defaultValue: null },
      author: { type: Sequelize.JSON, allowNull: true },
      published_at: { type: Sequelize.DATEONLY, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP') },
    });

    await queryInterface.createTable('media_assets', {
      id: { type: Sequelize.CHAR(36), primaryKey: true },
      name: { type: Sequelize.STRING(255), allowNull: false },
      type: {
        type: Sequelize.ENUM('image', 'video', 'pdf', 'glb', 'usdz', 'texture'),
        allowNull: false,
      },
      url: { type: Sequelize.STRING(500), allowNull: false },
      folder: { type: Sequelize.STRING(120), allowNull: true },
      size: { type: Sequelize.INTEGER, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    });

    await queryInterface.createTable('contact_messages', {
      id: { type: Sequelize.CHAR(36), primaryKey: true },
      name: { type: Sequelize.STRING(160), allowNull: false },
      email: { type: Sequelize.STRING(190), allowNull: false },
      phone: { type: Sequelize.STRING(40), allowNull: true },
      company: { type: Sequelize.STRING(160), allowNull: true },
      message: { type: Sequelize.TEXT, allowNull: false },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    });

    await queryInterface.createTable('calculator_projects', {
      id: { type: Sequelize.CHAR(36), primaryKey: true },
      user_email: { type: Sequelize.STRING(190), allowNull: true },
      input_json: { type: Sequelize.JSON, allowNull: false },
      result_json: { type: Sequelize.JSON, allowNull: false },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    });

    await queryInterface.createTable('certificates', {
      id: { type: Sequelize.CHAR(36), primaryKey: true },
      title: { type: Sequelize.JSON, allowNull: false },
      issuer: { type: Sequelize.STRING(160), allowNull: true },
      year: { type: Sequelize.SMALLINT, allowNull: true },
      file_url: { type: Sequelize.STRING(500), allowNull: true },
      image: { type: Sequelize.STRING(500), allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP') },
    });

    await queryInterface.createTable('download_files', {
      id: { type: Sequelize.CHAR(36), primaryKey: true },
      filename: { type: Sequelize.STRING(255), allowNull: false },
      title: { type: Sequelize.JSON, allowNull: false },
      category: { type: Sequelize.STRING(80), allowNull: true },
      url: { type: Sequelize.STRING(500), allowNull: false },
      file_size: { type: Sequelize.STRING(40), allowNull: true },
      downloadable: { type: Sequelize.TINYINT(1), defaultValue: 1 },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP') },
    });

    await queryInterface.createTable('site_settings', {
      setting_key: { type: Sequelize.STRING(80), primaryKey: true },
      setting_value: { type: Sequelize.JSON, allowNull: false },
    });
  },

  async down(queryInterface) {
    const tables = [
      'site_settings', 'download_files', 'certificates', 'calculator_projects',
      'contact_messages', 'media_assets', 'blog_posts', 'projects',
      'products', 'collections', 'categories', 'users',
    ];
    for (const table of tables) {
      await queryInterface.dropTable(table);
    }
  },
};
