#!/usr/bin/env python3
"""Immutable THS Kokoro ONNX model/voice vault (the original Voice Engine 0.44 files)."""
from __future__ import annotations

import argparse
import hashlib
import json
import shutil
import time
import urllib.request
from pathlib import Path

BASE_URL = "https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.1/"
TAG = "ths-kokoro-onnx-am-michael-int8-v1"
SCHEMA = "ths-original-house-voice-vault-v1"
ASSETS = {
    "kokoro-v1.0.int8.onnx": "ae315a79b623f244700e4afb9246c46a26066782e049ba174bf3ba433970ee9c",
    "voices-v1.0.bin": "bca610b8308e8d99f32e6fe4197e7ec01679264efed0cac9140fe9c29f1fbf7d",
}


def sha256(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for block in iter(lambda: f.read(1024 * 1024), b""):
            h.update(block)
    return h.hexdigest()


def verify(folder: Path) -> dict:
    manifest = json.loads((folder / "voice-vault.json").read_text())
    if (manifest.get("schemaVersion") != SCHEMA
            or manifest.get("tag") != TAG
            or manifest.get("voice") != "am_michael"
            or manifest.get("engine") != "kokoro-onnx"
            or manifest.get("engineVersion") != "0.6.1"
            or manifest.get("upstreamRelease") != BASE_URL
            or manifest.get("assets") != ASSETS):
        raise RuntimeError("THS narrator identity/manifest changed; refusing substituted voice")
    for name, digest in ASSETS.items():
        path = folder / name
        if not path.is_file() or path.is_symlink() or path.stat().st_size < 1_000_000:
            raise RuntimeError("THS narrator model missing: " + name)
        if sha256(path) != digest:
            raise RuntimeError("THS narrator model SHA-256 mismatch: " + name)
    print("PASS: exact approved Kokoro ONNX INT8 model + am_michael voicebank verified")
    return manifest


def bootstrap(folder: Path) -> None:
    folder.mkdir(parents=True, exist_ok=True)
    for name, digest in ASSETS.items():
        path = folder / name
        if path.is_file() and sha256(path) == digest:
            continue
        if path.exists():
            path.unlink()
        url = BASE_URL + name
        for attempt in range(3):
            partial = path.with_suffix(path.suffix + ".part")
            try:
                with urllib.request.urlopen(urllib.request.Request(
                    url, headers={"User-Agent": "THS-Immutable-Kokoro-Archive/1.0"}
                ), timeout=180) as response, partial.open("wb") as out:
                    shutil.copyfileobj(response, out, 1024 * 1024)
                if sha256(partial) != digest:
                    raise RuntimeError("Incorrect upstream model checksum: " + name)
                partial.replace(path)
                break
            except Exception:
                partial.unlink(missing_ok=True)
                if attempt == 2:
                    raise
                time.sleep(3 * (attempt + 1))
    manifest = {
        "schemaVersion": SCHEMA, "tag": TAG, "engine": "kokoro-onnx",
        "engineVersion": "0.6.1", "model": "Kokoro-82M v1.0 INT8",
        "voice": "am_michael", "upstreamRelease": BASE_URL,
        "assets": ASSETS, "sizes": {name: (folder / name).stat().st_size for name in ASSETS},
    }
    (folder / "voice-vault.json").write_text(json.dumps(manifest, indent=2) + "\n")
    verify(folder)


def restore(folder: Path, target: Path) -> None:
    manifest = verify(folder)
    target.mkdir(parents=True, exist_ok=True)
    if target.resolve() == folder.resolve():
        return
    for name in ASSETS:
        destination = target / name
        source = folder / name
        staging = destination.with_suffix(destination.suffix + ".part")
        shutil.copyfile(source, staging)
        if sha256(staging) != ASSETS[name]:
            raise RuntimeError("Corrupt voice model while restoring: " + name)
        staging.replace(destination)
    (target / "voice-vault.json").write_text(json.dumps(manifest, indent=2) + "\n")
    verify(target)
    print("RESTORE PASS: independently verified model restored to durable local cache")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("command", choices=["bootstrap", "verify", "restore"])
    parser.add_argument("folder", type=Path)
    parser.add_argument("--target", type=Path, default=None)
    args = parser.parse_args()
    if args.command == "bootstrap":
        bootstrap(args.folder.resolve())
    elif args.command == "verify":
        verify(args.folder.resolve())
    elif args.command == "restore":
        if args.target is None:
            parser.error("restore requires --target")
        restore(args.folder.resolve(), args.target.resolve())
