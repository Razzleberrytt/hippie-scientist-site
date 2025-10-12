import { useEffect, useMemo, useRef } from "react";
import type { MeltIntensity, MeltPalette } from "@/state/melt";

const FRAG = `
precision highp float;
uniform vec2 u_res;
uniform float u_time;
uniform int u_palette;
uniform float u_gain;

float hash(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453123); }
float noise(vec2 p){
  vec2 i=floor(p), f=fract(p);
  float a=hash(i), b=hash(i+vec2(1.,0.)), c=hash(i+vec2(0.,1.)), d=hash(i+1.);
  vec2 u=f*f*(3.-2.*f);
  return mix(a,b,u.x)+ (c-a)*u.y*(1.-u.x) + (d-b)*u.x*u.y;
}
float fbm(vec2 p){
  float v=0., a=.5;
  for(int i=0;i<5;i++){ v+=a*noise(p); p*=2.02; a*=.5; }
  return v;
}
vec3 palette(int idx, float t){
  if(idx==0){
    return mix(vec3(0.05,0.35,0.30), vec3(0.10,0.75,0.85), t);
  }else if(idx==1){
    return mix(vec3(0.02,0.20,0.28), vec3(0.15,0.35,0.95), t);
  }else if(idx==2){
    return mix(vec3(0.24,0.10,0.40), vec3(0.95,0.25,0.65), t);
  }
  return mix(vec3(0.02,0.10,0.06), vec3(0.20,0.85,0.55), t);
}
void main(){
  vec2 uv = (gl_FragCoord.xy / u_res.xy);
  vec2 p = (uv - .5) * vec2(u_res.x/u_res.y, 1.0);
  float t = u_time*0.06;
  float n1 = fbm(p*1.6 + t);
  float n2 = fbm(p*3.2 - t*1.2 + n1);
  float mask = smoothstep(0.25, 0.95, n2);
  vec3 col = palette(u_palette, mask);
  float r = fbm(p*2.4 + t*1.3);
  float g = fbm(p*2.4 + t*1.0 + 3.14);
  float b = fbm(p*2.4 + t*0.7 + 6.28);
  col += 0.12*vec3(r,g,b);
  float v = smoothstep(1.2, 0.2, length(p));
  col *= v;
  col = mix(vec3(0.04, 0.05, 0.08), col, u_gain);
  gl_FragColor = vec4(col, 1.0);
}
`;

const paletteLookup: Record<MeltPalette, number> = {
  aura: 0,
  ocean: 1,
  amethyst: 2,
  forest: 3,
};

const gainLookup: Record<MeltIntensity, number> = {
  low: 0.75,
  med: 1.0,
  high: 1.25,
};

const speedLookup: Record<MeltIntensity, number> = {
  low: 0.15,
  med: 0.28,
  high: 0.45,
};

type MeltCanvasProps = {
  intensity?: MeltIntensity;
  palette?: MeltPalette;
  active?: boolean;
};

export function MeltCanvas({
  intensity = "med",
  palette = "ocean",
  active = true,
}: MeltCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const paletteId = useMemo(() => paletteLookup[palette], [palette]);
  const gain = useMemo(() => gainLookup[intensity], [intensity]);
  const speed = useMemo(() => speedLookup[intensity], [intensity]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (typeof window === "undefined" || typeof document === "undefined") return;
    if (!active) {
      return;
    }

    const reduceMotion =
      typeof window.matchMedia === "function"
        ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
        : false;
    if (reduceMotion) {
      return;
    }

    const gl = canvas.getContext("webgl", {
      antialias: false,
      depth: false,
      stencil: false,
      premultipliedAlpha: true,
      preserveDrawingBuffer: false,
    });

    if (!gl) {
      return;
    }

    const pxRatio = Math.min(2, window.devicePixelRatio || 1);

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const width = Math.max(1, Math.floor(rect.width * pxRatio));
      const height = Math.max(1, Math.floor(rect.height * pxRatio));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        gl.viewport(0, 0, width, height);
      }
    };

    const vs = gl.createShader(gl.VERTEX_SHADER);
    const fs = gl.createShader(gl.FRAGMENT_SHADER);
    if (!vs || !fs) {
      return;
    }

    gl.shaderSource(vs, "attribute vec2 p; void main(){ gl_Position=vec4(p,0.,1.); }");
    gl.compileShader(vs);
    gl.shaderSource(fs, FRAG);
    gl.compileShader(fs);

    if (!gl.getShaderParameter(vs, gl.COMPILE_STATUS) || !gl.getShaderParameter(fs, gl.COMPILE_STATUS)) {
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      return;
    }

    const program = gl.createProgram();
    if (!program) {
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      return;
    }

    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      return;
    }

    gl.useProgram(program);

    const buffer = gl.createBuffer();
    if (!buffer) {
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      return;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);

    const positionLocation = gl.getAttribLocation(program, "p");
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(program, "u_res");
    const uTime = gl.getUniformLocation(program, "u_time");
    const uPalette = gl.getUniformLocation(program, "u_palette");
    const uGain = gl.getUniformLocation(program, "u_gain");

    let animationFrame = 0;
    const start = performance.now();

    const draw = (now: number) => {
      animationFrame = window.requestAnimationFrame(draw);
      const time = ((now - start) / 1000) * speed;
      if (uRes) {
        gl.uniform2f(uRes, canvas.width, canvas.height);
      }
      if (uTime) {
        gl.uniform1f(uTime, time);
      }
      if (uPalette) {
        gl.uniform1i(uPalette, paletteId);
      }
      if (uGain) {
        gl.uniform1f(uGain, gain);
      }
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };

    resize();
    const resizeObserver = typeof ResizeObserver !== "undefined" ? new ResizeObserver(resize) : null;
    resizeObserver?.observe(canvas);
    window.addEventListener("resize", resize);
    animationFrame = window.requestAnimationFrame(draw);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", resize);
      resizeObserver?.disconnect();
      const lose = gl.getExtension("WEBGL_lose_context");
      lose?.loseContext();
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
    };
  }, [active, gain, paletteId, speed]);

  return (
    <div className="pointer-events-none fixed inset-0 z-0">
      <canvas
        ref={canvasRef}
        className="h-full w-full"
        style={{
          background:
            "radial-gradient(1200px 600px at 20% 20%, rgba(87,164,255,.25), transparent 60%), radial-gradient(1200px 700px at 80% 80%, rgba(255,130,220,.18), transparent 65%), linear-gradient(180deg, #0b0f14 0%, #0a0d12 100%)",
          display: "block",
        }}
        aria-hidden
      />
    </div>
  );
}
