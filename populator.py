import pandas as pd
import httpx
import os
import json
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("VITE_SUPABASE_URL")
# Use the service role key provided by the user
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtyeHJydHRmcnR0b2xwYmxscXd5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzk2ODgwNSwiZXhwIjoyMDgzNTQ0ODA1fQ.tB16jqCB2axZXHYtwKsGvCOcn0yEMPh6SHpqmVS3dzo"

if not SUPABASE_URL or not SUPABASE_KEY:
    print("Error: Supabase credentials not found")
    exit(1)

FILES = {
    "SE": "SE Sem-IV Attendance List AY 2025-26.xlsx",
    "TE": "TE Sem-VI Attendance List AY 2025-26.xlsx",
    "BE": "BE Sem VIII Attendance List AY 2025-26.xlsx"
}

def parse_excel():
    all_students = []
    
    for year, file_path in FILES.items():
        if not os.path.exists(file_path):
            print(f"File not found: {file_path}")
            continue
            
        print(f"Processing {year}: {file_path}")
        try:
            xl = pd.ExcelFile(file_path)
            for sheet_name in xl.sheet_names:
                division = sheet_name.split()[-1]
                print(f"  Parsing Sheet: {sheet_name} (Division: {division})")
                
                df = pd.read_excel(file_path, sheet_name=sheet_name, header=None)
                
                header_row = -1
                for i, row in df.iterrows():
                    row_str = " ".join([str(val) for val in row.values if pd.notna(val)])
                    if "Roll No" in row_str or "Student Name" in row_str or "Name of the Student" in row_str:
                        header_row = i
                        break
                
                if header_row == -1:
                    continue
                
                header = df.iloc[header_row]
                roll_col = -1
                name_col = -1
                for idx, col_val in enumerate(header):
                    col_str = str(col_val).lower()
                    if "roll" in col_str: roll_col = idx
                    if "name" in col_str: name_col = idx
                
                if roll_col == -1 or name_col == -1:
                    continue

                current_batch = None
                for i in range(header_row + 1, len(df)):
                    row = df.iloc[i]
                    val_roll = str(row[roll_col]).strip() if pd.notna(row[roll_col]) else ""
                    val_name = str(row[name_col]).strip() if pd.notna(row[name_col]) else ""
                    
                    row_str = " ".join([str(v) for v in row.values if pd.notna(v)])
                    if "Batch" in row_str:
                        parts = row_str.split()
                        for p_idx, part in enumerate(parts):
                            if part == "Batch" and p_idx + 1 < len(parts):
                                batch_val = parts[p_idx+1]
                                if batch_val == "I": batch_val = "1"
                                current_batch = f"B{batch_val}"
                                break
                        continue
                    
                    if val_roll and val_roll != "nan" and any(c.isdigit() for c in val_roll):
                        all_students.append({
                            "roll_no": val_roll,
                            "name": val_name,
                            "branch": "IT",
                            "division": division,
                            "year": year,
                            "batch": current_batch
                        })
                        
        except Exception as e:
            print(f"Error processing {file_path}: {e}")
            
    return all_students

def upload_students(students):
    print(f"Uploading {len(students)} students to Supabase...")
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json"
    }
    url = f"{SUPABASE_URL}/rest/v1/students"
    
    chunk_size = 100
    for i in range(0, len(students), chunk_size):
        chunk = students[i:i + chunk_size]
        # Use upsert to avoid duplicate errors if some data somehow remained
        upsert_headers = {**headers, "Prefer": "resolution=merge-duplicates"}
        response = httpx.post(url, headers=upsert_headers, json=chunk)
        if response.status_code in [200, 201]:
            print(f"  Uploaded chunk {i//chunk_size + 1}")
        else:
            print(f"  Error uploading chunk {i//chunk_size + 1}: {response.text}")

if __name__ == "__main__":
    students = parse_excel()
    if students:
        upload_students(students)
    else:
        print("No students found.")
