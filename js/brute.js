// ═══════════════════════════════════════════════════════════════
// BRUTE FORCE ATTACK
// ═══════════════════════════════════════════════════════════════

const ENGLISH_FREQ = {
    A:8.17,B:1.49,C:2.78,D:4.25,E:12.70,F:2.23,G:2.02,H:6.09,
    I:6.97,J:0.15,K:0.77,L:4.03,M:2.41,N:6.75,O:7.51,P:1.93,
    Q:0.10,R:5.99,S:6.33,T:9.06,U:2.76,V:0.98,W:2.36,X:0.15,
    Y:1.97,Z:0.07
};

const COMMON_WORDS = [
    'THE','AND','IS','IN','IT','OF','TO','THAT',
    'WAS','FOR','ON','ARE','WITH','AS','AT','BE',
    'THIS','NOT','HER','SHE','YOU','THEY','HAVE','FROM'
];

function chiSquared(text) {
    const u = text.toUpperCase().replace(/[^A-Z]/g, '');
    if (!u.length) return 9999;
    const counts = {};
    for (const c of u) counts[c] = (counts[c] || 0) + 1;
    let chi = 0;
    for (const [l, ef] of Object.entries(ENGLISH_FREQ)) {
        const obs = (counts[l] || 0) / u.length * 100;
        chi += Math.pow(obs - ef, 2) / ef;
    }
    return chi;
}

function wordScore(text) {
    const u = text.toUpperCase();
    return COMMON_WORDS.filter(w => u.includes(w)).length;
}

function bruteRun() {
    const ct = document.getElementById('bruteInput').value.trim();
    if (!ct) {
        document.getElementById('bruteInfo').textContent = 'Paste a ciphertext first.';
        return;
    }

    const container = document.getElementById('bruteResults');
    container.innerHTML = '';
    document.getElementById('bruteInfo').textContent = 'Analyzing...';

    const t0 = performance.now();
    const results = [];

    for (let s = 1; s <= 25; s++) {
        const dec = caesarDec(ct, s);
        results.push({
            shift: s,
            dec,
            chi: chiSquared(dec),
            words: wordScore(dec)
        });
    }

    results.sort((a, b) => a.chi - b.chi);
    const elapsed = (performance.now() - t0).toFixed(2);
    const maxChi = Math.max(...results.map(r => r.chi));

    results.forEach((r, i) => {
        const row = document.createElement('div');
        row.className = 'brute-row' + (i === 0 ? ' best' : '');

        row.innerHTML = `
      <div class="br-rank">#${r.shift}</div>
      <div class="br-score">
        χ²: ${r.chi.toFixed(1)}<br/>
        <span class="br-words">words: ${r.words}</span>
      </div>
      <div class="br-text">
        ${r.dec.substring(0, 40)}${r.dec.length > 40 ? '...' : ''}
        <span class="best-badge">BEST</span>
      </div>
      <div class="br-bar-wrap">
        <div class="br-bar"></div>
      </div>
    `;

        container.appendChild(row);

        // animate in with stagger
        setTimeout(() => {
            row.classList.add('visible');
            // animate bar after row appears
            setTimeout(() => {
                const barPct = Math.max(5, (1 - r.chi / maxChi) * 100);
                row.querySelector('.br-bar').style.width = barPct + '%';
            }, 100);
        }, i * 55);
    });

    document.getElementById('bruteInfo').innerHTML =
        `⚡ Tried 25 shifts in <b>${elapsed}ms</b> — best match: shift <b>${results[0].shift}</b>`;
}

function bruteReset() {
    document.getElementById('bruteInput').value = '';
    document.getElementById('bruteResults').innerHTML = '';
    document.getElementById('bruteInfo').textContent = 'Paste a Caesar ciphertext and press ATTACK';
}