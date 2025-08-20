# Multi-Language Analysis Support

This system provides comprehensive support for displaying financial analysis in multiple languages with easy extensibility.

## Features

- **Easy Language Extension**: Add new languages by simply updating the configuration
- **Automatic Language Detection**: Detects available languages from analysis data
- **Language Selector UI**: Multiple UI variants (dropdown, tabs, pills)
- **React Context**: Global language state management
- **Analysis-Aware Hooks**: Automatically extracts correct language content

## Quick Start

### 1. Language Configuration

Languages are defined in `/src/lib/languages.ts`:

```typescript
export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
  { code: 'cz', name: 'Czech', nativeName: 'Čeština' },
  { code: 'sk', name: 'Slovak', nativeName: 'Slovenčina' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano' },
];
```

### 2. Using the Language Hook

```typescript
import { useAnalysisLanguage } from '@/hooks/useLanguage';

function AnalysisComponent({ analysisData }) {
  const { currentAnalysis, hasMultipleLanguages } = useAnalysisLanguage(analysisData);
  
  // currentAnalysis contains the analysis in the selected language
  // hasMultipleLanguages is true if analysis has content in multiple languages
}
```

### 3. Adding Language Selector

```typescript
import { LanguageSelector } from '@/components/LanguageSelector';

// Different UI variants
<LanguageSelector variant="dropdown" showText={true} />
<LanguageSelector variant="tabs" showText={false} />
<LanguageSelector variant="pills" showText={true} />
```

### 4. Expected Analysis Data Structure

```typescript
const analysisData = {
  en: {
    overall_analysis: ["English analysis content..."],
    investment_narrative: ["English investment story..."],
    fundamental_analysis: ["English fundamentals..."],
    // ... other sections
  },
  de: {
    overall_analysis: ["German analysis content..."],
    investment_narrative: ["German investment story..."],
    fundamental_analysis: ["German fundamentals..."],
    // ... other sections
  },
  // ... other languages
};
```

## Components

### LanguageProvider

Wrap your app with the `LanguageProvider` to enable language context:

```typescript
import { LanguageProvider } from '@/hooks/useLanguage';

export default function RootLayout({ children }) {
  return (
    <LanguageProvider>
      {children}
    </LanguageProvider>
  );
}
```

### Language Selector

Three UI variants available:

- **Dropdown**: Compact, good for headers
- **Tabs**: Horizontal layout, good for navigation
- **Pills**: Rounded buttons, good for inline selection

### TextualAnalysis Component

A complete component for displaying multi-language analysis content:

```typescript
import { TextualAnalysis } from '@/components/TextualAnalysis';

<TextualAnalysis 
  analysisData={analysisData} 
  ticker="AAPL" 
/>
```

## Adding New Languages

1. **Update Language Config**: Add the language to `SUPPORTED_LANGUAGES` in `/src/lib/languages.ts`
2. **Add Translations**: Update UI translation keys in the same file
3. **Backend Support**: Ensure your analysis generation includes the new language

Example of adding French:

```typescript
// In languages.ts
export const SUPPORTED_LANGUAGES = [
  // ... existing languages
  { code: 'fr', name: 'French', nativeName: 'Français' },
];

export const UI_TRANSLATIONS = {
  // ... existing translations
  fr: {
    language: 'Langue',
    analysis: 'Analyse',
    loading: 'Chargement...',
    // ... other keys
  },
};
```

## Integration Examples

### Analysis Detail Page

```typescript
export default function AnalysisPage() {
  const { currentAnalysis, hasMultipleLanguages } = useAnalysisLanguage(analysis?.analysis_overview?.analysis_data);
  
  return (
    <div>
      {/* Header with language selector */}
      {hasMultipleLanguages && (
        <div className="flex items-center space-x-2">
          <span>Language:</span>
          <LanguageSelector variant="pills" showText={false} />
        </div>
      )}
      
      {/* Display analysis content */}
      <TextualAnalysis 
        analysisData={analysis?.analysis_overview?.analysis_data}
        ticker={analysis?.ticker}
      />
    </div>
  );
}
```

### Header Integration

```typescript
export function Header() {
  const { availableLanguages } = useLanguage();
  
  return (
    <header>
      {/* ... other header content */}
      {availableLanguages.length > 1 && (
        <LanguageSelector variant="dropdown" showText={false} />
      )}
    </header>
  );
}
```

## API Integration

The system expects analysis data to be structured with language codes as top-level keys. When fetching from your API, ensure the response format matches:

```typescript
// API Response
{
  "ticker": "AAPL",
  "date": "2024-01-15",
  "analysis_overview": {
    "analysis_data": {
      "en": { /* English analysis */ },
      "de": { /* German analysis */ },
      "cz": { /* Czech analysis */ },
      // ... other languages
    }
  }
}
```

## Best Practices

1. **Fallback Strategy**: The system automatically falls back to English, then to the first available language
2. **Performance**: Language context is optimized to prevent unnecessary re-renders
3. **Accessibility**: Language selectors include proper ARIA labels
4. **Mobile-Friendly**: All components are responsive and touch-friendly
5. **Extensibility**: Adding new languages requires minimal code changes

## Troubleshooting

- **Language not showing**: Ensure the language is included in `SUPPORTED_LANGUAGES`
- **Content not switching**: Check that analysis data has the language key
- **UI not translating**: Verify UI translations are added to `UI_TRANSLATIONS`
- **Context errors**: Ensure components are wrapped in `LanguageProvider`
