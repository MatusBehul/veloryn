import { EN_TRANSLATIONS } from './en';
import { DE_TRANSLATIONS } from './de';
import { IT_TRANSLATIONS } from './it';
import { ES_TRANSLATIONS } from './es';
import { SK_TRANSLATIONS } from './sk';
import { CZ_TRANSLATIONS } from './cz';
// Language configuration for multi-language support

export interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  direction?: 'ltr' | 'rtl';
}

export const SUPPORTED_LANGUAGES: Language[] = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
    direction: 'ltr'
  },
  {
    code: 'de',
    name: 'German',
    nativeName: 'Deutsch',
    flag: '🇩🇪',
    direction: 'ltr'
  },
  {
    code: 'cz',
    name: 'Czech',
    nativeName: 'Čeština',
    flag: '🇨🇿',
    direction: 'ltr'
  },
  {
    code: 'sk',
    name: 'Slovak',
    nativeName: 'Slovenčina',
    flag: '🇸🇰',
    direction: 'ltr'
  },
  {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    flag: '🇪🇸',
    direction: 'ltr'
  },
  {
    code: 'it',
    name: 'Italian',
    nativeName: 'Italiano',
    flag: '🇮🇹',
    direction: 'ltr'
  }
];

export const ALL_LANGUAGES = SUPPORTED_LANGUAGES;
export const DEFAULT_LANGUAGE = 'en';

// Helper functions
export function getLanguageByCode(code: string): Language | undefined {
  return ALL_LANGUAGES.find(lang => lang.code === code);
}

export function getLanguageName(code: string): string {
  const language = getLanguageByCode(code);
  return language?.nativeName || language?.name || code.toUpperCase();
}

export function getLanguageFlag(code: string): string {
  const language = getLanguageByCode(code);
  return language?.flag || '🌐';
}

export function isLanguageSupported(code: string): boolean {
  return ALL_LANGUAGES.some(lang => lang.code === code);
}

// Get available languages from analysis data
export function getAvailableLanguagesFromAnalysis(analysisData: any): Language[] {
  if (!analysisData || typeof analysisData !== 'object') {
    return [getLanguageByCode(DEFAULT_LANGUAGE)!];
  }

  const availableCodes = Object.keys(analysisData);
  return availableCodes
    .map(code => getLanguageByCode(code))
    .filter(Boolean) as Language[];
}

export type UITranslationKey = keyof typeof EN_TRANSLATIONS;

// Function to get UI translation
export function getUITranslation(key: UITranslationKey, languageCode: string = DEFAULT_LANGUAGE): string {
    switch (languageCode) {
    case 'en':
      return EN_TRANSLATIONS[key] || EN_TRANSLATIONS[key] || key;
    case 'de':
      return DE_TRANSLATIONS[key] || EN_TRANSLATIONS[key] || key;
    case 'it':
      return IT_TRANSLATIONS[key] || EN_TRANSLATIONS[key] || key;
    case 'es':
      return ES_TRANSLATIONS[key] || EN_TRANSLATIONS[key] || key;
    case 'sk':
      return SK_TRANSLATIONS[key] || EN_TRANSLATIONS[key] || key;
    case 'cz':
      return CZ_TRANSLATIONS[key] || EN_TRANSLATIONS[key] || key;
    // Future cases for other languages can be added here
    default:
      return EN_TRANSLATIONS[key] || EN_TRANSLATIONS[key] || key;
    }
}
