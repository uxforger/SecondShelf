import { ArrowLeft } from 'lucide-react';
import { goBack } from '../../lib/router';
import { IconButton, Logo } from '../kit/core';

/** Same list as CREDITS.md. All photos: Pexels License. */
const PHOTOS: [file: string, use: string, title: string, by: string, url: string][] = [
  ['products/crackers', 'Cream crackers', 'Ham and Cheese with Crackers on the Plate', 'Gül Işık', 'https://www.pexels.com/photo/ham-and-cheese-with-crackers-on-the-plate-17227300/'],
  ['products/noodles', 'Instant noodles', 'Photo of Uncooked Noodles on White Background', 'Polina Tankilevitch', 'https://www.pexels.com/photo/photo-of-uncooked-noodles-on-white-background-4518665/'],
  ['products/milk-powder', 'Milk powder', 'Close-up of Plastic Spoon with Dairy Product', 'Towfiqu barbhuiya', 'https://www.pexels.com/photo/close-up-of-plastic-spoon-with-dairy-product-10994727/'],
  ['products/digestive', 'Digestive biscuits', 'Brown Cookies on the Plate', 'eat kubba', 'https://www.pexels.com/photo/brown-cookies-on-the-plate-11833309/'],
  ['products/fruit-drink', 'Fruit drink', 'Healthy Fruit Juices in Glasses', 'Kindel Media', 'https://www.pexels.com/photo/healthy-fruit-juices-in-glasses-8215113/'],
  ['products/sugar', 'Granulated sugar', 'A Spoonful of Sugar', 'Towfiqu barbhuiya', 'https://www.pexels.com/photo/a-spoonful-of-sugar-11477544/'],
  ['products/rice', 'Long-grain rice', 'Close-Up Photo Of White Rice Grains', 'Polina Tankilevitch', 'https://www.pexels.com/photo/close-up-photo-of-white-rice-grains-4110251/'],
  ['products/pasta', 'Spaghetti', 'Pasta', 'Pixabay', 'https://www.pexels.com/photo/pasta-262905/'],
  ['products/cooking-oil', 'Vegetable oil', 'Clear Plastic Bottles With Yellow Liquid', 'Towfiqu barbhuiya', 'https://www.pexels.com/photo/clear-plastic-bottles-with-yellow-liquid-12284682/'],
  ['products/flour', 'Wheat flour', 'Flour in Bowl next to Spoons', 'Diana Light', 'https://www.pexels.com/photo/flour-in-bowl-next-to-spoons-10994433/'],
  ['market/lagos-vendor-800', 'Home page', 'Woman Selling Vegetables on a Market on a Street', 'David Iloba', 'https://www.pexels.com/photo/woman-selling-vegetables-on-a-market-on-a-street-14881680/'],
  ['market/lagos-market-800', 'Sign-in', 'Crowded City Street', 'David Iloba', 'https://www.pexels.com/photo/crowded-city-street-16155217/'],
];

export function Credits() {
  return (
    <div className="min-h-dvh bg-paper">
      <main className="mx-auto max-w-[960px] px-4 pt-[max(12px,var(--safe-top))] pb-12 sm:px-6">
        <div className="flex items-center justify-between">
          <IconButton label="Back" onClick={() => goBack('/')} className="-ml-2">
            <ArrowLeft className="size-6" />
          </IconButton>
          <Logo />
        </div>
        <h1 className="t-32 mt-4 text-ink">Photo credits</h1>
        <p className="t-16 mt-1 text-slate">
          All photos from Pexels, under the{' '}
          <a className="font-medium text-forest underline underline-offset-2" href="https://www.pexels.com/license/" target="_blank" rel="noreferrer">
            Pexels License
          </a>
          . Stored in the app, so the demo works offline.
        </p>
        <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {PHOTOS.map(([file, use, title, by, url]) => (
            <li key={file} className="flex items-center gap-3 rounded-[16px] bg-white p-3 ring-1 ring-hairline">
              <img src={`/images/${file}.webp`} alt="" loading="lazy" className="size-16 shrink-0 rounded-[12px] object-cover" />
              <span className="min-w-0">
                <span className="t-16 block font-semibold text-ink">{use}</span>
                <a href={url} target="_blank" rel="noreferrer" className="t-14 block truncate text-forest underline underline-offset-2">
                  {title}
                </a>
                <span className="t-12 block text-slate">by {by}</span>
              </span>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
