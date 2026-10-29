#!/usr/bin/env python3
"""Read-only listing of OperationalReports awaiting Oracle review."""
from __future__ import annotations
import argparse, csv
from pathlib import Path

def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("index", type=Path)
    args = ap.parse_args()
    with args.index.open(encoding="utf-8-sig", newline="") as f:
        rows = list(csv.DictReader(f))
    pending = [r for r in rows if r.get("oracle_status", "").upper() in {"PENDING", "IN_REVIEW"}]
    for r in pending:
        print(f"{r.get('or_id','')}\t{r.get('skill_name','')}\t{r.get('status','')}\t{r.get('oracle_status','')}\t{r.get('notes','')}")
    print(f"pending_count={len(pending)}")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
