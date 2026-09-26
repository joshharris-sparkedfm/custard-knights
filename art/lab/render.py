"""Render the knight lab sheet headless. Usage: python render.py <out.png> [json-overrides]
Needs Chrome and Node (the CDP helper is inlined below)."""
import base64, json, os, subprocess, sys, time, tempfile
HERE = os.path.dirname(os.path.abspath(__file__))
GAME = 'file:///' + os.path.abspath(os.path.join(HERE, '..', '..', 'index.html')).replace('\\', '/') + '?qa=1'
CHROME = r'C:\Program Files\Google\Chrome\Application\chrome.exe'
out = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, 'sheet.png')
over = sys.argv[2] if len(sys.argv) > 2 else '{}'
script = 'window.LAB=' + over + ';\n' + open(os.path.join(HERE, 'sheet.js'), encoding='utf-8').read()
tmp = os.path.join(HERE, '.tmp'); os.makedirs(tmp, exist_ok=True)
js = os.path.join(tmp, 'lab.js'); open(js, 'w', encoding='utf-8').write(script)
cdp = os.path.join(tmp, 'cdp.js')
open(cdp, 'w', encoding='utf-8').write(r"""
const port=9334, fs=require('fs'); const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{ let tabs; for(let i=0;i<120;i++){ try{ tabs=await (await fetch(`http://127.0.0.1:${port}/json`)).json(); if(tabs.find(x=>x.type==='page')) break; }catch(e){} await sleep(250); }
 const t=tabs.find(x=>x.type==='page'); const ws=new WebSocket(t.webSocketDebuggerUrl); let id=0; const pend={};
 const send=(m,p={})=>new Promise(r=>{ const i=++id; pend[i]=r; ws.send(JSON.stringify({id:i,method:m,params:p})); });
 ws.onmessage=m=>{ const d=JSON.parse(m.data); if(d.id&&pend[d.id]){ pend[d.id](d.result); delete pend[d.id]; } };
 await new Promise(r=>ws.onopen=r); await send('Page.navigate',{url:process.argv[2]});
 for(let i=0;i<60;i++){ await sleep(250); const r=await send('Runtime.evaluate',{expression:'!!window.CK',returnByValue:true}); if(r&&r.result&&r.result.value) break; }
 await sleep(600);
 const r=await send('Runtime.evaluate',{expression:fs.readFileSync(process.argv[3],'utf8'),returnByValue:true});
 if(r&&r.exceptionDetails){ console.log('EXC',JSON.stringify(r.exceptionDetails).slice(0,600)); process.exit(1); }
 const d=await send('Runtime.evaluate',{expression:'window.__sheet',returnByValue:true});
 fs.writeFileSync(process.argv[4],Buffer.from(d.result.value.split(',')[1],'base64')); console.log('saved',process.argv[4]); ws.close(); process.exit(0); })();
""")
prof = os.path.join(tmp, 'prof')
pr = subprocess.Popen([CHROME, '--headless=new', '--remote-debugging-port=9334', '--user-data-dir=' + prof, '--window-size=1400,900', '--mute-audio', 'about:blank'], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
try:
    time.sleep(2)
    res = subprocess.run(['node', cdp, GAME, js, out], capture_output=True, text=True, timeout=120)
    print(res.stdout.strip(), res.stderr.strip()[:400])
finally:
    pr.kill()
