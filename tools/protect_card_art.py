"""Record/verify exact card artwork bytes; does not regenerate or edit artwork."""
import argparse,hashlib,json,pathlib,sys
root=pathlib.Path(__file__).resolve().parents[1]
manifest=root/'CARD-ART-SHA256.json'
def current():
    paths=list((root/'assets/cards').rglob('*'))
    paths.extend((root/'assets/js'/name) for name in ['deck-faces.js','deck-prefs.js'])
    paths.extend([root/'assets/css/deck-prefs.css',root/'card-maker.html'])
    paths.extend((root/'tools').glob('gen*deck*'))
    paths.extend((root/'svg_primitive').rglob('*'))
    paths.extend(root.glob('*cards*'))
    return {str(p.relative_to(root)).replace('\\','/'):hashlib.sha256(p.read_bytes()).hexdigest() for p in sorted(set(paths)) if p.is_file()}
if '--record' in sys.argv:
    if manifest.exists():raise SystemExit('Baseline already exists; do not overwrite it casually.')
    manifest.write_text(json.dumps({'baseline':current()},indent=2)+'\n',encoding='utf-8')
    print(f'Recorded {len(current())} protected card/art source files.')
else:
    expected=json.loads(manifest.read_text(encoding='utf-8'))['baseline'];actual=current()
    changed=[p for p,h in expected.items() if actual.get(p)!=h]
    if changed:raise SystemExit('Protected card files changed: '+', '.join(changed))
    print(f'All {len(expected)} protected files match their original SHA-256 hashes.')
