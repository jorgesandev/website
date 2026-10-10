import { BallTracker, type VisionConfig } from "./tracker";
let tracker: BallTracker | null = null;
let generation = 0;
self.onmessage = (event: MessageEvent) => {
  const message = event.data;
  if (message.type === "configure") {
    generation = message.generation;
    tracker = new BallTracker(message.config as VisionConfig);
    self.postMessage({ type: "ready", generation });
  } else if (message.type === "reset") {
    tracker?.reset();
  } else if (
    message.type === "frame" &&
    tracker &&
    message.generation === generation
  ) {
    try {
      const result = tracker.process(
        new Uint8ClampedArray(message.pixels),
        message.width,
        message.height,
        message.time,
      );
      self.postMessage({ type: "result", result, generation });
    } catch {
      self.postMessage({ type: "error", generation });
    }
  }
};
