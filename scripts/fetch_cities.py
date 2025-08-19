import os.path
import requests
import pycountry
import json
from zipfile import ZipFile
from csv import reader

# Download and output cites data to JSON file

def get_country_name(code):
    country = pycountry.countries.get(alpha_2=code)
    if country:
        return country.name
    elif code == "XK":
        # XK not recognised
        return "Kosovo"
    else:
        print(f"could not match {code}")
        return code

output_path = "src/data/"
os.makedirs(output_path, exist_ok=True)

url = "https://download.geonames.org/export/dump/cities15000.zip"
zip_path = f"{output_path}cities15000.zip"
json_path = f"{output_path}cities.json"

# Only run if JSON file not already present
if not os.path.exists(json_path):
    if not os.path.exists(zip_path):
        # Download zip
        res = requests.get(url)
        file_path = "src/data/cities15000.zip"

        if res.status_code == 200:
            with open(file_path, "wb") as file:
                file.write(res.content)
            print("File downloaded successfully")
        else:
            raise RuntimeError(f"Failed to download file: {res.status_code}")

    # Extract first txt file in zip
    with ZipFile(zip_path, "r") as zipObj:
        txt_files = [name for name in zipObj.namelist() if name.endswith(".txt")]
        if not txt_files:
            raise FileNotFoundError("No .txt files found in the zip")

        txt_file = txt_files[0]
        zipObj.extract(txt_file, path=output_path)
        print(f"Extracted {txt_file} to {output_path}")

    # Read the extracted file and build JSON array
    cities = []
    with open(f"{output_path}{txt_file}", newline='') as file:
        for row in reader(file, delimiter='\t'):
            city_data = {
                "city": row[1],
                "country": get_country_name(row[8]),
                "lat": float(row[4]),
                "long": float(row[5])
            }
            cities.append(city_data)

    # Write array to JSON file
    with open(f"{output_path}cities.json", "w", encoding="utf-8") as json_file:
        json.dump(cities, json_file, indent = 2, sort_keys=True, ensure_ascii=False)
    json_file.close()

    print(f"Saved {len(cities)} cities to {output_path}cities.json")

    # Clean up zip and extracted TXT
    os.remove(zip_path)
    os.remove(f"{output_path}{txt_file}")
    print("Temp files deleted")
else:
    print(f"{json_path} already exists")