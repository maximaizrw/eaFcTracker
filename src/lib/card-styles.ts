
import type { CardStyle } from "./types";

// Maps card styles to their corresponding image URLs from futbin.
// These images are the small icons representing the card type (gold, silver, special, etc.).
export const cardStyleImages: Record<CardStyle, string> = {
    'gold-rare': 'https://cdn3.futbin.com/content/fifa24/img/cards/tiny/2.png',
    'gold-common': 'https://cdn3.futbin.com/content/fifa24/img/cards/tiny/1.png',
    'silver-rare': 'https://cdn3.futbin.com/content/fifa24/img/cards/tiny/5.png',
    'silver-common': 'https://cdn3.futbin.com/content/fifa24/img/cards/tiny/4.png',
    'bronze-rare': 'https://cdn3.futbin.com/content/fifa24/img/cards/tiny/8.png',
    'bronze-common': 'https://cdn3.futbin.com/content/fifa24/img/cards/tiny/7.png',
    'totw': 'https://cdn3.futbin.com/content/fifa24/img/cards/tiny/11.png', // Example for TOTW, might need adjustments
    'tots': 'https://cdn3.futbin.com/content/fifa24/img/cards/tiny/13.png', // Example for TOTS
    'toty': 'https://cdn3.futbin.com/content/fifa24/img/cards/tiny/12.png', // Example for TOTY
    'hero': 'https://cdn3.futbin.com/content/fifa24/img/cards/tiny/22.png', // Example for Hero
    'icon': 'https://cdn3.futbin.com/content/fifa24/img/cards/tiny/9.png',   // Example for Icon
};
