"""Derive small production clips from the documented CC0 masters."""
from pathlib import Path
import json, hashlib, zipfile
import numpy as np
import soundfile as sf

root = Path(__file__).resolve().parents[1]
src = root / 'assets/audio/candidates'
out = root / 'assets/audio'
def write(name, samples, rate):
    if samples.ndim > 1:
        samples = samples.mean(axis=1)
    samples = samples / max(float(np.max(np.abs(samples))), .001) * .55
    fade = min(int(rate*.008), len(samples)//4)
    samples[:fade] *= np.linspace(0,1,fade)
    samples[-fade:] *= np.linspace(1,0,fade)
    sf.write(out/name, samples, rate, subtype='PCM_16')

a, rate = sf.read(src/'physical-cards-preview.mp3')
for n, start in enumerate([11,12,13], 1):
    window = a[int(start*rate):int((start+1)*rate)]
    peak = int(np.argmax(np.abs(window))) + int(start*rate)
    write(f'deal-{n}.wav', a[max(0,peak-int(.06*rate)):peak+int(.25*rate)].copy(), rate)
# Replace the short swish preview with a longer physical riffle from KevinHilt.
a, rate = sf.read(src/'physical-cards-preview.mp3')
write('shuffle.wav', a[int(.8*rate):int(2.15*rate)].copy(), rate)
with zipfile.ZipFile(src/'kenney-interface-sounds.zip') as z:
    names = [n for n in z.namelist() if n.endswith('.ogg')]
    print('Interface pack:', names[:15])
    for target, search in [('reward.ogg','confirmation_001.ogg'),('tap.ogg','click_001.ogg')]:
        match = next((n for n in names if n.endswith(search)), None)
        if not match:
            raise ValueError(search)
        (out/target).write_bytes(z.read(match))
    license_name = next(n for n in z.namelist() if 'license' in n.lower() and n.endswith('.txt'))
    (out/'KENNEY-LICENSE.txt').write_bytes(z.read(license_name))
(out/'music.mp3').write_bytes((src/'happy-adventure.mp3').read_bytes())
with zipfile.ZipFile(src/'kenney-music-jingles.zip') as z:
    (out/'tada.ogg').write_bytes(z.read('Audio/Pizzicato jingles/jingles_PIZZI03.ogg'))
    name=next(n for n in z.namelist() if 'license' in n.lower() and n.endswith('.txt'))
    (out/'KENNEY-JINGLES-LICENSE.txt').write_bytes(z.read(name))
files = [p for p in out.iterdir() if p.suffix in ['.wav','.ogg','.mp3']]
(out/'PRODUCTION-SHA256.json').write_text(json.dumps({p.name:hashlib.sha256(p.read_bytes()).hexdigest() for p in files},indent=2)+'\n')
print('Production files:', [p.name for p in files])
