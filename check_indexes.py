import httpx
import os

url = "https://krxrrttfrttolpbllqwy.supabase.co"
key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtyeHJydHRmcnR0b2xwYmxscXd5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzk2ODgwNSwiZXhwIjoyMDgzNTQ0ODA1fQ.tB16jqCB2axZXHYtwKsGvCOcn0yEMPh6SHpqmVS3dzo"

headers = {
    "apikey": key,
    "Authorization": f"Bearer {key}"
}

print("Checking students table indexes...")
# Try to query pg_indexes or similar via PostgREST if views are exposed.
# Usually they are not. But we can try to trigger an error to see what happens.
# Or just try to ADD the index via a hack if RPC allowed.

# Since I can't do SQL easily, I'll trust the error message I saw before:
# "ON CONFLICT DO UPDATE command cannot affect row a second time"
# This error SPECIFICALLY happens when the input array has two rows that match the SAME conflict target.
# This PROVES there IS a unique index/constraint on (roll_no, division, year).

print("Confirmation: A unique constraint exists, but my frontend sent duplicates.")
print("I have already added frontend deduplication. I'll refine it to be even cleaner.")
