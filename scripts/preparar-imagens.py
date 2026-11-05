"""Gera recortes (sem rostos), logo circular e favicons a partir de assets-cliente/.
Uso: python3 -I scripts/preparar-imagens.py
"""
from PIL import Image, ImageDraw
import os
A, S, P = "assets-cliente", "src/assets", "public"
os.makedirs(S, exist_ok=True)

def crop(src, box, dst, q=88):
    im = Image.open(f"{A}/{src}").convert("RGB").crop(box)
    im.save(f"{S}/{dst}", quality=q, optimize=True)
    print(dst, im.size)

# Fachada: porta, relogio de pendulo e janela (x<740 => sem as 4 pessoas)
crop("fachada-noite.jpg", (90, 120, 740, 770), "fachada-porta.jpg")
# Letreiro iluminado
crop("fachada-noite.jpg", (790, 40, 1100, 330), "letreiro.jpg")
# Salao: fundo (tijolo, parede menta, lampadas), acima das pessoas
crop("salao.jpg", (330, 0, 1206, 395), "salao-fundo.jpg")
# Adega: armario de madeira a direita
crop("salao.jpg", (985, 0, 1206, 620), "salao-adega.jpg")
# Pizza inteira (hero) e detalhes
crop("pizza-presunto-rucula.jpg", (0, 40, 1206, 1190), "pizza-presunto-rucula.jpg")
crop("pizza-presunto-rucula.jpg", (0, 560, 520, 1000), "pizza-borda.jpg")
crop("pizza-presunto-rucula.jpg", (640, 60, 1206, 540), "pizza-forno.jpg")
crop("pizza-presunto-rucula.jpg", (170, 220, 900, 900), "pizza-centro.jpg")
# Potinhos de molhos e limoes (parte de baixo da mesa: sem embalagens de marca)
crop("mesa-molhos.jpg", (330, 610, 1206, 1172), "ingredientes-molhos.jpg")
# Pizza branca (so a pizza)
crop("pizzaiolo-pizza-branca.jpg", (262, 620, 650, 930), "pizza-branca.jpg")
# Pizza branca na caixa (so maos e pizza, sem rosto)
crop("pizzaiolo-pizza-branca.jpg", (200, 530, 700, 960), "pizza-branca-caixa.jpg")

# Logo circular com alfa (disco + moldura de tijolo)
lg = Image.open(f"{A}/logo-artesa.jpg").convert("RGB")
cx, cy, r = 440, 447, 392
box = (cx - r, cy - r, cx + r, cy + r)
disc = lg.crop(box).resize((2 * r, 2 * r))
m = Image.new("L", (8 * 2 * r, 8 * 2 * r), 0)
ImageDraw.Draw(m).ellipse((0, 0, 8 * 2 * r - 1, 8 * 2 * r - 1), fill=255)
m = m.resize((2 * r, 2 * r), Image.LANCZOS)
disc.putalpha(m)
disc.save(f"{S}/logo-disco.png", optimize=True)
for n, sz in (("favicon-32.png", 32), ("icon-192.png", 192), ("icon-512.png", 512), ("apple-touch-icon.png", 180)):
    disc.resize((sz, sz), Image.LANCZOS).save(f"{P}/{n}", optimize=True)
disc.resize((64, 64), Image.LANCZOS).save(f"{P}/favicon.ico", sizes=[(16, 16), (32, 32), (48, 48)])
print("logo ok")
