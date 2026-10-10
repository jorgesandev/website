# PingPong

Live route: <https://jorgesandoval.dev/pingpong>. Integrated into the existing Next.js website and its Vercel deployment.

## What ships

- Spanish mobile interface, manual/assisted/experimental automatic modes.
- Singles games to 11, win by two, best of 1/3/5; correct serve rotation and side changes.
- Rear-camera capture, four-corner calibration, orange/white ball settings, live trail and actual processing fps.
- Entire vision pipeline in a dedicated, same-origin Web Worker. No video upload, microphone, account or paid inference service.
- Manual confirmation when a tracked rally disappears; possible double-bounce proposals. Experimental automatic mode can accept those proposals, with an explicit accuracy caveat.
- Undo, correct previous point, repeat/let, pause, interrupted matches, rematches and results sharing.
- IndexedDB history, validated JSON import/export, speech announcements, optional Wake Lock and scoped installable PWA with offline fallback page.

## Camera setup

Use a fixed, elevated, diagonal side view, enough light, one visible ball, and no moving camera. Select the four corners in order: near-left, near-right, far-right, far-left. Set the player at the near end during match setup. The overlay marks the estimated halfway line; it is a planar guide, not a reconstruction of the physical net or airborne ball.

After calibration, check the trail and press Reanudar. If the detector follows clothing or reflections, adjust color, sensitivity and expected size. Try better placement before increasing sensitivity. Keep the page visible. The app pauses when hidden; it cannot see play while the screen is locked.

## Vision implementation and limits

The implementation uses original, lightweight TypeScript computer vision rather than distributing unverified pretrained weights: two temporal differences, white/orange pixel gating, connected components, projective ROI filtering, motion prediction and candidate ambiguity rejection. A projected plane and image trajectory reversals generate bounce candidates. A broad scene change invalidates calibration; long frame gaps invalidate the track.

A bright ball against a pale background, rapid blur, occlusion or moving white clothing can defeat this detector. Image reversals do not prove a 3D bounce. Only two compatible reversals on the same side after observed crossings can yield a possible double-bounce winner; the automatic mode is explicitly experimental. Losing the ball alone never determines a winner. A detected rally disappearing can request human confirmation. Legal serve, net lets, edges, unseen hits and all possible outcomes are not fully adjudicated.

No measured real-game precision or coverage is claimed. The original plan's 98% precision / 80% coverage target is **not validated or achieved by the available tests**. Completing robust, general automatic scoring remains dependent on labelled real footage and device evaluation, potentially a licensed temporal model. This release is a usable scorer with real local visual tracking and limited experimental automation, not a validated autonomous referee.

Research reference: [TTNet](https://arxiv.org/abs/2004.09927). It describes specialized temporal vision with 120-fps data and desktop GPU timing; those results are not this app's results. No TTNet, BlurBall or OpenTTR code or weights are incorporated.

## Development

Use the root website toolchain, Bun 1.3.14+ and compatible Node (CI 22.18.0). `bun install --frozen-lockfile` then `bun run dev`. Build the standalone worker with `bun run build:vision`; `dev` and `build` do this automatically. The worker's generated JS is ignored by lint/format.

Checks:

```sh
bun run format:check
bun run lint
bun run typecheck
bun run test
bun run build
bunx playwright install chromium webkit
bun run test:e2e
```

Playwright runs desktop, portrait and two landscape phone sizes in Chromium, plus landscape camera/rotation/dialog checks in WebKit, against a production build. In landscape, camera and score share the screen, pause/resume stays above both panels, and secondary controls scroll inside each panel. Rotation or video dimension changes pause the match and clear calibration without clearing points. For a deployed build, set `PINGPONG_TEST_URL` to the deployment origin. Synthetic camera streams exercise capture, calibration and worker transport; they do not validate physical game accuracy. Unit tests use Node's existing test runner to avoid a second testing framework.

## PWA and privacy

`public/pingpong/sw.js` has scope `/pingpong`, permitted by a narrowly scoped response header. It never caches portfolio pages, RSC navigation responses or worker JS. New installations cache only the manifest, icons and fallback page; an offline reload intentionally displays a reconnect message rather than relying on a stale Next build. An already-open match continues without network access. IndexedDB stays local and can be unavailable/evicted in private or restricted browsers; users can export results.

Heavy camera modules are dynamically loaded only on camera matches. No OpenCV/ONNX binary or model is loaded. Existing portfolio dependencies and deployment are retained. The route declares its own metadata and manifest; Navbar hides itself only under `/pingpong`.

## Deploy / rollback

Changes to the production branch use the existing Vercel Git integration. Verify CI and the Vercel deployment status, then verify `/pingpong`, worker MIME, manifest, icons and `Service-Worker-Allowed`. Revert the integration commit and redeploy for rollback. `vercel.json` explicitly builds the vision worker before Next. Changing the PWA shell requires bumping its cache version and avoiding immediate activation in an active match.
