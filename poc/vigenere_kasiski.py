"""
PROOF OF CONCEPT: Vigenère Cipher — Kasiski Test + Frequency Analysis
Finds key length using repeated trigrams, then cracks each Caesar group.
"""
from math import gcd
from functools import reduce

ENGLISH_FREQ = {
    'A':8.17,'B':1.49,'C':2.78,'D':4.25,'E':12.70,
    'F':2.23,'G':2.02,'H':6.09,'I':6.97,'J':0.15,
    'K':0.77,'L':4.03,'M':2.41,'N':6.75,'O':7.51,
    'P':1.93,'Q':0.10,'R':5.99,'S':6.33,'T':9.06,
    'U':2.76,'V':0.98,'W':2.36,'X':0.15,'Y':1.97,'Z':0.07
}

def kasiski_key_length(text):
    text = ''.join(c for c in text.upper() if c.isalpha())
    trigrams = {}
    for i in range(len(text) - 2):
        t = text[i:i+3]
        if t not in trigrams:
            trigrams[t] = []
        trigrams[t].append(i)
    repeated = {t: pos for t, pos in trigrams.items() if len(pos) > 1}
    if not repeated:
        return None, {}
    distances = []
    for positions in repeated.values():
        for i in range(1, len(positions)):
            distances.append(positions[i] - positions[0])
    key_length = reduce(gcd, distances)
    return key_length, repeated

def chi_squared(text):
    text = ''.join(c for c in text.upper() if c.isalpha())
    if not text:
        return 9999
    counts = {c: text.count(c) for c in 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'}
    chi = 0
    for letter, expected in ENGLISH_FREQ.items():
        observed = counts[letter] / len(text) * 100
        chi += (observed - expected) ** 2 / expected
    return chi

def crack_caesar_group(text):
    best_shift, best_score = 0, 9999
    for shift in range(26):
        dec = ''.join(chr((ord(c) - 65 - shift) % 26 + 65) for c in text)
        score = chi_squared(dec)
        if score < best_score:
            best_score, best_shift = score, shift
    return best_shift

def vigenere_decrypt(text, key):
    key = key.upper()
    result = []
    ki = 0
    for c in text.upper():
        if c.isalpha():
            shift = ord(key[ki % len(key)]) - 65
            result.append(chr((ord(c) - 65 - shift) % 26 + 65))
            ki += 1
        else:
            result.append(c)
    return ''.join(result)

def crack_vigenere(ciphertext):
    text = ''.join(c for c in ciphertext.upper() if c.isalpha())
    print(f"\nAttacking: {ciphertext[:50]}...\n")
    key_length, repeated = kasiski_key_length(text)
    if not key_length:
        print("No repeated trigrams found — text may be too short.")
        return
    print(f"Repeated trigrams found: {list(repeated.keys())[:5]}")
    print(f"Kasiski estimated key length: {key_length}\n")
    # Split into groups and crack each
    groups = [''.join(text[i::key_length]) for i in range(key_length)]
    key = ''
    for i, group in enumerate(groups):
        shift = crack_caesar_group(group)
        key += chr(shift + 65)
        print(f"Group {i+1} best shift: {shift} → key letter: {chr(shift+65)}")
    print(f"\nRecovered key: {key}")
    print(f"Decrypted: {vigenere_decrypt(ciphertext, key)}")

if __name__ == '__main__':
    ciphertext = input("Enter Vigenère ciphertext: ").strip()
    crack_vigenere(ciphertext)