import requests
import sys

try:
    res = requests.get('http://127.0.0.1:5000/api/auth/login')
    print("Status:", res.status_code)
    print("Response:", res.text[:200])
except Exception as e:
    print("Error:", e)
