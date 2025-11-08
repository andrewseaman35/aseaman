"""
Scrapes game data from mamedb.com
"""

import json
import os
import requests
import time

from bs4 import BeautifulSoup


def get_url_format(year, page):
    if page == 0:
        return f"http://www.mamedb.com/year/{year}.html"
    return f"http://www.mamedb.com/year/{year}_start={page  * 20}.html"


SLEEP_BETWEEN_PAGES = 0
BASE_DIR = os.path.join(os.path.dirname(__file__), "mame_data_tables")
WARNING_FILE = os.path.join(BASE_DIR, "log.txt")


def get_table_file(year):
    return os.path.join(BASE_DIR, f"{year}.csv")


def get_json_file(year):
    return os.path.join(BASE_DIR, f"{year}.json")


YEARS = {
    "1969": {"num_pages": 726},
    "1972": {"num_pages": 1},
    "1975": {"num_pages": 1},
    "1976": {"num_pages": 2},
    "1976": {"num_pages": 3},
    "1978": {"num_pages": 6},
    "1979": {"num_pages": 10},
    "1980": {"num_pages": 15},
    "1981": {"num_pages": 19},
    "1982": {"num_pages": 21},
    "1983": {"num_pages": 21},
    "1984": {"num_pages": 1},
    "1985": {"num_pages": 22},
    "1986": {"num_pages": 23},
    "1987": {"num_pages": 25},
    "1988": {"num_pages": 25},
    "1989": {"num_pages": 29},
    "1990": {"num_pages": 27},
    "1991": {"num_pages": 33},
    "1992": {"num_pages": 27},
    "1993": {"num_pages": 31},
    "1994": {"num_pages": 31},
    "1995": {"num_pages": 31},
    "1996": {"num_pages": 32},
    "1997": {"num_pages": 21},
    "1998": {"num_pages": 21},
    "1999": {"num_pages": 19},
    "2000": {"num_pages": 16},
    "2001": {"num_pages": 13},
    "2002": {"num_pages": 17},
    "2003": {"num_pages": 16},
    "2004": {"num_pages": 12},
    "2005": {"num_pages": 17},
    "2007": {"num_pages": 2},
    "2008": {"num_pages": 2},
}


def write_log(warning):
    print(warning)
    with open(WARNING_FILE, "a+") as f:
        f.write(warning)
        f.write("\n")


def extract_data_from_page(url, table_file, json_file):
    resp = requests.get(url, headers={"User-Agent": "Chrome"})
    print(resp)

    html = resp.text
    soup = BeautifulSoup(html, "html.parser")
    try:
        results_table = soup.find("table", {"id": "resultsTable"})
        table_body = results_table.find("tbody")
        table_rows = table_body.find_all("tr")
    except:
        write_log(f"WARN: parsing failed on url: {url}")
        return

    metadata = {}
    row_num = 0
    with open(table_file, "a+") as f:
        for row in table_rows:
            row_num += 1
            try:
                cols = row.find_all("td")
                line = ",".join([c.text.strip() for c in cols])
                title = cols[1].text.strip()
                rom_name = cols[4].text.strip()
                f.write(line)
                f.write("\n")
                if rom_name in metadata:
                    write_log(f"WARN: duplicated {rom_name}")
                else:
                    metadata[rom_name] = title
            except:
                write_log(f"WARN: issue parsing table on {url}, row {row_num}")

    if os.path.exists(json_file):
        with open(json_file, "r") as f:
            metadata.update(json.load(f))
    with open(json_file, "w+") as f:
        f.write(json.dumps(metadata))


for year in YEARS:
    if year in {"1969", "1972"}:
        continue
    print(f"== Starting year: {year}")
    definition = YEARS[year]
    start_page = definition.get("start_page", 0)
    end_page = definition.get("end_page", definition["num_pages"] - 1)
    for i in range(start_page, end_page):
        print(f"Page {i} of {end_page}")
        extract_data_from_page(
            get_url_format(year, i), get_table_file(year), get_json_file(year)
        )
        time.sleep(SLEEP_BETWEEN_PAGES)
