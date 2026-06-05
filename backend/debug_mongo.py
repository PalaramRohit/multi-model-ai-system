from pymongo import MongoClient
import os
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

mongo_uri = os.getenv('MONGO_URI', 'mongodb://localhost:27017/ai_platform')
print(f"Connecting to: {mongo_uri}")

try:
    client = MongoClient(mongo_uri, serverSelectionTimeoutMS=2000)
    db = client.get_database()
    print(f"Connected to database: {db.name}")
    
    # List collections
    collections = db.list_collection_names()
    print(f"Collections: {collections}")
    
    # Try inserting a test document
    test_doc = {
        "domain": "debug",
        "model_type": "connectivity_test",
        "timestamp": datetime.utcnow(),
        "user_id": "debug_user",
        "result": {"prediction": "Debug Success"}
    }
    
    result = db.predictions.insert_one(test_doc)
    print(f"Inserted test document ID: {result.inserted_id}")
    
    # Verify insertion
    doc = db.predictions.find_one({"_id": result.inserted_id})
    if doc:
        print("Verification: Document found!")
        print(doc)
    else:
        print("Verification: Document NOT found!")

except Exception as e:
    print(f"Connection/Insertion Error: {e}")
