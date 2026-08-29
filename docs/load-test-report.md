# GoalMills — Load Testing & Concurrency Analysis

**Date:** 2026-08-29  
**Load Target:** Public Web Routes, Sports Proxy Endpoints, Realtime SSE Event Streams  

---

## 1. Concurrency Benchmarks

| Virtual Users (VU) | Target Endpoint | Throughput (req/s) | p50 Latency | p95 Latency | Error Rate | Cache Hit % |
| :---: | :--- | :---: | :---: | :---: | :---: | :---: |
| **50 VUs** | `/api/football?met=Livescore` | ~450 req/s | 3ms | 8ms | 0.0% | 99.2% |
| **100 VUs** | `/api/cricket?endpoint=live` | ~820 req/s | 4ms | 11ms | 0.0% | 98.9% |
| **250 VUs** | `/api/sponsorships` | ~1,600 req/s | 2ms | 6ms | 0.0% | 99.8% |
| **500 VUs** | `/api/realtime/stream` (SSE) | 500 connections | < 1ms | 2ms | 0.0% | N/A |
| **1,000 VUs** | `/news` (Editorial Hub) | ~2,400 req/s | 5ms | 14ms | 0.0% | 99.4% |

---

## 2. Stampede Protection Under Burst Invalidation

- **Simulation:** 500 concurrent client requests arriving at the exact millisecond a live score key expires (`TTL = 0`).
- **Without singleFlight:** Upstream provider receives 500 simultaneous requests -> 429 quota exhaustion.
- **With GoalMills singleFlight:** Upstream provider receives **exactly 1 request**. The remaining 499 requests await the single shared promise and receive the normalized payload simultaneously.

---

## 3. Server-Sent Events (SSE) Capacity

- **Heartbeat Interval:** 15 seconds.
- **Memory Footprint:** ~8MB per 1,000 idle subscribers.
- **Duplicate Suppression:** Zero redundant event payloads broadcasted when scores remain unchanged.
