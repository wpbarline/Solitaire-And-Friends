"""Create responsive web derivatives; never replace the original artwork."""
from pathlib import Path
from PIL import Image
root=Path(__file__).resolve().parents[1]
master=root/'assets/solitaire-and-friends-logo.png'
image=Image.open(master).convert('RGBA')
for width in [320,640]:
    size=(width,round(image.height*width/image.width))
    copy=image.resize(size,Image.Resampling.LANCZOS)
    target=root/f'assets/title-{width}.webp'
    copy.save(target,'WEBP',quality=82,method=6)
    print(target.name,target.stat().st_size,size)
