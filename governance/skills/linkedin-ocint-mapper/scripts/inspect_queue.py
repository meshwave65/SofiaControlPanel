#!/usr/bin/env python3
"""List active locks and the first eligible contact in a network repository."""
from __future__ import annotations
import argparse, csv, glob, json, os
from pathlib import Path

def read_csv(path: Path):
    with path.open(encoding="utf-8-sig", newline="") as f:
        return list(csv.DictReader(f))

def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("repo", type=Path)
    ap.add_argument("--start-id", default="")
    ap.add_argument("--queue", default="network_master.csv")
    ap.add_argument("--index", default="contacts/INDEX.csv")
    args = ap.parse_args()
    root = args.repo.resolve()
    queue = read_csv(root / args.queue)
    index_rows = read_csv(root / args.index)
    index = {r.get("master_id", ""): r for r in index_rows}
    locks = {}
    for owner in glob.glob(str(root / "contacts" / "*" / ".processing.lock" / "owner.json")):
        p = Path(owner)
        try:
            data = json.loads(p.read_text(encoding="utf-8"))
        except Exception as exc:
            data = {"error": str(exc)}
        locks[data.get("master_id", p.parts[-4])] = str(p)
    print("active_locks:", ", ".join(sorted(locks)) or "<none>")
    for row in queue:
        mid = row.get("master_id", "")
        if args.start_id and mid < args.start_id:
            continue
        if mid in locks:
            print(f"locked_skip: {mid} — {row.get('name','')}")
            continue
        status = index.get(mid, {}).get("reconciliation_status", "<not-in-index>")
        if status in {"DONE", "REVIEW_REQUIRED"}:
            print(f"processed_skip: {mid} — {row.get('name','')} [{status}]")
            continue
        print("NEXT_AVAILABLE:", json.dumps(row, ensure_ascii=False))
        return 0
    print("NEXT_AVAILABLE: <none>")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
