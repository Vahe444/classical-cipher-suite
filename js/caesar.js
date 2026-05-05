let cState={idx:0,running:false,letters:[],result:[],mode:'enc',timer:null,shift:3};

function caesarRun(mode){
    let t=document.getElementById('caesarText').value.toUpperCase();
    if(!t.trim())return;
    let s=parseInt(document.getElementById('caesarKey').value);
    if(isNaN(s)||s<1)s=1;if(s>25)s=25;
    document.getElementById('caesarKey').value=s;
    cState.mode=mode;
    cState.shift=s;
    // FIX: filter to only A-Z letters — no spaces in animation
    cState.letters=t.split('').filter(c=>c>='A'&&c<='Z');
    cState.result=mode==='enc'?caesarEnc(t,s).split('').filter(c=>c>='A'&&c<='Z')
        :caesarDec(t,s).split('').filter(c=>c>='A'&&c<='Z');
    cState.idx=0;cState.running=false;
    clearInterval(cState.timer);
    caesarRender();
    // auto-play after 200ms for nice UX
    setTimeout(()=>caesarPlay(),200);
}

function caesarRender(){
    const inp=document.getElementById('caesarInput'),out=document.getElementById('caesarOutput');
    inp.innerHTML='';out.innerHTML='';
    cState.letters.forEach((l,i)=>{
        const d=document.createElement('div');
        d.className='letter';d.id=`cl_${i}`;d.textContent=l;
        inp.appendChild(d);
    });
    drawCaesarWheel(cState.shift,null,null);
    document.getElementById('caesarInfo').textContent=cState.letters.length?'Press ▶ to start the animation':'Type some text first';
    const r=document.getElementById('caesarResult');
    r.textContent='Will appear here when complete';
    r.classList.add('empty');
}

function caesarPlay(){
    if(cState.running)return;
    if(!cState.letters.length){caesarRun(cState.mode);return;}
    if(cState.idx>=cState.letters.length){caesarReset();return;}
    cState.running=true;
    const spd=SPEEDS[parseInt(document.getElementById('caesarSpeed').value)-1];
    // immediately render current frame
    caesarFrame(cState.idx);cState.idx++;
    cState.timer=setInterval(()=>{
        if(cState.idx>=cState.letters.length){
            clearInterval(cState.timer);cState.running=false;
            caesarFinish();
            return;
        }
        caesarFrame(cState.idx);cState.idx++;
    },spd);
}

function caesarPause(){clearInterval(cState.timer);cState.running=false;}

function caesarStep(d){
    clearInterval(cState.timer);cState.running=false;
    if(!cState.letters.length)return;
    cState.idx=Math.max(0,Math.min(cState.letters.length,cState.idx+d));
    // FIX: rebuild full output from scratch
    caesarRebuildUpTo(cState.idx);
    if(cState.idx>=cState.letters.length)caesarFinish();
}

function caesarReset(){
    clearInterval(cState.timer);cState.idx=0;cState.running=false;
    caesarRender();
}

// FIX: rebuild output deterministically from scratch
function caesarRebuildUpTo(n){
    const out=document.getElementById('caesarOutput');
    out.innerHTML='';
    // mark input letters
    document.querySelectorAll('[id^="cl_"]').forEach(el=>{
        const idx=parseInt(el.id.split('_')[1]);
        el.className='letter';
        if(idx<n-1)el.classList.add('done');
        if(idx===n-1)el.classList.add('active-g');
    });
    // build output up to n
    for(let i=0;i<n;i++){
        const d=document.createElement('div');
        d.className='output-letter g';d.textContent=cState.result[i];
        out.appendChild(d);
    }
    // wheel highlight
    if(n>0){
        const l=cState.letters[n-1],o=cState.result[n-1];
        drawCaesarWheel(cState.shift,l,o);
        const pos=l.charCodeAt(0)-65,outPos=o.charCodeAt(0)-65;
        document.getElementById('caesarInfo').innerHTML=cState.mode==='enc'
            ?`<b>${l}</b>(${pos}) + ${cState.shift} = <b>${o}</b>(${outPos})`
            :`<b>${l}</b>(${pos}) − ${cState.shift} = <b>${o}</b>(${outPos})`;
    } else {
        drawCaesarWheel(cState.shift,null,null);
    }
}

function caesarFrame(i){
    caesarRebuildUpTo(i+1);
    playClick(220+i*15);
}

function caesarFinish(){
    // clear active state
    document.querySelectorAll('[id^="cl_"]').forEach(el=>{
        el.className='letter done';
    });
    document.getElementById('caesarInfo').innerHTML=`✓ Complete — ${cState.letters.length} letters processed`;
    const r=document.getElementById('caesarResult');
    r.textContent=cState.result.join('');
    r.classList.remove('empty');
}

// ── CAESAR WHEEL DRAWING ──
function drawCaesarWheel(shift,plain,cipher){
    const c=document.getElementById('caesarWheel');
    if(!c)return;
    const ctx=c.getContext('2d');
    const W=c.width,H=c.height,cx=W/2,cy=H/2;
    const s=((shift%26)+26)%26;
    ctx.clearRect(0,0,W,H);
    const letters='ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    // Outer ring (cipher)
    for(let i=0;i<26;i++){
        const angle=(i/26)*Math.PI*2-Math.PI/2;
        const x=cx+Math.cos(angle)*82,y=cy+Math.sin(angle)*82;
        const l=letters[(i+s)%26];
        const isAct=cipher&&l===cipher;
        ctx.beginPath();ctx.arc(x,y,11,0,Math.PI*2);
        ctx.fillStyle=isAct?'rgba(0,255,157,0.3)':'rgba(13,17,23,0.9)';
        ctx.fill();
        ctx.strokeStyle=isAct?'#00ff9d':'#21262d';ctx.lineWidth=isAct?1.5:1;
        ctx.stroke();
        ctx.fillStyle=isAct?'#00ff9d':'#7d8590';
        ctx.font='bold 9px Orbitron,monospace';ctx.textAlign='center';ctx.textBaseline='middle';
        ctx.fillText(l,x,y);
    }
    // Inner ring (plain)
    for(let i=0;i<26;i++){
        const angle=(i/26)*Math.PI*2-Math.PI/2;
        const x=cx+Math.cos(angle)*52,y=cy+Math.sin(angle)*52;
        const l=letters[i];
        const isAct=plain&&l===plain;
        ctx.beginPath();ctx.arc(x,y,9,0,Math.PI*2);
        ctx.fillStyle=isAct?'rgba(0,201,255,0.3)':'rgba(8,12,16,0.95)';
        ctx.fill();
        ctx.strokeStyle=isAct?'#00c9ff':'#21262d';ctx.lineWidth=isAct?1.5:1;
        ctx.stroke();
        ctx.fillStyle=isAct?'#00c9ff':'#e6edf3';
        ctx.font='bold 8px Orbitron,monospace';ctx.textAlign='center';ctx.textBaseline='middle';
        ctx.fillText(l,x,y);
    }
    // Center
    ctx.beginPath();ctx.arc(cx,cy,22,0,Math.PI*2);
    ctx.fillStyle='rgba(8,12,16,0.98)';ctx.fill();
    ctx.strokeStyle='#21262d';ctx.lineWidth=1;ctx.stroke();
    ctx.fillStyle='#00ff9d';ctx.font='bold 9px Orbitron,monospace';
    ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillText('+'+s,cx,cy);
}
