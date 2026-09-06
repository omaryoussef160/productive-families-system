import { getProducts } from '../services/products';
import { ProductsFilterableList } from './ProductsFilterableList';

// Server Component: fetches products on the server for SEO and instant SSR delivery
export async function ProductsSection({ products, selectedFamily, onClearFamilyFilter }) {
  const data = products ?? (await getProducts());

  return (
    <ProductsFilterableList
      products={data}
      selectedFamily={selectedFamily}
      onClearFamilyFilter={onClearFamilyFilter}
    />
  );
}
