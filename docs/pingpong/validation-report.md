# Validation report — 2026-10-10

## Status

Local production validation passed:

- Formatting and ESLint: passed.
- TypeScript and production build: passed.
- Node tests: 18 passed (16 PingPong + 2 existing portfolio tests).
- Playwright: 14 passed across desktop and mobile-size Chromium, including real worker transport and synthetic automatic proposal/correction.
- Visual inspection: desktop landing and mobile landing/scoreboard screenshots; no horizontal overflow in viewport checks.

Deployment SHA and production status are recorded in the GitHub PR/deployment history. These results do not establish real-game precision.

## Coverage

Core: service rotation, deuce, win by two, set transitions, deciding-set side switch, stopping completed matches, duplicate rally prevention, undo/correction across set boundaries, interrupted matches, import validation and calibration geometry.

Vision: moving white/orange pixels, rejecting static bright pixels, requiring confirmation after a missing ball, and invalidating evidence after capture gaps. These are synthetic inputs, not filmed games.

Browser: complete manual game, service, undo, correction, persist/reload, result and rematch; camera denial/manual fallback; synthetic camera capture/calibration/worker trail; help dialog keyboard handling and mobile layout; portfolio and privacy smoke checks.

## Required physical evaluation

- Actual iPhone/Safari and Android/Chrome camera permissions, orientation and calibrated view.
- Labelled retained matches, including net, edges, blur, occlusions, serve, false detections and double bounces.
- Automatic assignment precision **and** coverage, omissions/duplicates, latency p95.
- 30-minute session for stability, fps degradation, memory and battery observation.

None of these physical checks has been performed remotely. No physical-game accuracy, continuous 30-minute stability or guaranteed mobile-browser compatibility is claimed.
