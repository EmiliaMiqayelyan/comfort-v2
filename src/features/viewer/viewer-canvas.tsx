"use client";

import {
  Component,
  Suspense,
  useLayoutEffect,
  useMemo,
  useRef,
  type ReactNode,
} from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  Center,
  ContactShadows,
  Environment,
  Html,
  Line,
  OrbitControls,
  PerspectiveCamera,
  useGLTF,
} from "@react-three/drei";
import { Box3, Color, Mesh, Vector3, type Group, type Material } from "three";
import { resolveProductModelUrl } from "@/lib/product-model";

type LightingPreset = "studio" | "soft" | "dramatic" | "product";
type EnvironmentPreset = "apartment" | "city" | "warehouse" | "sunset";

interface ViewerCanvasProps {
  modelUrl?: string;
  color: string;
  scale: { h: number; d: number };
  autoRotate: boolean;
  exploded: boolean;
  wireframe: boolean;
  showDimensions: boolean;
  lighting: LightingPreset;
  environment: EnvironmentPreset;
  heightMm: number;
  depthMm: number;
}

const LIGHTING_PRESETS: Record<
  LightingPreset,
  { ambient: number; key: number; fill: number }
> = {
  studio: { ambient: 0.45, key: 1.2, fill: 0.35 },
  soft: { ambient: 0.65, key: 0.75, fill: 0.5 },
  dramatic: { ambient: 0.2, key: 1.6, fill: 0.15 },
  product: { ambient: 0.55, key: 1.0, fill: 0.45 },
};

export function ViewerCanvas({
  modelUrl,
  color,
  scale,
  autoRotate,
  exploded,
  wireframe,
  showDimensions,
  lighting,
  environment,
  heightMm,
  depthMm,
}: ViewerCanvasProps) {
  const resolvedModelUrl = resolveProductModelUrl(modelUrl);

  return (
    <Canvas
      className="h-full w-full"
      style={{ width: "100%", height: "100%", display: "block" }}
      shadows
      dpr={[1, 2]}
      gl={{ preserveDrawingBuffer: true, antialias: true }}
    >
      <PerspectiveCamera makeDefault position={[0.42, 0.2, 0.55]} fov={38} />
      <color attach="background" args={["#E7DFD9"]} />
      <ambientLight intensity={LIGHTING_PRESETS[lighting].ambient} />
      <directionalLight
        castShadow
        position={[3, 4, 2]}
        intensity={LIGHTING_PRESETS[lighting].key}
      />
      <directionalLight
        position={[-2, 1.5, -1]}
        intensity={LIGHTING_PRESETS[lighting].fill}
      />
      <Environment preset={environment} />
      <ContactShadows
        position={[0, 0, 0]}
        opacity={0.35}
        scale={2.2}
        blur={2.4}
        far={1.2}
      />
      <ModelErrorBoundary
        fallback={
          <FallbackProduct
            color={color}
            scale={scale}
            autoRotate={autoRotate}
            wireframe={wireframe}
            showDimensions={showDimensions}
            heightMm={heightMm}
            depthMm={depthMm}
          />
        }
      >
        <Suspense fallback={null}>
          {resolvedModelUrl ? (
            <GltfProduct
              url={resolvedModelUrl}
              color={color}
              scale={scale}
              autoRotate={autoRotate}
              exploded={exploded}
              wireframe={wireframe}
              showDimensions={showDimensions}
              heightMm={heightMm}
              depthMm={depthMm}
            />
          ) : (
            <FallbackProduct
              color={color}
              scale={scale}
              autoRotate={autoRotate}
              wireframe={wireframe}
              showDimensions={showDimensions}
              heightMm={heightMm}
              depthMm={depthMm}
            />
          )}
        </Suspense>
      </ModelErrorBoundary>
      <OrbitControls
        enablePan
        enableZoom
        minDistance={0.22}
        maxDistance={2.4}
        maxPolarAngle={Math.PI / 2.05}
      />
    </Canvas>
  );
}

class ModelErrorBoundary extends Component<
  { fallback: ReactNode; children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

function FallbackProduct({
  color,
  scale,
  autoRotate,
  wireframe,
  showDimensions,
  heightMm,
  depthMm,
}: {
  color: string;
  scale: { h: number; d: number };
  autoRotate: boolean;
  wireframe: boolean;
  showDimensions: boolean;
  heightMm: number;
  depthMm: number;
}) {
  const groupRef = useRef<Group>(null);
  const h = 0.38 * scale.h;
  const d = 0.08 * scale.d;
  const w = 0.42;

  useFrame((_, delta) => {
    if (autoRotate && groupRef.current) {
      groupRef.current.rotation.y += delta * 0.45;
    }
  });

  return (
    <group ref={groupRef}>
      <mesh castShadow receiveShadow position={[0, h / 2, 0]}>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial color={color} wireframe={wireframe} />
      </mesh>
      {showDimensions && (
        <DimensionOverlay heightMm={heightMm} depthMm={depthMm} h={h} d={d} w={w} />
      )}
    </group>
  );
}

function GltfProduct({
  url,
  color,
  scale,
  autoRotate,
  exploded,
  wireframe,
  showDimensions,
  heightMm,
  depthMm,
}: {
  url: string;
  color: string;
  scale: { h: number; d: number };
  autoRotate: boolean;
  exploded: boolean;
  wireframe: boolean;
  showDimensions: boolean;
  heightMm: number;
  depthMm: number;
}) {
  const groupRef = useRef<Group>(null);
  const { scene } = useGLTF(url);
  const instance = useMemo(() => scene.clone(true), [scene]);

  const fit = useMemo(() => {
    const box = new Box3().setFromObject(instance);
    const size = box.getSize(new Vector3());
    const maxDim = Math.max(size.x, size.y, size.z, 0.0001);
    const target = 0.38 * Math.max(scale.h, scale.d, 0.6);
    return {
      s: target / maxDim,
      size,
    };
  }, [instance, scale.d, scale.h]);

  useLayoutEffect(() => {
    let meshIndex = 0;
    instance.traverse((obj) => {
      if (!(obj instanceof Mesh)) return;
      obj.castShadow = true;
      obj.receiveShadow = true;

      if (!obj.userData.restPosition) {
        obj.userData.restPosition = obj.position.clone();
      }
      const rest = obj.userData.restPosition as Vector3;
      if (exploded) {
        obj.position.set(
          rest.x,
          rest.y + meshIndex * 0.018,
          rest.z + (meshIndex % 2 === 0 ? 0.012 : -0.008),
        );
        meshIndex += 1;
      } else {
        obj.position.copy(rest);
      }

      const materials = Array.isArray(obj.material)
        ? obj.material
        : [obj.material];
      for (const mat of materials) {
        applyViewerMaterial(mat, color, wireframe);
      }
    });
  }, [color, exploded, instance, wireframe]);

  useFrame((_, delta) => {
    if (autoRotate && groupRef.current) {
      groupRef.current.rotation.y += delta * 0.45;
    }
  });

  const h = fit.size.y * fit.s;
  const d = fit.size.z * fit.s;
  const w = fit.size.x * fit.s;

  return (
    <group ref={groupRef}>
      <group scale={fit.s}>
        <Center bottom>
          <primitive object={instance} />
        </Center>
      </group>
      {showDimensions && (
        <DimensionOverlay heightMm={heightMm} depthMm={depthMm} h={h} d={d} w={w} />
      )}
    </group>
  );
}

function applyViewerMaterial(
  mat: Material,
  color: string,
  wireframe: boolean,
) {
  if ("wireframe" in mat) {
    (mat as Material & { wireframe: boolean }).wireframe = wireframe;
  }
  if (!("color" in mat) || !mat.color) return;

  const colored = mat as Material & { color: Color };
  if (!mat.userData.baseColor) {
    mat.userData.baseColor = colored.color.clone();
  }
  colored.color.set(color);
}

function DimensionOverlay({
  heightMm,
  depthMm,
  h,
  d,
  w,
}: {
  heightMm: number;
  depthMm: number;
  h: number;
  d: number;
  w: number;
}) {
  const x = w * 0.55;
  const topY = h * 0.95;
  const bottomY = 0;
  const frontZ = d * 0.55;

  return (
    <group>
      <Line
        points={[
          [x, bottomY, frontZ],
          [x, topY, frontZ],
        ]}
        color="#203E4B"
        lineWidth={1.5}
      />
      <Line
        points={[
          [x, bottomY, frontZ],
          [x + 0.06, bottomY, frontZ + 0.06],
        ]}
        color="#203E4B"
        lineWidth={1.5}
      />
      <Line
        points={[
          [x, bottomY, frontZ + 0.06],
          [x + 0.06, bottomY, frontZ + 0.06],
        ]}
        color="#203E4B"
        lineWidth={1.5}
      />

      <Html
        position={[x + 0.04, h * 0.5, frontZ]}
        center
        style={{ pointerEvents: "none" }}
      >
        <span className="glass rounded-full px-2 py-0.5 text-[10px] font-medium text-foreground shadow-soft">
          {heightMm} mm
        </span>
      </Html>

      <Html
        position={[x + 0.08, bottomY + 0.01, frontZ + 0.03]}
        center
        style={{ pointerEvents: "none" }}
      >
        <span className="glass rounded-full px-2 py-0.5 text-[10px] font-medium text-foreground shadow-soft">
          {depthMm} mm
        </span>
      </Html>
    </group>
  );
}
