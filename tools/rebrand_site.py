"""Update visible branding only; preserve deck sources, cards, and original logo."""
import json,pathlib
root=pathlib.Path(__file__).resolve().parents[1]
files=[root/'index.html',root/'README.md',root/'ROADMAP.md',root/'sw.js']+list((root/'games').rglob('index.html'))+list((root/'games').rglob('cards.html'))
for file in files:
    text=file.read_text(encoding='utf-8')
    text=text.replace('Arline Arcade','Solitaire and Friends')
    if file.suffix=='.html':
        text=text.replace('assets/arlinearcade-logo.png','assets/solitaire-and-friends-logo.png')
        text=text.replace('&#8592; Arcade','&#8592; Games')
        if file.name=='index.html' and file.parent==root:
            text=text.replace('width="1024" height="559"','width="1728" height="928"')
    file.write_text(text,encoding='utf-8')
manifest=root/'manifest.webmanifest';data=json.loads(manifest.read_text(encoding='utf-8'));data['name']='Solitaire and Friends';data['short_name']='Solitaire';data['description']='Solitaire, FreeCell and friendly arcade games. Ad-free, no sign-ups, with the original gold card artwork.';manifest.write_text(json.dumps(data,indent=2,ensure_ascii=False)+'\n',encoding='utf-8')
print('Visible branding updated; no card or deck source files were edited.')
