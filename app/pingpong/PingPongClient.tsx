"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  addPoint,
  correctPoint,
  isMatch,
  other,
  resultText,
  scoreMatch,
  undoPoint,
  type Match,
  type Mode,
  type Player,
} from "./core/match";
import { loadMatches, saveMatch } from "./core/storage";
import type { Suggestion } from "./vision/tracker";
import styles from "./pingpong.module.css";

const CameraPanel = dynamic(() => import("./CameraPanel"), {
  ssr: false,
  loading: () => (
    <div className={styles.cameraPanel}>
      <p className={styles.instructions}>Preparando cámara…</p>
    </div>
  ),
});
type Screen = "home" | "setup" | "match" | "history";

function TableArt() {
  return (
    <svg
      className={styles.tableArt}
      viewBox="0 0 620 470"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="m73 161 355-75 140 219-362 89Z"
        fill="#17282c"
        stroke="#9aa9a5"
        strokeWidth="2"
      />
      <path
        d="m86 169 337-70 127 199-342 82Z"
        stroke="#eaf0da"
        strokeWidth="2"
      />
      <path
        d="m256 135 137 204M152 272l344-81"
        stroke="#eaf0da"
        strokeWidth="2"
      />
      <path
        d="m151 272-2-37 342-76 5 32"
        fill="#d9f95f12"
        stroke="#d9f95f"
        strokeWidth="2"
      />
      <path
        d="m164 233 2 35m19-40 2 35m19-40 2 35m19-40 2 35m19-40 2 35m19-40 2 35m19-40 2 35m19-40 2 35m19-40 2 35m19-40 2 35m19-40 2 35m19-40 2 35m19-40 2 35m19-40 2 35m19-40 2 35"
        stroke="#d9f95f"
        opacity=".3"
      />
      <path
        d="m84 175 5 75m118 145 2 40m347-126-6 48m-119-268 6 37"
        stroke="#667777"
        strokeWidth="5"
      />
      <path
        d="M349 98c-27-54-54-29-68 40s-6 97-56 130"
        stroke="#d9f95f"
        strokeDasharray="4 7"
        strokeWidth="2"
      />
      <circle cx="349" cy="98" r="12" fill="#d9f95f" />
      <circle cx="349" cy="98" r="26" stroke="#d9f95f" opacity=".3" />
      <path
        d="m53 139-19 4 4 20m533 154 20-4-4-20M420 60l17-4 6 17m-244 338-18 4-4-17"
        stroke="#66d9ef"
        strokeWidth="2"
      />
      <text x="25" y="436" fill="#95aba8" fontSize="11" letterSpacing="3">
        LOCAL VISION / TABLE 01
      </text>
    </svg>
  );
}
function download(value: unknown) {
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(value, null, 2)], { type: "application/json" }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = "pingpong-historial.json";
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function PingPongClient() {
  const [screen, setScreen] = useState<Screen>("home");
  const [match, setMatch] = useState<Match | null>(null);
  const [history, setHistory] = useState<Match[]>([]);
  const [paused, setPaused] = useState(false);
  const [ready, setReady] = useState(false);
  const [pending, setPending] = useState<Suggestion | null>(null);
  const [sideChange, setSideChange] = useState(false);
  const [finishDialog, setFinishDialog] = useState(false);
  const [help, setHelp] = useState(false);
  const [sound, setSound] = useState(true);
  const [wake, setWake] = useState(true);
  const [message, setMessage] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [visionReset, setVisionReset] = useState(0);
  const [storageError, setStorageError] = useState(false);
  const [update, setUpdate] = useState<ServiceWorkerRegistration | null>(null);
  const writeQueue = useRef(Promise.resolve());
  const activeMatch = useRef(match);
  const dialog = useRef<HTMLDivElement>(null);
  const current = match ? scoreMatch(match) : null;
  const completed =
    !!match?.finished ||
    (current?.winner !== null && current?.winner !== undefined);
  const inPlay =
    screen === "match" &&
    !paused &&
    !pending &&
    !sideChange &&
    !finishDialog &&
    !completed;
  const resumable = history.find(
    (item) => !item.finished && scoreMatch(item).winner === null,
  );

  useEffect(() => {
    activeMatch.current = match;
  }, [match]);
  useEffect(() => {
    let cancelled = false;
    loadMatches()
      .then((items) => {
        if (!cancelled) {
          setHistory(items);
          setLoaded(true);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setLoaded(true);
          setStorageError(true);
        }
      });
    let remembered: string | null = null;
    try {
      remembered = localStorage.getItem("pingpong-settings");
    } catch {
      /* Optional settings storage. */
    }
    if (remembered) {
      try {
        const parsed = JSON.parse(remembered);
        queueMicrotask(() => {
          if (!cancelled) {
            setSound(parsed.sound !== false);
            setWake(parsed.wake !== false);
          }
        });
      } catch {
        /* Defaults survive invalid settings. */
      }
    }
    return () => {
      cancelled = true;
    };
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem(
        "pingpong-settings",
        JSON.stringify({ sound, wake }),
      );
    } catch {
      /* Settings remain in memory. */
    }
  }, [sound, wake]);
  useEffect(() => {
    if (!match || !loaded) return;
    const snapshot = match;
    writeQueue.current = writeQueue.current
      .then(() => saveMatch(snapshot))
      .catch(() => setStorageError(true));
  }, [match, loaded]);
  useEffect(() => {
    const visibility = () => {
      if (document.hidden) {
        setPaused(true);
        setPending(null);
        if ("speechSynthesis" in window) speechSynthesis.cancel();
      }
    };
    document.addEventListener("visibilitychange", visibility);
    const rotate = () => {
      if (activeMatch.current?.mode !== "manual") {
        setPaused(true);
        setReady(false);
        setMessage(
          "La orientación cambió. Recalibra la cámara antes de continuar.",
        );
      }
    };
    window.addEventListener("orientationchange", rotate);
    return () => {
      document.removeEventListener("visibilitychange", visibility);
      window.removeEventListener("orientationchange", rotate);
    };
  }, []);
  useEffect(() => {
    if (!inPlay || !wake || !("wakeLock" in navigator)) return;
    let cancelled = false;
    let lock: WakeLockSentinel | null = null;
    navigator.wakeLock
      .request("screen")
      .then((value) => {
        if (cancelled) void value.release();
        else lock = value;
      })
      .catch(() => {
        /* Optional browser capability. */
      });
    return () => {
      cancelled = true;
      if (lock) void lock.release();
    };
  }, [inPlay, wake]);
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    let disposed = false;
    navigator.serviceWorker
      .register("/pingpong/sw.js", { scope: "/pingpong" })
      .then((registration) => {
        if (!disposed && registration.waiting) setUpdate(registration);
        registration.addEventListener("updatefound", () => {
          registration.installing?.addEventListener("statechange", () => {
            if (
              !disposed &&
              registration.waiting &&
              navigator.serviceWorker.controller
            )
              setUpdate(registration);
          });
        });
      })
      .catch(() => {
        /* The web app works without installation support. */
      });
    return () => {
      disposed = true;
    };
  }, []);
  useEffect(() => {
    if (!help && !pending && !sideChange && !finishDialog) return;
    const previous = document.activeElement as HTMLElement | null;
    const node = dialog.current;
    node?.focus();
    const trap = (event: KeyboardEvent) => {
      if (event.key === "Escape" && help) {
        setHelp(false);
        return;
      }
      if (event.key !== "Tab" || !node) return;
      const items = [
        ...node.querySelectorAll<HTMLElement>(
          'button:not(:disabled), a[href], input, select, [tabindex="0"]',
        ),
      ];
      const first = items[0],
        last = items[items.length - 1];
      if (!first) {
        event.preventDefault();
        return;
      }
      if (
        event.shiftKey &&
        (document.activeElement === first || document.activeElement === node)
      ) {
        event.preventDefault();
        last.focus();
      } else if (
        !event.shiftKey &&
        (document.activeElement === last || document.activeElement === node)
      ) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", trap);
    return () => {
      document.removeEventListener("keydown", trap);
      previous?.focus();
    };
  }, [help, pending, sideChange, finishDialog]);

  function announce(text: string) {
    if (!sound || !("speechSynthesis" in window)) return;
    speechSynthesis.cancel();
    const voice = new SpeechSynthesisUtterance(text);
    voice.lang = "es-MX";
    voice.rate = 1;
    speechSynthesis.speak(voice);
  }
  function recordPoint(
    winner: Player,
    source: "manual" | "camera" = "manual",
    rallyId = crypto.randomUUID(),
  ) {
    if (!match || !current || completed || sideChange) return;
    const next = addPoint(match, {
      id: crypto.randomUUID(),
      rallyId,
      winner,
      source,
      at: Date.now(),
    });
    if (next === match) return;
    const nextScore = scoreMatch(next);
    setMatch(next);
    setPending(null);
    if (nextScore.winner !== null) {
      announce(`Ganó ${next.players[nextScore.winner]}.`);
      setPaused(true);
    } else {
      if (current.sideKey !== nextScore.sideKey) {
        setSideChange(true);
        setPaused(true);
      }
      announce(
        `Punto para ${next.players[winner]}. ${nextScore.points[0]} a ${nextScore.points[1]}.`,
      );
    }
  }
  const suggestionHandler = useRef<(value: Suggestion) => void>(() => {});
  useEffect(() => {
    suggestionHandler.current = (value) => {
      if (!match || !current || !inPlay) return;
      if (
        value.strong &&
        value.loserSide !== null &&
        match.mode === "automatic"
      ) {
        const loser =
          value.loserSide === 0 ? current.near : other(current.near);
        recordPoint(other(loser), "camera", value.id);
        setMessage(
          "Punto experimental por posible doble bote. Puedes corregirlo.",
        );
      } else {
        setPending(value);
      }
    };
  });
  const onSuggestion = useCallback(
    (value: Suggestion) => suggestionHandler.current(value),
    [],
  );
  const onReady = useCallback((value: boolean) => setReady(value), []);
  const onCameraLost = useCallback(() => {
    setPaused(true);
    setReady(false);
    setPending(null);
  }, []);
  function createMatch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const next: Match = {
      version: 1,
      id: crypto.randomUUID(),
      players: [
        String(data.get("p1") || "Jugador 1").trim() || "Jugador 1",
        String(data.get("p2") || "Jugador 2").trim() || "Jugador 2",
      ],
      bestOf: Number(data.get("bestOf")) as 1 | 3 | 5,
      firstServer: Number(data.get("server")) as Player,
      initialNear: Number(data.get("near")) as Player,
      mode: String(data.get("mode")) as Mode,
      points: [],
      created: Date.now(),
    };
    setMatch(next);
    setPaused(next.mode !== "manual");
    setReady(false);
    setPending(null);
    setSideChange(false);
    setMessage("");
    setScreen("match");
    setHistory((items) => [next, ...items]);
  }
  async function goHome() {
    setPaused(true);
    setPending(null);
    setSideChange(false);
    setFinishDialog(false);
    setScreen("home");
    if (match)
      setHistory((items) => [
        match,
        ...items.filter((item) => item.id !== match.id),
      ]);
  }
  async function share() {
    if (!match) return;
    const text = resultText(match);
    try {
      if (navigator.share) await navigator.share({ text });
      else {
        await navigator.clipboard.writeText(text);
        setMessage("Resultado copiado.");
      }
    } catch {
      setMessage("Puedes exportar el partido para guardarlo.");
    }
  }
  async function importHistory(file?: File) {
    if (!file) return;
    if (file.size > 5_000_000) {
      setMessage("El archivo es demasiado grande.");
      return;
    }
    try {
      const input = JSON.parse(await file.text());
      const values: unknown[] = Array.isArray(input) ? input : [input];
      if (values.length > 1000 || !values.every(isMatch))
        throw new Error("Invalid");
      await writeQueue.current;
      for (const item of values as Match[]) await saveMatch(item);
      setHistory(await loadMatches());
      setMessage("Historial importado.");
    } catch {
      setMessage(
        "No pudimos importar ese archivo. Usa una exportación de PingPong válida.",
      );
    }
  }
  const modalOpen = help || !!pending || sideChange || finishDialog;

  return (
    <main id="main" lang="es" className={styles.app}>
      <div className={styles.container} inert={modalOpen ? true : undefined}>
        <header className={styles.header}>
          <button
            className={styles.brand}
            onClick={() => void goHome()}
            aria-label="PingPong, inicio"
          >
            <span className={styles.brandMark} aria-hidden="true">
              ↗
            </span>
            ping<span>pong</span>
            <sup>01</sup>
          </button>
          <div className={styles.headerRight}>
            <span className={styles.headerCaption}>
              JUEGO LOCAL / SIN CUENTAS
            </span>
            <button
              className={styles.iconButton}
              onClick={() => {
                setHelp(true);
                if (match) setPaused(true);
              }}
              aria-label="Cómo funciona"
            >
              ?
            </button>
          </div>
        </header>
        {screen === "home" ? (
          <>
            <section className={styles.hero}>
              <div className={styles.heroCopy}>
                <p className={styles.kicker}>
                  Un teléfono. Una mesa. Otro set.
                </p>
                <h1>
                  Jueguen.
                  <br />
                  El marcador
                  <br />
                  <em>va aquí.</em>
                </h1>
                <p className={styles.heroDescription}>
                  Puntos, sets y servicio. Coloca tu teléfono frente a la mesa y
                  deja que la cámara siga la pelota.
                </p>
                <div className={styles.heroActions}>
                  <button
                    className={styles.primary}
                    onClick={() => setScreen("setup")}
                  >
                    Nuevo partido <span aria-hidden="true">↗</span>
                  </button>
                  {resumable ? (
                    <button
                      className={styles.secondary}
                      onClick={() => {
                        setMatch(resumable);
                        setPaused(true);
                        setReady(false);
                        setScreen("match");
                      }}
                    >
                      Continuar partido
                    </button>
                  ) : null}
                </div>
                <button
                  className={styles.textButton}
                  onClick={() => setScreen("history")}
                >
                  Ver historial <span aria-hidden="true">→</span>
                </button>
              </div>
              <div className={styles.heroVisual}>
                <span className={styles.visualTag}>
                  CAM / VISIÓN EXPERIMENTAL
                </span>
                <TableArt />
                <div className={styles.sampleScore} aria-hidden="true">
                  <span>LOCAL</span>
                  <strong>
                    08<span>:</span>06
                  </strong>
                  <span>SET 01</span>
                </div>
              </div>
            </section>
            <section className={styles.steps} aria-label="Cómo empezar">
              <div>
                <span>01</span>
                <h2>Abre un partido.</h2>
                <p>Dos nombres y quién saca primero.</p>
              </div>
              <div>
                <span>02</span>
                <h2>Encuadra la mesa.</h2>
                <p>Cámara fija, buena luz, pelota visible.</p>
              </div>
              <div>
                <span>03</span>
                <h2>Que siga el juego.</h2>
                <p>La cámara sigue. Tú corriges si hace falta.</p>
              </div>
            </section>
            <div className={styles.betaNote}>
              <span className={styles.pill}>Visión beta</span>
              <p>
                El marcador está listo. La cámara usa color y movimiento: ayuda
                a detectar el final del intercambio y propone posibles dobles
                botes. La precisión depende de tu encuadre; las jugadas dudosas
                se confirman.
              </p>
            </div>
          </>
        ) : null}
        {screen === "setup" ? (
          <section className={styles.setupSection}>
            <button
              className={styles.textButton}
              onClick={() => setScreen("home")}
            >
              ← Inicio
            </button>
            <div className={styles.sectionTitle}>
              <p className={styles.kicker}>01 / El partido</p>
              <h1>¿Quién juega?</h1>
              <p>Sets a 11. Gana por dos puntos.</p>
            </div>
            <form onSubmit={createMatch} className={styles.setupForm}>
              <div className={styles.playerInputs}>
                <label>
                  <span className={styles.cyanText}>Jugador 1</span>
                  <input
                    name="p1"
                    placeholder="Jugador 1"
                    maxLength={40}
                    autoComplete="off"
                  />
                </label>
                <label>
                  <span className={styles.orangeText}>Jugador 2</span>
                  <input
                    name="p2"
                    placeholder="Jugador 2"
                    maxLength={40}
                    autoComplete="off"
                  />
                </label>
              </div>
              <div className={styles.formGrid}>
                <label>
                  Partido al mejor de
                  <select name="bestOf" defaultValue="3">
                    <option value="1">1 set</option>
                    <option value="3">3 sets</option>
                    <option value="5">5 sets</option>
                  </select>
                </label>
                <label>
                  Primer servicio
                  <select name="server">
                    <option value="0">Jugador 1</option>
                    <option value="1">Jugador 2</option>
                  </select>
                </label>
                <label>
                  Extremo cercano a la cámara
                  <select name="near">
                    <option value="0">Jugador 1</option>
                    <option value="1">Jugador 2</option>
                  </select>
                </label>
              </div>
              <fieldset className={styles.modeOptions}>
                <legend>Cómo llevamos los puntos</legend>
                <label>
                  <input
                    type="radio"
                    name="mode"
                    value="assisted"
                    defaultChecked
                  />
                  <span>
                    <strong>Cámara asistida</strong>
                    <small>Sigue la pelota y te pide confirmar el punto.</small>
                  </span>
                  <span className={styles.pill}>RECOMENDADO</span>
                </label>
                <label>
                  <input type="radio" name="mode" value="automatic" />
                  <span>
                    <strong>Automático experimental</strong>
                    <small>
                      Suma posibles dobles botes; pregunta en los demás casos.
                      Puede equivocarse.
                    </small>
                  </span>
                </label>
                <label>
                  <input type="radio" name="mode" value="manual" />
                  <span>
                    <strong>Marcador manual</strong>
                    <small>Un toque para cada punto. Sin cámara.</small>
                  </span>
                </label>
              </fieldset>
              <button className={styles.primary} type="submit">
                Empezar partido <span aria-hidden="true">↗</span>
              </button>
            </form>
          </section>
        ) : null}
        {screen === "match" && match && current ? (
          <>
            <div className={styles.matchHeading}>
              <div>
                <p className={styles.kicker}>
                  PARTIDO /{" "}
                  {new Date(match.created).toLocaleDateString("es-MX", {
                    day: "2-digit",
                    month: "short",
                  })}
                </p>
                <h1>{completed ? "Buen partido." : "Un punto más."}</h1>
              </div>
              <div className={styles.matchToggles}>
                <button
                  className={styles.smallButton}
                  aria-pressed={sound}
                  onClick={() => setSound(!sound)}
                >
                  Voz {sound ? "on" : "off"}
                </button>
                <button
                  className={styles.smallButton}
                  aria-pressed={wake}
                  onClick={() => setWake(!wake)}
                >
                  Pantalla {wake ? "activa" : "normal"}
                </button>
              </div>
            </div>
            <div
              className={`${styles.matchGrid} ${match.mode === "manual" ? styles.manualGrid : ""}`}
            >
              <section className={styles.scorePanel} aria-label="Marcador">
                <div className={styles.panelHead}>
                  <span className={styles.kicker}>
                    {completed
                      ? "Resultado"
                      : `Set ${current.games.length + 1}`}{" "}
                    / Mejor de {match.bestOf}
                  </span>
                  <span className={styles.pill}>
                    {match.mode === "manual"
                      ? "MANUAL"
                      : match.mode === "assisted"
                        ? "ASISTIDO"
                        : "AUTO · BETA"}
                  </span>
                </div>
                <div className={styles.scoreboard}>
                  {([0, 1] as Player[]).map((player) => (
                    <div
                      className={
                        player === 0 ? styles.playerOne : styles.playerTwo
                      }
                      key={player}
                    >
                      <div className={styles.playerName}>
                        {match.players[player]}
                      </div>
                      <div
                        className={styles.bigScore}
                        data-testid={`score-${player}`}
                      >
                        {current.points[player].toString().padStart(2, "0")}
                      </div>
                      <div className={styles.playerMeta}>
                        <span>
                          {current.sets[player]}{" "}
                          {current.sets[player] === 1 ? "set" : "sets"}
                        </span>
                        <span>
                          {!completed && current.server === player
                            ? "● Saca"
                            : ""}
                        </span>
                      </div>
                      <button
                        className={styles.pointButton}
                        disabled={completed || sideChange || paused}
                        onClick={() => recordPoint(player)}
                        aria-label={`Punto para ${match.players[player]}`}
                      >
                        +1 <span>{match.players[player]}</span>
                      </button>
                    </div>
                  ))}
                </div>
                <div className={styles.gameStatus} role="status">
                  {completed
                    ? current.winner !== null
                      ? `Ganó ${match.players[current.winner]}`
                      : "Partido terminado"
                    : paused
                      ? "En pausa"
                      : pending
                        ? "Punto pendiente"
                        : current.points[0] >= 10 && current.points[1] >= 10
                          ? "Ventaja de dos · servicio cada punto"
                          : `Saca ${match.players[current.server]}`}
                </div>
                {current.games.length ? (
                  <div className={styles.setHistory}>
                    {current.games.map((game, index) => (
                      <span key={index}>
                        S{index + 1} <strong>{game.join(" – ")}</strong>
                      </span>
                    ))}
                  </div>
                ) : null}
                <div className={styles.matchControls}>
                  <button
                    className={styles.smallButton}
                    disabled={!match.points.length}
                    onClick={() => {
                      const next = undoPoint(match);
                      setMatch(next);
                      setPending(null);
                      setPaused(true);
                      setSideChange(scoreMatch(next).near !== current.near);
                      announce("Último punto anulado.");
                    }}
                  >
                    ↶ Deshacer
                  </button>
                  <button
                    className={styles.smallButton}
                    disabled={!match.points.length}
                    onClick={() => {
                      const next = correctPoint(match);
                      setMatch(next);
                      setPending(null);
                      setPaused(true);
                      setSideChange(scoreMatch(next).near !== current.near);
                      announce("Último punto corregido.");
                    }}
                  >
                    Corregir último
                  </button>
                  <button
                    className={styles.smallButton}
                    disabled={
                      completed ||
                      sideChange ||
                      (!ready && match.mode !== "manual" && paused)
                    }
                    onClick={() => {
                      setPaused(!paused);
                      setPending(null);
                    }}
                  >
                    {paused ? "▶ Reanudar" : "Ⅱ Pausa"}
                  </button>
                  <button
                    className={styles.smallButton}
                    disabled={completed || paused}
                    onClick={() => {
                      setPending(null);
                      setMatch({ ...match });
                      setVisionReset((value) => value + 1);
                      setMessage("Punto repetido. El servicio no cambia.");
                    }}
                  >
                    Repetir punto
                  </button>
                </div>
                {!completed && paused && match.mode !== "manual" && !ready ? (
                  <p className={styles.instructions}>
                    Activa la cámara y marca las cuatro esquinas. Después puedes
                    reanudar.
                  </p>
                ) : null}
                {!completed ? (
                  <div className={styles.matchFooter}>
                    <button
                      className={styles.textButton}
                      onClick={() => {
                        setFinishDialog(true);
                        setPaused(true);
                      }}
                    >
                      Terminar partido
                    </button>
                    {match.mode !== "manual" ? (
                      <button
                        className={styles.textButton}
                        onClick={() => {
                          setMatch({ ...match, mode: "manual" });
                          setReady(false);
                          setPaused(false);
                          setPending(null);
                        }}
                      >
                        Usar modo manual
                      </button>
                    ) : (
                      <button
                        className={styles.textButton}
                        onClick={() => {
                          setMatch({ ...match, mode: "assisted" });
                          setPaused(true);
                          setReady(false);
                        }}
                      >
                        Activar cámara
                      </button>
                    )}
                  </div>
                ) : (
                  <div className={styles.resultsActions}>
                    <button
                      className={styles.primary}
                      onClick={() => {
                        const next = {
                          ...match,
                          id: crypto.randomUUID(),
                          points: [],
                          firstServer: other(match.firstServer),
                          created: Date.now(),
                          finished: undefined,
                        };
                        setHistory((items) => [
                          match,
                          ...items.filter((item) => item.id !== match.id),
                        ]);
                        setMatch(next);
                        setPaused(next.mode !== "manual");
                        setReady(false);
                        setPending(null);
                        setSideChange(false);
                        setMessage("");
                      }}
                    >
                      Revancha ↗
                    </button>
                    <button
                      className={styles.secondary}
                      onClick={() => void share()}
                    >
                      Compartir resultado
                    </button>
                    <button
                      className={styles.textButton}
                      onClick={() => download(match)}
                    >
                      Exportar partido
                    </button>
                  </div>
                )}
              </section>
              {match.mode !== "manual" && !completed ? (
                <CameraPanel
                  key={match.id}
                  active={inPlay}
                  epoch={`${match.points.length}:${match.points.at(-1)?.winner ?? ""}:${visionReset}`}
                  onSuggestion={onSuggestion}
                  onReady={onReady}
                  onCameraLost={onCameraLost}
                />
              ) : null}
            </div>
            <button className={styles.textButton} onClick={() => void goHome()}>
              ← Guardar y volver al inicio
            </button>
          </>
        ) : null}
        {screen === "history" ? (
          <section className={styles.setupSection}>
            <button
              className={styles.textButton}
              onClick={() => setScreen("home")}
            >
              ← Inicio
            </button>
            <div className={styles.sectionTitle}>
              <p className={styles.kicker}>LOS PARTIDOS</p>
              <h1>Quedó en la mesa.</h1>
              <p>Guardados solo en este navegador.</p>
            </div>
            {history.length ? (
              <div className={styles.historyList}>
                {history.map((item) => {
                  const score = scoreMatch(item);
                  return (
                    <button
                      className={styles.historyItem}
                      key={item.id}
                      onClick={() => {
                        setMatch(item);
                        setPaused(true);
                        setReady(false);
                        setPending(null);
                        setSideChange(false);
                        setScreen("match");
                      }}
                    >
                      <span>
                        <strong>{item.players.join(" / ")}</strong>
                        <small>
                          {new Date(item.created).toLocaleDateString("es-MX")} ·{" "}
                          {item.finished || score.winner !== null
                            ? "Terminado"
                            : "En curso"}
                        </small>
                      </span>
                      <span className={styles.historyScore}>
                        {score.sets.join(" – ")}
                        <small>{score.points.join(" – ")}</small>
                      </span>
                      <span aria-hidden="true">↗</span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className={styles.emptyState}>Aquí aparecerán tus partidos.</p>
            )}
            <div className={styles.buttonRow}>
              <button
                className={styles.secondary}
                disabled={!history.length}
                onClick={() => download(history)}
              >
                Exportar historial
              </button>
              <label className={styles.fileLabel}>
                Importar historial
                <input
                  type="file"
                  accept="application/json,.json"
                  onChange={(event) => {
                    void importHistory(event.target.files?.[0]);
                    event.target.value = "";
                  }}
                />
              </label>
            </div>
          </section>
        ) : null}
        {message ? (
          <div role="status" className={styles.notice}>
            {message}
            <button
              className={styles.iconButton}
              aria-label="Cerrar aviso"
              onClick={() => setMessage("")}
            >
              ×
            </button>
          </div>
        ) : null}
        {storageError ? (
          <p role="alert" className={styles.error}>
            No pudimos guardar en este navegador. Exporta el partido antes de
            cerrar.
          </p>
        ) : null}
        {update && !inPlay ? (
          <div className={styles.notice}>
            Hay una versión nueva.
            <button
              className={styles.smallButton}
              onClick={() => {
                update.waiting?.postMessage({ type: "SKIP_WAITING" });
                navigator.serviceWorker.addEventListener(
                  "controllerchange",
                  () => location.reload(),
                  { once: true },
                );
              }}
            >
              Actualizar
            </button>
          </div>
        ) : null}
        <footer className={styles.footer}>
          <span>HECHO PARA OTRO SET.</span>
          <Link href="/">Jorge Sandoval ↗</Link>
          <span>
            Cámara local · visión beta ·{" "}
            <a href="/pingpong/licenses.txt">Licencias</a>
          </span>
        </footer>
      </div>
      {modalOpen ? (
        <div className={styles.modalBackdrop}>
          <div
            className={styles.modal}
            ref={dialog}
            role="dialog"
            aria-modal="true"
            aria-label={
              help
                ? "Cómo funciona PingPong"
                : pending
                  ? "Confirma el punto"
                  : sideChange
                    ? "Cambio de lado"
                    : "Terminar partido"
            }
            tabIndex={-1}
          >
            {help ? (
              <>
                <p className={styles.kicker}>ANTES DEL SAQUE</p>
                <h2>
                  La mesa completa.
                  <br />
                  La pelota visible.
                </h2>
                <ol>
                  <li>
                    Coloca el teléfono horizontal y fijo en un soporte, elevado
                    a un costado.
                  </li>
                  <li>
                    Marca las esquinas en este orden: cercana izquierda, cercana
                    derecha, lejana derecha y lejana izquierda.
                  </li>
                  <li>
                    Comprueba que la pelota deje una trayectoria. Ajusta color,
                    sensibilidad y tamaño si es necesario.
                  </li>
                  <li>
                    Reanuda y juega. Confirma puntos dudosos o corrige el último
                    con un toque.
                  </li>
                </ol>
                <p>
                  El modo automático es experimental: solo suma posibles dobles
                  botes tras un intercambio observado. No arbitra saques, red ni
                  bordes. En asistido, todos los puntos se confirman.
                </p>
                <p>
                  La cámara se procesa aquí, sin subir video. Mantén la página
                  abierta; al bloquear el teléfono, el partido se pausa.
                </p>
                <p>
                  Para instalar: usa «Añadir a pantalla de inicio» en el menú
                  del navegador. Necesitas conexión para abrir o recargar la
                  aplicación. El partido abierto sigue funcionando si se corta
                  la red.
                </p>
                <button
                  className={styles.primary}
                  onClick={() => setHelp(false)}
                >
                  Entendido ↗
                </button>
              </>
            ) : pending && match && current ? (
              <>
                <p className={styles.kicker}>PUNTO PENDIENTE</p>
                <h2>¿Quién ganó?</h2>
                <p>{pending.reason}</p>
                {pending.loserSide !== null ? (
                  <p>
                    Posible punto para{" "}
                    <strong>
                      {
                        match.players[
                          other(
                            pending.loserSide === 0
                              ? current.near
                              : other(current.near),
                          )
                        ]
                      }
                    </strong>
                    .
                  </p>
                ) : null}
                <div className={styles.pendingChoices}>
                  {([0, 1] as Player[]).map((player) => (
                    <button
                      className={
                        player === 0 ? styles.choiceCyan : styles.choiceOrange
                      }
                      key={player}
                      onClick={() => recordPoint(player, "camera", pending.id)}
                    >
                      {match.players[player]} +1
                    </button>
                  ))}
                </div>
                <button
                  className={styles.secondary}
                  onClick={() => {
                    setPending(null);
                    setMatch({ ...match });
                    setVisionReset((value) => value + 1);
                  }}
                >
                  Repetir punto / descartar
                </button>
              </>
            ) : sideChange && match && current ? (
              <>
                <p className={styles.kicker}>MISMO JUEGO. OTRO LADO.</p>
                <h2>Cambien de lado.</h2>
                <p>
                  <strong>{match.players[current.near]}</strong> va en el
                  extremo cercano a la cámara. Mantén el teléfono fijo.
                </p>
                <button
                  className={styles.primary}
                  onClick={() => {
                    setSideChange(false);
                    setPaused(match.mode !== "manual" && !ready);
                  }}
                >
                  Listo, seguir jugando ↗
                </button>
              </>
            ) : finishDialog && match ? (
              <>
                <p className={styles.kicker}>CERRAR EL PARTIDO</p>
                <h2>¿Lo dejamos aquí?</h2>
                <p>Se guardará el resultado actual en tu historial.</p>
                <button
                  className={styles.primary}
                  onClick={() => {
                    setMatch({ ...match, finished: Date.now() });
                    setFinishDialog(false);
                  }}
                >
                  Terminar y guardar ↗
                </button>
                <button
                  className={styles.secondary}
                  onClick={() => setFinishDialog(false)}
                >
                  Volver al partido
                </button>
              </>
            ) : null}
          </div>
        </div>
      ) : null}
    </main>
  );
}
