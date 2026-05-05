// ── CAESAR ──
function caesarShift(t, s) {
    const sh = ((s % 26) + 26) % 26;
    return t.toUpperCase().split('').map(c =>
        c >= 'A' && c <= 'Z'
            ? String.fromCharCode(((c.charCodeAt(0) - 65 + sh) % 26) + 65)
            : c
    ).join('');
}
function caesarEnc(t, s) { return caesarShift(t, s); }
function caesarDec(t, s) { return caesarShift(t, 26 - ((s % 26 + 26) % 26)); }

// ── RAIL FENCE ──
function getRailPattern(n, r) {
    const p = []; let rail = 0, dir = 1;
    for (let i = 0; i < n; i++) {
        p.push(rail);
        if (rail === 0) dir = 1;
        else if (rail === r - 1) dir = -1;
        rail += dir;
    }
    return p;
}
function railEnc(text, r) {
    const c = text.toUpperCase().replace(/[^A-Z]/g, '');
    if (!c || r < 2) return c;
    const f = Array.from({ length: r }, () => []);
    let rail = 0, dir = 1;
    for (const ch of c) {
        f[rail].push(ch);
        if (rail === 0) dir = 1;
        else if (rail === r - 1) dir = -1;
        rail += dir;
    }
    return f.map(x => x.join('')).join('');
}
function railDec(text, r) {
    const n = text.length;
    if (!n || r < 2) return text;
    const p = getRailPattern(n, r), res = Array(n);
    let idx = 0;
    for (let rail = 0; rail < r; rail++)
        for (let i = 0; i < n; i++)
            if (p[i] === rail) res[i] = text[idx++];
    return res.join('');
}

// ── VIGENÈRE ──
function vigProc(text, kw, enc) {
    const key = kw.toUpperCase().replace(/[^A-Z]/g, '');
    if (!key) return text;
    let ki = 0;
    return text.toUpperCase().split('').map(c => {
        if (c >= 'A' && c <= 'Z') {
            const s = key[ki++ % key.length].charCodeAt(0) - 65;
            return String.fromCharCode(((c.charCodeAt(0) - 65 + (enc ? s : 26 - s)) % 26) + 65);
        }
        return c;
    }).join('');
}
function vigEnc(t, k) { return vigProc(t, k, true); }
function vigDec(t, k) { return vigProc(t, k, false); }