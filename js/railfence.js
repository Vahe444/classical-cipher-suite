let rState={idx:0,running:false,letters:[],result:[],pattern:[],rails:3,timer:null,mode:'enc',readOrder:[]};

function railRun(mode){
    let t=document.getElementById('railText').value;
    if(!t.trim())return;
    let r=parseInt(document.getElementById('railKey').value);
    if(isNaN(r)||r<2)r=2;if(r>5)r=5;
    document.getElementById('railKey').value=r;
    rState.mode=mode;
    rState.rails=r;
    rState.letters=t.toUpperCase().replace(/[^A-Z]/g,'').split('');
    rState.pattern=getRailPattern(rState.letters.length,r);
    rState.result=mode==='enc'?railEnc(t,r).split(''):railDec(t,r).split('');
    // Build read order: which original index is read at each step of phase 2
    // Read rail 0 left-to-right, then rail 1, etc.
    rState.readOrder=[];
    for(let rail=0;rail<r;rail++){
        for(let i=0;i<rState.letters.length;i++){
            if(rState.pattern[i]===rail)rState.readOrder.push(i);
        }
    }
    rState.idx=0;rState.running=false;
    clearInterval(rState.timer);
    railRender();
    setTimeout(()=>railPlay(),200);
}

function railRender(){
    const grid=document.getElementById('railGrid');grid.innerHTML='';
    const out=document.getElementById('railOutput');out.innerHTML='';
    // build grid empty
    for(let rail=0;rail<rState.rails;rail++){
        const row=document.createElement('div');row.className='rail-row';
        const lbl=document.createElement('div');lbl.className='rail-label';lbl.textContent=`R${rail+1}`;
        row.appendChild(lbl);
        for(let i=0;i<rState.letters.length;i++){
            const cell=document.createElement('div');
            if(rState.pattern[i]===rail){
                cell.className=`rail-cell r${rail%5}`;
                cell.id=`rc_${i}`;
                cell.textContent='';
            } else {
                cell.className='rail-cell empty';
                cell.textContent='·';
            }
            row.appendChild(cell);
        }
        grid.appendChild(row);
    }
    document.getElementById('railInfo').textContent=rState.letters.length?'Press ▶ — Phase 1: write letters in zigzag':'Type some text first';
    const r=document.getElementById('railResult');
    r.textContent='Will appear here when complete';
    r.classList.add('empty');
}

function railPlay(){
    if(rState.running)return;
    if(!rState.letters.length){railRun(rState.mode);return;}
    const totalSteps=rState.letters.length*2;
    if(rState.idx>=totalSteps){railReset();return;}
    rState.running=true;
    const spd=SPEEDS[parseInt(document.getElementById('railSpeed').value)-1];
    railFrame(rState.idx);rState.idx++;
    rState.timer=setInterval(()=>{
        if(rState.idx>=totalSteps){
            clearInterval(rState.timer);rState.running=false;
            railFinish();
            return;
        }
        railFrame(rState.idx);rState.idx++;
    },spd);
}

function railPause(){clearInterval(rState.timer);rState.running=false;}

function railStep(d){
    clearInterval(rState.timer);rState.running=false;
    if(!rState.letters.length)return;
    const totalSteps=rState.letters.length*2;
    rState.idx=Math.max(0,Math.min(totalSteps,rState.idx+d));
    railRebuildUpTo(rState.idx);
    if(rState.idx>=totalSteps)railFinish();
}

function railReset(){
    clearInterval(rState.timer);rState.idx=0;rState.running=false;
    railRender();
}

// Rebuild full state from scratch up to step n (0..2N)
function railRebuildUpTo(n){
    const N=rState.letters.length;
    // Clear all cell states first
    for(let i=0;i<N;i++){
        const cell=document.getElementById(`rc_${i}`);
        if(!cell)continue;
        cell.classList.remove('active','placed','reading','read');
        cell.textContent='';
    }

    if(n<=N){
        // ─── PHASE 1: WRITE ─── (steps 0..N)
        // Place letters 0..n-1
        for(let i=0;i<n;i++){
            const cell=document.getElementById(`rc_${i}`);
            if(cell){
                cell.textContent=rState.letters[i];
                if(i===n-1)cell.classList.add('active');
                else cell.classList.add('placed');
            }
        }
        // Output empty during phase 1
        document.getElementById('railOutput').innerHTML='';
        // Info
        if(n===0){
            document.getElementById('railInfo').textContent='Press ▶ — Phase 1: write letters in zigzag';
        } else if(n<N){
            const i=n-1,rail=rState.pattern[i];
            document.getElementById('railInfo').innerHTML=
                `<span style="color:var(--b)">PHASE 1 — WRITE</span> · Letter <b>${rState.letters[i]}</b> → Rail <b>${rail+1}</b>`;
        } else {
            // n === N: all placed, ready for phase 2
            // Mark all as placed (none active)
            for(let i=0;i<N;i++){
                const cell=document.getElementById(`rc_${i}`);
                if(cell){cell.classList.remove('active');cell.classList.add('placed');}
            }
            document.getElementById('railInfo').innerHTML=
                `<span style="color:var(--b)">PHASE 1 ✓</span> · All letters placed. Now reading rail-by-rail...`;
        }
    } else {
        // ─── PHASE 2: READ ─── (steps N+1..2N)
        // All letters fully written
        for(let i=0;i<N;i++){
            const cell=document.getElementById(`rc_${i}`);
            if(cell){cell.textContent=rState.letters[i];cell.classList.add('placed');}
        }
        // Mark which have been read so far
        const readCount=n-N; // how many letters read
        for(let k=0;k<readCount;k++){
            const origIdx=rState.readOrder[k];
            const cell=document.getElementById(`rc_${origIdx}`);
            if(cell){cell.classList.remove('placed');cell.classList.add('read');}
        }
        // Highlight current letter being read
        if(readCount>0&&readCount<=N){
            const curIdx=rState.readOrder[readCount-1];
            const cell=document.getElementById(`rc_${curIdx}`);
            if(cell){cell.classList.remove('read');cell.classList.add('reading');}
        }
        // Build output up to readCount
        const out=document.getElementById('railOutput');out.innerHTML='';
        for(let k=0;k<readCount;k++){
            const d=document.createElement('div');
            d.className='output-letter b';
            d.textContent=rState.letters[rState.readOrder[k]];
            out.appendChild(d);
        }
        // Info
        if(readCount>0){
            const curIdx=rState.readOrder[readCount-1];
            const rail=rState.pattern[curIdx];
            document.getElementById('railInfo').innerHTML=
                `<span style="color:var(--b)">PHASE 2 — READ</span> · Reading Rail <b>${rail+1}</b> · picked <b>${rState.letters[curIdx]}</b>`;
        }
    }
}

function railFrame(i){
    railRebuildUpTo(i+1);
    // Play tone — different for phase 1 vs phase 2
    const N=rState.letters.length;
    if(i<N){
        const rail=rState.pattern[i];
        playClick(180+rail*100);
    } else {
        const k=i-N;
        if(k<rState.readOrder.length){
            const rail=rState.pattern[rState.readOrder[k]];
            playClick(400+rail*120);
        }
    }
}

function railFinish(){
    // Phase 2 complete — mark all read
    for(let i=0;i<rState.letters.length;i++){
        const cell=document.getElementById(`rc_${i}`);
        if(cell){cell.classList.remove('placed','reading');cell.classList.add('read');}
    }
    document.getElementById('railInfo').innerHTML=
        `<span style="color:var(--g)">✓ COMPLETE</span> · ${rState.letters.length} letters · ${rState.rails} rails`;
    const r=document.getElementById('railResult');
    r.textContent=rState.result.join('');
    r.classList.remove('empty');
}
