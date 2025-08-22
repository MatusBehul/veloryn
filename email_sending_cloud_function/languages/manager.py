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
            return DE_TRANSLATIONS.get(language, EN_TRANSLATIONS).get(key, EN_TRANSLATIONS[key])
        case 'it':
            return IT_TRANSLATIONS.get(language, EN_TRANSLATIONS).get(key, EN_TRANSLATIONS[key])
        case 'es':
            return ES_TRANSLATIONS.get(language, EN_TRANSLATIONS).get(key, EN_TRANSLATIONS[key])
        case 'sk':
            return SK_TRANSLATIONS.get(language, EN_TRANSLATIONS).get(key, EN_TRANSLATIONS[key])
        case 'cz':
            return CZ_TRANSLATIONS.get(language, EN_TRANSLATIONS).get(key, EN_TRANSLATIONS[key])
        case _:
            return EN_TRANSLATIONS.get(language, EN_TRANSLATIONS[key])


