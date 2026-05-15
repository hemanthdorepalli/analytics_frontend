"use client";
import { useEffect, useRef } from "react";

interface Props {
  labels: string[];
  values: number[];
}

const CSS_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];
const HEX_COLORS = [0x3b82f6, 0x10b981, 0xf59e0b, 0xef4444, 0x8b5cf6];

export function ThreeBarChart({ labels, values }: Props) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current || labels.length === 0) return;

    const el = mountRef.current;
    let animId = 0;
    let cleanup: (() => void) | null = null;
    let mounted = true;

    import("three").then((THREE) => {
      if (!mounted) return;

      const width = el.clientWidth || 600;
      const height = 220;

      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0xf8fafc);

      const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
      camera.position.set(0, 7, 13);
      camera.lookAt(0, 1, 0);

      const renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      el.appendChild(renderer.domElement);

      scene.add(new THREE.AmbientLight(0xffffff, 0.7));
      const dir = new THREE.DirectionalLight(0xffffff, 0.9);
      dir.position.set(5, 10, 7);
      scene.add(dir);

      const maxVal = Math.max(...values, 1);
      const n = labels.length;
      const gap = Math.min(2.0, 14 / Math.max(n, 1));
      const totalW = n * gap;
      const startX = -(totalW / 2) + gap / 2;

      const grid = new THREE.GridHelper(totalW + gap * 1.5, Math.max(n, 2), 0xd1d5db, 0xe5e7eb);
      scene.add(grid);

      const bars = values.map((v, i) => {
        const targetH = Math.max((v / maxVal) * 5, 0.1);
        const geo = new THREE.BoxGeometry(gap * 0.6, targetH, gap * 0.6);
        const mat = new THREE.MeshPhongMaterial({
          color: HEX_COLORS[i % HEX_COLORS.length],
          shininess: 80,
          specular: new THREE.Color(0xffffff),
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(startX + i * gap, 0, 0);
        mesh.scale.y = 0.001;
        mesh.userData.targetH = targetH;
        scene.add(mesh);
        return mesh;
      });

      let frame = 0;
      const animate = () => {
        animId = requestAnimationFrame(animate);
        frame++;
        bars.forEach((bar) => {
          if (bar.scale.y < 1) bar.scale.y = Math.min(bar.scale.y + 0.035, 1);
          bar.position.y = (bar.userData.targetH * bar.scale.y) / 2;
        });
        scene.rotation.y = Math.sin(frame * 0.004) * 0.28;
        renderer.render(scene, camera);
      };
      animate();

      const onResize = () => {
        const w = el.clientWidth || 600;
        camera.aspect = w / height;
        camera.updateProjectionMatrix();
        renderer.setSize(w, height);
      };
      window.addEventListener("resize", onResize);

      cleanup = () => {
        cancelAnimationFrame(animId);
        window.removeEventListener("resize", onResize);
        renderer.dispose();
        if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
      };
    });

    return () => {
      mounted = false;
      cleanup?.();
    };
  }, [labels.join(","), values.join(",")]);

  return (
    <div>
      <div ref={mountRef} className="w-full rounded-lg overflow-hidden" style={{ height: 220 }} />
      <div className="flex flex-wrap gap-3 justify-center mt-3 px-2">
        {labels.map((label, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <div
              className="w-3 h-3 rounded-sm flex-shrink-0"
              style={{ backgroundColor: CSS_COLORS[i % CSS_COLORS.length] }}
            />
            <span className="text-xs text-gray-600 font-medium">{label}</span>
            <span className="text-xs text-gray-400">({values[i]})</span>
          </div>
        ))}
      </div>
    </div>
  );
}
