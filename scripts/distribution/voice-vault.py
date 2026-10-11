#!/usr/bin/env python3
"""Bootstrap, verify and offline-restore the exact THS Kokoro-82M torch narrator."""
import argparse
import hashlib
import json
import os
from pathlib import Path

REPO = "hexgrad/Kokoro-82M"
VOICE = "am_michael"
FILENAMES = ("kokoro-v1_0.pth", "voices/am_michael.pt", "config.json")
MANIFEST = "voice-vault.json"
SCHEMA = "ths-kokoro-torch-vault-v1"
TAG = "ths-kokoro-torch-am-michael-v1"


def sha(path):
    h = hashlib.sha256()
    with path.open("rb") as f:
        for block in iter(lambda: f.read(1024 * 1024), b""):
            h.update(block)
    return h.hexdigest()


def bootstrap(folder):
    from huggingface_hub import HfApi, hf_hub_download
    folder.mkdir(parents=True, exist_ok=True)
    revision = HfApi().model_info(REPO).sha
    if not revision or len(revision) != 40:
        raise ValueError("No immutable model source revision; refusing mutable main")
    files = {}
    for filename in FILENAMES:
        source = Path(hf_hub_download(repo_id=REPO, filename=filename, revision=revision))
        dest = folder / filename
        dest.parent.mkdir(parents=True, exist_ok=True)
        dest.write_bytes(source.read_bytes())
        files[filename] = {"sha256": sha(dest), "bytes": dest.stat().st_size}
    manifest = {
        "schemaVersion": SCHEMA, "tag": TAG, "repository": REPO,
        "revision": revision, "model": "Kokoro-82M", "voice": VOICE,
        "package": "kokoro>=0.9.4,<1", "files": files,
    }
    (folder / MANIFEST).write_text(json.dumps(manifest, indent=2) + "\n")
    verify(folder)
    print("BOOTSTRAP PASS: exact original torch model/voice pinned to immutable source revision")


def verify(folder):
    manifest = json.loads((folder / MANIFEST).read_text())
    if (manifest.get("schemaVersion") != SCHEMA or manifest.get("tag") != TAG
            or manifest.get("repository") != REPO or manifest.get("model") != "Kokoro-82M"
            or manifest.get("voice") != VOICE):
        raise ValueError("Voice identity mismatch")
    revision = manifest.get("revision", "")
    if len(revision) != 40 or any(c not in "0123456789abcdef" for c in revision):
        raise ValueError("Unpinned model source revision")
    if set(manifest.get("files", {})) != set(FILENAMES):
        raise ValueError("Missing or unexpected voice vault files")
    for filename in FILENAMES:
        asset = folder / filename
        if not asset.is_file() or asset.is_symlink():
            raise ValueError("Missing or symlinked voice asset: " + filename)
        expected = manifest["files"][filename]
        actual_size = asset.stat().st_size
        minimum = 100_000_000 if filename.endswith(".pth") else (10_000 if filename.endswith(".pt") else 100)
        if actual_size < minimum or actual_size != expected["bytes"] or sha(asset) != expected["sha256"]:
            raise ValueError("Corrupt/incorrect voice asset: " + filename)
    print("VERIFY PASS: exact pinned original Kokoro voice, SHA-256 and size verified")
    return manifest


def restore(folder, cache_dir):
    """Populate HF's offline snapshot cache, so KPipeline uses *saved* model bytes."""
    manifest = verify(folder)
    root = cache_dir / "models--hexgrad--Kokoro-82M"
    snapshot = root / "snapshots" / manifest["revision"]
    snapshot.mkdir(parents=True, exist_ok=True)
    (root / "refs").mkdir(parents=True, exist_ok=True)
    for filename in FILENAMES:
        source = folder / filename
        dest = snapshot / filename
        dest.parent.mkdir(parents=True, exist_ok=True)
        if dest.exists() or dest.is_symlink():
            dest.unlink()
        # Keep the release model as the owned copy; the snapshot path mirrors it.
        dest.symlink_to(source.resolve())
    (root / "refs" / "main").write_text(manifest["revision"])
    print("RESTORE PASS: Hugging Face offline cache resolves the exact saved THS weights")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("command", choices=["bootstrap", "verify", "restore"])
    parser.add_argument("folder", type=Path)
    parser.add_argument("--cache-dir", type=Path)
    args = parser.parse_args()
    root = args.folder.resolve()
    if args.command == "bootstrap":
        bootstrap(root)
    elif args.command == "verify":
        verify(root)
    else:
        cache_dir = args.cache_dir or Path(os.environ.get("HF_HUB_CACHE") or Path(os.environ.get("HF_HOME", Path.home() / ".cache" / "huggingface")) / "hub")
        restore(root, cache_dir.expanduser().resolve())


if __name__ == "__main__":
    main()
