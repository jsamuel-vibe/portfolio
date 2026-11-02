"""Build the two hero mock-ups into single self-contained HTML files.

Run:  python prototypes/legends-room/build.py
Out:  room-mockup.html  (the retro red-room hero, the current direction)
      white-mockup.html (the earlier version on a white background)

Sources:
  white-version-src.html  painting, name ovals, spotlight and the diary-ink conversation script
  room-head-src.html      <head> + CSS of the room (/*TAGS*/ and /*INK*/ are filled from the white version)
  room-body-src.html      markup of the room (<!--SVG--> is filled with the painting from the white version)
  images/legends-cutout.png   the painting with the wall removed (transparent background)
  ../../assets/profile.jpg    stand-in portrait until a painted one exists
"""
import base64, io, os
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
p = lambda *a: os.path.join(HERE, *a)
read = lambda f: open(p(f), encoding='utf-8').read()

def webp_data_uri(path):
    b = io.BytesIO(); Image.open(path).convert('RGBA').save(b, 'WEBP', quality=86, method=6)
    return 'data:image/webp;base64,' + base64.b64encode(b.getvalue()).decode()

IMG = webp_data_uri(p('images', 'legends-cutout.png'))
PORTRAIT = 'data:image/jpeg;base64,' + base64.b64encode(open(p('..', '..', 'assets', 'profile.jpg'), 'rb').read()).decode()

t = read('white-version-src.html')
open(p('white-mockup.html'), 'w', encoding='utf-8').write(t.replace('__IMG__', IMG))

script = t[t.index('<script>'):t.index('</script>') + 9]
svg = t[t.index('      <svg viewBox'):t.index('      </svg>') + 12]
inkcss = t[t.index('/* diary ink'):t.index('@media (max-width:640px){.ink')]
tagcss = t[t.index('/* name oval on hover */'):t.index('/* diary ink')]

# in the room, place the ink relative to the painting rather than the whole section
old = script[script.index('  const r=stage.getBoundingClientRect(),s=r.width/W, x=p.head[0]*s;'):script.index('  ink.style.setProperty("--tx",tx+"px");')]
new = '''  const r=stage.getBoundingClientRect(),g=svgEl.getBoundingClientRect(),s=g.width/W, x=g.left-r.left+p.head[0]*s;
  ink.style.left=x+"px"; ink.style.top=(g.top-r.top+p.top*s-10)+"px";
  const bw=ink.offsetWidth; let tx=-bw/2;
  if(x+tx<8)tx=8-x; if(x+tx+bw>r.width-8)tx=r.width-8-bw-x;
'''
script = script.replace(old, new).replace('const stage=$("#stage"),', 'const svgEl=document.querySelector("#scene svg"),stage=$("#stage"),')
script = script.replace('observe(stage)', 'observe(svgEl)')

head = read('room-head-src.html')
head = head.replace('/*TAGS*/', tagcss.replace('stroke:#fff;stroke-width:7px', 'stroke:#f6ead2;stroke-width:7px'))
head = head.replace('/*INK*/', inkcss.replace('color:#3b2a1c', 'color:var(--on-wall);text-shadow:0 1px 6px rgba(0,0,0,.55)').replace('max-width:min(280px,46%)', 'max-width:min(300px,46%);z-index:3'))
body = read('room-body-src.html').replace('<!--SVG-->', svg)
room = (head + body + script).replace('__IMG__', IMG).replace('__PORTRAIT__', PORTRAIT)
open(p('room-mockup.html'), 'w', encoding='utf-8').write(room)
print('built room-mockup.html and white-mockup.html')
