import { Camera, Flashlight, FlashlightOff, Keyboard, X } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import { haptic } from '../../lib/haptics';
import { spring } from '../../lib/motion';
import {
  cameraAvailable,
  cameraPermission,
  createDetector,
  openCamera,
  setTorch,
  torchSupported,
  type Detection,
  type ScanKind,
} from '../../lib/scanner';
import { Button, IconButton } from './core';
import { TextField } from './fields';
import { Sheet } from './sheet';

type Phase = 'checking' | 'prompt' | 'starting' | 'live' | 'denied' | 'unavailable';

interface Props {
  kind: ScanKind;
  title: string;
  /** Freeze on the detected frame while a sheet is open. */
  paused: boolean;
  onDetect: (value: string) => void;
  onClose: () => void;
}

const FRAME: Record<ScanKind, { w: number; h: number }> = {
  product: { w: 288, h: 168 },
  qr: { w: 240, h: 240 },
};
const CORNER = 36;

interface Rect {
  cx: number;
  cy: number;
  w: number;
  h: number;
}

export function Scanner({ kind, title, paused, onDetect, onClose }: Props) {
  const video = useRef<HTMLVideoElement>(null);
  const stream = useRef<MediaStream | null>(null);
  const [phase, setPhase] = useState<Phase>('checking');
  const [torch, setTorchOn] = useState(false);
  const [canTorch, setCanTorch] = useState(false);
  const [target, setTarget] = useState<Rect | null>(null);
  const [manual, setManual] = useState(false);
  const pausedRef = useRef(paused);
  pausedRef.current = paused;
  const onDetectRef = useRef(onDetect);
  onDetectRef.current = onDetect;
  const reduced = useReducedMotion();

  const stopCamera = useCallback(() => {
    stream.current?.getTracks().forEach((t) => t.stop());
    stream.current = null;
  }, []);

  const start = useCallback(async () => {
    if (!cameraAvailable()) return setPhase('unavailable');
    setPhase('starting');
    try {
      const s = await openCamera();
      stream.current = s;
      const v = video.current;
      if (!v) return;
      v.srcObject = s;
      await v.play();
      setCanTorch(torchSupported(s));
      setPhase('live');
    } catch (e) {
      const name = (e as DOMException)?.name;
      setPhase(name === 'NotAllowedError' || name === 'SecurityError' ? 'denied' : 'unavailable');
    }
  }, []);

  // Decide whether to ask first.
  useEffect(() => {
    let alive = true;
    (async () => {
      if (!cameraAvailable()) return setPhase('unavailable');
      const p = await cameraPermission();
      if (!alive) return;
      if (p === 'granted') void start();
      else if (p === 'denied') setPhase('denied');
      else setPhase('prompt');
    })();
    return () => {
      alive = false;
      stopCamera();
    };
  }, [start, stopCamera]);

  // Map a box in video pixels to screen pixels (object-fit: cover).
  const toScreen = (box: NonNullable<Detection['box']>): Rect | null => {
    const v = video.current;
    if (!v || !v.videoWidth) return null;
    const vw = v.clientWidth;
    const vh = v.clientHeight;
    const scale = Math.max(vw / v.videoWidth, vh / v.videoHeight);
    const ox = (vw - v.videoWidth * scale) / 2;
    const oy = (vh - v.videoHeight * scale) / 2;
    const pad = 14;
    return {
      cx: box.x * scale + ox + (box.width * scale) / 2 - vw / 2,
      cy: box.y * scale + oy + (box.height * scale) / 2 - vh / 2,
      w: Math.min(vw - 24, Math.max(96, box.width * scale + pad * 2)),
      h: Math.min(vh * 0.6, Math.max(72, box.height * scale + pad * 2)),
    };
  };

  // Detection loop.
  useEffect(() => {
    if (phase !== 'live' || paused) return;
    let alive = true;
    let timer = 0;
    const v = video.current;
    setTarget(null);
    if (v && v.paused) void v.play().catch(() => {});

    (async () => {
      const detect = await createDetector(kind);
      const loop = async () => {
        if (!alive || pausedRef.current || !video.current) return;
        let hit: Detection | null = null;
        try {
          hit = await detect(video.current);
        } catch {
          hit = null;
        }
        if (!alive || pausedRef.current) return;
        if (hit) {
          haptic();
          video.current.pause(); // freeze on this frame
          const f = FRAME[kind];
          setTarget((hit.box && toScreen(hit.box)) || { cx: 0, cy: 0, w: f.w * 0.78, h: f.h * 0.7 });
          onDetectRef.current(hit.value);
          return;
        }
        timer = window.setTimeout(loop, 140);
      };
      void loop();
    })();

    return () => {
      alive = false;
      window.clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, paused, kind]);

  const toggleTorch = async () => {
    const next = !torch;
    setTorchOn(next);
    await setTorch(stream.current, next);
  };

  const submitManual = (value: string) => {
    setManual(false);
    onDetectRef.current(value);
  };

  const f = FRAME[kind];
  const rect: Rect = target ?? { cx: 0, cy: 0, w: f.w, h: f.h };
  const corners = [
    { key: 'tl', x: rect.cx - rect.w / 2, y: rect.cy - rect.h / 2, cls: 'border-l-4 border-t-4 rounded-tl-[18px]' },
    { key: 'tr', x: rect.cx + rect.w / 2 - CORNER, y: rect.cy - rect.h / 2, cls: 'border-r-4 border-t-4 rounded-tr-[18px]' },
    { key: 'bl', x: rect.cx - rect.w / 2, y: rect.cy + rect.h / 2 - CORNER, cls: 'border-l-4 border-b-4 rounded-bl-[18px]' },
    { key: 'br', x: rect.cx + rect.w / 2 - CORNER, y: rect.cy + rect.h / 2 - CORNER, cls: 'border-r-4 border-b-4 rounded-br-[18px]' },
  ];
  const detected = !!target;
  const live = phase === 'live';

  return (
    <div className="fixed inset-0 z-40 overflow-hidden bg-night text-white">
      {/* Camera */}
      <video
        ref={video}
        muted
        playsInline
        autoPlay
        aria-hidden="true"
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${live ? 'opacity-100' : 'opacity-0'}`}
      />

      {/* Dimmed edges + frame */}
      {live && (
        <>
          <motion.div
            aria-hidden="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: detected ? 0.75 : 1 }}
            transition={spring}
            className="pointer-events-none absolute top-1/2 left-1/2 rounded-[24px]"
            style={{ width: f.w, height: f.h, marginLeft: -f.w / 2, marginTop: -f.h / 2, boxShadow: '0 0 0 200vmax rgba(3, 20, 15, 0.55)' }}
          >
            {!detected && !reduced && (
              <div className="absolute inset-x-5 top-3 overflow-hidden" style={{ height: f.h - 24 }}>
                <div className="sweep h-0.5 rounded-full bg-lime shadow-[0_0_12px_2px_rgba(200,241,105,0.6)]" style={{ ['--sweep' as string]: `${f.h - 26}px` }} />
              </div>
            )}
          </motion.div>
          <div aria-hidden="true" className={`pointer-events-none absolute top-1/2 left-1/2 size-0 ${detected ? '' : 'breathe'}`}>
            {corners.map((c) => (
              <motion.span
                key={c.key}
                initial={false}
                animate={{ x: c.x, y: c.y, borderColor: detected ? '#C8F169' : '#ffffff' }}
                transition={detected ? { type: 'spring', visualDuration: 0.25, bounce: 0 } : spring}
                className={`absolute top-0 left-0 ${c.cls}`}
                style={{ width: CORNER, height: CORNER }}
              />
            ))}
          </div>
        </>
      )}

      {/* Top bar */}
      <div className="absolute inset-x-0 top-0 flex items-center gap-2 px-3 pt-[max(12px,var(--safe-top))]">
        <IconButton label="Close" tone="dark" onClick={onClose}>
          <X className="size-5" />
        </IconButton>
        <h1 className="flex-1 text-center text-[1.0625rem] leading-6 font-semibold text-white">{title}</h1>
        <span className="size-11" />
      </div>

      {/* Bottom controls */}
      {live && (
        <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-4 px-6 pb-[max(28px,calc(var(--safe-bottom)+16px))]">
          {canTorch && (
            <IconButton label={torch ? 'Torch off' : 'Torch on'} tone="dark" onClick={toggleTorch} aria-pressed={torch}>
              {torch ? <FlashlightOff className="size-5" /> : <Flashlight className="size-5" />}
            </IconButton>
          )}
          <Button variant="onDark" className="backdrop-blur-md" icon={<Keyboard className="size-5" />} onClick={() => setManual(true)}>
            Enter code
          </Button>
        </div>
      )}

      {/* Ask first */}
      {(phase === 'prompt' || phase === 'starting') && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={spring} className="absolute inset-0 flex flex-col items-center justify-center px-8 text-center">
          <div className="mb-5 flex size-16 items-center justify-center rounded-full bg-white/10">
            <Camera className="size-8" />
          </div>
          <p className="t-20 max-w-[280px]">{kind === 'qr' ? "Scan the buyer's code." : 'Scan carton barcodes.'}</p>
          <div className="mt-8 flex w-full max-w-[280px] flex-col gap-2">
            <Button variant="lime" size="lg" block loading={phase === 'starting'} loadingLabel="Opening camera" onClick={start}>
              Allow camera
            </Button>
            <Button variant="onDark" onClick={() => setManual(true)}>
              Enter code
            </Button>
          </div>
        </motion.div>
      )}

      {/* No camera: type it instead */}
      {(phase === 'denied' || phase === 'unavailable') && (
        <div className="absolute inset-0 flex flex-col items-center justify-center px-6">
          <div className="w-full max-w-[360px] rounded-[24px] bg-paper p-6 text-left text-ink shadow-lift">
            <p className="t-20 text-ink">{phase === 'denied' ? 'Camera is off' : 'No camera here'}</p>
            <p className="t-14 mt-1 text-slate">Type the code instead.</p>
            <ManualForm kind={kind} onSubmit={submitManual} />
          </div>
        </div>
      )}

      <Sheet open={manual} onClose={() => setManual(false)} title="Enter code">
        <ManualForm kind={kind} onSubmit={submitManual} autoFocus />
      </Sheet>
    </div>
  );
}

function ManualForm({ kind, onSubmit, autoFocus }: { kind: ScanKind; onSubmit: (v: string) => void; autoFocus?: boolean }) {
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const submit = (e: FormEvent) => {
    e.preventDefault();
    const v = value.trim();
    if (kind === 'product' && !/^\d{8,14}$/.test(v.replace(/\s/g, ''))) return setError('Use the 8 to 13 digits under the bars.');
    if (kind === 'qr' && !/SS-?\d{4,6}/i.test(v)) return setError('Codes look like SS-24081.');
    onSubmit(kind === 'qr' ? v.toUpperCase().replace(/^SS-?/, 'SS-') : v.replace(/\s/g, ''));
  };
  return (
    <form onSubmit={submit} className="mt-4">
      <TextField
        label={kind === 'qr' ? 'Order code' : 'Barcode'}
        inputMode={kind === 'qr' ? 'text' : 'numeric'}
        autoComplete="off"
        placeholder={kind === 'qr' ? 'SS-24081' : '2006001000016'}
        value={value}
        error={error}
        data-autofocus={autoFocus ? '' : undefined}
        onChange={(e) => {
          setValue(e.target.value);
          setError(null);
        }}
      />
      <Button type="submit" size="lg" block>
        Find
      </Button>
    </form>
  );
}
