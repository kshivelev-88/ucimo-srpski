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
app_match = re.search(r'<application\\b', content)
if not app_match:
    raise SystemExit('Could not find application element in AndroidManifest.xml')

for entry in required:
    if entry not in content:
        content = content[:app_match.start()] + entry + '\\n    ' + content[app_match.start():]
        app_match = re.search(r'<application\\b', content)

manifest.write_text(content, encoding='utf-8')
print('Ensured optional microphone feature and RECORD_AUDIO permission are declared.')
