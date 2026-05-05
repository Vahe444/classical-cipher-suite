## Team

Vahe Maleryan and
Iren Arakelyan


# Classical Cipher Suite

## About

This is our cybersecurity course project. We built an interactive website that demonstrates how three classical ciphers work and how they can be broken. Each cipher has a live animation that shows what happens to every letter during encryption and decryption.

## Ciphers

**Caesar** — shifts every letter by a fixed amount. Broken by trying all 25 possible keys automatically.

**Rail Fence** — rearranges letters in a zigzag pattern across rails. Broken by exhausting all possible rail counts.

**Vigenère** — uses a repeating keyword to shift each letter differently. Broken using the Kasiski test and frequency analysis.

## How to Run

Open index.html in any browser. No installation needed.

## Attack Scripts


cd poc
python3 caesar_bruteforce.py

python3 railfence_crack.py

python3 vigenere_kasiski.py


