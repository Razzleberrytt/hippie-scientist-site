import { useEffect, useRef } from "react";
import { useMelt, type MeltIntensity, type MeltPalette } from "@/melt/useMelt";

/** Palettes as RGB uniforms (0..1) */
const PALETTES: Record<MeltPalette, [number, number, number][]> = {
  ocean: [[0.0, 0.82, 1.0], [0.0, 0.4, 1.0], [0.0, 1.0, 0.65]],
  amethyst: [[0.7, 0.53, 1.0], [0.54, 0.31, 1.0], [1.0, 0.0, 0.85]],
  aura: [[0.0, 1.0, 0.65], [0.2, 0.87, 1.0], [1.0, 0.4, 1.0]],
  forest: [[0.49, 0.94, 0.63], [0.12, 0.67, 0.35], [0.0, 1.0, 0.7]],
};

const SPEED: Record<MeltIntensity, number> = { low: 0.35, med: 0.75, high: 1.4 };

/** Minimal passthrough vertex shader */
const VERT = `
attribute vec2 a_pos;
void main() {
  gl_Position = vec4(a_pos, 0.0, 1.0);
}
`;

/** Fragment shader: aurora / plasma with fbm + domain warp. */
const FRAG = `
precision highp float;

uniform vec2  u_res;      // viewport
uniform float u_time;     // seconds
uniform float u_speed;    // 0.3..1.5
uniform vec3  u_c0;       // palette color 0
uniform vec3  u_c1;       // palette color 1
uniform vec3  u_c2;       // palette color 2
uniform float u_alpha;    // global alpha

// hash + noise helpers
float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  vec2 u = f*f*(3.0-2.0*f);
  return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  mat2 m = mat2(1.6,1.2,-1.2,1.6);
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p = m * p;
    a *= 0.5;
  }
  return v;
}

void main(){
  vec2 uv = gl_FragCoord.xy / u_res.xy;
  vec2 p  = (uv - 0.5);
  p.x *= u_res.x / u_res.y;

  // Domain warp for organic flow
  float t = u_time * u_speed;
  vec2 q = p;
  q += 0.25 * vec2(fbm(p*1.2 + vec2(0.0, t*0.15)),
                   fbm(p*1.2 + vec2(t*0.1, 0.0)));

  float n = fbm(q*2.0 + t*0.05);
  float m = fbm(q*4.0 - t*0.03);
  float mask = smoothstep(0.3, 0.9, n + m*0.6);

  // Color blend
  vec3 col = mix(u_c0, u_c1, clamp(n, 0.0, 1.0));
  col = mix(col, u_c2, clamp(m, 0.0, 1.0));

  // subtle vignette
  float v = smoothstep(0.95, 0.2, length(p)*1.2);
  col *= v * mask;

  gl_FragColor = vec4(col, u_alpha);
}
`;

type Props = {
  enabled?: boolean;
  palette?: MeltPalette;
  intensity?: MeltIntensity;
};

export default function MeltGLCanvas({ enabled: propEnabled, palette: propPalette, intensity: propIntensity }: Props) {
  const storeEnabled = useMelt((state) => state.enabled);
  const storePalette = useMelt((state) => state.palette);
  const storeIntensity = useMelt((state) => state.intensity);

  const enabled = propEnabled ?? storeEnabled;
  const palette = propPalette ?? storePalette;
  const intensity = propIntensity ?? storeIntensity;

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl =
      (canvas.getContext("webgl2", { premultipliedAlpha: true, alpha: true }) ||
        canvas.getContext("webgl", { premultipliedAlpha: true, alpha: true }) ||
        canvas.getContext("experimental-webgl")) as WebGLRenderingContext | null;

    const fit = () => {
      const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
      const width = Math.ceil(window.innerWidth * dpr);
      const height = Math.ceil(window.innerHeight * dpr);
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      if (gl) gl.viewport(0, 0, canvas.width, canvas.height);
    };

    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(document.documentElement);
    window.addEventListener("resize", fit);
    window.addEventListener("orientationchange", fit);

    if (!gl) {
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
      return () => {
        observer.disconnect();
        window.removeEventListener("resize", fit);
        window.removeEventListener("orientationchange", fit);
      };
    }

    const compile = (type: number, source: string) => {
      const shader = gl.createShader(type)!;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error("Shader error:", gl.getShaderInfoLog(shader));
      }
      return shader;
    };

    const vert = compile(gl.VERTEX_SHADER, VERT);
    const frag = compile(gl.FRAGMENT_SHADER, FRAG);
    const program = gl.createProgram()!;
    gl.attachShader(program, vert);
    gl.attachShader(program, frag);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error("Link error:", gl.getProgramInfoLog(program));
    }
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW,
    );
    const aPos = gl.getAttribLocation(program, "a_pos");
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aPos);

    const uRes = gl.getUniformLocation(program, "u_res");
    const uTime = gl.getUniformLocation(program, "u_time");
    const uSpeed = gl.getUniformLocation(program, "u_speed");
    const uC0 = gl.getUniformLocation(program, "u_c0");
    const uC1 = gl.getUniformLocation(program, "u_c1");
    const uC2 = gl.getUniformLocation(program, "u_c2");
    const uAlpha = gl.getUniformLocation(program, "u_alpha");

    const paletteRGB = PALETTES[palette] || PALETTES.ocean;
    const speed = SPEED[intensity];

    let start = performance.now();
    const render = (now: number) => {
      if (!enabled) {
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        raf.current = requestAnimationFrame(render);
        return;
      }

      const t = (now - start) / 1000;
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, t);
      gl.uniform1f(uSpeed, speed);
      gl.uniform3f(uC0, ...paletteRGB[0]);
      gl.uniform3f(uC1, ...paletteRGB[1]);
      gl.uniform3f(uC2, ...paletteRGB[2]);
      gl.uniform1f(uAlpha, 0.85);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
      raf.current = requestAnimationFrame(render);
    };

    raf.current = requestAnimationFrame(render);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", fit);
      window.removeEventListener("orientationchange", fit);
      if (raf.current) cancelAnimationFrame(raf.current);
      gl.deleteProgram(program);
      gl.deleteBuffer(buffer);
      gl.deleteShader(vert);
      gl.deleteShader(frag);
    };
  }, [enabled, intensity, palette]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 -z-10 block h-[100svh] w-[100vw] transition-opacity duration-700"
      style={{ opacity: enabled ? 1 : 0, background: "transparent" }}
      aria-hidden="true"
    />
  );
}
