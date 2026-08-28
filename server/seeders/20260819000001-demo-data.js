'use strict';
const bcrypt = require('bcryptjs');

const L = (en, ru, am) => JSON.stringify({ en, ru, am });
const productImage = '/products/plinth.jpg';
const productGallery = JSON.stringify([
  productImage,
  'https://images.unsplash.com/photo-1600210491892-03d54c0aaf87?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=2400&q=80',
]);

const colors = JSON.stringify([
  { id: 'white', name: { en: 'Polar White', ru: 'Полярный белый', am: 'Բևեdelays սպիտակ' }, hex: '#F7F7F4' },
  { id: 'anthracite', name: { en: 'Anthracite', ru: 'Антрацит', am: 'Անdelays' }, hex: '#2B2F36' },
  { id: 'oak', name: { en: 'Natural Oak', ru: 'Натуральный дуб', am: 'Բdelays կાdelays' }, hex: '#B8A07E' },
]);

const textures = JSON.stringify([
  { id: 'matte', name: { en: 'Matte', ru: 'Матовый', am: 'Մdelay' }, mapUrl: '/textures/matte.jpg', previewUrl: productImage },
  { id: 'satin', name: { en: 'Satin', ru: 'Сатин', am: 'Սdelay' }, mapUrl: '/textures/satin.jpg', previewUrl: productImage },
]);

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const hash = await bcrypt.hash('admin', 10);
    const now = new Date();

    await queryInterface.bulkInsert('users', [
      { id: 'u-admin', name: 'Admin', email: 'admin@comfort.am', password_hash: hash, role: 'admin', created_at: now, updated_at: now },
      { id: 'u-editor', name: 'Editor', email: 'editor@comfort.am', password_hash: hash, role: 'editor', created_at: now, updated_at: now },
      { id: 'u-dealer', name: 'Dealer', email: 'dealer@comfort.am', password_hash: hash, role: 'dealer', created_at: now, updated_at: now },
    ]);

    await queryInterface.bulkInsert('categories', [
      { id: 'cat-baseboards', slug: 'baseboards', name: L('Baseboards', 'Плинтусы', 'Սალիկներ'), description: L('Precision profiles that frame floors with quiet elegance.', 'Точные профили, которые элегантно обрамляют пол.', 'Ճշգрит պрофիldelays'), image: productImage, parent_id: null, created_at: now, updated_at: now },
      { id: 'cat-panels', slug: 'wall-panels', name: L('Pannels', 'Панели', 'Վahdelays'), description: L('Sculptural 3D surfaces that transform architecture.', 'Скульdelays 3D пdelays', '3D delays'), image: productImage, parent_id: null, created_at: now, updated_at: now },
      { id: 'cat-3d-prof', slug: '3d-prof', name: L('3D Prof', '3D Prof', '3D Prof'), description: L('3D professional wall panel profiles.', 'Пdelays 3D пdelays.', '3D delays'), image: productImage, parent_id: 'cat-panels', created_at: now, updated_at: now },
      { id: 'cat-moldings', slug: 'moldings', name: L('Moldings', 'Молdelays', 'Մdelays'), description: L('Refined lines for classic and contemporary interiors.', 'Изяdelays линdelays', 'Նdelays'), image: productImage, parent_id: null, created_at: now, updated_at: now },
      { id: 'cat-profiles', slug: 'profiles', name: L('Profiles', 'Пdelays', 'Пdelays'), description: L('Technical profiles with LED and finishing systems.', 'Тdelays', 'Тdelays'), image: productImage, parent_id: null, created_at: now, updated_at: now },
      { id: 'cat-accessories', slug: 'accessories', name: L('Accessories', 'Аdelays', 'Аdelays'), description: L('Corners, connectors and installation essentials.', 'Уdelays', 'Аdelays'), image: productImage, parent_id: null, created_at: now, updated_at: now },
    ]);

    await queryInterface.bulkInsert('collections', [
      { id: 'col-white', slug: 'white', name: L('White Collection', 'Белая коллекция', 'Սdelays'), description: L('Pure light surfaces for calm architecture.', 'Чdelays', 'Մdelays'), image: productImage, style: 'minimal', created_at: now, updated_at: now },
      { id: 'col-wood', slug: 'wood', name: L('Wood Collection', 'Деревянная коллdelays', 'Փdelays'), description: L('Warm natural tones and tactile grain.', 'Тdelays', 'Ջdelays'), image: productImage, style: 'natural', created_at: now, updated_at: now },
      { id: 'col-modern', slug: 'modern', name: L('Modern Collection', 'Современdelays', 'Ժdelays'), description: L('Sharp geometry for contemporary spaces.', 'Чdelays', 'Սdelays'), image: productImage, style: 'modern', created_at: now, updated_at: now },
      { id: 'col-classic', slug: 'classic', name: L('Classic Collection', 'Класdelays', 'Դdelays'), description: L('Timeless profiles with sculpted detail.', 'Вdelays', 'Аdelays'), image: productImage, style: 'classic', created_at: now, updated_at: now },
      { id: 'col-minimal', slug: 'minimal', name: L('Minimal Collection', 'Минdelays', 'Մdelays'), description: L('Quiet lines. Maximum presence.', 'Тdelays', 'Հdelays'), image: productImage, style: 'minimal', created_at: now, updated_at: now },
      { id: 'col-natural', slug: 'natural', name: L('Natural Collection', 'Натdelays', 'Бdelays'), description: L('Organic harmony for living interiors.', 'Оdelays', 'Оdelays'), image: productImage, style: 'natural', created_at: now, updated_at: now },
    ]);

    const specs = (h) => JSON.stringify([{ key: 'height', label: { en: 'Height', ru: 'Высота', am: 'Բdelays' }, value: String(h), unit: 'mm' }]);

    await queryInterface.bulkInsert('products', [
      { id: 'p-md101', slug: 'plinth-md101', sku: 'MD-101', name: L('Plinth MD101', 'Плинтус MD101', 'Սdelays MD101'), description: L('A refined flat baseboard with soft shadow line for contemporary interiors.', 'Изdelays', 'Нdelays'), category_id: 'cat-baseboards', collection_id: 'col-modern', images: productGallery, height: 80, width: 16, depth: 16, length: 2400, material: 'HD polymer', finish: 'Matte', colors, textures, specs: specs(80), downloads: '[]', price: 4200, featured: 1, availability: 'in_stock', created_at: now, updated_at: now },
      { id: 'p-classic', slug: 'plinth-classic', sku: 'CL-080', name: L('Plinth Classic', 'Плинтус Classic', 'Սdelays Classic'), description: L('Traditional curved profile with timeless proportion.', 'Кdelays', 'Дdelays'), category_id: 'cat-baseboards', collection_id: 'col-classic', images: productGallery, height: 100, width: 18, depth: 18, length: 2400, material: 'HD polymer', finish: 'Matte', colors, textures, specs: specs(100), downloads: '[]', price: 4800, featured: 1, availability: 'in_stock', created_at: now, updated_at: now },
      { id: 'p-modern', slug: 'plinth-modern', sku: 'MD-070', name: L('Plinth Modern', 'Плинтус Modern', 'Սdelays Modern'), description: L('A simple rectangular block profile for contemporary interiors.', 'Пdelays', 'Пdelays'), category_id: 'cat-baseboards', collection_id: 'col-modern', images: productGallery, height: 70, width: 14, depth: 14, length: 2400, material: 'HD polymer', finish: 'Matte', colors, textures, specs: specs(70), downloads: '[]', price: 4100, featured: 1, availability: 'in_stock', created_at: now, updated_at: now },
      { id: 'p-elegant', slug: 'plinth-elegant', sku: 'EL-090', name: L('Plinth Elegant', 'Плинтус Elegant', 'Սdelays Elegant'), description: L('A profile with a smooth convex top curve.', 'Пdelays', 'Пdelays'), category_id: 'cat-baseboards', collection_id: 'col-classic', images: productGallery, height: 90, width: 16, depth: 16, length: 2400, material: 'HD polymer', finish: 'Matte', colors, textures, specs: specs(90), downloads: '[]', price: 4500, featured: 0, availability: 'in_stock', created_at: now, updated_at: now },
      { id: 'p-flat', slug: 'plinth-flat', sku: 'FL-060', name: L('Plinth Flat', 'Плинтус Flat', 'Սdelays Flat'), description: L('Ultra-slim rectangular profile for minimal interiors.', 'Уdelays', 'Гdelays'), category_id: 'cat-baseboards', collection_id: 'col-minimal', images: productGallery, height: 60, width: 12, depth: 12, length: 2400, material: 'HD polymer', finish: 'Matte', colors, textures, specs: specs(60), downloads: '[]', price: 3900, featured: 0, availability: 'in_stock', created_at: now, updated_at: now },
      { id: 'p-panel-3d', slug: 'panel-fluted', sku: 'PN-3D-12', name: L('Fluted 3D Panel', 'Фdelays 3D панdelays', 'Փdelays 3D вdelays'), description: L('Vertical rhythm for feature walls.', 'Вdelays', 'Уdelays'), category_id: 'cat-3d-prof', collection_id: 'col-modern', images: productGallery, height: 2800, width: 600, depth: 18, length: 600, material: 'HD polymer', finish: 'Matte', colors, textures, specs: specs(2800), downloads: '[]', price: 18900, featured: 1, availability: 'in_stock', created_at: now, updated_at: now },
      { id: 'p-molding-elegant', slug: 'molding-elegant', sku: 'ML-ELG', name: L('Molding Elegant', 'Молdelays Elegant', 'Մdelays Elegant'), description: L('Soft convex framing for walls and ceilings.', 'Мdelays', 'Фdelays'), category_id: 'cat-moldings', collection_id: 'col-classic', images: productGallery, height: 45, width: 20, depth: 20, length: 2400, material: 'HD polymer', finish: 'Matte', colors, textures, specs: specs(45), downloads: '[]', price: 3200, featured: 0, availability: 'in_stock', created_at: now, updated_at: now },
      { id: 'p-molding-classic', slug: 'molding-classic', sku: 'ML-CL', name: L('Molding Classic', 'Молdelays Classic', 'Մdelays Classic'), description: L('Elaborate decorative molding with multiple ridges.', 'Дdelays', 'Дdelays'), category_id: 'cat-moldings', collection_id: 'col-classic', images: productGallery, height: 50, width: 22, depth: 22, length: 2400, material: 'HD polymer', finish: 'Matte', colors, textures, specs: specs(50), downloads: '[]', price: 3400, featured: 0, availability: 'in_stock', created_at: now, updated_at: now },
      { id: 'p-molding-modern', slug: 'molding-modern', sku: 'ML-MD', name: L('Molding Modern', 'Молdelays Modern', 'Մdelays Modern'), description: L('Stepped geometric profile with sharp lines.', 'Гdelays', 'Еdelays'), category_id: 'cat-moldings', collection_id: 'col-modern', images: productGallery, height: 40, width: 18, depth: 18, length: 2400, material: 'HD polymer', finish: 'Matte', colors, textures, specs: specs(40), downloads: '[]', price: 3100, featured: 0, availability: 'in_stock', created_at: now, updated_at: now },
      { id: 'p-molding-flat', slug: 'molding-flat', sku: 'ML-FL', name: L('Molding Flat', 'Молdelays Flat', 'Մdelays Flat'), description: L('A simple beveled profile for quiet detailing.', 'Пdelays', 'Пdelays'), category_id: 'cat-moldings', collection_id: 'col-minimal', images: productGallery, height: 28, width: 14, depth: 14, length: 2400, material: 'HD polymer', finish: 'Matte', colors, textures, specs: specs(28), downloads: '[]', price: 2800, featured: 0, availability: 'in_stock', created_at: now, updated_at: now },
      { id: 'p-led-profile', slug: 'led-profile-lp20', sku: 'LP-20', name: L('LED Profile LP20', 'LED профdelays LP20', 'LED delays LP20'), description: L('Integrated lighting channel for skirting.', 'Сdelays', 'Лdelays'), category_id: 'cat-profiles', collection_id: 'col-modern', images: productGallery, height: 60, width: 22, depth: 22, length: 2000, material: 'HD polymer', finish: 'Matte', colors, textures, specs: specs(60), downloads: '[]', price: 7600, featured: 1, availability: 'in_stock', created_at: now, updated_at: now },
      { id: 'p-corner-set', slug: 'corner-accessory-set', sku: 'AC-COR-01', name: L('Corner Accessory Set', 'Набdelays', 'Аdelays'), description: L('Inner and outer corners with matching connectors.', 'Вdelays', 'Нdelays'), category_id: 'cat-accessories', collection_id: 'col-modern', images: productGallery, height: 80, width: 16, depth: 16, length: 80, material: 'HD polymer', finish: 'Matte', colors, textures, specs: specs(80), downloads: '[]', price: 1800, featured: 0, availability: 'in_stock', created_at: now, updated_at: now },
    ]);

    await queryInterface.bulkInsert('projects', [
      { id: 'pr-1', slug: 'yerevan-residence', title: L('Yerevan Residence', 'Резиdelays', 'Еdelays'), description: L('A quiet residential interior framed by Comfort MD profiles.', 'Сdelays', 'Хdelays'), location: L('Yerevan, Armenia', 'Ереван, Армения', 'Երdelays'), year: 2025, images: JSON.stringify([productImage]), before_image: productImage, after_image: productImage, product_ids: JSON.stringify(['p-md101', 'p-panel-3d']), category: 'residential', created_at: now, updated_at: now },
      { id: 'pr-2', slug: 'cascade-hotel', title: L('Cascade Hotel Lobby', 'Лdelays Cascade', 'Cascade delays'), description: L('Hospitality scale detailing with fluted panels.', 'Дdelays', 'Delays'), location: L('Yerevan', 'Ереван', 'Երdelays'), year: 2024, images: JSON.stringify([productImage]), before_image: null, after_image: null, product_ids: JSON.stringify(['p-panel-3d', 'p-led-profile']), category: 'hospitality', created_at: now, updated_at: now },
      { id: 'pr-3', slug: 'studio-nord', title: L('Studio Nord', 'Студdelays Nord', 'Studio Nord'), description: L('Minimal office with flat skirting.', 'Мdelays', 'Мdelays'), location: L('Moscow', 'Москва', 'Մdelays'), year: 2024, images: JSON.stringify([productImage]), before_image: null, after_image: null, product_ids: JSON.stringify(['p-flat', 'p-molding-elegant']), category: 'office', created_at: now, updated_at: now },
    ]);

    await queryInterface.bulkInsert('blog_posts', [
      { id: 'b1', slug: 'choosing-baseboard-height', title: L('Choosing the right baseboard height', 'Как выdelays', 'Иdelays'), excerpt: L('Proportion, ceiling height and style cues.', 'Пdelays', 'Хdelays'), content: L('Baseboard height defines the visual weight of a room.', 'Вdelays', 'Сdelays'), cover_image: productImage, category: 'design', tags: JSON.stringify(['baseboards', 'architecture']), author: JSON.stringify({ id: 'a1', name: 'Anna Petrosyan', avatar: productImage, role: { en: 'Design Lead', ru: 'Дdelays', am: 'Дdelays' } }), published_at: '2026-03-12', created_at: now, updated_at: now },
      { id: 'b2', slug: '3d-panels-in-hospitality', title: L('3D panels in hospitality interiors', '3D пdelays', '3D delays'), excerpt: L('How fluted panels create memorable guest journeys.', 'Кdelays', 'Иdelays'), content: L('Feature walls guide movement and absorb acoustics.', 'Аdelays', 'Шdelays'), cover_image: productImage, category: 'projects', tags: JSON.stringify(['panels', 'hospitality']), author: JSON.stringify({ id: 'a2', name: 'David Hakobyan', avatar: productImage, role: { en: 'Architect Partner', ru: 'Аdelays', am: 'Чdelays' } }), published_at: '2026-02-02', created_at: now, updated_at: now },
    ]);

    await queryInterface.bulkInsert('media_assets', [
      { id: 'm1', name: 'plinth.png', type: 'image', url: '/products/plinth.png', folder: 'products', size: 240000, created_at: now },
    ]);

    await queryInterface.bulkInsert('certificates', [
      { id: 'cert-iso', title: L('ISO 9001:2015', 'ISO 9001:2015', 'ISO 9001:2015'), issuer: 'ISO', year: 2015, file_url: '/products/plinth.png', image: '/products/plinth.png', created_at: now, updated_at: now },
      { id: 'cert-ce', title: L('CE Marking', 'CE Marking', 'CE Marking'), issuer: 'CE', year: 2022, file_url: '/products/plinth.png', image: '/products/plinth.png', created_at: now, updated_at: now },
    ]);

    await queryInterface.bulkInsert('download_files', [
      { id: 'dl-catalog', filename: 'comfort-catalog.pdf', title: L('Comfort catalog', 'Каталог Comfort', 'Comfort delays'), category: 'catalogs', url: '/downloads/md101.pdf', file_size: '1.2 MB', downloadable: 1, created_at: now, updated_at: now },
      { id: 'dl-template', filename: 'order-template.docx', title: L('Order template', 'Шabldelays', 'Пdelays'), category: 'templates', url: '/downloads/md101.pdf', file_size: '240 KB', downloadable: 1, created_at: now, updated_at: now },
    ]);

    await queryInterface.bulkInsert('site_settings', [
      {
        setting_key: 'contact',
        setting_value: JSON.stringify({
          phones: ['+374 00 000000'],
          emails: ['info@comfort.am'],
          address: { en: 'Yerevan, Armenia', ru: 'Ереван, Армения', am: 'Երdelays' },
          hours: { en: 'Mon–Sat 10:00–19:00', ru: 'Пн–Сб 10:00–19:00', am: 'Еdelays' },
          socials: [
            { id: 'whatsapp', label: 'WhatsApp', href: 'https://wa.me/37400000000' },
            { id: 'telegram', label: 'Telegram', href: 'https://t.me/comfort' },
            { id: 'instagram', label: 'Instagram', href: 'https://instagram.com' },
          ],
          showrooms: [
            { id: 'yerevan', name: 'Yerevan Showroom', address: '15 Northern Ave, Yerevan, Armenia', hours: 'Mon–Sat 10:00–19:00', phone: '+374 00 000000' },
          ],
        }),
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('site_settings', null, {});
    await queryInterface.bulkDelete('download_files', null, {});
    await queryInterface.bulkDelete('certificates', null, {});
    await queryInterface.bulkDelete('media_assets', null, {});
    await queryInterface.bulkDelete('blog_posts', null, {});
    await queryInterface.bulkDelete('projects', null, {});
    await queryInterface.bulkDelete('products', null, {});
    await queryInterface.bulkDelete('collections', null, {});
    await queryInterface.bulkDelete('categories', null, {});
    await queryInterface.bulkDelete('users', null, {});
  },
};
