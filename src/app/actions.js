'use server';

import { revalidatePath } from 'next/cache';

/**
 * Server Action for On-Demand Revalidation.
 * Instantly purges the cached ISR storefront HTML so new products and updates
 * appear immediately on '/' without waiting for the 60-second background revalidation window.
 */
export async function revalidateStorefront() {
  try {
    revalidatePath('/');
    return { success: true, timestamp: Date.now() };
  } catch (err) {
    console.error('Error in revalidateStorefront:', err);
    return { success: false, error: err.message };
  }
}
