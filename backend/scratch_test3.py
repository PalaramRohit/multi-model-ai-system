import requests

try:
    res = requests.get('https://ai-multimodel-beta.vercel.app/')
    print("Status:", res.status_code)
    print("Response:", res.text[:300])
except Exception as e:
    print("Error:", e)
