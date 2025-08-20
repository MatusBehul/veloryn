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

// Easy extension: just add new languages here
export const ADDITIONAL_LANGUAGES: Language[] = [
  // Example of how to add more languages:
  // {
  //   code: 'fr',
  //   name: 'French',
  //   nativeName: 'Français',
  //   flag: '🇫🇷',
  //   direction: 'ltr'
  // },
  // {
  //   code: 'ja',
  //   name: 'Japanese',
  //   nativeName: '日本語',
  //   flag: '🇯🇵',
  //   direction: 'ltr'
  // },
  // {
  //   code: 'zh',
  //   name: 'Chinese',
  //   nativeName: '中文',
  //   flag: '🇨🇳',
  //   direction: 'ltr'
  // }
];

export const ALL_LANGUAGES = [...SUPPORTED_LANGUAGES, ...ADDITIONAL_LANGUAGES];

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

// Translation keys for UI elements (can be extended)
export const UI_TRANSLATIONS = {
  en: {
    overall_analysis: 'Overall Analysis',
    technical_analysis: 'Technical Analysis',
    fundamental_analysis: 'Fundamental Analysis',
    sentiment_analysis: 'Sentiment Analysis',
    risk_analysis: 'Risk Analysis',
    investment_insights: 'Investment Insights',
    investment_narrative: 'Investment Narrative',
    select_language: 'Select Language',
    language: 'Language',
    switch_language: 'Switch Language'
  },
  de: {
    overall_analysis: 'Gesamtanalyse',
    technical_analysis: 'Technische Analyse',
    fundamental_analysis: 'Fundamentalanalyse',
    sentiment_analysis: 'Sentiment-Analyse',
    risk_analysis: 'Risikoanalyse',
    investment_insights: 'Investitionserkenntnisse',
    investment_narrative: 'Investment-Narrativ',
    select_language: 'Sprache auswählen',
    language: 'Sprache',
    switch_language: 'Sprache wechseln'
  },
  cz: {
    overall_analysis: 'Celková analýza',
    technical_analysis: 'Technická analýza',
    fundamental_analysis: 'Fundamentální analýza',
    sentiment_analysis: 'Analýza sentimentu',
    risk_analysis: 'Analýza rizik',
    investment_insights: 'Investiční poznatky',
    investment_narrative: 'Investiční příběh',
    select_language: 'Vyberte jazyk',
    language: 'Jazyk',
    switch_language: 'Změnit jazyk'
  },
  sk: {
    overall_analysis: 'Celková analýza',
    technical_analysis: 'Technická analýza',
    fundamental_analysis: 'Fundamentálna analýza',
    sentiment_analysis: 'Analýza sentimentu',
    risk_analysis: 'Analýza rizík',
    investment_insights: 'Investičné poznatky',
    investment_narrative: 'Investičný príbeh',
    select_language: 'Vyberte jazyk',
    language: 'Jazyk',
    switch_language: 'Zmeniť jazyk'
  },
  es: {
    overall_analysis: 'Análisis General',
    technical_analysis: 'Análisis Técnico',
    fundamental_analysis: 'Análisis Fundamental',
    sentiment_analysis: 'Análisis de Sentimiento',
    risk_analysis: 'Análisis de Riesgo',
    investment_insights: 'Perspectivas de Inversión',
    investment_narrative: 'Narrativa de Inversión',
    select_language: 'Seleccionar idioma',
    language: 'Idioma',
    switch_language: 'Cambiar idioma'
  },
  it: {
    overall_analysis: 'Analisi Generale',
    technical_analysis: 'Analisi Tecnica',
    fundamental_analysis: 'Analisi Fondamentale',
    sentiment_analysis: 'Analisi del Sentiment',
    risk_analysis: 'Analisi del Rischio',
    investment_insights: 'Insight di Investimento',
    investment_narrative: 'Narrativa di Investimento',
    select_language: 'Seleziona lingua',
    language: 'Lingua',
    switch_language: 'Cambia lingua'
  }
} as const;

export type UITranslationKey = keyof typeof UI_TRANSLATIONS.en;

export function getUITranslation(key: UITranslationKey, language: string = DEFAULT_LANGUAGE): string {
  const translations = UI_TRANSLATIONS[language as keyof typeof UI_TRANSLATIONS];
  return translations?.[key] || UI_TRANSLATIONS[DEFAULT_LANGUAGE][key] || key;
}
