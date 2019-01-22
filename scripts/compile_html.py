import jinja2
import os

TEMPLATE_DIRNAME = 'templates'
WEBSITE_DIRNAME = 'website'

PAGES = ['about', 'index', 'patent']


class CompileHTML():
    def __init__(self):
        script_dir = os.path.dirname(os.path.realpath(__file__))
        self.website_dir = os.path.join(os.path.dirname(script_dir), WEBSITE_DIRNAME)
        self.template_dir = os.path.join(self.website_dir, TEMPLATE_DIRNAME)

        self.template_env = self.init_template_env()

    def init_template_env(self):
        template_loader = jinja2.FileSystemLoader(searchpath=self.template_dir)
        template_env = jinja2.Environment(loader=template_loader)
        return template_env

    def render_html(self, page):
        template_file_name = '{}.jinja2'.format(page)
        html_file_name = '{}.html'.format(page)
        page_content = self.template_env.get_template(template_file_name).render()

        with open(os.path.join(self.website_dir, html_file_name), 'w') as html_file:
            html_file.write(page_content)

    def run(self):
        for page in PAGES:
            self.render_html(page)
            print("{} rendered".format(page))


if __name__ == '__main__':
    CompileHTML().run()
