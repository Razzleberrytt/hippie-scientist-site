import { useEffect, useRef } from "react";
import { useTrippy } from "@/lib/trippy";

const vert = `
attribute vec2 a_pos;
void main(){
  gl_Position = vec4(a_pos, 0.0, 1.0);
}
`;

const frag = `
precision highp float;
uniform vec2 u_res;
uniform float u_time;
uniform float u_intensity;

float hash(vec2 p){
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(vec2 x){
  vec2 i = floor(x);
  vec2 f = fract(x);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

vec3 palette(float t){
  vec3 a = vec3(0.5, 0.5, 0.5);
  vec3 b = vec3(0.5, 0.5, 0.5);
  vec3 c = vec3(1.0, 0.7, 0.9);
  vec3 d = vec3(0.3, 0.20, 0.70);
  return a + b * cos(6.28318 * (c * t + d));
}

void main(){
  vec2 uv = (gl_FragCoord.xy / u_res.xy) * 2.0 - 1.0;
  uv.x *= u_res.x / u_res.y;

  float ang = atan(uv.y, uv.x);
  float rad = length(uv);
  float seg = 6.0 + floor(u_intensity * 6.0);
  ang = mod(ang, 6.28318 / seg);
  float t = u_time * (0.08 + u_intensity * 0.22);

  float n = 0.0;
  vec2 p = vec2(ang * 2.0 + t * 0.6, log(rad + 0.01) * 3.0 - t * 0.8);
  for (int i = 0; i < 4; i++) {
    n += noise(p * 1.7) * 0.6;
    p = p * 1.6 + vec2(0.11, -0.13);
  }
  float v = sin(n * 3.0 + t * 2.0 + rad * 8.0);
  vec3 col = palette(v * 0.25 + n * 0.25 + t * 0.1);

  float vig = smoothstep(1.2, 0.2, rad);
  col *= mix(0.65, 1.2, vig);

  float split = 0.003 + u_intensity * 0.006;
  col = vec3(
    palette(v * 0.25 + n * 0.25 + t * 0.1 + split).r,
    palette(v * 0.25 + n * 0.25 + t * 0.1).g,
    palette(v * 0.25 + n * 0.25 + t * 0.1 - split).b
  );

  float alpha = mix(0.16, 0.33, u_intensity);
  gl_FragColor = vec4(col, alpha);
}
`;

const intensityForLevel = {
  calm: 0.25,
  trippy: 0.6,
  melt: 1,
} as const;

export default function TrippyShader() {
  const { level } = useTrippy();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const clear = () => {
      const context = canvas.getContext("webgl");
      if (context) {
        context.clearColor(0, 0, 0, 0);
        context.clear(context.COLOR_BUFFER_BIT);
      }
    };

    if (level === "off") {
      clear();
      return;
    }

    const gl = canvas.getContext("webgl", { premultipliedAlpha: true, antialias: false });
    if (!gl) return;

    const DPR = Math.min(window.devicePixelRatio || 1, 1.5);
    let width = 0;
    let height = 0;
    let raf = 0;
    let stopped = false;
    let lastFrame = 0;

    const makeShader = (type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) throw new Error("shader");
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        const info = gl.getShaderInfoLog(shader);
        gl.deleteShader(shader);
        throw new Error(info || "shader compile error");
      }
      return shader;
    };

    const vertShader = makeShader(gl.VERTEX_SHADER, vert);
    const fragShader = makeShader(gl.FRAGMENT_SHADER, frag);
    const program = gl.createProgram();
    if (!program) {
      gl.deleteShader(vertShader);
      gl.deleteShader(fragShader);
      return;
    }

    gl.attachShader(program, vertShader);
    gl.attachShader(program, fragShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      const info = gl.getProgramInfoLog(program) || "program link error";
      gl.deleteProgram(program);
      gl.deleteShader(vertShader);
      gl.deleteShader(fragShader);
      throw new Error(info);
    }

    gl.useProgram(program);

    const buffer = gl.createBuffer();
    if (!buffer) {
      gl.deleteProgram(program);
      gl.deleteShader(vertShader);
      gl.deleteShader(fragShader);
      return;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, "a_pos");
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(program, "u_res");
    const uTime = gl.getUniformLocation(program, "u_time");
    const uIntensity = gl.getUniformLocation(program, "u_intensity");
    const intensity = intensityForLevel[level] ?? 0.25;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const nextWidth = Math.max(1, Math.floor(rect.width * DPR));
      const nextHeight = Math.max(1, Math.floor(rect.height * DPR));
      if (nextWidth !== width || nextHeight !== height) {
        width = nextWidth;
        height = nextHeight;
        canvas.width = nextWidth;
        canvas.height = nextHeight;
        gl.viewport(0, 0, nextWidth, nextHeight);
      }
    };

    const draw = (time: number) => {
      if (stopped) return;
      if (time - lastFrame < 22) {
        raf = requestAnimationFrame(draw);
        return;
      }
      lastFrame = time;
      resize();
      gl.uniform2f(uRes, width, height);
      gl.uniform1f(uTime, time / 1000);
      gl.uniform1f(uIntensity, intensity);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      raf = requestAnimationFrame(draw);
    };

    const handleVisibility = () => {
      if (document.hidden) {
        stopped = true;
        cancelAnimationFrame(raf);
      } else {
        if (!stopped) return;
        stopped = false;
        lastFrame = 0;
        raf = requestAnimationFrame(draw);
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);

    resize();
    if (!document.hidden) {
      raf = requestAnimationFrame(draw);
    } else {
      stopped = true;
    }

    return () => {
      stopped = true;
      cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", handleVisibility);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.deleteShader(vertShader);
      gl.deleteShader(fragShader);
      clear();
    };
  }, [level]);

  return <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 -z-10" />;
}
