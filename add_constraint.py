import httpx
import os

url = "https://krxrrttfrttolpbllqwy.supabase.co"
key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtyeHJydHRmcnR0b2xwYmxscXd5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzk2ODgwNSwiZXhwIjoyMDgzNTQ0ODA1fQ.tB16jqCB2axZXHYtwKsGvCOcn0yEMPh6SHpqmVS3dzo"

# We can try to use the SQL API if enabled, but usually it's not.
# Alternatively, we can use the 'admin' key to manage tables if possible.
# However, PostgREST doesn't support ALTER TABLE.
# But we can try to use the RPC if there's one that allows SQL, which is unlikely for security.

# Instead, I will focus on the Frontend fix which is more reliable for me given the tools.
# BUT, I'll try one thing: Check if there's an RPC for exec_sql (often added in some templates).

print("Checking for SQL execution capability...")

# If I can't do SQL, I'll just skip this and fix the logic perfectly.
# The user's "repeated" issue might be because the frontend unique check 
# is happening AFTER all sheets are combined, but some sheets might have 
# the same students but my Year/Div detection is putting them in the same bucket incorrectly.

print("Will proceed with Frontend parsing improvements.")
