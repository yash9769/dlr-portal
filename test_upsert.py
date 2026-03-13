import httpx
import os
from dotenv import load_dotenv

load_dotenv()

url = "https://krxrrttfrttolpbllqwy.supabase.co"
key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtyeHJydHRmcnR0b2xwYmxscXd5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzk2ODgwNSwiZXhwIjoyMDgzNTQ0ODA1fQ.tB16jqCB2axZXHYtwKsGvCOcn0yEMPh6SHpqmVS3dzo"

if not url or not key:
    print("Missing credentials")
    exit(1)

# Supabase management API or SQL exec isn't usually available via these keys 
# unless specifically enabled. 
# But we can try to test upsert behavior directly.

test_student = {
    "roll_no": "TEST-1",
    "name": "Test Student",
    "division": "A",
    "year": "TE",
    "branch": "IT"
}

headers = {
    "apikey": key,
    "Authorization": f"Bearer {key}",
    "Content-Type": "application/json",
    "Prefer": "resolution=merge-duplicates"
}

# Try upserting one student
with httpx.Client() as client:
    print("Testing upsert behavior...")
    # First, delete test student if exists
    client.delete(f"{url}/rest/v1/students?roll_no=eq.TEST-1&division=eq.A&year=eq.TE", headers=headers)
    
    # Try 1: Normal Insert
    r1 = client.post(f"{url}/rest/v1/students", json=test_student, headers=headers)
    print(f"Insert 1 status: {r1.status_code}")
    
    # Try 2: Upsert with onConflict on columns
    upsert_headers = {**headers, "Prefer": "resolution=merge-duplicates"}
    # PostgREST 9+ uses 'on_conflict' query param
    r2 = client.post(f"{url}/rest/v1/students?on_conflict=roll_no,division,year", json=test_student, headers=upsert_headers)
    print(f"Upsert 2 status: {r2.status_code}")
    if r2.status_code >= 400:
        print(f"Upsert error: {r2.text}")
    else:
        print("Upsert successful on columns!")
