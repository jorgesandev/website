"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { validCorners, type Corners, type XY } from "./vision/geometry";
import type { Suggestion, VisionResult } from "./vision/tracker";
import styles from "./pingpong.module.css";

type Props = {
  active: boolean;
  epoch: string;
  onSuggestion: (suggestion: Suggestion) => void;
  onReady: (ready: boolean) => void;
  onCameraLost: () => void;
};
const cornerNames = [
  "cercana izquierda",
  "cercana derecha",
  "lejana derecha",
  "lejana izquierda",
];

export default function CameraPanel({
  active,
  epoch,
  onSuggestion,
  onReady,
  onCameraLost,
}: Props) {
  const video = useRef<HTMLVideoElement>(null);
  const videoSize = useRef("");
  const stream = useRef<MediaStream | null>(null);
  const objectUrl = useRef<string | null>(null);
  const request = useRef(0);
  const worker = useRef<Worker | null>(null);
  const callbacks = useRef({ onSuggestion, onReady, onCameraLost });
  const [source, setSource] = useState<"camera" | "file" | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [corners, setCorners] = useState<XY[]>([]);
  const [cursor, setCursor] = useState<XY>({ x: 0.5, y: 0.5 });
  const [aspect, setAspect] = useState(16 / 9);
  const [color, setColor] = useState<"white" | "orange">("white");
  const [sensitivity, setSensitivity] = useState(50);
  const [diameter, setDiameter] = useState(9);
  const [result, setResult] = useState<VisionResult | null>(null);
  const [cameraFps, setCameraFps] = useState(0);
  const [facing, setFacing] = useState<"environment" | "user">("environment");
  const [showSettings, setShowSettings] = useState(false);
  const [trackingError, setTrackingError] = useState("");
  const [generation, setGeneration] = useState(0);
  const calibrated = validCorners(corners);

  useEffect(() => {
    callbacks.current = { onSuggestion, onReady, onCameraLost };
  }, [onSuggestion, onReady, onCameraLost]);
  useEffect(() => {
    callbacks.current.onReady(!!source && calibrated && !trackingError);
  }, [source, calibrated, trackingError]);
  useEffect(() => {
    const rotate = () => {
      setCorners([]);
      setResult(null);
      callbacks.current.onReady(false);
      callbacks.current.onCameraLost();
    };
    window.addEventListener("orientationchange", rotate);
    window.screen.orientation?.addEventListener("change", rotate);
    return () => {
      window.removeEventListener("orientationchange", rotate);
      window.screen.orientation?.removeEventListener("change", rotate);
    };
  }, []);
  useEffect(
    () => () => {
      request.current++;
      stream.current?.getTracks().forEach((track) => track.stop());
      if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
    },
    [],
  );

  function releaseSource() {
    videoSize.current = "";
    stream.current?.getTracks().forEach((track) => track.stop());
    stream.current = null;
    if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
    objectUrl.current = null;
    setSource(null);
    setCorners([]);
    setResult(null);
  }
  async function openCamera(nextFacing = facing) {
    const id = ++request.current;
    releaseSource();
    setLoading(true);
    setError("");
    setTrackingError("");
    try {
      if (!navigator.mediaDevices?.getUserMedia) throw new Error("unsupported");
      const media = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: { ideal: nextFacing },
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 60 },
        },
      });
      if (id !== request.current) {
        media.getTracks().forEach((track) => track.stop());
        return;
      }
      stream.current = media;
      const track = media.getVideoTracks()[0];
      setCameraFps(Math.round(track.getSettings().frameRate ?? 0));
      track.onended = () => {
        setError("Se interrumpió la cámara. Vuelve a activarla.");
        setSource(null);
        callbacks.current.onCameraLost();
      };
      if (video.current) {
        video.current.srcObject = media;
        await video.current.play();
      }
      setFacing(nextFacing);
      setSource("camera");
      setGeneration((value) => value + 1);
    } catch (reason) {
      if (id !== request.current) return;
      stream.current?.getTracks().forEach((track) => track.stop());
      stream.current = null;
      const name = reason instanceof Error ? reason.name : "";
      setError(
        name === "NotAllowedError"
          ? "Permite el acceso a la cámara en el navegador, o juega con marcador manual."
          : "No pudimos abrir la cámara. Comprueba que esté disponible y abre este enlace en Safari o Chrome.",
      );
    } finally {
      if (id === request.current) setLoading(false);
    }
  }
  function openFile(file?: File) {
    if (!file) return;
    request.current++;
    releaseSource();
    setError("");
    setTrackingError("");
    setLoading(false);
    objectUrl.current = URL.createObjectURL(file);
    if (video.current) {
      video.current.srcObject = null;
      video.current.src = objectUrl.current;
    }
    setSource("file");
    setCameraFps(0);
    setGeneration((value) => value + 1);
  }
  function metadata() {
    const element = video.current;
    if (!element?.videoWidth || !element.videoHeight) return;
    const size = `${element.videoWidth}:${element.videoHeight}`;
    if (videoSize.current && videoSize.current !== size) {
      setCorners([]);
      setResult(null);
      callbacks.current.onReady(false);
      callbacks.current.onCameraLost();
    }
    videoSize.current = size;
    setAspect(element.videoWidth / element.videoHeight);
  }

  useEffect(() => {
    if (!source || !calibrated) return;
    const instance = new Worker("/pingpong/vision.worker.js");
    worker.current = instance;
    let raf = 0,
      busy = false,
      lastTime = -1,
      lastUi = 0,
      sentId = "";
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d", { willReadFrequently: true });
    let disposed = false;
    let watchdog: ReturnType<typeof setTimeout> | undefined;
    instance.onerror = () => {
      setTrackingError(
        "El seguimiento no pudo iniciarse. Recarga la página o usa el marcador manual.",
      );
      callbacks.current.onCameraLost();
    };
    instance.onmessage = (event: MessageEvent) => {
      if (disposed || event.data.generation !== generation) return;
      if (event.data.type === "ready") {
        busy = false;
        return;
      }
      busy = false;
      clearTimeout(watchdog);
      if (event.data.type === "error") {
        setTrackingError("Se interrumpió el seguimiento. Reinicia la cámara.");
        callbacks.current.onCameraLost();
        return;
      }
      const next = event.data.result as VisionResult;
      if (performance.now() - lastUi > 80 || next.suggestion) {
        setResult(next);
        lastUi = performance.now();
      }
      if (next.motion > 0.45 && active) {
        callbacks.current.onCameraLost();
        setCorners([]);
        setError(
          "La cámara se movió o cambió mucho la escena. Marca las esquinas de nuevo.",
        );
      }
      if (active && next.suggestion && next.suggestion.id !== sentId) {
        sentId = next.suggestion.id;
        callbacks.current.onSuggestion({
          ...next.suggestion,
          id: `${generation}:${next.suggestion.id}`,
        });
      }
    };
    instance.postMessage({
      type: "configure",
      generation,
      config: { corners: corners as Corners, color, sensitivity, diameter },
    });
    function tick() {
      const element = video.current;
      if (
        !disposed &&
        !busy &&
        context &&
        element &&
        element.readyState >= 2 &&
        element.currentTime !== lastTime
      ) {
        lastTime = element.currentTime;
        canvas.width = 480;
        canvas.height = Math.round(
          480 / (element.videoWidth / element.videoHeight || aspect),
        );
        context.drawImage(element, 0, 0, canvas.width, canvas.height);
        const image = context.getImageData(0, 0, canvas.width, canvas.height);
        busy = true;
        instance.postMessage(
          {
            type: "frame",
            generation,
            pixels: image.data.buffer,
            width: canvas.width,
            height: canvas.height,
            time: element.currentTime * 1000,
          },
          [image.data.buffer],
        );
        watchdog = setTimeout(() => {
          if (!disposed) {
            setTrackingError(
              "El teléfono dejó de responder al seguimiento. Prueba el modo manual.",
            );
            callbacks.current.onCameraLost();
            instance.terminate();
          }
        }, 5000);
      }
      if (!disposed) raf = requestAnimationFrame(tick);
    }
    // Calibration previews track the ball but never score.
    raf = requestAnimationFrame(tick);
    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      clearTimeout(watchdog);
      instance.terminate();
      worker.current = null;
    };
  }, [
    source,
    calibrated,
    corners,
    color,
    sensitivity,
    diameter,
    aspect,
    generation,
    active,
    epoch,
  ]);

  useEffect(() => {
    const element = video.current;
    if (source === "file" && element) {
      if (active)
        void element
          .play()
          .catch(() => setError("Pulsa reproducir para analizar el video."));
      else element.pause();
    }
    worker.current?.postMessage({ type: "reset" });
  }, [active, source]);

  return (
    <section className={styles.cameraPanel} aria-label="Cámara y seguimiento">
      <div className={styles.panelHead}>
        <span className={styles.kicker}>02 / Cámara</span>
        <span className={styles.localBadge}>● Solo en tu teléfono</span>
      </div>
      <div
        className={styles.videoFrame}
        style={
          { aspectRatio: aspect, "--camera-aspect": aspect } as CSSProperties
        }
      >
        <video
          ref={video}
          playsInline
          muted
          onLoadedMetadata={metadata}
          onResize={metadata}
          onEnded={() => {
            callbacks.current.onCameraLost();
            setError("Terminó el video. Revisa el marcador.");
          }}
          onError={() => {
            setError("No pudimos leer este video. Prueba un archivo MP4.");
            callbacks.current.onCameraLost();
          }}
          controls={source === "file" && !active}
        />
        {source ? (
          <svg
            className={styles.cameraOverlay}
            viewBox="0 0 1000 1000"
            preserveAspectRatio="none"
            style={{ pointerEvents: corners.length >= 4 ? "none" : "auto" }}
            role="img"
            aria-label="Vista de calibración de la mesa"
            aria-describedby="calibration-help"
            tabIndex={corners.length < 4 && !active ? 0 : -1}
            onKeyDown={(event) => {
              if (active || corners.length >= 4) return;
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                setCorners([...corners, cursor]);
              }
              if (event.key.startsWith("Arrow")) {
                event.preventDefault();
                const step = event.shiftKey ? 0.005 : 0.02;
                setCursor((p) => ({
                  x: Math.max(
                    0,
                    Math.min(
                      1,
                      p.x +
                        (event.key === "ArrowRight"
                          ? step
                          : event.key === "ArrowLeft"
                            ? -step
                            : 0),
                    ),
                  ),
                  y: Math.max(
                    0,
                    Math.min(
                      1,
                      p.y +
                        (event.key === "ArrowDown"
                          ? step
                          : event.key === "ArrowUp"
                            ? -step
                            : 0),
                    ),
                  ),
                }));
              }
            }}
            onClick={(event) => {
              if (active || corners.length >= 4) return;
              const bounds = event.currentTarget.getBoundingClientRect();
              setCorners([
                ...corners,
                {
                  x: (event.clientX - bounds.left) / bounds.width,
                  y: (event.clientY - bounds.top) / bounds.height,
                },
              ]);
            }}
          >
            {corners.length < 4 ? (
              <g stroke="#ffffff" strokeWidth="2">
                <line
                  x1={cursor.x * 1000 - 14}
                  y1={cursor.y * 1000}
                  x2={cursor.x * 1000 + 14}
                  y2={cursor.y * 1000}
                />
                <line
                  x1={cursor.x * 1000}
                  y1={cursor.y * 1000 - 14}
                  x2={cursor.x * 1000}
                  y2={cursor.y * 1000 + 14}
                />
              </g>
            ) : null}
            {corners.length > 1 ? (
              <polyline
                points={corners
                  .map((p) => `${p.x * 1000},${p.y * 1000}`)
                  .join(" ")}
                fill="none"
                stroke="#d9f95f"
                strokeWidth="3"
              />
            ) : null}
            {calibrated ? (
              <>
                <polygon
                  points={corners
                    .map((p) => `${p.x * 1000},${p.y * 1000}`)
                    .join(" ")}
                  fill="#d9f95f12"
                  stroke="#d9f95f"
                  strokeWidth="3"
                />
                <line
                  x1={(corners[0].x + corners[3].x) * 500}
                  y1={(corners[0].y + corners[3].y) * 500}
                  x2={(corners[1].x + corners[2].x) * 500}
                  y2={(corners[1].y + corners[2].y) * 500}
                  stroke="#ffffff"
                  strokeWidth="2"
                  strokeDasharray="8 8"
                />
              </>
            ) : null}
            {corners.map((p, i) => (
              <g key={i}>
                <circle cx={p.x * 1000} cy={p.y * 1000} r="12" fill="#d9f95f" />
                <text
                  x={p.x * 1000 + 20}
                  y={p.y * 1000 - 15}
                  fill="#d9f95f"
                  fontSize="34"
                >
                  {i + 1}
                </text>
              </g>
            ))}
            {result?.trail.length ? (
              <polyline
                points={result.trail
                  .map((p) => `${p.x * 1000},${p.y * 1000}`)
                  .join(" ")}
                fill="none"
                stroke="#66d9ef"
                strokeWidth="3"
              />
            ) : null}
            {result?.ball ? (
              <circle
                cx={result.ball.x * 1000}
                cy={result.ball.y * 1000}
                r="14"
                fill="none"
                stroke="#d9f95f"
                strokeWidth="4"
              />
            ) : null}
          </svg>
        ) : (
          <div className={styles.cameraPlaceholder}>
            <svg viewBox="0 0 64 64" aria-hidden="true">
              <rect x="6" y="14" width="38" height="36" rx="7" />
              <path d="m44 25 14-8v30l-14-8" />
              <circle cx="25" cy="32" r="9" />
            </svg>
            <strong>La mesa, en cuadro.</strong>
            <span>Activa la cámara para seguir la pelota.</span>
          </div>
        )}
      </div>
      <div className={styles.cameraBody}>
        {source ? (
          <>
            <div className={styles.cameraStatus}>
              <span className={result?.ball ? styles.statusOn : ""}>
                ●{" "}
                {active
                  ? result?.phase === "tracking"
                    ? "Pelota en juego"
                    : "Esperando saque"
                  : "Vista previa"}
              </span>
              <span>
                {cameraFps ? `${cameraFps} fps cámara · ` : ""}
                {Math.round(result?.fps ?? 0)} fps análisis
              </span>
            </div>
            {!calibrated ? (
              <p id="calibration-help" className={styles.instructions}>
                {corners.length < 4 ? (
                  <>
                    Toca la esquina{" "}
                    <strong>{cornerNames[corners.length]}</strong> de la mesa.{" "}
                    {corners.length + 1}/4. También puedes usar flechas y Enter.
                  </>
                ) : (
                  "Las esquinas deben formar un rectángulo en perspectiva, sin cruzarse. Vuelve a marcarlas."
                )}
              </p>
            ) : (
              <p id="calibration-help" className={styles.instructions}>
                Mesa calibrada.{" "}
                {active
                  ? "El conteo experimental está activo."
                  : "Comprueba la trayectoria y pulsa Reanudar."}
              </p>
            )}
            <div className={styles.buttonRow}>
              <button
                className={styles.smallButton}
                disabled={active}
                onClick={() => {
                  setCorners([]);
                  setResult(null);
                }}
              >
                Recalibrar
              </button>
              <button
                className={styles.smallButton}
                disabled={active || loading}
                onClick={() =>
                  void openCamera(
                    facing === "environment" ? "user" : "environment",
                  )
                }
              >
                Cambiar cámara
              </button>
              <button
                className={styles.smallButton}
                disabled={active}
                onClick={() => setShowSettings(!showSettings)}
              >
                Ajustar detección
              </button>
            </div>
            {showSettings ? (
              <div className={styles.detectorSettings}>
                <label>
                  Pelota
                  <select
                    value={color}
                    disabled={active}
                    onChange={(event) =>
                      setColor(event.target.value as "white" | "orange")
                    }
                  >
                    <option value="white">Blanca</option>
                    <option value="orange">Naranja</option>
                  </select>
                </label>
                <label>
                  Sensibilidad: {sensitivity}
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={sensitivity}
                    disabled={active}
                    onChange={(event) =>
                      setSensitivity(Number(event.target.value))
                    }
                  />
                </label>
                <label>
                  Tamaño máximo: {diameter} px
                  <input
                    type="range"
                    min="3"
                    max="18"
                    value={diameter}
                    disabled={active}
                    onChange={(event) =>
                      setDiameter(Number(event.target.value))
                    }
                  />
                </label>
              </div>
            ) : null}
          </>
        ) : (
          <>
            <p className={styles.instructions}>
              Teléfono horizontal, fijo y elevado a un costado. Deben verse los
              dos extremos y la red. Usa buena luz y una sola pelota.
            </p>
            <button
              className={styles.primary}
              disabled={loading}
              onClick={() => void openCamera()}
            >
              {loading ? "Abriendo cámara…" : "Activar cámara"}
              <span aria-hidden="true">↗</span>
            </button>
          </>
        )}
        {error || trackingError ? (
          <p role="alert" className={styles.error}>
            {error || trackingError}
          </p>
        ) : null}
        {!active ? (
          <label className={styles.fileLabel}>
            O probar con un video
            <input
              type="file"
              accept="video/*"
              onChange={(event) => {
                openFile(event.target.files?.[0]);
                event.target.value = "";
              }}
            />
          </label>
        ) : null}
        <p className={styles.finePrint}>
          Visión experimental por color y movimiento. Los puntos dudosos
          necesitan confirmación; los roces de red y borde pueden pasar
          inadvertidos.
        </p>
      </div>
    </section>
  );
}
