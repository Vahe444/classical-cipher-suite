const KEY_COLORS = ['#00ff9d','#00c9ff','#ffd93d','#ff6b6b','#c084fc','#fb923c'];
const SPEEDS = [1100, 550, 250];
let soundOn = false, audioCtx = null;

function toggleSound() {
    soundOn = !soundOn;
    document.getElementById('soundBtn').textContent = soundOn ? '🔊' : '🔇';
}

function playClick(freq) {
    if (!soundOn) return;
    try {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const o = audioCtx.createOscillator(), g = audioCtx.createGain();
        o.connect(g); g.connect(audioCtx.destination);
        o.frequency.value = freq || 440; o.type = 'triangle';
        g.gain.setValueAtTime(0.04, audioCtx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.06);
        o.start(); o.stop(audioCtx.currentTime + 0.06);
    } catch(e) {}
}

function goTo(sec) {
    document.querySelectorAll('.section').forEach(s => s.style.display = 'none');
    document.getElementById(sec).style.display = 'block';
    document.querySelectorAll('nav button').forEach(b => b.classList.remove('active','g','b','y'));
    const map = { caesar:'g', rail:'b', vig:'y', brute:'r' };
    document.getElementById('nav-' + sec).classList.add('active', map[sec]);
    setTimeout(() => document.getElementById(sec).scrollIntoView({ behavior:'smooth', block:'start' }), 50);
}

function copy(id, btn) {
    const el = document.getElementById(id);
    if (el.classList.contains('empty')) return;
    navigator.clipboard.writeText(el.textContent).then(() => {
        const orig = btn.textContent;
        btn.textContent = 'COPIED!';
        btn.style.color = 'var(--g)';
        btn.style.borderColor = 'var(--g)';
        setTimeout(() => {
            btn.textContent = orig;
            btn.style.color = '';
            btn.style.borderColor = '';
        }, 1200);
    }).catch(() => {});
}

window.addEventListener('load', () => {
    document.getElementById('rail').style.display = 'none';
    document.getElementById('vig').style.display = 'none';
    document.getElementById('brute').style.display = 'none';

    cState.letters = 'HELLO'.split('');
    cState.result = caesarEnc('HELLO', 3).split('');
    cState.shift = 3;
    caesarRender();

    rState.letters = 'WEAREDISCOVERED'.split('');
    rState.rails = 3;
    rState.pattern = getRailPattern(15, 3);
    rState.result = railEnc('WEAREDISCOVERED', 3).split('');
    rState.readOrder = [];
    for (let rail = 0; rail < 3; rail++)
        for (let i = 0; i < 15; i++)
            if (rState.pattern[i] === rail) rState.readOrder.push(i);
    railRender();

    vState.letters = 'HELLO'.split('');
    vState.keyLetters = ['K','E','Y','K','E'];
    vState.result = vigEnc('HELLO', 'KEY').split('');
    vigRender();

    drawCaesarWheel(3, null, null);
});