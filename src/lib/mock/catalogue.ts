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
    focus: '12% 80%',
    zoom: 1.6,
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
    zoom: 1.7,
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
    focus: '36% 55%',
    zoom: 1.9,
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
    focus: '18% 92%',
    zoom: 1.6,
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
    focus: '100% 100%',
    zoom: 1.6,
  },
  {
    id: 'p-sugar',
    barcode: '2006001000061',
    name: 'Granulated sugar',
    pack: '50 × 500 g',
    netKg: 25,
    price: 42000,
    type: 'sugar',
    image: 'provisions',
    focus: '50% 50%',
  },
  {
    id: 'p-rice',
    barcode: '2006001000078',
    name: 'Long-grain rice',
    pack: '10 × 2.5 kg',
    netKg: 25,
    price: 48000,
    type: 'rice',
    image: 'provisions',
    focus: '50% 50%',
  },
  {
    id: 'p-pasta',
    barcode: '2006001000085',
    name: 'Spaghetti',
    pack: '20 × 500 g',
    netKg: 10,
    price: 15600,
    type: 'pasta',
    image: 'provisions',
    focus: '50% 50%',
  },
  {
    id: 'p-oil',
    barcode: '2006001000092',
    name: 'Vegetable oil',
    pack: '4 × 5 L',
    netKg: 18.4,
    price: 52000,
    type: 'oil',
    image: 'provisions',
    focus: '50% 50%',
  },
  {
    id: 'p-flour',
    barcode: '2006001000108',
    name: 'Wheat flour',
    pack: '10 × 2 kg',
    netKg: 20,
    price: 21500,
    type: 'flour',
    image: 'provisions',
    focus: '50% 50%',
  },
];

export const DISTRIBUTOR: Business = {
  id: 'biz-ade',
  name: 'Ade Foods',
  owner: 'Babatunde Olumide Adeyemi',
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
