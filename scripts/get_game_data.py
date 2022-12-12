import json
import os
import sys

write_game_metadata = False
if len(sys.argv) == 2:
    write_game_metadata = sys.argv[1].strip() == "write_metadata"
print(sys.argv[1])


BASE_DIR = os.path.join(os.path.dirname(__file__), "mame_data_tables")

files = os.listdir(BASE_DIR)

all_game_titles = {}
json_files = [f for f in files if f.endswith(".json")]
for json_file in json_files:
    new_file_contents = json.load(open(os.path.join(BASE_DIR, json_file), "r"))
    overlap = set(new_file_contents.keys()) & set(all_game_titles.keys())
    if overlap:
        print(overlap)
    all_game_titles.update(new_file_contents)

if write_game_metadata:
    print("Writing game metadata")
    game_metadata = {
        k: {"title": v.split("\u00a0")[0]} for (k, v) in all_game_titles.items()
    }
    with open("./game_metadata.json", "w+") as f:
        json.dump(game_metadata, f, sort_keys=True)

while True:
    game_id = input("Game: ")
    if game_id in all_game_titles:
        print(f"{all_game_titles[game_id]}")
    else:
        print(f"{game_id} not found!")
