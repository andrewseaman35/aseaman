import errno
import jinja2
import os
import time

from base import BaseScript

TEMPLATE_DIRNAME = 'templates'
WEBSITE_DIRNAME = 'website'
PUBLIC_DIRNAME = 'public'

PAGES = ['about', 'index', 'patent', 'auth_callback', 'logout']


class CompileHTML(BaseScript):
    aws_enabled = False

    def __init__(self):
        super(CompileHTML, self).__init__()
        self.website_dir = os.path.join(self.root, WEBSITE_DIRNAME)
        self.public_dir = os.path.join(self.website_dir, PUBLIC_DIRNAME)
        self.template_dir = os.path.join(self.website_dir, TEMPLATE_DIRNAME)

        self.modification_times = {}

        self.template_env = self._init_template_env()

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

    def _run(self):
        self.render_all()


if __name__ == '__main__':
    CompileHTML().run()
