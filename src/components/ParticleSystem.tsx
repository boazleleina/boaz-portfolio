// @ts-nocheck
'use client';

import { useMemo, useRef, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// ─────────────────────────────────────────────────────────────────────────────
// VERTEX SHADER
// Particles smoothly lerp between portrait positions and scattered cloud.
// They never fall off screen — always visible.
// uDrop = 0 → portrait  |  uDrop = 1 → scattered  |  back to 0 at footer
// ─────────────────────────────────────────────────────────────────────────────
const vertexShader = `
uniform float uDrop;
uniform float uTime;
uniform float uSize;
uniform float uIsDark;
uniform vec3  uMouse;

attribute vec3  color;
attribute vec3  aTarget;   // random scatter target position (within canvas)
attribute float aRandom;   // per-particle random seed
attribute float aIsClothing; // 1.0 if red Maasai Shuka clothing, 0.0 otherwise

varying vec3  vColor;
varying vec3  vPosition;

void main() {
    vColor    = color;

    // Smooth scatter interpolation
    float t = smoothstep(0.0, 1.0, uDrop);

    // Each particle has a slight delay based on its random seed for organic feel
    float tDelayed = smoothstep(aRandom * 0.3, 1.0 - aRandom * 0.1, uDrop);

    vec3 scattered = mix(position, aTarget, tDelayed);

    // Subtle ambient drift — always on, portrait feels alive not static
    vec3 sway = vec3(
        sin(scattered.y * 0.007 + uTime * 0.5 + aRandom * 3.14) * 2.5,
        cos(scattered.x * 0.007 + uTime * 0.4 + aRandom * 2.5)  * 2.0,
        sin(uTime * 0.3  + aRandom * 6.28) * 1.0
    );

    vec3 finalPos = scattered + sway;

    // Displace clothing particles only when mouse hovers near them
    if (aIsClothing > 0.5) {
        float dist = distance(finalPos.xy, uMouse.xy);
        if (dist < 100.0) {
            float force = (1.0 - (dist / 100.0));
            // Push away from mouse
            vec2 dir = normalize(finalPos.xy - uMouse.xy);
            
            // Apply push force + dynamic hover swirl
            finalPos.x += dir.x * force * 35.0 + sin(uTime * 5.0 + aRandom * 6.28) * force * 8.0;
            finalPos.y += dir.y * force * 35.0 + cos(uTime * 5.0 + aRandom * 6.28) * force * 8.0;
            finalPos.z += force * 20.0;
        }
    }

    vPosition = finalPos;

    vec4 mv      = modelViewMatrix * vec4(finalPos, 1.0);
    gl_Position  = projectionMatrix * mv;
    
    // Scale particles 2.5x larger in light mode to fill space on white page
    float sizeMult = mix(2.5, 1.0, uIsDark);
    gl_PointSize = uSize * sizeMult * (300.0 / -mv.z);
}
`;

// ─────────────────────────────────────────────────────────────────────────────
// FRAGMENT SHADER
// ─────────────────────────────────────────────────────────────────────────────
const fragmentShader = `
uniform float uDrop;
uniform float uIsDark;

varying vec3 vColor;
varying vec3 vPosition;

void main() {
    float dist = length(gl_PointCoord - vec2(0.5));
    if (dist > 0.5) discard;

    // Sharper edges in light mode for a clean halftone dot aesthetic
    float edge   = mix(0.2, 0.05, uIsDark);
    float soft   = smoothstep(0.5, edge, dist);

    // When assembled: radial fade gives organic portrait shape
    // When scattered: no fade so all particles stay visible
    float radial = mix(smoothstep(280.0, 120.0, length(vPosition.xy)), 1.0, uDrop);
    float fadeB  = mix(smoothstep(-320.0, -160.0, vPosition.y), 1.0, uDrop);

    float alpha = soft * radial * fadeB;

    // Dark mode: boost colors so they glow on black bg
    // Light mode: use natural/slightly brighter photo colors to fit white theme
    vec3 forDark  = min(vColor * 3.2, 1.0);
    vec3 forLight = min(vColor * 1.1, 1.0);
    vec3 final    = mix(forLight, forDark, uIsDark);

    gl_FragColor = vec4(final, alpha);
}
`;

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function ParticleSystem({ isDark = true }: { isDark?: boolean }) {
  const { gl } = useThree();
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const mouseRef = useRef({ x: -9999, y: -9999, targetX: -9999, targetY: -9999 });

  const [geo, setGeo] = useState<{
    positions: Float32Array;
    colors: Float32Array;
    targets: Float32Array;  // scatter positions (within canvas)
    randoms: Float32Array;
    isClothing: Float32Array;
  } | null>(null);

  // Track window mousemove relative to Canvas bounds to update targets
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const rect = gl.domElement.getBoundingClientRect();
      const xRel = e.clientX - rect.left;
      const yRel = e.clientY - rect.top;
      
      const nx = (xRel / rect.width) * 2 - 1;
      const ny = -(yRel / rect.height) * 2 + 1;
      
      const aspect = rect.width / rect.height;
      // Map canvas NDC coordinates to WebGL units using the camera scale (326.4)
      const wx = nx * 326.4 * aspect;
      const wy = ny * 326.4;
      
      mouseRef.current.targetX = wx;
      mouseRef.current.targetY = wy;
    };

    const handleMouseLeave = () => {
      mouseRef.current.targetX = -9999;
      mouseRef.current.targetY = -9999;
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [gl]);

  // ── Image → Particles ───────────────────────────────────────────────────
  useEffect(() => {
    const img = new Image();
    img.src = isDark ? '/boaz-portrait.jpg' : '/boaz-portrait-light.png';
    img.onload = () => build(img);
    img.onerror = () => {
      const fb = new Image();
      fb.crossOrigin = 'Anonymous';
      fb.src = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&fit=crop';
      fb.onload = () => build(fb);
    };

    function build(image: HTMLImageElement) {
      const cv = document.createElement('canvas');
      const ctx = cv.getContext('2d')!;

      const W = 200;
      cv.width = W;
      cv.height = Math.floor(image.height * (W / image.width));
      ctx.drawImage(image, 0, 0, cv.width, cv.height);

      const px = ctx.getImageData(0, 0, cv.width, cv.height).data;
      const SCALE = 2.8;

      // Scatter bounds — keep particles within the canvas frame
      const BX = cv.width / 2 * SCALE * 0.9;  // ≈±252
      const BY = cv.height / 2 * SCALE * 0.9;

      const pos: number[] = [], col: number[] = [], tgt: number[] = [], rnd: number[] = [], cloth: number[] = [];

      for (let y = 0; y < cv.height; y++) {
        for (let x = 0; x < cv.width; x++) {
          const i = (y * cv.width + x) * 4;
          const r = px[i], g = px[i + 1], b = px[i + 2], a = px[i + 3];

          // Skip transparent background pixels
          if (a < 60) continue;

          // Skip background pixels depending on mode
          if (isDark) {
            // Dark mode: skip dark/black pixels
            if (r < 15 && g < 15 && b < 15) continue;
          } else {
            // Light mode: skip white pixels and light-grey background pixels
            if (r > 190 && g > 190 && b > 190) {
              if (r > 235 && g > 235 && b > 235) continue; // White
              if (r < 228 && g < 228 && b < 228 && Math.abs(r - g) < 12 && Math.abs(r - b) < 12) continue; // Grey background
            }
          }

          pos.push(
            (x - cv.width / 2) * SCALE,
            -(y - cv.height / 2) * SCALE,
            0
          );
          col.push(r / 255, g / 255, b / 255);

          // Random scatter target — bounded within canvas area
          tgt.push(
            (Math.random() * 2 - 1) * BX,
            (Math.random() * 2 - 1) * BY,
            (Math.random() * 2 - 1) * 80
          );

          rnd.push(Math.random());

          // Chroma-key red checks of the Maasai Shuka clothing
          const isRed = (r > 90 && r > g * 1.35 && r > b * 1.35) ? 1.0 : 0.0;
          cloth.push(isRed);
        }
      }

      setGeo({
        positions: new Float32Array(pos),
        colors: new Float32Array(col),
        targets: new Float32Array(tgt),
        randoms: new Float32Array(rnd),
        isClothing: new Float32Array(cloth),
      });
    }
  }, [isDark]);

  // ── SCROLL → uDrop ──────────────────────────────────────────────────────
  // sin(progress × π):  top=0 (portrait) → mid=1 (scattered) → bottom=0 (reformed)
  useEffect(() => {
    if (!materialRef.current) return;

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: document.body,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 2.5,
        onUpdate(self) {
          if (materialRef.current) {
            materialRef.current.uniforms.uDrop.value = Math.sin(self.progress * Math.PI);
          }
        },
      });
    });

    return () => ctx.revert();
  }, [geo]);

  // ── Theme ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (materialRef.current) {
      materialRef.current.uniforms.uIsDark.value = isDark ? 1 : 0;
    }
  }, [isDark]);

  // ── Clock & Smooth Mouse Lerp ───────────────────────────────────────────
  useFrame(({ clock }) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = clock.elapsedTime;

      // Smooth lerp mouse coordinates to eliminate lag
      const m = mouseRef.current;
      m.x += (m.targetX - m.x) * 0.1;
      m.y += (m.targetY - m.y) * 0.1;
      materialRef.current.uniforms.uMouse.value.set(m.x, m.y, 0);
    }
  });

  const uniforms = useMemo(() => ({
    uDrop: { value: 0 },
    uTime: { value: 0 },
    uSize: { value: typeof window !== 'undefined' && window.innerWidth < 768 ? 3.5 : 4.5 },
    uIsDark: { value: isDark ? 1.0 : 0.0 },
    uMouse: { value: new THREE.Vector3(-9999, -9999, 0) },
  }), []);

  if (!geo) return null;

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position"
          count={geo.positions.length / 3} array={geo.positions} itemSize={3} />
        <bufferAttribute attach="attributes-color"
          count={geo.colors.length / 3} array={geo.colors} itemSize={3} />
        <bufferAttribute attach="attributes-aTarget"
          count={geo.targets.length / 3} array={geo.targets} itemSize={3} />
        <bufferAttribute attach="attributes-aRandom"
          count={geo.randoms.length} array={geo.randoms} itemSize={1} />
        <bufferAttribute attach="attributes-aIsClothing"
          count={geo.isClothing.length} array={geo.isClothing} itemSize={1} />
      </bufferGeometry>
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={isDark ? THREE.AdditiveBlending : THREE.NormalBlending}
      />
    </points>
  );
}
