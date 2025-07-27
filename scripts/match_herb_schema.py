import json
from pathlib import Path
import re
from typing import Dict, List, Any


def normalize_text(text: str) -> str:
    """Normalize text by stripping extra spaces and converting to lowercase."""
    return re.sub(r"\s+", " ", text).strip().lower()


def derive_normalized_fields(entry: Dict[str, Any]) -> None:
    if "nameNorm" not in entry and "name" in entry and isinstance(entry["name"], str):
        entry["nameNorm"] = normalize_text(entry["name"])
    else:
        entry.setdefault("nameNorm", None)

    if "intensityClean" not in entry and "intensity" in entry and isinstance(entry["intensity"], str):
        entry["intensityClean"] = normalize_text(entry["intensity"])
    else:
        entry.setdefault("intensityClean", None)

    if "legalstatusClean" not in entry and "legalstatus" in entry and isinstance(entry["legalstatus"], str):
        entry["legalstatusClean"] = normalize_text(entry["legalstatus"])
    else:
        entry.setdefault("legalstatusClean", None)


def main() -> None:
    original_file = Path("original_herbs_enriched.json")
    new_file = Path("new_herbs_enriched.json")
    output_file = Path("final_herbs_enriched.json")

    original_data: List[Dict[str, Any]] = json.loads(original_file.read_text())
    new_data: List[Dict[str, Any]] = json.loads(new_file.read_text())

    schema_keys = set()
    for herb in original_data:
        schema_keys.update(herb.keys())

    missing_counts = {key: 0 for key in schema_keys}
    extra_counts = {key: 0 for key in ["nameNorm", "intensityClean", "legalstatusClean"]}

    for herb in new_data:
        for key in schema_keys:
            if key not in herb:
                herb[key] = None
                missing_counts[key] += 1

        derive_normalized_fields(herb)
        for k in extra_counts:
            if herb[k] is None:
                extra_counts[k] += 1

    output_file.write_text(json.dumps(new_data, ensure_ascii=False, indent=2))

    total = len(new_data)
    print(f"Processed {total} herb entries.")

    print("Missing keys filled:")
    for key, count in missing_counts.items():
        if count:
            print(f"  {key}: {count}")
    print("Missing normalized fields filled or set to null:")
    for key, count in extra_counts.items():
        if count:
            print(f"  {key}: {count}")


if __name__ == "__main__":
    main()
