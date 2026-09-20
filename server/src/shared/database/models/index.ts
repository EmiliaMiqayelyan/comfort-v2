export { User } from './User';
export { Category } from './Category';
export { Collection } from './Collection';
export { Product } from './Product';
export { ProductCollection } from './ProductCollection';
export { ProductOption } from './ProductOption';
export { ProductOptionValue } from './ProductOptionValue';
export { ProductVariant } from './ProductVariant';
export { ProductVariantOption } from './ProductVariantOption';
export { Project } from './Project';
export { BlogPost } from './BlogPost';
export { MediaAsset } from './MediaAsset';
export { ContactMessage } from './ContactMessage';
export { CalculatorProject } from './CalculatorProject';
export { Certificate } from './Certificate';
export { Partner } from './Partner';
export { DownloadFile } from './DownloadFile';
export { SiteSetting } from './SiteSetting';

import { Category } from './Category';
import { Product } from './Product';
import { Collection } from './Collection';
import { ProductCollection } from './ProductCollection';
import { ProductOption } from './ProductOption';
import { ProductOptionValue } from './ProductOptionValue';
import { ProductVariant } from './ProductVariant';
import { ProductVariantOption } from './ProductVariantOption';

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

Product.hasMany(ProductOption, { foreignKey: 'productId', as: 'options' });
ProductOption.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

ProductOption.hasMany(ProductOptionValue, { foreignKey: 'optionId', as: 'values' });
ProductOptionValue.belongsTo(ProductOption, { foreignKey: 'optionId', as: 'option' });

Product.hasMany(ProductVariant, { foreignKey: 'productId', as: 'variants' });
ProductVariant.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

ProductVariant.belongsToMany(ProductOptionValue, {
  through: ProductVariantOption,
  foreignKey: 'variantId',
  otherKey: 'optionValueId',
  as: 'optionValues',
});
ProductOptionValue.belongsToMany(ProductVariant, {
  through: ProductVariantOption,
  foreignKey: 'optionValueId',
  otherKey: 'variantId',
  as: 'variants',
});

Category.hasMany(Category, { foreignKey: 'parentId', as: 'children' });
Category.belongsTo(Category, { foreignKey: 'parentId', as: 'parent' });
