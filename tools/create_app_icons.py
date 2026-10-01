"""Draw code-native app icons. Existing title and card artwork stay untouched."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import json
root=Path(__file__).resolve().parents[1]
for size in [192,512]:
    image=Image.new('RGB',(size,size),'#194d40')
    d=ImageDraw.Draw(image)
    box=(int(size*.21),int(size*.16),int(size*.79),int(size*.84))
    d.rounded_rectangle(box,radius=int(size*.07),fill='#fff0ce',outline='#eac477',width=max(2,size//50))
    font=ImageFont.truetype('C:/Windows/Fonts/segoeuib.ttf',int(size*.40))
    d.text((size*.5,size*.46),'S',font=font,fill='#194d40',anchor='mm')
    y=int(size*.69);x=size//2;r=int(size*.06)
    d.polygon([(x,y-r),(x+r,y),(x,y+r),(x-r,y)],fill='#c05280')
    image.save(root/f'assets/icon-{size}.png')
manifest=json.loads((root/'manifest.webmanifest').read_text())
manifest['id']='./'
manifest['icons']=[{'src':f'assets/icon-{s}.png','sizes':f'{s}x{s}','type':'image/png','purpose':'any maskable'} for s in [192,512]]
manifest.pop('orientation',None)
(root/'manifest.webmanifest').write_text(json.dumps(manifest,indent=2)+'\n')
