"""Compose short original cues from the documented CC0 VCSL xylophone sample."""
from pathlib import Path
import json, hashlib
import numpy as np
import soundfile as sf
root=Path(__file__).resolve().parents[1]
audio=root/'assets/audio'
sample,rate=sf.read(audio/'candidates/xylophone-c6.wav')
if sample.ndim>1: sample=sample.mean(axis=1)
onset=np.flatnonzero(np.abs(sample)>.01)
sample=sample[max(0,int(onset[0])-int(.004*rate)):][:int(.7*rate)]
sample=sample/max(np.max(np.abs(sample)),.001)
phrases={
 'menu-open':[(0,0,.38),(7,.09,.3)],
 'menu-close':[(7,0,.3),(0,.08,.24)],
 'hint-chime':[(7,0,.38),(12,.1,.3)],
 'reverse-chime':[(7,0,.3),(4,.09,.26),(0,.18,.24)],
 'launch-chime':[(0,0,.4),(4,.075,.36),(7,.15,.34),(12,.25,.28),(4,.25,.15)],
 'tap-chime':[(0,0,.24)]
}
for name,notes in phrases.items():
    output=np.zeros(int(rate*1.15))
    for semitone,start,gain in notes:
        ratio=2**(semitone/12)
        tone=np.interp(np.arange(0,len(sample),ratio),np.arange(len(sample)),sample)*gain
        fade=min(len(tone)//4,int(.035*rate));tone[-fade:]*=np.linspace(1,0,fade)
        i=int(start*rate);output[i:i+len(tone)]+=tone[:len(output)-i]
    output=output[:np.flatnonzero(np.abs(output)>.0001)[-1]+1]
    sf.write(audio/(name+'.wav'),output,rate,subtype='PCM_16')
music_info=sf.info(audio/'magic-puzzle.ogg')
sf.write(audio/'candidates/magic-puzzle-preview.wav',sf.read(audio/'magic-puzzle.ogg',frames=music_info.samplerate*20)[0],music_info.samplerate,subtype='PCM_16')
files=[p for p in audio.iterdir() if p.suffix in ['.wav','.ogg','.mp3']]
(audio/'PRODUCTION-SHA256.json').write_text(json.dumps({p.name:hashlib.sha256(p.read_bytes()).hexdigest() for p in files},indent=2)+'\n')
print('Prepared recorded xylophone phrases:',', '.join(phrases))
