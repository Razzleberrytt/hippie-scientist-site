import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useTrippy } from "../../lib/trippy";

const fragmentShader = `
uniform float uTime;
uniform vec2 uRes;
float noise(vec3 p){
  vec3 ip=floor(p); vec3 u=fract(p); u=u*u*(3.0-2.0*u);
  float res = mix(
    mix(mix(dot(fract(ip+vec3(0,0,0)),u-vec3(0,0,0)),
            dot(fract(ip+vec3(1,0,0)),u-vec3(1,0,0)),u.x),
        mix(dot(fract(ip+vec3(0,1,0)),u-vec3(0,1,0)),
            dot(fract(ip+vec3(1,1,0)),u-vec3(1,1,0)),u.x),u.y),
    mix(mix(dot(fract(ip+vec3(0,0,1)),u-vec3(0,0,1)),
            dot(fract(ip+vec3(1,0,1)),u-vec3(1,0,1)),u.x),
        mix(dot(fract(ip+vec3(0,1,1)),u-vec3(0,1,1)),
            dot(fract(ip+vec3(1,1,1)),u-vec3(1,1,1)),u.x),u.y),u.z);
  return res;
}
float fbm(vec3 p){
  float f=0., a=0.5;
  for(int i=0;i<5;i++){ f+=a*noise(p); p*=2.0; a*=0.5; }
  return f;
}
void main(){
  vec2 uv = (gl_FragCoord.xy / uRes.xy)*2.0-1.0;
  uv.x*=uRes.x/uRes.y;
  vec3 p = vec3(uv*1.25, uTime*0.04);
  float n = fbm(p) * 0.9 + fbm(p*0.5+3.1)*0.6;
  vec3 col = mix(vec3(0.03,0.1,0.2), vec3(0.1,0.6,0.5), n);
  col += 0.25*vec3(0.6,0.2,0.8)*smoothstep(0.3,1.0,n);
  gl_FragColor = vec4(col, 0.85);
}
`;

type AuroraProps = {
  className?: string;
};

export default function Aurora({ className = "" }: AuroraProps) {
  const { trippy, enabled } = useTrippy();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !enabled || !trippy) return undefined;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const geometry = new THREE.PlaneGeometry(2, 2);
    const material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uRes: { value: new THREE.Vector2() },
      },
      fragmentShader,
      vertexShader: "void main(){gl_Position=vec4(position,1.0);}",
      transparent: true,
    });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const resize = () => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      renderer.setSize(width, height, false);
      (material.uniforms.uRes.value as THREE.Vector2).set(width, height);
    };

    const observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(resize) : null;
    if (observer) {
      observer.observe(canvas);
    } else {
      window.addEventListener("resize", resize);
    }
    resize();

    let frame = 0;
    const start = performance.now();
    const renderLoop = () => {
      material.uniforms.uTime.value = (performance.now() - start) / 1000;
      renderer.render(scene, camera);
      frame = requestAnimationFrame(renderLoop);
    };
    renderLoop();

    return () => {
      cancelAnimationFrame(frame);
      observer?.disconnect();
      window.removeEventListener("resize", resize);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, [enabled, trippy]);

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none absolute inset-0 h-full w-full ${trippy && enabled ? "" : "hidden"} ${className}`.trim()}
    />
  );
}

