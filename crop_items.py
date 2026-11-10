import os
from PIL import Image

flyer_path = os.path.join(os.path.dirname(__file__), 'flyer.jpg')
output_dir = os.path.join(os.path.dirname(__file__), 'images')
os.makedirs(output_dir, exist_ok=True)

img = Image.open(flyer_path)
width, height = img.size
print(f"Image size: {width}x{height}")

# The flyer has 3 rows and 3 columns of item cards.
# Let's inspect the layout and crop the product picture box in each card.
# The flyer:
# Top header: PECC and Polines logos, PEMINJAMAN ALAT, DAFTAR BARANG YANG DIPINJAMKAN
# Row 1: SPEAKER, MICROPHONE WIRELESS, BENDERA POLINES
# Row 2: BENDERA MERAH PUTIH, TAPLAK MEJA ARTIFICIAL, GREEN SCREEN KECIL
# Row 3: AKRILIK NAMA, WEB CAM, VAS BUNGA ARTIFICIAL

# Let's define percentage-based or pixel-based boxes:
# Columns roughly:
# Col 1: x from 0.11 to 0.36
# Col 2: x from 0.38 to 0.62
# Col 3: x from 0.64 to 0.89
#
# Rows of photo area inside card:
# Row 1: y from 0.25 to 0.40
# Row 2: y from 0.51 to 0.65
# Row 3: y from 0.76 to 0.90

items = [
    # (filename, name, (x1_pct, y1_pct, x2_pct, y2_pct))
    ('speaker.jpg', 'Speaker', (0.13, 0.25, 0.34, 0.40)),
    ('mic.jpg', 'Microphone Wireless', (0.39, 0.25, 0.61, 0.40)),
    ('bendera_polines.jpg', 'Bendera Polines', (0.66, 0.25, 0.87, 0.40)),
    ('bendera_mp.jpg', 'Bendera Merah Putih', (0.13, 0.51, 0.34, 0.65)),
    ('taplak.jpg', 'Taplak Meja Artificial', (0.39, 0.51, 0.61, 0.65)),
    ('greenscreen.jpg', 'Green Screen Kecil', (0.66, 0.51, 0.87, 0.65)),
    ('akrilik.jpg', 'Akrilik Nama', (0.13, 0.76, 0.34, 0.90)),
    ('webcam.jpg', 'Web Cam', (0.39, 0.76, 0.61, 0.90)),
    ('vas_bunga.jpg', 'Vas Bunga Artificial', (0.66, 0.76, 0.87, 0.90)),
]

for filename, name, (x1p, y1p, x2p, y2p) in items:
    box = (int(x1p * width), int(y1p * height), int(x2p * width), int(y2p * height))
    cropped = img.crop(box)
    out_file = os.path.join(output_dir, filename)
    cropped.save(out_file, quality=95)
    print(f"Saved {filename} with size {cropped.size}")

# Also extract the Polines logo from header (around top right)
polines_logo = img.crop((int(0.63 * width), int(0.03 * height), int(0.76 * width), int(0.10 * height)))
polines_logo.save(os.path.join(output_dir, 'polines_logo.jpg'), quality=95)
print("Crop completed!")

