/**
 * Barcode / QR detection. Uses the browser's BarcodeDetector when it can
 * (fast, Chrome on Android), otherwise ZXing, loaded only when needed.
 */

export type ScanKind = 'product' | 'qr';

export interface Detection {
  value: string;
  /** Bounding box in video pixels, when known. */
  box?: { x: number; y: number; width: number; height: number };
}

export type Detector = (video: HTMLVideoElement) => Promise<Detection | null>;

interface NativeBarcode {
  rawValue: string;
  boundingBox?: DOMRectReadOnly;
}
interface NativeDetector {
  detect(source: CanvasImageSource): Promise<NativeBarcode[]>;
}
interface NativeDetectorCtor {
  new (opts: { formats: string[] }): NativeDetector;
  getSupportedFormats?: () => Promise<string[]>;
}

const NATIVE_FORMATS: Record<ScanKind, string[]> = {
  product: ['ean_13', 'ean_8', 'upc_a', 'upc_e'],
  qr: ['qr_code'],
};

async function nativeDetector(kind: ScanKind): Promise<Detector | null> {
  const Ctor = (window as unknown as { BarcodeDetector?: NativeDetectorCtor }).BarcodeDetector;
  if (!Ctor) return null;
  try {
    const supported = (await Ctor.getSupportedFormats?.()) ?? [];
    const formats = NATIVE_FORMATS[kind].filter((f) => supported.includes(f));
    if (!formats.length) return null;
    const d = new Ctor({ formats });
    return async (video) => {
      if (video.readyState < 2) return null;
      const found = await d.detect(video);
      const hit = found[0];
      if (!hit?.rawValue) return null;
      const b = hit.boundingBox;
      return { value: hit.rawValue, box: b ? { x: b.x, y: b.y, width: b.width, height: b.height } : undefined };
    };
  } catch {
    return null;
  }
}

async function zxingDetector(kind: ScanKind): Promise<Detector> {
  const [{ BrowserMultiFormatReader }, lib] = await Promise.all([import('@zxing/browser'), import('@zxing/library')]);
  const { BarcodeFormat, DecodeHintType } = lib;
  const hints = new Map();
  hints.set(
    DecodeHintType.POSSIBLE_FORMATS,
    kind === 'qr' ? [BarcodeFormat.QR_CODE] : [BarcodeFormat.EAN_13, BarcodeFormat.EAN_8, BarcodeFormat.UPC_A, BarcodeFormat.UPC_E],
  );
  hints.set(DecodeHintType.TRY_HARDER, true);
  const reader = new BrowserMultiFormatReader(hints);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d', { willReadFrequently: true });

  return async (video) => {
    if (!ctx || video.readyState < 2 || !video.videoWidth) return null;
    const scale = Math.min(1, 720 / video.videoWidth);
    canvas.width = Math.round(video.videoWidth * scale);
    canvas.height = Math.round(video.videoHeight * scale);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    try {
      const r = reader.decodeFromCanvas(canvas);
      const pts = r.getResultPoints() ?? [];
      let box: Detection['box'];
      if (pts.length >= 2) {
        const xs = pts.map((p) => p.getX() / scale);
        const ys = pts.map((p) => p.getY() / scale);
        const minX = Math.min(...xs);
        const maxX = Math.max(...xs);
        const minY = Math.min(...ys);
        const maxY = Math.max(...ys);
        // 1D codes report points on one line: give the box some height.
        const h = Math.max(maxY - minY, (maxX - minX) * 0.45);
        box = { x: minX, y: (minY + maxY) / 2 - h / 2, width: maxX - minX, height: h };
      }
      return { value: r.getText(), box };
    } catch {
      return null; // nothing in this frame
    }
  };
}

export async function createDetector(kind: ScanKind): Promise<Detector> {
  return (await nativeDetector(kind)) ?? zxingDetector(kind);
}

export type CameraState = 'unknown' | 'granted' | 'prompt' | 'denied';

export async function cameraPermission(): Promise<CameraState> {
  try {
    const status = await navigator.permissions.query({ name: 'camera' as PermissionName });
    return status.state as CameraState;
  } catch {
    return 'unknown';
  }
}

export function cameraAvailable(): boolean {
  return typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getUserMedia && window.isSecureContext;
}

export async function openCamera(): Promise<MediaStream> {
  return navigator.mediaDevices.getUserMedia({
    audio: false,
    video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
  });
}

export function torchSupported(stream: MediaStream | null): boolean {
  const track = stream?.getVideoTracks()[0];
  const caps = track?.getCapabilities?.() as (MediaTrackCapabilities & { torch?: boolean }) | undefined;
  return !!caps?.torch;
}

export async function setTorch(stream: MediaStream | null, on: boolean) {
  const track = stream?.getVideoTracks()[0];
  try {
    await track?.applyConstraints({ advanced: [{ torch: on } as MediaTrackConstraintSet] });
  } catch {
    /* not supported */
  }
}

/** Accept "SS-24081" or anything containing it (e.g. a URL). */
export function parseHandoverRef(value: string): string | null {
  const m = value.toUpperCase().match(/SS-\d{4,6}/);
  return m ? m[0] : null;
}
