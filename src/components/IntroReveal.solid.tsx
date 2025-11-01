/** @jsxImportSource solid-js */
import { Show, createSignal, onCleanup, onMount } from "solid-js";

export default function IntroReveal() {
  const brand = "#0048BF";

  const [mounted, setMounted] = createSignal(false);
  const [overlayUp, setOverlayUp] = createSignal(false);
  const [progress, setProgress] = createSignal(0);
  const [tipIndex, setTipIndex] = createSignal(0);
  const TIPS = [
    "Crafting your experience…",
    "Aligning pixels and performance…",
    "Loading components & caffeine…",
    "Pro tip: Press Esc to skip ✨",
  ];

  let rafId = 0;
  let tipTimer: number | undefined;
  let startedAt = 0;

  const animateProgress = () => {
    const ease = (t: number) => 1 - Math.pow(1 - t, 3);
    const step = () => {
      const elapsed = performance.now() - startedAt;
      const t = Math.min(1, elapsed / 1200);
      setProgress(Math.floor(ease(t) * 100));
      if (t < 1) {
        rafId = requestAnimationFrame(step);
      } else {
        finish();
      }
    };
    rafId = requestAnimationFrame(step);
  };

  const unlockPage = () => {
    try {
      sessionStorage.setItem("introSeen", "1");
    } catch (_) {}
    document.documentElement.removeAttribute("data-intro");
  };

  const finish = () => {
    const overlay = document.getElementById("intro-overlay");
    if (!overlay) {
      unlockPage();
      setMounted(false);
      return;
    }
    overlay.addEventListener(
      "transitionend",
      () => {
        unlockPage();
        setMounted(false);
        // Hapus node anchor supaya bersih
        const root = document.getElementById("intro-root");
        if (root) root.remove();
      },
      { once: true }
    );
    setOverlayUp(true);
  };

  const onKey = (e: KeyboardEvent) => {
    if (["Escape", "Enter", " "].includes(e.key)) finish();
  };

  onMount(() => {
    setMounted(true);
    document.addEventListener("keydown", onKey);

    tipTimer = window.setInterval(() => {
      setTipIndex((i) => (i + 1) % TIPS.length);
    }, 900) as unknown as number;

    requestAnimationFrame(() => {
      startedAt = performance.now();
      animateProgress();
    });

    onCleanup(() => {
      cancelAnimationFrame(rafId);
      document.removeEventListener("keydown", onKey);
      if (tipTimer) clearInterval(tipTimer);
    });
  });

  return (
    <Show when={mounted()}>
      <div
        id="intro-overlay"
        class={`fixed inset-0 z-[9999] grid place-items-center
                transition-transform duration-700 ease-[cubic-bezier(.22,1,.36,1)]
                ${overlayUp() ? "-translate-y-full" : "translate-y-0"}`}
        style={{
          background:
            "radial-gradient(1200px 600px at 50% -10%, rgba(0,0,0,0.06), transparent 60%), linear-gradient(180deg, #F9FAFB 0%, #F3F4F6 100%)",
        }}
      >
        <div class="relative w-[min(92vw,28rem)] rounded-3xl border border-black/10 bg-white/70 backdrop-blur-xl shadow-[0_1px_1px_rgba(0,0,0,.10),0_24px_64px_rgba(0,0,0,.16)] p-6 flex flex-col items-center gap-5">
          <div class="w-16 h-16 rounded-2xl border border-black/10 grid place-items-center">
            <div
              class="w-8 h-8 rounded-full border-4 border-neutral-300 border-t-transparent animate-spin"
              style={{ "border-top-color": brand }}
            />
          </div>

          <div class="flex flex-col items-center gap-1 text-center">
            <p class="text-sm text-gray-800 font-medium">Loading your experience…</p>
            <p class="text-xs text-gray-500 h-4">{TIPS[tipIndex()]}</p>
          </div>

          <div class="w-full">
            <div class="h-2 w-full rounded-full bg-gray-200 overflow-hidden">
              <div
                class="h-full rounded-full transition-[width] duration-300"
                style={{
                  width: `${progress()}%`,
                  "background-image": `linear-gradient(90deg, ${brand}, ${brand}80)`,
                }}
              />
            </div>
            <div class="mt-2 text-right text-[10px] text-gray-500 tabular-nums">
              {progress()}%
            </div>
          </div>

          <div
            class="pointer-events-none absolute -inset-1 rounded-[inherit] opacity-50 blur-2xl"
            style={{ background: `${brand}22` }}
          />
        </div>
      </div>
    </Show>
  );
}
