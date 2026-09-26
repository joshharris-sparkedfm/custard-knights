"""Tile a folder of concept images into one labelled contact sheet. Usage: python contact.py <folder> [cols] [cell]"""
import os, sys
from PIL import Image, ImageDraw, ImageFont
folder = sys.argv[1]; cols = int(sys.argv[2]) if len(sys.argv) > 2 else 4; cell = int(sys.argv[3]) if len(sys.argv) > 3 else 420
files = sorted(f for f in os.listdir(folder) if f.lower().endswith('.png') and not f.startswith('_'))
rows = (len(files) + cols - 1) // cols
sheet = Image.new('RGB', (cols * cell, rows * (cell + 28)), (43, 30, 63))
d = ImageDraw.Draw(sheet)
try: font = ImageFont.truetype('arialbd.ttf', 18)
except Exception: font = ImageFont.load_default()
for i, f in enumerate(files):
    im = Image.open(os.path.join(folder, f)).convert('RGB'); im.thumbnail((cell, cell))
    x, y = (i % cols) * cell, (i // cols) * (cell + 28)
    sheet.paste(im, (x + (cell - im.width) // 2, y))
    d.text((x + 8, y + cell + 4), f[:-4], fill=(255, 210, 63), font=font)
out = os.path.join(folder, '_contact.png'); sheet.save(out); print(out)
