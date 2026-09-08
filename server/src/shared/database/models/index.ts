export { User } from './User';
export { Category } from './Category';
export { Collection } from './Collection';
export { Product } from './Product';
export { ProductCollection } from './ProductCollection';
export { Project } from './Project';
export { BlogPost } from './BlogPost';
export { MediaAsset } from './MediaAsset';
export { ContactMessage } from './ContactMessage';
export { CalculatorProject } from './CalculatorProject';
export { Certificate } from './Certificate';
export { DownloadFile } from './DownloadFile';
export { SiteSetting } from './SiteSetting';

import { Category } from './Category';
import { Product } from './Product';
import { Collection } from './Collection';
import { ProductCollection } from './ProductCollection';

Category.hasMany(Product, { foreignKey: 'categoryId', as: 'products' });
Product.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });

Collection.hasMany(Product, { foreignKey: 'collectionId', as: 'legacyProducts' });
Product.belongsTo(Collection, { foreignKey: 'collectionId', as: 'collection' });

Product.belongsToMany(Collection, {
  through: ProductCollection,
  foreignKey: 'productId',
  otherKey: 'collectionId',
  as: 'collections',
});
Collection.belongsToMany(Product, {
  through: ProductCollection,
  foreignKey: 'collectionId',
  otherKey: 'productId',
  as: 'products',
});

Category.hasMany(Category, { foreignKey: 'parentId', as: 'children' });
Category.belongsTo(Category, { foreignKey: 'parentId', as: 'parent' });
