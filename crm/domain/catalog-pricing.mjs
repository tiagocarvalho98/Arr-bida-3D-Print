// Illustrative catalogue prices for the CRM demo, not commercial prices.
export const CATALOG_PRICES={'produto-1':null,'produto-2':15000,'produto-3':5000};
export function hasCatalogPrice(order){return Boolean(order.lines?.length)&&order.lines.every(l=>Number.isSafeInteger(CATALOG_PRICES[l.productId])&&CATALOG_PRICES[l.productId]>=0);}
