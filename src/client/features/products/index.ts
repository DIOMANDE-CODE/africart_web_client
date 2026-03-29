/**
 * Products feature public API.
 *
 * Components, pages, skeletons and hooks related to product browsing
 * are exported from here so that other features import from a single, stable path.
 *
 * Usage:
 *   import { ProductsPage, DetailProductPage } from '../../features/products';
 *   import { CategoryCarousel }                from '../../features/products';
 */

// Pages
export { ProductsPage }      from '../../pages/ProductsPage';
export { DetailProductPage } from '../../pages/DetailProductPage';
export { HomePage }          from '../../pages/HomePage';

// Components
export { CategoryCarousel }  from '../../components/CategoryCarousel';
export { Categories }        from '../../components/Categories';
export { default as SearchInput } from '../../components/SearchInput';
export { ProductRating }     from '../../components/ProductRating';
export { StarRating }        from '../../components/StarRating';

// Skeletons
export {
  ProductSkeleton,
  ProductSkeletonGrid,
  CategoryCarouselSkeleton,
  CategorySkeleton,
  CategorySkeletonCarousel,
  ProductDetailSkeleton,
  RecommendationSkeleton,
} from '../../skeletons';
