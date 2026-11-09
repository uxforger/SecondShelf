import type { Business, Product } from '../api/types.ts';

/**
 * Demo catalogue. Barcodes use the 200 prefix (in-store range) so they
 * never collide with real products. Print them from DEMO.md.
 */
export const PRODUCTS: Product[] = [
  {
    id: 'p-crackers',
    barcode: '2006001000016',
    name: 'Cream crackers',
    pack: '12 × 300 g',
    netKg: 3.6,
    price: 2600,
    type: 'crackers',
    image: 'provisions',
    focus: '14% 78%',
    zoom: 1.9,
  },
  {
    id: 'p-noodles',
    barcode: '2006001000023',
    name: 'Instant noodles',
    pack: '40 × 70 g',
    netKg: 2.8,
    price: 9800,
    type: 'noodles',
    image: 'inspection',
    focus: '4% 62%',
    zoom: 2.1,
  },
  {
    id: 'p-milk',
    barcode: '2006001000030',
    name: 'Milk powder',
    pack: '12 × 380 g',
    netKg: 4.56,
    price: 18500,
    type: 'milk',
    image: 'warehouse',
    focus: '36% 52%',
    zoom: 2.4,
  },
  {
    id: 'p-digestive',
    barcode: '2006001000047',
    name: 'Digestive biscuits',
    pack: '24 × 200 g',
    netKg: 4.8,
    price: 7200,
    type: 'biscuits',
    image: 'inspection',
    focus: '22% 92%',
    zoom: 2.0,
  },
  {
    id: 'p-drink',
    barcode: '2006001000054',
    name: 'Fruit drink',
    pack: '12 × 1 L',
    netKg: 12,
    price: 8400,
    type: 'drink',
    image: 'warehouse',
    focus: '96% 88%',
    zoom: 2.0,
  },
];

export const DISTRIBUTOR: Business = {
  id: 'biz-ade',
  name: 'Ade Foods',
  area: 'Mushin',
  role: 'distributor',
  distanceKm: 0,
};

export const BUYER: Business = {
  id: 'biz-tolu',
  name: 'Mama Tolu Canteen',
  area: 'Yaba',
  role: 'buyer',
  distanceKm: 6.2,
};

export const FOOD_BANK: Business = {
  id: 'biz-lfbi',
  name: 'Lagos Food Bank Initiative',
  area: 'Partner example',
  role: 'foodbank',
  distanceKm: 8.4,
};

/** Past buyers, used for history only. */
export const PAST_BUYERS: Business[] = [
  { id: 'biz-basira', name: 'Iya Basira Foods', area: 'Surulere', role: 'buyer', distanceKm: 5.1 },
  { id: 'biz-kola', name: 'Kola Provisions', area: 'Ojuelegba', role: 'buyer', distanceKm: 3.8 },
  { id: 'biz-akoka', name: 'Akoka Staff Canteen', area: 'Akoka', role: 'buyer', distanceKm: 9.6 },
  { id: 'biz-chidi', name: 'Chidi Mini Mart', area: 'Ikeja', role: 'buyer', distanceKm: 11.2 },
];
