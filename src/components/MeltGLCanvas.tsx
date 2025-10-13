import { useEffect, useRef } from "react";
import type { MeltPalette, MeltIntensity } from "@/melt/useMelt";

/** Palettes as RGB uniforms (0..1) */
const PALETTES: Record<MeltPalette, [number, number, number][]> = {
  ocean:    [[0.00, 0.82, 1.00], [0.00, 0.40, 1.00], [0.00, 1.00, 0.65]],
  amethyst: [[0.70, 0.53, 1.00], [0.54, 0.31, 1.00], [1.00, 0.00, 0.85]],
  aura:     [[0.00, 1.00, 0.65], [0.20, 0.87, 1.00], [1.00, 0.40, 1.00]],
  forest:   [[0.49, 0.94, 0.63], [0.12, 0.67, 0.35], [0.00, 1.00, 0.70]],
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
  col *= v;

  gl_FragColor = vec4(col, u_alpha);
}
`;

export default function MeltGLCanvas({
  enabled,
  palette,
  intensity,
}: {
  enabled: boolean;
  palette: MeltPalette;
  intensity: MeltIntensity;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Try WebGL; if not, fall back to clear canvas (no crash)
    const gl =
      (canvas.getContext("webgl", { premultipliedAlpha: true, alpha: true }) ||
        canvas.getContext("experimental-webgl")) as WebGLRenderingContext | null;

    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const fit = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      if (gl) gl.viewport(0, 0, canvas.width, canvas.height);
    };
    fit();
    window.addEventListener("resize", fit);

    if (!gl) {
      // graceful fallback
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
      return () => window.removeEventListener("resize", fit);
    }

    // Compile shader helpers
    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        console.error("Shader error:", gl.getShaderInfoLog(s));
      }
      return s;
    };

    const vert = compile(gl.VERTEX_SHADER, VERT);
    const frag = compile(gl.FRAGMENT_SHADER, FRAG);
    const prog = gl.createProgram()!;
    gl.attachShader(prog, vert);
    gl.attachShader(prog, frag);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.error("Link error:", gl.getProgramInfoLog(prog));
    }
    gl.useProgram(prog);

    // Quad
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    );
    const aPos = gl.getAttribLocation(prog, "a_pos");
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aPos);

    // Uniforms
    const uRes = gl.getUniformLocation(prog, "u_res");
    const uTime = gl.getUniformLocation(prog, "u_time");
    const uSpeed = gl.getUniformLocation(prog, "u_speed");
    const uC0 = gl.getUniformLocation(prog, "u_c0");
    const uC1 = gl.getUniformLocation(prog, "u_c1");
    const uC2 = gl.getUniformLocation(prog, "u_c2");
    const uAlpha = gl.getUniformLocation(prog, "u_alpha");

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

      const t = (now - start) / 1000; // seconds
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, t);
      gl.uniform1f(uSpeed, speed);
      gl.uniform3f(uC0, ...paletteRGB[0]);
      gl.uniform3f(uC1, ...paletteRGB[1]);
      gl.uniform3f(uC2, ...paletteRGB[2]);
      gl.uniform1f(uAlpha, 0.85); // global opacity

      gl.drawArrays(gl.TRIANGLES, 0, 6);
      raf.current = requestAnimationFrame(render);
    };

    raf.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("resize", fit);
      if (raf.current) cancelAnimationFrame(raf.current);
      gl.deleteProgram(prog);
      gl.deleteBuffer(buf);
      gl.deleteShader(vert);
      gl.deleteShader(frag);
    };
  }, [enabled, palette, intensity]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10 pointer-events-none transition-opacity duration-700"
      style={{ opacity: enabled ? 1 : 0 }}
    />
  );
}
