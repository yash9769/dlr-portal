import httpx
import os
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("VITE_SUPABASE_URL")
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtyeHJydHRmcnR0b2xwYmxscXd5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzk2ODgwNSwiZXhwIjoyMDgzNTQ0ODA1fQ.tB16jqCB2axZXHYtwKsGvCOcn0yEMPh6SHpqmVS3dzo"

TABLES = [
    "report_approvals",
    "daily_lecture_records",
    "timetable",
    "students"
]

def cleanup():
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json"
    }
    
    for table in TABLES:
        print(f"Clearing table: {table}...")
        # Use a filter that is always true to satisfy PostgREST's requirement for a WHERE clause
        # The correct syntax for checking NOT NULL is 'not.is.null'
        url = f"{SUPABASE_URL}/rest/v1/{table}?id=not.is.null"
        response = httpx.delete(url, headers=headers)
        if response.status_code in [200, 204]:
            print(f"  Successfully cleared {table}.")
        else:
            print(f"  Error clearing {table}: {response.status_code} {response.text}")

if __name__ == "__main__":
    cleanup()
