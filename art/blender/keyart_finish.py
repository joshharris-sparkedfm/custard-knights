"""Paint the sky behind the key-art render (a warm cel gradient with a soft sun) and export WebP for the game."""
import sys
from PIL import Image, ImageDraw, ImageFilter
src, out = sys.argv[1], sys.argv[2]
a = Image.open(src).convert('RGBA'); W, H = a.size
sky = Image.new('RGBA', (W, H)); d = ImageDraw.Draw(sky)
top, mid, bot = (92, 180, 255), (150, 214, 255), (255, 226, 170)
for y in range(H):
    t = y / H
    c = tuple(int(p + (q - p) * (t / .5)) for p, q in zip(top, mid)) if t < .5 else tuple(int(p + (q - p) * ((t - .5) / .5)) for p, q in zip(mid, bot))
    d.line([(0, y), (W, y)], fill=c + (255,))
glow = Image.new('RGBA', (W, H), (0, 0, 0, 0)); g = ImageDraw.Draw(glow)
cx, cy = int(W * .82), int(H * .12)
for i, r in enumerate(range(int(H * .5), 0, -int(H * .02))): g.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(255, 244, 200, 10))
sky.alpha_composite(glow.filter(ImageFilter.GaussianBlur(H * .02)))
sky.alpha_composite(a)
sky.convert('RGB').save(out, 'WEBP', quality=86, method=6) if out.endswith('.webp') else sky.convert('RGB').save(out)
print('finished', out)
