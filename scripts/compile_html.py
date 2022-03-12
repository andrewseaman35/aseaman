from collections import defaultdict
import errno
import json
import os
import time

import jinja2

from base import BaseScript

TEMPLATE_DIRNAME = "templates"
WEBSITE_DIRNAME = "website"
PUBLIC_DIRNAME = "public"
PAGES_DIRNAME = "pages"

CONFIG_FILENAME = "config.json"

# list of `relative_html_filepath`s that we should also render a .html for
RENDER_HTML_EXTENSION = {"index"}


class CompileHTML(BaseScript):
    aws_enabled = False

    def __init__(self):
        super(CompileHTML, self).__init__()
        self.website_dir = os.path.join(self.root, WEBSITE_DIRNAME)
        self.public_dir = os.path.join(self.website_dir, PUBLIC_DIRNAME)
        self.template_dir = os.path.join(self.website_dir, TEMPLATE_DIRNAME)
        self.pages_dir = os.path.join(self.template_dir, PAGES_DIRNAME)

        self.modification_times = {}

        self.template_env = self._init_template_env()

    def _load_config(self):
        config_file = os.path.join(self.website_dir, CONFIG_FILENAME)
        with open(config_file, "r") as f:
            config = json.load(f)
        return config

    def _init_template_env(self):
        template_loader = jinja2.FileSystemLoader(self.template_dir)
        template_env = jinja2.Environment(loader=template_loader)
        return template_env

    def _render_html(self, relative_path, template_filename, output_directory, context):
        html_filename = template_filename.replace(".jinja2", "")

        template_filepath = os.path.join(
            "./pages", os.path.join(relative_path, template_filename)
        )
        page_content = self.template_env.get_template(template_filepath).render(context)

        relative_html_filepath = os.path.join(relative_path, html_filename)
        html_filepath = os.path.join(self.public_dir, relative_html_filepath)
        with open(html_filepath, "w") as html_file:
            html_file.write(page_content)

        if relative_html_filepath in RENDER_HTML_EXTENSION:
            with open(f"{html_filepath}.html", "w") as html_file:
                html_file.write(page_content)

    def _find_template_path_by_directory(self):
        template_path_by_directory = defaultdict(list)
        for dir_name, _, file_list in os.walk(self.pages_dir):
            for fname in [
                fname for fname in file_list if os.path.splitext(fname)[1] == ".jinja2"
            ]:
                file_path = os.path.join(dir_name, fname)

                # Find the directory structure the file lives in beyond the pages directory
                relative_file_dir = os.path.split(
                    os.path.relpath(file_path, self.pages_dir)
                )[0]
                template_path_by_directory[relative_file_dir].append(file_path)

        return template_path_by_directory

    def _generate_output_directory_structure(self, relative_directories):
        for relative_directory in relative_directories:
            os.makedirs(
                os.path.join(self.public_dir, relative_directory), exist_ok=True
            )

    def _get_context(self):
        config = self._load_config()
        return config

    def render_all(self):
        template_path_by_directory = self._find_template_path_by_directory()
        self._generate_output_directory_structure(template_path_by_directory.keys())

        context = self._get_context()

        for relative_directory, filepaths in template_path_by_directory.items():
            output_directory = os.path.join(self.public_dir, relative_directory)
            for filepath in filepaths:
                filename = os.path.basename(filepath)
                self._render_html(
                    relative_directory, filename, output_directory, context
                )

    def _run(self):
        self.render_all()


if __name__ == "__main__":
    CompileHTML().run()
