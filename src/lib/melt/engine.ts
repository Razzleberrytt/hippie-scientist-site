import { MeltEffect, MeltKey } from './types';

type Registry = Record<MeltKey, MeltEffect>;

export class MeltEngine {
  private ctx?: CanvasRenderingContext2D;
  private canvas?: HTMLCanvasElement;
  private raf = 0;
  private t0 = 0;
  private dpr = 1;
  private current?: MeltEffect;
  private running = false;
  private prefersReduce = false;

  constructor(
    private registry: Registry,
    private key: MeltKey,
    private onError: (e: unknown) => void,
  ) {}

  private loop: FrameRequestCallback = (now) => {
    if (!this.running || !this.canvas || !this.ctx || !this.current) return;

    try {
      const t = (now - this.t0) / 1000;
      const w = this.canvas.width / this.dpr;
      const h = this.canvas.height / this.dpr;
      this.current.frame(this.ctx, w, h, t);
    } catch (error) {
      this.onError(error);
      this.stop();
      return;
    }

    if (this.running) {
      this.raf = requestAnimationFrame(this.loop);
    }
  };

  mount(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: true }) ?? undefined;
    if (!this.ctx) {
      throw new Error('2D context unavailable');
    }

    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.current = this.registry[this.key];
    if (!this.current) {
      throw new Error(`Unknown Melt effect: ${this.key}`);
    }

    const resize = () => {
      if (!this.canvas || !this.ctx) return;
      const w = Math.max(1, window.innerWidth);
      const h = Math.max(1, window.innerHeight);
      this.canvas.width = Math.ceil(w * this.dpr);
      this.canvas.height = Math.ceil(h * this.dpr);
      this.canvas.style.width = `${w}px`;
      this.canvas.style.height = `${h}px`;
      this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
      this.current?.init?.(this.ctx, w, h);
      if (this.prefersReduce) {
        this.current.frame(this.ctx, w, h, 0);
      }
    };

    const visibility = () => {
      if (document.hidden) this.stop();
      else this.start();
    };

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    this.prefersReduce = reduce.matches;

    const handleReduce = (event: MediaQueryListEvent) => {
      this.prefersReduce = event.matches;
      if (this.prefersReduce) {
        this.stop();
        resize();
      } else {
        this.start();
      }
    };

    resize();
    window.addEventListener('resize', resize, { passive: true });
    document.addEventListener('visibilitychange', visibility);
    if (typeof reduce.addEventListener === 'function') {
      reduce.addEventListener('change', handleReduce);
    } else if (typeof reduce.addListener === 'function') {
      reduce.addListener(handleReduce);
    }

    if (this.prefersReduce) {
      this.running = false;
    } else {
      this.running = true;
      this.t0 = performance.now();
      this.raf = requestAnimationFrame(this.loop);
    }

    return () => {
      this.stop();
      document.removeEventListener('visibilitychange', visibility);
      window.removeEventListener('resize', resize);
      if (typeof reduce.removeEventListener === 'function') {
        reduce.removeEventListener('change', handleReduce);
      } else if (typeof reduce.removeListener === 'function') {
        reduce.removeListener(handleReduce);
      }
      this.current?.dispose?.();
    };
  }

  start() {
    if (!this.canvas || !this.ctx || this.running || this.prefersReduce) return;
    this.running = true;
    this.t0 = performance.now();
    this.raf = requestAnimationFrame(this.loop);
  }

  stop() {
    this.running = false;
    if (this.raf) {
      cancelAnimationFrame(this.raf);
      this.raf = 0;
    }
  }
}
