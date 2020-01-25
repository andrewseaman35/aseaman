import os
import threading
import time
import subprocess

from base import BaseScript
from compile_html import CompileHTML


class Watcher(object):
    """
    A simple file watcher that calls a function whenever files within a given
    directory are updated.
    """
    POLL_TIME = 2

    def __init__(self, name, watched_dir, on_update):
        self.name = name
        self.watched_dir = watched_dir
        self.on_update = on_update
        self.last_modification_time = None

    def log(self, t):
        timestamp = time.strftime("%Y-%m-%d %H:%M:%S")
        print('{}: {} watcher - {}'.format(timestamp, self.name, t))

    def get_last_update_time(self):
        return max(
            ((filename, os.stat(os.path.join(subdirectory, filename)).st_mtime)
            for (subdirectory, _, filenames) in os.walk(self.watched_dir)
            for filename in filenames),
            key=lambda x: x[1]
        )

    def watch(self):
        self.log("started")
        while True:
            modified_file, modification_time = self.get_last_update_time()
            if not self.last_modification_time or modification_time > self.last_modification_time:
                self.log("Detected change in {}".format(modified_file))
                try:
                    self.on_update()
                except:
                    self.log("Update failed!")
                else:
                    self.log("Files updated")
                self.last_modification_time = modification_time
            time.sleep(self.POLL_TIME)


class RunWatchers(BaseScript):
    def __init__(self):
        super(RunWatchers, self).__init__()
        self.website_dir = os.path.join(self.root, 'website')
        self.jinja_dir = os.path.join(self.website_dir, 'templates')
        self.scss_dir = os.path.join(self.website_dir, 'scss')
        self.js_dir = os.path.join(self.website_dir, 'js', 'src')

        self.jinja_thread = None
        self.scss_thread = None
        self.js_thread = None

        self.compile_html = CompileHTML()

    def _new_watcher_thread(self, name, watch_dir, on_update):
        watcher = Watcher(name, watch_dir, on_update)
        thread = threading.Thread(name=name, target=watcher.watch)
        return thread

    def trigger_jinja_build(self):
        try:
            self.compile_html.run()
        except Exception as e:
            print("Error while building HTML: {}".format(e))

    def trigger_scss_build(self):
        subprocess.check_output(['make', '-C', 'website', 'css'])

    def trigger_js_build(self):
        subprocess.check_output(['make', '-C', 'website', 'build_local_js'])

    def _run(self):
        self.jinja_thread = self._new_watcher_thread('jinja', self.jinja_dir, self.trigger_jinja_build)
        self.scss_thread = self._new_watcher_thread('scss', self.scss_dir, self.trigger_scss_build)
        self.js_thread = self._new_watcher_thread('js', self.js_dir, self.trigger_js_build)

        self.jinja_thread.start()
        self.scss_thread.start()
        self.js_thread.start()


if __name__ == '__main__':
    RunWatchers().run()
