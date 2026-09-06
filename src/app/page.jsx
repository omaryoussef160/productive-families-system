import { getProducts } from '../services/products';
import { getFamilyCount } from '../services/families';
import { HomeStorefront } from '../components/HomeStorefront';

// Incremental Static Regeneration (ISR) - revalidates every 60 seconds on the server
export const revalidate = 60;

export default async function HomePage() {
  // Fetch initial data directly on the server (RSC / SSR)
  const [products, familyCount] = await Promise.all([
    getProducts(),
    getFamilyCount(),
  ]);

  return (
    <HomeStorefront
      initialProducts={products}
      initialFamilyCount={familyCount}
    />
  );
}
