import os
import threading
import time
import subprocess

from base import BaseScript
from compile_html import CompileHTML


class Watcher(object):
    """
    A simple file watch that calls a function whenever files within a given
    directory are updated.

    NOTE: Currently does not update on files within folders.
    """
    POLL_TIME = 2

    def __init__(self, name, watched_dir, on_update):
        self.name = name
        self.watched_dir = watched_dir
        self.on_update = on_update
        self.modification_times = {}

    def log(self, t):
        timestamp = time.strftime("%Y-%m-%d %H:%M:%S")
        print('{}: {} watcher - {}'.format(timestamp, self.name, t))

    def watch(self):
        self.log("started")
        while True:
            with os.scandir(self.watched_dir) as entries:
                for entry in entries:
                    modification_time = entry.stat().st_mtime
                    if entry.path not in self.modification_times:
                        self.modification_times[entry.path] = modification_time
                    elif modification_time > self.modification_times[entry.path]:
                        self.log("Detected change in {}".format(entry.name))
                        self.on_update()
                        self.modification_times = {}
            time.sleep(self.POLL_TIME)


class RunWatchers(BaseScript):
    def __init__(self):
        super(RunWatchers, self).__init__()
        self.website_dir = os.path.join(self.root, 'website')
        self.jinja_dir = os.path.join(self.website_dir, 'templates')
        self.scss_dir = os.path.join(self.website_dir, 'scss')
        self.js_dir = os.path.join(self.website_dir, 'js', 'src')

        self.js_input = os.path.join(self.website_dir, 'js', 'src', 'main.js')
        self.js_output = os.path.join(self.website_dir, 'public', 'js', 'bundle.js')
        self.scss_input = os.path.join(self.website_dir, 'scss', 'main.scss')
        self.scss_output = os.path.join(self.website_dir, 'public', 'css', 'main.css')

        self.compile_html = CompileHTML()

    def _new_watcher_thread(self, name, watch_dir, on_update):
        watcher = Watcher(name, watch_dir, on_update)
        thread = threading.Thread(name=name, target=watcher.watch)
        return thread

    def trigger_scss_build(self):
        subprocess.call(['sass', self.scss_input, self.scss_output])

    def trigger_js_build(self):
        subprocess.call(['browserify', self.js_input, '-o', self.js_output, '-d'])

    def _run(self):
        self.jinja_thread = self._new_watcher_thread('jinja', self.jinja_dir, self.compile_html.run)
        self.scss_thread = self._new_watcher_thread('scss', self.scss_dir, self.trigger_scss_build)
        self.js_thread = self._new_watcher_thread('js', self.js_dir, self.trigger_js_build)

        self.jinja_thread.start()
        self.scss_thread.start()
        self.js_thread.start()


if __name__ == '__main__':
    RunWatchers().run()
