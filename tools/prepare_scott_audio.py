"""Inventory originals; derive short gameplay assets only from verified sources."""
from pathlib import Path
import hashlib,json
import numpy as np
import soundfile as sf
root=Path(__file__).resolve().parents[1];audio=root/'assets/audio';masters=audio/'candidates/scott'
verified={
 'freesound_community-harp-flourish-6251.mp3':('nathanmanaker (Freesound)','https://pixabay.com/sound-effects/musical-harp-flourish-6251/','harp-transition.ogg'),
 'oxidvideos-shuffling-deck-of-cards-522518.mp3':('OxidVideos','https://pixabay.com/sound-effects/film-special-effects-shuffling-deck-of-cards-522518/','card-shuffle.wav'),
 'oxidvideos-taking-playing-card-522520.mp3':('OxidVideos','https://pixabay.com/sound-effects/film-special-effects-taking-playing-card-522520/','card-contact.wav'),
 'floraphonic-playful-casino-slot-machine-bonus-1-183918.mp3':('floraphonic','https://pixabay.com/sound-effects/film-special-effects-playful-casino-slot-machine-bonus-1-183918/','surprise-bonus.ogg')
}
inventory=[]
for path in sorted(masters.glob('*.mp3')):
    a,rate=sf.read(path);mono=a.mean(axis=1) if a.ndim>1 else a
    item={'file':path.name,'sha256':hashlib.sha256(path.read_bytes()).hexdigest(),'seconds':round(len(a)/rate,3),'sampleRate':rate,'peak':round(float(np.max(np.abs(a))),4),'status':'archived; source/license not independently verified; not used'}
    if path.name in verified:
        creator,url,target=verified[path.name];item.update(creator=creator,source=url,license='Pixabay Content License',terms='https://pixabay.com/service/terms/',attribution='Not required; credited voluntarily',production=target,status='Verified for integration in this game; original excluded from distribution')
        trimmed=mono.copy();trimmed/=max(float(np.max(np.abs(trimmed))),.001);trimmed*=.65
        fade=min(int(rate*.008),len(trimmed)//4);trimmed[:fade]*=np.linspace(0,1,fade);trimmed[-fade:]*=np.linspace(1,0,fade)
        sf.write(audio/target,trimmed,rate,subtype='VORBIS' if target.endswith('.ogg') else 'PCM_16')
        item['edits']='Mono, peak .65, 8ms edge fades; production cue gain separately restrained.'
        item['productionSha256']=hashlib.sha256((audio/target).read_bytes()).hexdigest()
    inventory.append(item)
(masters/'INVENTORY.json').write_text(json.dumps(inventory,indent=2)+'\n')
(audio/'SCOTT-AUDIO-INVENTORY.json').write_text(json.dumps(inventory,indent=2)+'\n')
files=[p for p in audio.iterdir() if p.suffix in ['.wav','.ogg','.mp3']]
(audio/'PRODUCTION-SHA256.json').write_text(json.dumps({p.name:hashlib.sha256(p.read_bytes()).hexdigest() for p in files},indent=2)+'\n')
print('\n'.join(f"{i['seconds']:6.2f}s {i['file']} -> {i.get('production','archive only')}" for i in inventory))
