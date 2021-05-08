import time
from api import app, db

@app.route('/time')
def get_current_time():
    return { "time": time.time() }
