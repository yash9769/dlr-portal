import pandas as pd
import os

files = [
    "BE Sem VIII Attendance List AY 2025-26.xlsx",
    "SE Sem-IV Attendance List AY 2025-26.xlsx",
    "TE Sem-VI Attendance List AY 2025-26.xlsx"
]

for file in files:
    print(f"==================================================")
    print(f"FILE: {file}")
    try:
        xl = pd.ExcelFile(file)
        print(f"Sheet names: {xl.sheet_names}")
        for sheet in xl.sheet_names:
            print(f"\n--- Sheet: {sheet} ---")
            df = pd.read_excel(file, sheet_name=sheet, header=None)
            # Find the row that looks like a header (e.g. contains "Roll No")
            header_row = -1
            for i, row in df.iterrows():
                row_str = " ".join([str(val) for val in row.values if pd.notna(val)])
                if "Roll No" in row_str or "Student Name" in row_str or "Name of the Student" in row_str:
                    header_row = i
                    print(f"Found header at row {i}: {row_str}")
                    break
            
            if header_row != -1:
                # Print 5 rows after the header
                print(df.iloc[header_row:header_row+10].to_string())
            else:
                print("Could not find header row.")
    except Exception as e:
        print(f"Error reading {file}: {e}")
    print("\n")
