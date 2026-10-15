"""Prove explicit Git EOL checkout rules reproduce unchanged protected hashes.
Reads Git blobs only; never rewrites artwork or its expected manifest.
"""
import hashlib,json,pathlib,subprocess
root=pathlib.Path(__file__).resolve().parents[1]
expected=json.loads((root/'CARD-ART-SHA256.json').read_text())['baseline']
crlf=set()
for line in (root/'.gitattributes').read_text().splitlines():
    if line.endswith(' text eol=crlf'):
        crlf.add(line.removesuffix(' text eol=crlf'))
for path,digest in expected.items():
    data=subprocess.check_output(['git','show','HEAD:'+path],cwd=root)
    if path in crlf:
        data=data.replace(b'\r\n',b'\n').replace(b'\n',b'\r\n')
    assert hashlib.sha256(data).hexdigest()==digest,path
print(f'PASS all {len(expected)} protected checkout bytes; {len(crlf)} explicit CRLF rules; expected hashes unchanged.')
