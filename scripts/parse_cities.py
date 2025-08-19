import os.path
import json

# Standardise country names

file_path = "src/data/cities.json"
updated_countries = {
    "Bolivia, Plurinational State of": "Bolivia",
    "Brunei Darussalam": "Brunei",
    "Cabo Verde": "Cape Verde",
    "Congo, The Democratic Republic of the": "Democratic Republic of the Congo",
    "Czechia": "Czech Republic",
    "Iran, Islamic Republic of": "Iran",
    "Korea, Democratic People's Republic of": "North Korea",
    "Korea, Republic of": "South Korea",
    "Lao People's Democratic Republic": "Laos",
    "Macao": "Macau",
    "Micronesia, Federated States of": "Micronesia",
    "Moldova, Republic of": "Moldova",
    "Palestine, State of": "Palestine",
    "Russian Federation": "Russia",
    "Saint Helena, Ascension and Tristan da Cunha": "Saint Helena",
    "Saint Kitts and Nevis": "St. Kitts and Nevis",
    "Saint Vincent and the Grenadines": "St. Vincent and the Grenadines",
    "Syrian Arab Republic": "Syria",
    "Taiwan, Province of China": "Taiwan",
    "Tanzania, United Republic of": "Tanzania",
    "Holy See (Vatican City State)": "Vatican City State",
    "Venezuela, Bolivarian Republic of": "Venezuela",
    "Viet Nam": "Vietnam",
    "Virgin Islands, British": "British Virgin Islands",
    "Virgin Islands, U.S.": "U.S. Virgin Islands",
}


if os.path.exists(file_path):
    with open(file_path, "r", encoding="utf-8") as file:
        cities = json.load(file)

    for city in cities:
        country = city.get("country")
        if country in updated_countries:
            city["country"] = updated_countries[country]

    with open(file_path, "w", encoding="utf-8") as file:
        json.dump(cities, file, ensure_ascii=False, indent=2)

    print("Countries updated successfully")
else:
    print(f"{file_path} not found")
