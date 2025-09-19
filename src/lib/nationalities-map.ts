
import type { Nationality } from './types';

// This maps the full nationality name (used in the app) to a 2-letter ISO country code.
// The country code is then used to fetch the flag image from a CDN.
export const nationalityToCountryCode: Record<Nationality, string | null> = {
  'Sin Nacionalidad': null,
  'Alemania': 'DE',
  'Argentina': 'AR',
  'Australia': 'AU',
  'Austria': 'AT',
  'Bélgica': 'BE',
  'Brasil': 'BR',
  'Burkina Faso': 'BF',
  'Colombia': 'CO',
  'Corea del Sur': 'KR',
  'Croacia': 'HR',
  'Dinamarca': 'DK',
  'Escocia': 'GB-SCT', // Special case for Scotland within Great Britain
  'España': 'ES',
  'Estados Unidos': 'US',
  'Francia': 'FR',
  'Gales': 'GB-WLS', // Special case for Wales within Great Britain
  'Inglaterra': 'GB-ENG', // Special case for England within Great Britain
  'Irlanda': 'IE',
  'Italia': 'IT',
  'Japón': 'JP',
  'Marruecos': 'MA',
  'México': 'MX',
  'Nigeria': 'NG',
  'Noruega': 'NO',
  'Países Bajos': 'NL',
  'Polonia': 'PL',
  'Portugal': 'PT',
  'Senegal': 'SN',
  'Serbia': 'RS',
  'Suecia': 'SE',
  'Suiza': 'CH',
  'Turquía': 'TR',
  'Uruguay': 'UY',
};

