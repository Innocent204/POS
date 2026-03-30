export const PRODUCT_CATEGORIES = [
    'Adapters',
    'Chargers',
    'Cables',
    'Cases & Covers',
    'Screen Protectors',
    'Earphones',
    'Power Banks',
    'Mounts & Holders',
    'Batteries',
    'Memory Cards'
] as const;

export type ProductCategory = typeof PRODUCT_CATEGORIES[number];
