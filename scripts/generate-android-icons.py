from pathlib import Path
from PIL import Image

icon_path = Path('assets/ucimo-srpski-icon.jpg')
android_res = Path('android/app/src/main/res')
if not icon_path.exists():
    raise SystemExit(f'Icon not found: {icon_path}')
if not android_res.exists():
    raise SystemExit(f'Android resources directory not found: {android_res}')

icon = Image.open(icon_path).convert('RGB')
static_sizes = {'mdpi': 48, 'hdpi': 72, 'xhdpi': 96, 'xxhdpi': 144, 'xxxhdpi': 192}
adaptive_sizes = {'mdpi': 108, 'hdpi': 162, 'xhdpi': 216, 'xxhdpi': 324, 'xxxhdpi': 432}

for density, size in static_sizes.items():
    folder = android_res / f'mipmap-{density}'
    folder.mkdir(parents=True, exist_ok=True)
    bitmap = icon.resize((size, size), Image.Resampling.LANCZOS)
    bitmap.save(folder / 'ic_launcher.png', format='PNG', optimize=True)
    bitmap.save(folder / 'ic_launcher_round.png', format='PNG', optimize=True)

for density, size in adaptive_sizes.items():
    folder = android_res / f'mipmap-{density}'
    folder.mkdir(parents=True, exist_ok=True)
    canvas = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    logo_size = int(size * 0.66)
    logo = icon.resize((logo_size, logo_size), Image.Resampling.LANCZOS).convert('RGBA')
    canvas.alpha_composite(logo, ((size - logo_size) // 2, (size - logo_size) // 2))
    canvas.save(folder / 'ic_launcher_foreground.png', format='PNG', optimize=True)

adaptive = android_res / 'mipmap-anydpi-v26'
adaptive.mkdir(parents=True, exist_ok=True)
adaptive_xml = '''<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/ucimo_icon_background" />
    <foreground android:drawable="@mipmap/ic_launcher_foreground" />
</adaptive-icon>
'''
(adaptive / 'ic_launcher.xml').write_text(adaptive_xml, encoding='utf-8')
(adaptive / 'ic_launcher_round.xml').write_text(adaptive_xml, encoding='utf-8')

values = android_res / 'values'
values.mkdir(parents=True, exist_ok=True)
background_xml = '''<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="ucimo_icon_background">#0B2D68</color>
</resources>
'''
(values / 'ucimo_icon_background.xml').write_text(background_xml, encoding='utf-8')
print('Generated Učimo srpski launcher icons for all Android densities.')
