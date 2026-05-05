"""
PROOF OF CONCEPT: Caesar Cipher Brute Force
Tries all 25 shifts and scores using chi-squared test.
"""

ENGLISH_FREQ = {
    'A':8.17,'B':1.49,'C':2.78,'D':4.25,'E':12.70,
    'F':2.23,'G':2.02,'H':6.09,'I':6.97,'J':0.15,
    'K':0.77,'L':4.03,'M':2.41,'N':6.75,'O':7.51,
    'P':1.93,'Q':0.10,'R':5.99,'S':6.33,'T':9.06,
    'U':2.76,'V':0.98,'W':2.36,'X':0.15,'Y':1.97,'Z':0.07
}

def caesar_decrypt(text, shift):
    result = []
    for c in text.upper():
        if c.isalpha():
            result.append(chr((ord(c) - 65 - shift) % 26 + 65))
        else:
            result.append(c)
    return ''.join(result)

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

def brute_force(ciphertext):
    print(f"\nAttacking: {ciphertext}\n")
    results = []
    for shift in range(1, 26):
        decrypted = caesar_decrypt(ciphertext, shift)
        score = chi_squared(decrypted)
        results.append((shift, score, decrypted))
    results.sort(key=lambda x: x[1])
    print(f"{'SHIFT':<8} {'CHI²':<10} {'DECRYPTED'}")
    print('-' * 60)
    for shift, score, dec in results:
        marker = ' ← BEST' if shift == results[0][0] else ''
        print(f"{shift:<8} {score:<10.2f} {dec[:40]}{marker}")
    print(f"\nResult: Shift = {results[0][0]}, Plaintext = {results[0][2]}")

if __name__ == '__main__':
    ciphertext = input("Enter Caesar ciphertext: ").strip()
    brute_force(ciphertext)