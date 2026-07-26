import os

path = r"c:\Users\Yosr\Documents\GitHub\smartdoc-med\frontend\src\app\pages\patient\dashboard\dashboard.component.html"

with open(path, "r", encoding="utf-8") as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if 'class="doctor-avatar"' in line:
        print(f"Line {i+1}: {repr(line)}")
        print(f"Line {i+2}: {repr(lines[i+1])}")
        print(f"Line {i+3}: {repr(lines[i+2])}")
