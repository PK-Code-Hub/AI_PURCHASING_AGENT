#!/usr/bin/env python3
"""
AegisProcure AI — Evaluation Benchmark Suite Runner
Evaluates AI Purchasing Agent decisions across 8 comprehensive operational benchmarks.
"""
import sys
import time
from backend.evaluator import EvaluationBenchmarkSuite

def main():
    print("=" * 80)
    print("  AEGISPROCURE AI — AUTONOMOUS PURCHASING AGENT EVALUATION SUITE")
    print("  Enterprise Retail & Quick-Commerce Multi-Factor Benchmark")
    print("=" * 80)
    print()

    evaluator = EvaluationBenchmarkSuite()
    print("Running automated benchmarks against ReAct core and constraint engine...\n")
    
    results = evaluator.run_all_benchmarks()
    
    passed_count = 0
    total_count = len(results)

    for r in results:
        status_tag = "[PASS]" if r.passed else "[FAIL]"
        print(f" {status_tag} {r.id}: {r.name}")
        print(f"        Scenario Category: {r.scenario_type}")
        print(f"        Score: {r.score:.1f}/100.0 | Latency: {r.latency_ms:.1f}ms")
        print(f"        Audit: {r.execution_summary}")
        for log_line in r.audit_log:
            print(f"          - {log_line}")
        print("-" * 80)
        if r.passed:
            passed_count += 1

    pass_rate = (passed_count / total_count) * 100
    print("\n" + "=" * 80)
    print(f"  BENCHMARK SUMMARY: {passed_count}/{total_count} PASSED ({pass_rate:.1f}%)")
    print("  Criteria Audited: Decision Accuracy, Storage/Budget Constraints,")
    print("                    Information Completeness, Closed-Loop Invariant Validation")
    print("=" * 80 + "\n")

    if passed_count == total_count:
        sys.exit(0)
    else:
        sys.exit(1)

if __name__ == "__main__":
    main()
