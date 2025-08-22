from .en import EN_TRANSLATIONS
from .de import DE_TRANSLATIONS
from .it import IT_TRANSLATIONS
from .es import ES_TRANSLATIONS
from .sk import SK_TRANSLATIONS
from .cz import CZ_TRANSLATIONS

def get_translation(key: str, language: str = 'en') -> str:
    """Get translation for a given key and language"""
    match language:
        case 'de':
            if key not in DE_TRANSLATIONS:
                print(f"No German translation found for key '{key}', defaulting to English.")
            return DE_TRANSLATIONS.get(key, EN_TRANSLATIONS[key])
        case 'it':
            if key not in IT_TRANSLATIONS:
                print(f"No Italian translation found for key '{key}', defaulting to English.")
            return IT_TRANSLATIONS.get(key, EN_TRANSLATIONS[key])
        case 'es':
            if key not in ES_TRANSLATIONS:
                print(f"No Spanish translation found for key '{key}', defaulting to English.")
            return ES_TRANSLATIONS.get(key, EN_TRANSLATIONS[key])
        case 'sk':
            if key not in SK_TRANSLATIONS:
                print(f"No Slovak translation found for key '{key}', defaulting to English.")
            return SK_TRANSLATIONS.get(key, EN_TRANSLATIONS[key])
        case 'cz':
            if key not in CZ_TRANSLATIONS:
                print(f"No Czech translation found for key '{key}', defaulting to English.")
            return CZ_TRANSLATIONS.get(key, EN_TRANSLATIONS[key])
        case 'en':
            if key not in EN_TRANSLATIONS:
                print(f"No English translation found for key '{key}', defaulting to KEY.")
            return EN_TRANSLATIONS.get(key, key)
        case _:
            print(f"No translation found for language '{language}', defaulting to English.")
            if key not in EN_TRANSLATIONS:
                print(f"No English translation found for key '{key}', defaulting to KEY.")
            return EN_TRANSLATIONS.get(key, key)


