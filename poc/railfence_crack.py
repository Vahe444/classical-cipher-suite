"""
PROOF OF CONCEPT: Rail Fence Key Space Exhaustion
Tries all rail counts 2-8 and checks for English words.
"""

COMMON_WORDS = ['THE','AND','IS','IN','IT','OF','TO',
                'THAT','WAS','FOR','ON','ARE','WITH','AT']

def get_rail_pattern(n, rails):
    pattern = []
    rail, direction = 0, 1
    for _ in range(n):
        pattern.append(rail)
        if rail == 0:
            direction = 1
        elif rail == rails - 1:
            direction = -1
        rail += direction
    return pattern

def rail_fence_decrypt(text, rails):
    n = len(text)
    if rails < 2 or n == 0:
        return text
    pattern = get_rail_pattern(n, rails)
    result = [''] * n
    idx = 0
    for r in range(rails):
        for i in range(n):
            if pattern[i] == r:
                result[i] = text[idx]
                idx += 1
    return ''.join(result)

def word_score(text):
    return sum(1 for w in COMMON_WORDS if w in text.upper())

def crack_rail_fence(ciphertext):
    print(f"\nAttacking: {ciphertext}\n")
    print(f"{'RAILS':<8} {'WORDS FOUND':<14} {'DECRYPTED'}")
    print('-' * 60)
    best = None
    for rails in range(2, 9):
        dec = rail_fence_decrypt(ciphertext, rails)
        score = word_score(dec)
        marker = ' ← LIKELY' if score >= 2 else ''
        print(f"{rails:<8} {score:<14} {dec}{marker}")
        if best is None or score > best[0]:
            best = (score, rails, dec)
    print(f"\nResult: Rails = {best[1]}, Plaintext = {best[2]}")

if __name__ == '__main__':
    ciphertext = input("Enter Rail Fence ciphertext (letters only): ").strip()
    crack_rail_fence(ciphertext)