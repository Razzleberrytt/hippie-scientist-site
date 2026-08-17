#!/usr/bin/env python3
"""Materialize the 1,000-ticket backlog from the immutable seed + mutable status ledger.

Usage:
    python backlog/materialize_backlog.py

The generated backlog/master_backlog.csv is intentionally ignored by Git.
Agents should edit backlog/status.csv after ticket state changes.
"""

from __future__ import annotations

import csv
import io
import sys
import zlib
from pathlib import Path

HERE = Path(__file__).resolve().parent
SEED_PATH = HERE / "master_backlog.csv.zlib"
STATUS_PATH = HERE / "status.csv"
OUTPUT_PATH = HERE / "master_backlog.csv"

MUTABLE_FIELDS = (
    "Status",
    "Owner",
    "Claimed At",
    "Branch",
    "PR / Commit",
    "Blocker",
    "Proof / Notes",
)
ALLOWED_STATUSES = {
    "Not Started",
    "Ready",
    "In Progress",
    "In Review",
    "Done",
    "Blocked",
    "Won't Do",
}


def load_seed() -> tuple[list[str], list[dict[str, str]]]:
    raw = zlib.decompress(SEED_PATH.read_bytes()).decode("utf-8")
    reader = csv.DictReader(io.StringIO(raw))
    if not reader.fieldnames:
        raise SystemExit("Backlog seed has no header.")
    rows = list(reader)
    return list(reader.fieldnames), rows


def load_status() -> dict[str, dict[str, str]]:
    if not STATUS_PATH.exists():
        return {}

    with STATUS_PATH.open("r", encoding="utf-8", newline="") as handle:
        reader = csv.DictReader(handle)
        if not reader.fieldnames:
            return {}

        expected = {"ID", *MUTABLE_FIELDS}
        missing = expected.difference(reader.fieldnames)
        if missing:
            raise SystemExit(f"status.csv is missing columns: {sorted(missing)}")

        result: dict[str, dict[str, str]] = {}
        for line_no, row in enumerate(reader, start=2):
            ticket_id = (row.get("ID") or "").strip()
            if not ticket_id:
                continue
            if ticket_id in result:
                raise SystemExit(f"Duplicate status row for {ticket_id} at line {line_no}.")

            status = (row.get("Status") or "").strip()
            if status and status not in ALLOWED_STATUSES:
                raise SystemExit(
                    f"Invalid Status {status!r} for {ticket_id} at line {line_no}."
                )

            owner = (row.get("Owner") or "").strip()
            claimed_at = (row.get("Claimed At") or "").strip()
            branch = (row.get("Branch") or "").strip()
            blocker = (row.get("Blocker") or "").strip()

            if status in {"In Progress", "In Review"} and not owner:
                raise SystemExit(
                    f"{ticket_id} is {status} but has no Owner at line {line_no}."
                )
            if status in {"In Progress", "In Review"} and not branch:
                raise SystemExit(
                    f"{ticket_id} is {status} but has no Branch at line {line_no}."
                )
            if status == "In Progress" and not claimed_at:
                raise SystemExit(
                    f"{ticket_id} is In Progress but has no Claimed At timestamp at line {line_no}."
                )
            if status == "Blocked" and not blocker:
                raise SystemExit(
                    f"{ticket_id} is Blocked but has no Blocker explanation at line {line_no}."
                )

            result[ticket_id] = {
                field: (row.get(field) or "") for field in MUTABLE_FIELDS
            }
        return result


def main() -> int:
    fieldnames, rows = load_seed()
    status_by_id = load_status()
    seed_ids = {row["ID"] for row in rows}

    unknown = sorted(set(status_by_id).difference(seed_ids))
    if unknown:
        raise SystemExit(f"status.csv contains unknown ticket IDs: {unknown[:10]}")

    # Ensure generated output includes the coordination fields even if the original
    # immutable seed predates the multi-agent ledger.
    for field in MUTABLE_FIELDS:
        if field not in fieldnames:
            fieldnames.append(field)

    for row in rows:
        overlay = status_by_id.get(row["ID"])
        if overlay is not None:
            row.update(overlay)
        else:
            for field in MUTABLE_FIELDS:
                row.setdefault(field, "")

    with OUTPUT_PATH.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=fieldnames, lineterminator="\n")
        writer.writeheader()
        writer.writerows(rows)

    counts: dict[str, int] = {}
    for row in rows:
        counts[row.get("Status", "") or "Unspecified"] = (
            counts.get(row.get("Status", "") or "Unspecified", 0) + 1
        )

    print(f"Wrote {len(rows)} tickets to {OUTPUT_PATH.relative_to(HERE.parent)}")
    print("Status counts:", ", ".join(f"{k}={v}" for k, v in sorted(counts.items())))
    return 0


if __name__ == "__main__":
    sys.exit(main())
