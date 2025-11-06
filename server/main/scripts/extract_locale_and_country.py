import json


def extract_locale_and_country(json_data):
    if isinstance(json_data, str):
        data = json.loads(json_data)
    else:
        data = json_data

    results = []

    for record in data:
        locale = record.get("locale", "").replace("-", "_")

        country_code = record.get("country", {}).get("code", "")

        results.append({"locale": locale, "country_code": country_code})

    return results


def extract_to_dict(json_data):
    if isinstance(json_data, str):
        data = json.loads(json_data)
    else:
        data = json_data

    result_dict = {}

    for record in data:
        locale = record.get("locale", "").replace("-", "_")

        country_code = record.get("country", {}).get("code", "")

        if country_code:
            result_dict[country_code] = locale

    return result_dict


def extract_to_dict2(json_data):
    if isinstance(json_data, str):
        data = json.loads(json_data)
    else:
        data = json_data

    result_dict = {}

    for record in data:
        locale = record.get("locale", "").replace("-", "_")

        country_code = record.get("country", {}).get("code", "")

        if country_code and locale:
            parts = locale.split("_")
            if len(parts) >= 1:
                language_code = parts[0]
                locale = f"{language_code}_{language_code.upper()}"

            result_dict[country_code] = locale

    return result_dict


FAKER_LOCALES = {
}

# Faker locales without country codes (language-only)
FAKER_LANGUAGE_ONLY = [
    "ar",
    "az",
    "base",
    "cy",
    "da",
    "de",
    "el",
    "en",
    "eo",
    "es",
    "fa",
    "fi",
    "fr",
    "he",
    "hr",
    "hu",
    "it",
    "ja",
    "ko",
    "lv",
    "nl",
    "pl",
    "ro",
    "ru",
    "sk",
    "sv",
    "th",
    "tr",
    "uk",
    "vi",
]

# Create a mapping: language_code -> faker locale (with or without country)
LANGUAGE_TO_FAKER = {}

# Add language-only locales
for lang in FAKER_LANGUAGE_ONLY:
    LANGUAGE_TO_FAKER[lang] = lang

# Add country-specific locales (these override language-only if they exist)
for country_code, faker_locale in FAKER_LOCALES.items():
    language_code = faker_locale.split("_")[0]
    if language_code not in LANGUAGE_TO_FAKER:
        LANGUAGE_TO_FAKER[language_code] = faker_locale


def extract_to_dict_with_faker(json_data):
    if isinstance(json_data, str):
        data = json.loads(json_data)
    else:
        data = json_data

    result_dict = {}

    for record in data:
        locale = record.get("locale", "").replace("-", "_")
        country_code = record.get("country", {}).get("code", "")

        if country_code and locale:
            # Extract language code from the locale
            language_code = locale.split("_")[0]

            # Priority 1: Check if there's a faker locale for this exact country
            if country_code in FAKER_LOCALES:
                faker_locale = FAKER_LOCALES[country_code]
            # Priority 2: Check if there's a faker locale for this language
            elif language_code in LANGUAGE_TO_FAKER:
                faker_locale = LANGUAGE_TO_FAKER[language_code]
            else:
                # Fallback: use the original locale format
                faker_locale = "en_US"

            result_dict[country_code] = faker_locale

    return result_dict


if __name__ == "__main__":
    with open("../fixtures/locales.json", "r") as f:
        data = json.load(f)

    result = extract_to_dict_with_faker(data)

    with open("output.json", "w") as f:
        json.dump(result, f, indent=2)
