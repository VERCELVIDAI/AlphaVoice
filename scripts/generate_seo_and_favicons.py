import os
import math
from PIL import Image, ImageDraw, ImageFont

public_dir = os.path.join(os.path.dirname(__file__), "..", "electron", "public")
dist_dir = os.path.join(os.path.dirname(__file__), "..", "frontend", "dist")

os.makedirs(public_dir, exist_ok=True)
os.makedirs(dist_dir, exist_ok=True)

# -------------------------------------------------------------
# 1. Generate Favicon PNGs & ICO
# -------------------------------------------------------------
def create_favicon(size: int) -> Image.Image:
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Background rounded tile
    r = int(size * 0.22)
    # Background gradient approximation (deep slate to indigo)
    for i in range(size):
        ratio = i / float(size)
        cr = int(15 * (1 - ratio) + 2 * ratio)
        cg = int(23 * (1 - ratio) + 6 * ratio)
        cb = int(42 * (1 - ratio) + 23 * ratio)
        draw.line([(0, i), (size, i)], fill=(cr, cg, cb, 255))

    # Mask to rounded rect
    mask = Image.new("L", (size, size), 0)
    mask_draw = ImageDraw.Draw(mask)
    margin = max(1, int(size * 0.04))
    mask_draw.rounded_rectangle([margin, margin, size - margin, size - margin], radius=r, fill=255)
    
    # Border
    bordered = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    bordered.paste(img, (0, 0), mask=mask)
    draw_b = ImageDraw.Draw(bordered)
    draw_b.rounded_rectangle(
        [margin, margin, size - margin, size - margin],
        radius=r,
        outline=(56, 189, 248, 80),
        width=max(1, int(size * 0.03))
    )

    # Soundwave bars / curves
    # 5 bars with heights
    wave_heights = [0.35, 0.65, 0.9, 0.55, 0.8]
    bar_width = max(2, int(size * 0.08))
    spacing = max(2, int(size * 0.07))
    total_w = len(wave_heights) * bar_width + (len(wave_heights) - 1) * spacing
    start_x = (size - total_w) // 2
    center_y = size // 2

    for idx, h_ratio in enumerate(wave_heights):
        x = start_x + idx * (bar_width + spacing)
        bar_h = int(size * 0.5 * h_ratio)
        top = center_y - bar_h // 2
        bottom = center_y + bar_h // 2
        # Cyan-indigo gradient colors for each bar
        t_ratio = idx / float(len(wave_heights) - 1)
        r_c = int(129 * (1 - t_ratio) + 34 * t_ratio)
        g_c = int(140 * (1 - t_ratio) + 211 * t_ratio)
        b_c = int(248 * (1 - t_ratio) + 238 * t_ratio)
        draw_b.rounded_rectangle(
            [x, top, x + bar_width, bottom],
            radius=max(1, bar_width // 2),
            fill=(r_c, g_c, b_c, 255)
        )

    # Sparkle star in upper right
    sparkle_size = max(3, int(size * 0.16))
    s_x = int(size * 0.78)
    s_y = int(size * 0.22)
    draw_b.ellipse(
        [s_x - sparkle_size // 2, s_y - sparkle_size // 2, s_x + sparkle_size // 2, s_y + sparkle_size // 2],
        fill=(56, 189, 248, 240)
    )

    return bordered


# Save sizes
fav16 = create_favicon(16)
fav32 = create_favicon(32)
fav48 = create_favicon(48)
fav180 = create_favicon(180)
fav512 = create_favicon(512)

# Save to public and dist
for folder in [public_dir, dist_dir]:
    fav16.save(os.path.join(folder, "favicon-16x16.png"))
    fav32.save(os.path.join(folder, "favicon-32x32.png"))
    fav180.save(os.path.join(folder, "apple-touch-icon.png"))
    fav512.save(os.path.join(folder, "icon-512x512.png"))
    # Multi-res ICO
    fav48.save(
        os.path.join(folder, "favicon.ico"),
        format="ICO",
        sizes=[(16, 16), (32, 32), (48, 48)]
    )

print("[1/2] Favicons generated (16x16, 32x32, apple-touch-icon 180x180, icon-512x512, favicon.ico)")


# -------------------------------------------------------------
# 2. Generate 1200x630 SEO / OpenGraph Image (og-image.png)
# -------------------------------------------------------------
width = 1200
height = 630

og = Image.new("RGB", (width, height), (11, 15, 25))
draw_og = ImageDraw.Draw(og)

# Background radial ambient glow (indigo left, cyan right)
for y in range(height):
    for x in range(0, width, 4):  # step for speed
        # Distance from top-left glow (200, 150)
        d1 = math.sqrt((x - 250)**2 + (y - 120)**2)
        # Distance from bottom-right glow (950, 480)
        d2 = math.sqrt((x - 950)**2 + (y - 480)**2)

        g1 = max(0, 1 - d1 / 550) * 0.35
        g2 = max(0, 1 - d2 / 500) * 0.25

        r_base = 11 + int(g1 * 99 + g2 * 6)
        g_base = 15 + int(g1 * 102 + g2 * 182)
        b_base = 25 + int(g1 * 241 + g2 * 212)

        draw_og.rectangle([x, y, x + 3, y], fill=(min(255, r_base), min(255, g_base), min(255, b_base)))

# Draw grid pattern subtly
for x in range(0, width, 40):
    draw_og.line([(x, 0), (x, height)], fill=(255, 255, 255, 12), width=1)
for y in range(0, height, 40):
    draw_og.line([(0, y), (width, y)], fill=(255, 255, 255, 12), width=1)

# Central Brand Card Outline
card_x0, card_y0 = 60, 60
card_x1, card_y1 = 1140, 570
draw_og.rounded_rectangle(
    [card_x0, card_y0, card_x1, card_y1],
    radius=28,
    fill=(15, 23, 42),
    outline=(56, 189, 248, 60),
    width=2
)

# Render brand icon inside card (100x100)
brand_icon = create_favicon(100)
og.paste(brand_icon, (110, 110), mask=brand_icon)

# Load fonts if available, otherwise default
try:
    font_badge = ImageFont.truetype("arialbd.ttf", 20)
    font_title = ImageFont.truetype("arialbd.ttf", 52)
    font_sub = ImageFont.truetype("arial.ttf", 24)
    font_tag = ImageFont.truetype("arialbd.ttf", 16)
    font_footer = ImageFont.truetype("arial.ttf", 18)
except Exception:
    font_badge = ImageFont.load_default()
    font_title = ImageFont.load_default()
    font_sub = ImageFont.load_default()
    font_tag = ImageFont.load_default()
    font_footer = ImageFont.load_default()

# Top pill badge
badge_x, badge_y = 235, 115
draw_og.rounded_rectangle([badge_x, badge_y, badge_x + 360, badge_y + 36], radius=18, fill=(99, 102, 241, 45), outline=(99, 102, 241, 100), width=1)
draw_og.text((badge_x + 18, badge_y + 8), "ALPHAVOICE STUDIO  ·  LOCAL AI", font=font_badge, fill=(129, 140, 248))

# Main Title & Subtitle
draw_og.text((110, 240), "Sovereign Neural Speech & Voice AI", font=font_title, fill=(255, 255, 255))
draw_og.text((110, 315), "100% on-device neural voice cloning, design, dubbing & real-time dictation.", font=font_sub, fill=(148, 163, 184))
draw_og.text((110, 355), "No monthly cloud character quotas. Private offline cryptographic keys.", font=font_sub, fill=(148, 163, 184))

# Feature pill tags along bottom of card
tags = [
    ("40+ Neural Models", (16, 185, 129)),
    ("Zero-Shot Voice Cloning", (56, 189, 248)),
    ("WhisperX GPU Dictation", (168, 85, 247)),
    ("Video Dubbing & Lip-Sync", (245, 158, 11)),
    ("Offline License Keys", (99, 102, 241)),
]

tag_x = 110
tag_y = 425
for label, color in tags:
    # estimate pill width
    pill_w = len(label) * 10 + 30
    draw_og.rounded_rectangle([tag_x, tag_y, tag_x + pill_w, tag_y + 36], radius=18, fill=(color[0], color[1], color[2], 30), outline=color, width=1)
    draw_og.text((tag_x + 15, tag_y + 9), label, font=font_tag, fill=(255, 255, 255))
    tag_x += pill_w + 14

# Bottom divider & footer
draw_og.line([(110, 495), (1090, 495)], fill=(255, 255, 255, 25), width=1)
draw_og.text((110, 520), "https://alphavoice.studio", font=font_footer, fill=(56, 189, 248))
draw_og.text((790, 520), "Available on Windows · macOS · Linux", font=font_footer, fill=(148, 163, 184))

# Save og-image.png to public and dist
for folder in [public_dir, dist_dir]:
    og.save(os.path.join(folder, "og-image.png"), quality=95)
    # Also save as twitter-image.png for explicit Twitter card tags
    og.save(os.path.join(folder, "twitter-image.png"), quality=95)

print("[2/2] SEO Images generated (og-image.png 1200x630, twitter-image.png 1200x630)")
