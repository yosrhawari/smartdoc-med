import re
import os

path = r"c:\Users\Yosr\Documents\GitHub\smartdoc-med\frontend\src\app\pages\patient\dashboard\dashboard.component.html"

with open(path, "r", encoding="utf-8") as f:
    content = f.read()

# Using regex to handle whitespace and line endings variations
target_regex = r'(\s*)<div class="doctor-avatar">(\s*){{ rec\.doctor_name\?\.charAt\(4\) }}(\s*)</div>'
replacement = r'\1<div class="doctor-avatar">\2<img *ngIf="rec.doctor_image" [src]="\'http://localhost:8000/uploads/\' + rec.doctor_image" class="avatar-img-hub">\2<span *ngIf="!rec.doctor_image">{{ rec.doctor_name?.charAt(4) }}</span>\1</div>'

new_content = re.sub(target_regex, replacement, content)

if new_content == content:
    print("No replacement made. Target not found.")
else:
    with open(path, "w", encoding="utf-8") as f:
        f.write(new_content)
    print("Replacement successful.")
