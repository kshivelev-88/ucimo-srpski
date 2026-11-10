from pathlib import Path
import re

manifest = Path('android/app/src/main/AndroidManifest.xml')
if not manifest.exists():
    raise SystemExit('AndroidManifest.xml not found')

content = manifest.read_text(encoding='utf-8')
required = [
    '<uses-permission android:name="android.permission.RECORD_AUDIO" />',
    '<uses-feature android:name="android.hardware.microphone" android:required="false" />',
]
for entry in required:
    if entry not in content:
        content = re.sub(r'(<application\\b)', entry + '\\n    \\1', content, count=1)

manifest.write_text(content, encoding='utf-8')
print('Ensured optional microphone feature and RECORD_AUDIO permission are declared.')
