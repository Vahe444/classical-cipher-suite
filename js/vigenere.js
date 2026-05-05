let vState={idx:0,running:false,letters:[],keyLetters:[],result:[],timer:null,mode:'enc'};

function vigRun(mode){
    let t=document.getElementById('vigText').value.toUpperCase();
    if(!t.trim())return;
    let kw=document.getElementById('vigKey').value.toUpperCase().replace(/[^A-Z]/g,'');
    if(!kw){kw='KEY';document.getElementById('vigKey').value='KEY';}
    vState.mode=mode;
    vState.letters=t.split('').filter(c=>c>='A'&&c<='Z');
    vState.keyLetters=vState.letters.map((_,i)=>kw[i%kw.length]);
    vState.result=mode==='enc'?vigEnc(t,kw).split('').filter(c=>c>='A'&&c<='Z')
        :vigDec(t,kw).split('').filter(c=>c>='A'&&c<='Z');
    vState.idx=0;vState.running=false;
    clearInterval(vState.timer);
    vigRender();
    setTimeout(()=>vigPlay(),200);
}

function vigRender(){
    const inp=document.getElementById('vigInput');inp.innerHTML='';
    const out=document.getElementById('vigOutput');out.innerHTML='';
    vState.letters.forEach((l,i)=>{
        const d=document.createElement('div');
        d.className='letter';d.id=`vl_${i}`;d.textContent=l;
        inp.appendChild(d);
    });
    const kRow=document.getElementById('vigKeyRow');kRow.innerHTML='';
    vState.keyLetters.forEach((l,i)=>{
        const col=KEY_COLORS[i%6];
        const d=document.createElement('div');
        d.className='key-letter';d.id=`vk_${i}`;
        d.style.borderColor=col;d.style.color=col;d.style.background=col+'22';
        d.textContent=l;
        kRow.appendChild(d);
    });
    document.getElementById('vigInfo').textContent=vState.letters.length?'Press ▶ to start the animation':'Type some text first';
    const r=document.getElementById('vigResult');
    r.textContent='Will appear here when complete';
    r.classList.add('empty');
}

function vigPlay(){
    if(vState.running)return;
    if(!vState.letters.length){vigRun(vState.mode);return;}
    if(vState.idx>=vState.letters.length){vigReset();return;}
    vState.running=true;
    const spd=SPEEDS[parseInt(document.getElementById('vigSpeed').value)-1];
    vigFrame(vState.idx);vState.idx++;
    vState.timer=setInterval(()=>{
        if(vState.idx>=vState.letters.length){
            clearInterval(vState.timer);vState.running=false;
            vigFinish();
            return;
        }
        vigFrame(vState.idx);vState.idx++;
    },spd);
}

function vigPause(){clearInterval(vState.timer);vState.running=false;}

function vigStep(d){
    clearInterval(vState.timer);vState.running=false;
    if(!vState.letters.length)return;
    vState.idx=Math.max(0,Math.min(vState.letters.length,vState.idx+d));
    vigRebuildUpTo(vState.idx);
    if(vState.idx>=vState.letters.length)vigFinish();
}

function vigReset(){
    clearInterval(vState.timer);vState.idx=0;vState.running=false;
    vigRender();
}

function vigRebuildUpTo(n){
    // reset all
    for(let i=0;i<vState.letters.length;i++){
        const lEl=document.getElementById(`vl_${i}`);
        const kEl=document.getElementById(`vk_${i}`);
        if(lEl){
            lEl.className='letter';
            lEl.style.borderColor='';lEl.style.color='';lEl.style.background='';
            lEl.style.transform='scale(1)';lEl.style.boxShadow='';
        }
        if(kEl){
            kEl.style.transform='scale(1)';kEl.style.boxShadow='';
        }
    }
    // mark up to n
    for(let i=0;i<n;i++){
        const lEl=document.getElementById(`vl_${i}`);
        if(lEl&&i<n-1)lEl.classList.add('done');
    }
    // active
    if(n>0){
        const i=n-1,col=KEY_COLORS[i%6];
        const lEl=document.getElementById(`vl_${i}`);
        const kEl=document.getElementById(`vk_${i}`);
        if(lEl){
            lEl.style.borderColor=col;lEl.style.color=col;lEl.style.background=col+'22';
            lEl.style.transform='scale(1.18)';lEl.style.boxShadow=`0 0 12px ${col}`;
        }
        if(kEl){
            kEl.style.transform='scale(1.18)';kEl.style.boxShadow=`0 0 12px ${col}`;
        }
    }
    // build output
    const out=document.getElementById('vigOutput');out.innerHTML='';
    for(let i=0;i<n;i++){
        const col=KEY_COLORS[i%6];
        const d=document.createElement('div');
        d.className='output-letter';
        d.style.borderColor=col;d.style.color=col;d.style.background=col+'22';
        d.textContent=vState.result[i];
        out.appendChild(d);
    }
    // info
    if(n>0){
        const i=n-1,pl=vState.letters[i],kl=vState.keyLetters[i],o=vState.result[i];
        const s=kl.charCodeAt(0)-65;
        document.getElementById('vigInfo').innerHTML=vState.mode==='enc'
            ?`<b>${pl}</b> + <b>${kl}</b>(${s}) = <b>${o}</b>`
            :`<b>${pl}</b> − <b>${kl}</b>(${s}) = <b>${o}</b>`;
    } else {
        document.getElementById('vigInfo').textContent='Press ▶ to start the animation';
    }
}

function vigFrame(i){
    vigRebuildUpTo(i+1);
    const kl=vState.keyLetters[i];
    playClick(300+(kl.charCodeAt(0)-65)*8);
}

function vigFinish(){
    // remove active from all letters
    for(let i=0;i<vState.letters.length;i++){
        const lEl=document.getElementById(`vl_${i}`);
        const kEl=document.getElementById(`vk_${i}`);
        if(lEl){lEl.style.transform='scale(1)';lEl.style.boxShadow='';lEl.classList.add('done');}
        if(kEl){kEl.style.transform='scale(1)';kEl.style.boxShadow='';}
    }
    document.getElementById('vigInfo').innerHTML=`✓ Complete — ${vState.letters.length} letters processed`;
    const r=document.getElementById('vigResult');
    r.textContent=vState.result.join('');
    r.classList.remove('empty');
}
