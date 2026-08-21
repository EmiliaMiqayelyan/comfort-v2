export { User } from './User';
export { Category } from './Category';
export { Collection } from './Collection';
export { Product } from './Product';
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

Category.hasMany(Product, { foreignKey: 'categoryId', as: 'products' });
Product.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });

Collection.hasMany(Product, { foreignKey: 'collectionId', as: 'products' });
Product.belongsTo(Collection, { foreignKey: 'collectionId', as: 'collection' });

Category.hasMany(Category, { foreignKey: 'parentId', as: 'children' });
Category.belongsTo(Category, { foreignKey: 'parentId', as: 'parent' });
