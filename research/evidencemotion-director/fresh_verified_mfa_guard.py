"""SHA-bound original Kokoro 2026-10-19 MFA input selector; research only."""
from pathlib import Path
import hashlib
import wave

FRESH_WAV_SHA = '31b349d76abaf29488c96422fb798bc62c6e9aa8428cf84304629159aeacfc28'
FRESH_INPUTS = {
    'wav': FRESH_WAV_SHA,
    'transcript': '835f15869c48a7c77e4b344ab174180ceac492aae8011d127c51226cfa92afa3',
    'textgrid': 'd69fe9ad60535ab0a6e9a5946b22fcef1010c11328d95e998766b0113d74881f',
    'dictionary': 'e3102d6f33d147d3b7500a9a2386b0930d69b6674a93ddf37e299fb7d6e11805',
    'acousticModel': 'd35ce271ded357d833d2f4b8d1041dc3748b9538567ba13f2c697f4e4126711b',
}

def verify_fresh_manifest(root, manifest):
    if not isinstance(manifest, dict) or set(manifest) != set(FRESH_INPUTS):
        raise ValueError('TREATMENT_HOLD:FRESH_MFA_EXACT_FIVE_INPUTS_REQUIRED')
    for key, expected_sha in FRESH_INPUTS.items():
        entry = manifest.get(key)
        if not isinstance(entry, dict) or set(entry) != {'path', 'sha256'} or entry['sha256'] != expected_sha:
            raise ValueError('TREATMENT_HOLD:FRESH_MFA_SOURCE_PIN_MISMATCH:' + key)
    return True

def verify_fresh_wave(path):
    path = Path(path)
    if path.is_symlink() or not path.is_file():
        raise ValueError('TREATMENT_HOLD:FRESH_WAV_NOT_REGULAR_FILE')
    h = hashlib.sha256()
    with path.open('rb') as stream:
        for chunk in iter(lambda: stream.read(1048576), b''):
            h.update(chunk)
    if h.hexdigest() != FRESH_WAV_SHA:
        raise ValueError('TREATMENT_HOLD:FRESH_WAV_IDENTITY_CHANGED')
    with wave.open(str(path), 'rb') as wav:
        fmt = (wav.getnchannels(), wav.getsampwidth(), wav.getframerate(), wav.getcomptype(), wav.getnframes())
        if fmt != (1, 2, 24000, 'NONE', 824720):
            raise ValueError('TREATMENT_HOLD:FRESH_WAV_FORMAT_CHANGED')
        return wav.getnframes() / 24000
