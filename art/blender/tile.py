import os, sys
from PIL import Image, ImageDraw
d = sys.argv[1] if len(sys.argv) > 1 else 'out'
fs = [f for f in sorted(os.listdir(d)) if f.startswith('dir_')]
W = 260; sheet = Image.new('RGBA', (W * len(fs), W + 130), (111, 191, 94, 255))
for i, f in enumerate(fs):
    im = Image.open(os.path.join(d, f)).convert('RGBA')
    sheet.alpha_composite(im.resize((W, W), Image.LANCZOS), (i * W, 0))
    sheet.alpha_composite(im.resize((110, 110), Image.LANCZOS), (i * W + W // 2 - 55, W + 10))
    ImageDraw.Draw(sheet).text((i * W + 8, 4), f[:-4], fill=(34, 23, 51, 255))
sheet.save(os.path.join(d, '_turnaround.png')); print('tiled')
