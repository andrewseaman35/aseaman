import errno
import jinja2
import os
import time

from base import BaseScript

TEMPLATE_DIRNAME = 'templates'
WEBSITE_DIRNAME = 'website'
PUBLIC_DIRNAME = 'public'

POLL_TIME = 2
PAGES = ['about', 'index', 'patent']


class CompileHTML(BaseScript):
    aws_enabled = False

    def __init__(self):
        super(CompileHTML, self).__init__()
        self.website_dir = os.path.join(self.root, WEBSITE_DIRNAME)
        self.public_dir = os.path.join(self.website_dir, PUBLIC_DIRNAME)
        self.template_dir = os.path.join(self.website_dir, TEMPLATE_DIRNAME)

        self.modification_times = {}

        self.template_env = self._init_template_env()

    def _setup_parser(self):
        super(CompileHTML, self)._setup_parser()
        self.parser.add_argument("--watch", dest="watch", action="store_true", help="run with watcher")

    def _init_template_env(self):
        template_loader = jinja2.FileSystemLoader(searchpath=self.template_dir)
        template_env = jinja2.Environment(loader=template_loader)
        return template_env

    def _render_html(self, page):
        template_file_name = '{}.jinja2'.format(page)
        html_file_name = '{}.html'.format(page)
        page_content = self.template_env.get_template(template_file_name).render()

        try:
            os.mkdir(self.public_dir)
        except OSError as exc:
            if exc.errno != errno.EEXIST:
                raise

        with open(os.path.join(self.public_dir, html_file_name), 'w') as html_file:
            html_file.write(page_content)

    def render_all(self):
        self.log("Rendering {}".format(PAGES))
        for page in PAGES:
            self._render_html(page)

    def _run_watcher(self):
        print()
        print("-- Watcher enabled --")
        while True:
            with os.scandir(self.template_dir) as entries:
                for entry in entries:
                    modification_time = entry.stat().st_mtime
                    if entry.path not in self.modification_times:
                        self.modification_times[entry.path] = modification_time
                    elif modification_time > self.modification_times[entry.path]:
                        self.log("Detected change in {}".format(entry.name))
                        self.render_all()
                        self.modification_times = {}
            time.sleep(POLL_TIME)

    def _run(self):
        if self.args.watch:
            self._run_watcher()
        else:
            self.render_all()


if __name__ == '__main__':
    CompileHTML().run()
