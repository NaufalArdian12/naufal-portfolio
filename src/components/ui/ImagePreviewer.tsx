/* @refresh skip */
/** @jsxImportSource react */
import { useEffect, useLayoutEffect, useRef, useState } from "react";

type Props = {
  src: string;
  alt?: string;
  title?: string;
  overlay?: boolean;
  className?: string;
  excludeSelector?: string;
};

export default function ImagePreviewer({
  src,
  alt = "",
  title,
  overlay = false,
  className,
  excludeSelector,
}: Props) {
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const [scale, setScale] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [dims, setDims] = useState({ cw: 0, ch: 0, iw: 0, ih: 0 });
  const [isOpen, setIsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  //
  // helpers
  //
  const reset = () => {
    setScale(1);
    setPos({ x: 0, y: 0 });
  };

  // ripple click
  function addRipple(e: React.MouseEvent<HTMLElement>) {
    const host = e.currentTarget as HTMLElement;
    const rect = host.getBoundingClientRect();

    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    if (getComputedStyle(host).position === "static")
      host.style.position = "relative";
    if (getComputedStyle(host).overflow !== "hidden")
      host.style.overflow = "hidden";

    const span = document.createElement("span");
    span.className = "rb-ripple";
    span.style.width = `${size}px`;
    span.style.height = `${size}px`;
    span.style.left = `${x}px`;
    span.style.top = `${y}px`;

    host.appendChild(span);
    span.addEventListener("animationend", () => span.remove(), {
      once: true,
    });
  }

  //
  // show / close
  //
  const show = () => {
    dialogRef.current?.showModal();
    setIsOpen(true);
  };

  const softClose = () => {
    if (!dialogRef.current) return;
    setIsAnimating(true);
    setIsOpen(false);
    setTimeout(() => {
      dialogRef.current?.close();
      setIsAnimating(false);
      reset();
    }, 180); // sesuai transition CSS
  };

  //
  // size
  //
  const measure = () => {
    const root = rootRef.current,
      img = imgRef.current;
    if (!root || !img) return;
    const cw = root.clientWidth;
    const ch = root.clientHeight;
    const nw = img.naturalWidth || img.width;
    const nh = img.naturalHeight || img.height;
    setDims({ cw, ch, iw: nw, ih: nh });
  };

  useLayoutEffect(() => {
    measure();
    const f = () => measure();
    window.addEventListener("resize", f);
    return () => window.removeEventListener("resize", f);
  }, []);

  //
  // clamp
  //
  const clampPos = (nextX: number, nextY: number, nextScale = scale) => {
    const { cw, ch, iw, ih } = dims;
    if (!cw || !ch || !iw || !ih) return { x: 0, y: 0 };

    const ratio = Math.min(cw / iw, ch / ih);
    const baseW = iw * ratio;
    const baseH = ih * ratio;
    const curW = baseW * nextScale;
    const curH = baseH * nextScale;

    const maxX = Math.max(0, (curW - cw) / 2);
    const maxY = Math.max(0, (curH - ch) / 2);

    return {
      x: Math.max(-maxX, Math.min(maxX, nextX)),
      y: Math.max(-maxY, Math.min(maxY, nextY)),
    };
  };

  //
  // wheel zoom
  //
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = -Math.sign(e.deltaY) * 0.12;
      const next = Math.max(1, Math.min(6, scale + delta));
      if (next === scale) return;
      const clamped = clampPos(pos.x, pos.y, next);
      setScale(next);
      setPos(clamped);
    };
    root.addEventListener("wheel", onWheel, { passive: false });
    return () => root.removeEventListener("wheel", onWheel as any);
  }, [scale, pos, dims]);

  //
  // drag
  //
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    let dragging = false,
      lastX = 0,
      lastY = 0;

    const onDown = (e: MouseEvent) => {
      if (scale <= 1) return;
      dragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
    };
    const onMove = (e: MouseEvent) => {
      if (!dragging) return;
      const dx = e.clientX - lastX,
        dy = e.clientY - lastY;
      lastX = e.clientX;
      lastY = e.clientY;
      const c = clampPos(pos.x + dx, pos.y + dy);
      setPos(c);
    };
    const onUp = () => {
      dragging = false;
    };

    root.addEventListener("mousedown", onDown);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      root.removeEventListener("mousedown", onDown);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [scale, pos, dims]);

  //
  // overlay klik
  //
  const handleOverlayClick: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    if (excludeSelector) {
      const rootEl = e.currentTarget.parentElement as Element | null;
      const target = e.target as Element;
      if (rootEl) {
        for (const el of rootEl.querySelectorAll(excludeSelector)) {
          if (el.contains(target)) return;
        }
      }
    }
    show();
  };

  //
  // close via backdrop
  //
  const onDialogClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    const dlg = dialogRef.current;
    if (!dlg) return;
    if (e.target === dlg) return softClose();

    const panel = panelRef.current;
    if (panel) {
      const r = panel.getBoundingClientRect();
      const x = e.clientX,
        y = e.clientY;
      const inside = x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
      if (!inside) softClose();
    }
  };

  //
  // render
  //
  return (
    <>
      {overlay ? (
        <button
          type="button"
          onClick={handleOverlayClick}
          aria-label="Open certificate preview"
          className={className ?? "absolute inset-0 z-10 pointer-events-auto"}
        />
      ) : (
        <button
          type="button"
          onClick={(e) => { addRipple(e); show(); }}
          className={
            className ??
            "relative overflow-hidden shrink-0 grid place-items-center rounded-xl " +
            "w-16 h-16 md:w-32 md:h-32 " +
            "focus:outline-none focus:ring-2 focus:ring-[#0048BF] " +
            "transition-transform duration-150 active:scale-95 hover:scale-[0.985]"
          }
          aria-label="Open preview"
        >
          <img
            src={src}
            alt={alt}
            className="w-12 h-12 md:w-24 md:h-24"
            loading="lazy"
            decoding="async"
          />
        </button>
      )}

      <dialog
        ref={dialogRef}
        className="backdrop:bg-black/60 p-0 rounded-2xl m-auto w-[min(92vw,1000px)] max-h-[90vh]"
        onClick={onDialogClick}
        onCancel={(ev) => {
          ev.preventDefault();
          softClose();
        }}
      >
        <div
          ref={panelRef}
          data-open={isOpen ? "y" : "n"}
          className={[
            "relative bg-white rounded-2xl overflow-hidden flex flex-col",
            "transition-all duration-200",
            "data-[open=n]:opacity-0 data-[open=n]:translate-y-[6px] data-[open=n]:scale-[0.985] data-[open=n]:blur-[2px]",
            "data-[open=y]:opacity-100 data-[open=y]:translate-y-0   data-[open=y]:scale-100      data-[open=y]:blur-0",
          ].join(" ")}
        >
          <div className="flex items-center justify-between gap-2 p-2 border-b">
            <div className="text-sm font-medium truncate px-1">{title || alt}</div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setScale((s) => Math.max(1, s - 0.2))}
                className="px-2 py-1 rounded border text-sm"
              >
                −
              </button>
              <button
                onClick={() => { setScale(1); setPos({ x: 0, y: 0 }); }}
                className="px-2 py-1 rounded border text-sm"
              >
                Reset
              </button>
              <button
                onClick={() => setScale((s) => Math.min(6, s + 0.2))}
                className="px-2 py-1 rounded border text-sm"
              >
                +
              </button>
            </div>
          </div>

          <div
            ref={rootRef}
            style={{ height: "min(70vh, 80dvh)" }}
            className="relative bg-neutral-50 flex items-center justify-center overflow-hidden p-2 md:p-3"
          >
            <img
              ref={imgRef}
              src={src}
              alt={alt}
              onLoad={measure}
              draggable={false}
              className={[
                "select-none will-change-transform max-w-full max-h-full object-contain",
                "opacity-0 transition-opacity duration-150",
                isOpen ? "opacity-100" : "opacity-0",
              ].join(" ")}
              style={{
                transform: `translate(${pos.x}px, ${pos.y}px) scale(${scale})`,
                transformOrigin: "center center",
              }}
            />
          </div>

          <div className="flex items-center justify-between gap-2 p-2 border-t">
            <div className="text-xs text-gray-600 truncate px-1">{title || alt}</div>
            <button
              onClick={softClose}
              disabled={isAnimating}
              className="px-3 py-1 rounded border text-sm disabled:opacity-60"
            >
              Close
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}
