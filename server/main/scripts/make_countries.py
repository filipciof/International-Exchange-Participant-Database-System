import json

with open('../countries.json', 'r') as f:
    data = json.load(f)

transformed_data = []
for index, item in enumerate(data, start=1):
    transformed_item = {
        "model": "main.country",
        "pk": index,
        "fields": item
    }
    transformed_data.append(transformed_item)

with open('output.json', 'w') as f:
    json.dump(transformed_data, f, indent=2)