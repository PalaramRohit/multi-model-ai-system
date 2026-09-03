import threading
import time
import requests
import sys

# Import app
sys.path.insert(0, 'c:/Users/palar/OneDrive/Documents/ai-multimodel/backend')
from app import app

def run_app():
    app.run(port=5005, use_reloader=False)

t = threading.Thread(target=run_app)
t.daemon = True
t.start()

time.sleep(2)

print("Testing root...")
r = requests.get('http://127.0.0.1:5005/')
print(r.status_code)

print("Testing API GET...")
r = requests.get('http://127.0.0.1:5005/api/auth/login')
print(r.status_code, r.text[:100])

print("Testing API POST to undefined route...")
r = requests.post('http://127.0.0.1:5005/api/auth/loginnnn')
print(r.status_code, r.text[:100])

print("Testing API GET to trailing slash...")
r = requests.get('http://127.0.0.1:5005/api/auth/login/')
print(r.status_code, r.text[:100])
