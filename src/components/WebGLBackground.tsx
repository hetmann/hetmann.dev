import { Canvas, useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';

const sectionMap: Record<string, number> = {
  top: 0,
  work: 0.2,
  capabilities: 0.4,
  about: 0.6,
  process: 0.8,
  contact: 1,
};

type LineMover = {
  horizontal: boolean;
  lineIndex: number;
  phase: number;
  speed: number;
  direction: number;
};

const GRID_COLUMNS = 24;
const GRID_ROWS = 14;
const GRID_SPACING = 0.96;
const GRID_WIDTH = (GRID_COLUMNS - 1) * GRID_SPACING;
const GRID_HEIGHT = (GRID_ROWS - 1) * GRID_SPACING;
const GRID_Z = -0.52;
const GRID_SEGMENTS = 28;

function useReducedMotion() {
  return useMemo(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches, []);
}

function usePageProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const update = () => {
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      setProgress(Math.min(1, Math.max(0, window.scrollY / max)));
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  return progress;
}

function makeGridLines() {
  const lines: number[] = [];

  for (let column = 0; column < GRID_COLUMNS; column += 1) {
    const x = (column - (GRID_COLUMNS - 1) / 2) * GRID_SPACING;
    for (let segment = 0; segment < GRID_SEGMENTS; segment += 1) {
      const y1 = -GRID_HEIGHT / 2 + (segment / GRID_SEGMENTS) * GRID_HEIGHT;
      const y2 = -GRID_HEIGHT / 2 + ((segment + 1) / GRID_SEGMENTS) * GRID_HEIGHT;
      lines.push(x, y1, GRID_Z, x, y2, GRID_Z);
    }
  }

  for (let row = 0; row < GRID_ROWS; row += 1) {
    const y = (row - (GRID_ROWS - 1) / 2) * GRID_SPACING;
    for (let segment = 0; segment < GRID_SEGMENTS; segment += 1) {
      const x1 = -GRID_WIDTH / 2 + (segment / GRID_SEGMENTS) * GRID_WIDTH;
      const x2 = -GRID_WIDTH / 2 + ((segment + 1) / GRID_SEGMENTS) * GRID_WIDTH;
      lines.push(x1, y, GRID_Z, x2, y, GRID_Z);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(lines, 3));
  return geometry;
}

function applyGravityWell(
  positions: THREE.BufferAttribute,
  base: ArrayLike<number>,
  active: boolean,
  pointerX: number,
  pointerY: number,
  strength: number,
  radius: number,
) {
  for (let i = 0; i < positions.array.length; i += 3) {
    const x = base[i];
    const y = base[i + 1];
    let nextX = x;
    let nextY = y;
    let nextZ = base[i + 2];

    if (active) {
      const dx = pointerX - x;
      const dy = pointerY - y;
      const distance = Math.hypot(dx, dy);
      if (distance < radius) {
        const falloff = 1 - distance / radius;
        const pull = falloff * falloff * strength;
        nextX = x + dx * pull;
        nextY = y + dy * pull;
        nextZ = base[i + 2] + falloff * 0.08;
      }
    }

    positions.array[i] = nextX;
    positions.array[i + 1] = nextY;
    positions.array[i + 2] = nextZ;
  }
  positions.needsUpdate = true;
}

function applyWarpHighlight(
  positions: THREE.BufferAttribute,
  base: ArrayLike<number>,
  active: boolean,
  pointerX: number,
  pointerY: number,
  nearestColumn: number,
  nearestRow: number,
) {
  const radius = GRID_SPACING * 3.1;
  const strength = 0.28;

  for (let i = 0; i < positions.array.length; i += 6) {
    let visible = false;
    let strong = false;

    for (let point = 0; point < 2; point += 1) {
      const offset = i + point * 3;
      const x = base[offset];
      const y = base[offset + 1];
      const distance = Math.hypot(pointerX - x, pointerY - y);
      const vertexIndex = offset / 3;
      const verticalLineCount = GRID_COLUMNS * GRID_SEGMENTS * 2;
      const lineIndex =
        vertexIndex < verticalLineCount
          ? Math.floor(vertexIndex / (GRID_SEGMENTS * 2))
          : Math.floor((vertexIndex - verticalLineCount) / (GRID_SEGMENTS * 2));
      const isVertical = vertexIndex < verticalLineCount;

      visible ||= active && distance < radius;
      strong ||= active && ((isVertical && lineIndex === nearestColumn) || (!isVertical && lineIndex === nearestRow));
    }

    for (let point = 0; point < 2; point += 1) {
      const offset = i + point * 3;
      const x = base[offset];
      const y = base[offset + 1];
      let nextX = 999;
      let nextY = 999;
      let nextZ = GRID_Z + 0.025;

      if (visible) {
        const dx = pointerX - x;
        const dy = pointerY - y;
        const distance = Math.hypot(dx, dy);
        const falloff = Math.max(0, 1 - distance / radius);
        const pull = falloff * falloff * strength;
        nextX = x + dx * pull;
        nextY = y + dy * pull;
        nextZ = GRID_Z + 0.025 + falloff * 0.08 + (strong ? 0.015 : 0);
      }

      positions.array[offset] = nextX;
      positions.array[offset + 1] = nextY;
      positions.array[offset + 2] = nextZ;
    }
  }
  positions.needsUpdate = true;
}

function makeIntersectionDots() {
  const positions: number[] = [];
  const colors: number[] = [];

  for (let row = 0; row < GRID_ROWS; row += 1) {
    for (let column = 0; column < GRID_COLUMNS; column += 1) {
      const x = (column - (GRID_COLUMNS - 1) / 2) * GRID_SPACING;
      const y = (row - (GRID_ROWS - 1) / 2) * GRID_SPACING;

      positions.push(x, y, GRID_Z);
      colors.push(0.8, 0.8, 0.8);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  return geometry;
}

function makeMovingDots(count: number) {
  const positions: number[] = [];
  const movers: LineMover[] = [];

  for (let i = 0; i < count; i += 1) {
    const horizontal = Math.random() > 0.38;
    const lineIndex = horizontal
      ? Math.floor(Math.random() * GRID_ROWS)
      : Math.floor(Math.random() * GRID_COLUMNS);
    const phase = Math.random();
    const speed = 0.035 + Math.random() * 0.105;
    const direction = Math.random() > 0.5 ? 1 : -1;

    movers.push({ horizontal, lineIndex, phase, speed, direction });
    positions.push(0, 0, GRID_Z);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  return { geometry, movers };
}

function makeHitDots(maxHits: number) {
  const positions: number[] = [];
  for (let i = 0; i < maxHits; i += 1) {
    positions.push(999, 999, GRID_Z);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  return geometry;
}

function makeDotTexture() {
  const size = 96;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext('2d');
  if (!context) return undefined;

  const gradient = context.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, 'rgba(255,255,255,1)');
  gradient.addColorStop(0.28, 'rgba(255,255,255,0.72)');
  gradient.addColorStop(0.62, 'rgba(255,255,255,0.18)');
  gradient.addColorStop(1, 'rgba(255,255,255,0)');
  context.fillStyle = gradient;
  context.fillRect(0, 0, size, size);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

function GridField({ activeSection }: { activeSection: string }) {
  const group = useRef<THREE.Group>(null);
  const intersectionsRef = useRef<THREE.Points>(null);
  const moversRef = useRef<THREE.Points>(null);
  const hitDotsRef = useRef<THREE.Points>(null);
  const warpHighlightRef = useRef<THREE.LineSegments>(null);
  const pointerRef = useRef({ x: 0, y: 0, active: false });
  const localPointerRef = useRef({ x: 0, y: 0, inside: false, column: 0, row: 0 });
  const rayRef = useRef(new THREE.Ray());
  const planeRef = useRef(new THREE.Plane(new THREE.Vector3(0, 0, 1), 0));
  const pointerPointRef = useRef(new THREE.Vector3());
  const reducedMotion = useReducedMotion();
  const scrollProgress = usePageProgress();
  const target = sectionMap[activeSection] ?? 0;
  const gridLines = useMemo(() => makeGridLines(), []);
  const warpHighlightLines = useMemo(() => makeGridLines(), []);
  const intersections = useMemo(() => makeIntersectionDots(), []);
  const baseGridPositions = useMemo(
    () => (gridLines.getAttribute('position') as THREE.BufferAttribute).array.slice(),
    [gridLines],
  );
  const baseIntersectionPositions = useMemo(
    () => (intersections.getAttribute('position') as THREE.BufferAttribute).array.slice(),
    [intersections],
  );
  const movers = useMemo(() => makeMovingDots(18), []);
  const hitDots = useMemo(() => makeHitDots(42), []);
  const dotTexture = useMemo(() => makeDotTexture(), []);

  useEffect(() => {
    const move = (event: PointerEvent) => {
      pointerRef.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointerRef.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
      pointerRef.current.active = true;
    };
    const leave = () => {
      pointerRef.current.active = false;
    };
    window.addEventListener('pointermove', move, { passive: true });
    window.addEventListener('pointerleave', leave);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerleave', leave);
    };
  }, []);

  useFrame(({ clock, camera }) => {
    const elapsed = reducedMotion ? 0 : clock.getElapsedTime();
    const progress = reducedMotion ? target : Math.max(target, scrollProgress);

    camera.position.set(-0.35 + progress * 0.75, 0.18 - progress * 0.1, 10.2 - progress * 0.8);
    camera.lookAt(0.8 + progress * 0.35, -0.04, -3.3);

    if (group.current) {
      group.current.position.x = 1.35 - progress * 0.55;
      group.current.position.y = Math.sin(elapsed * 0.12) * 0.04;
    }

    if (group.current) {
      const gridPlaneZ = group.current.position.z + GRID_Z * group.current.scale.z;
      planeRef.current.set(new THREE.Vector3(0, 0, 1), -gridPlaneZ);
      rayRef.current.origin.copy(camera.position);
      rayRef.current.direction
        .set(pointerRef.current.x, pointerRef.current.y, 0.5)
        .unproject(camera)
        .sub(camera.position)
        .normalize();

      const hit = pointerRef.current.active && rayRef.current.intersectPlane(planeRef.current, pointerPointRef.current);
      if (hit) {
        const localX = (pointerPointRef.current.x - group.current.position.x) / group.current.scale.x;
        const localY = (pointerPointRef.current.y - group.current.position.y) / group.current.scale.y;
        const column = Math.round(localX / GRID_SPACING + (GRID_COLUMNS - 1) / 2);
        const row = Math.round(localY / GRID_SPACING + (GRID_ROWS - 1) / 2);
        const inside = column >= 0 && column < GRID_COLUMNS && row >= 0 && row < GRID_ROWS;

        if (inside) {
          localPointerRef.current.x = localX;
          localPointerRef.current.y = localY;
          localPointerRef.current.inside = true;
          localPointerRef.current.column = column;
          localPointerRef.current.row = row;
        } else {
          localPointerRef.current.inside = false;
        }
      } else {
        localPointerRef.current.inside = false;
      }
    }

    if (intersectionsRef.current) {
      applyGravityWell(
        intersectionsRef.current.geometry.getAttribute('position') as THREE.BufferAttribute,
        baseIntersectionPositions,
        localPointerRef.current.inside,
        localPointerRef.current.x,
        localPointerRef.current.y,
        0.16,
        GRID_SPACING * 2.7,
      );
    }

    applyGravityWell(
      gridLines.getAttribute('position') as THREE.BufferAttribute,
      baseGridPositions,
      localPointerRef.current.inside,
      localPointerRef.current.x,
      localPointerRef.current.y,
      0.28,
      GRID_SPACING * 3.1,
    );

    if (warpHighlightRef.current) {
      applyWarpHighlight(
        warpHighlightRef.current.geometry.getAttribute('position') as THREE.BufferAttribute,
        baseGridPositions,
        localPointerRef.current.inside,
        localPointerRef.current.x,
        localPointerRef.current.y,
        localPointerRef.current.column,
        localPointerRef.current.row,
      );
      const material = warpHighlightRef.current.material as THREE.LineBasicMaterial;
      material.opacity = localPointerRef.current.inside ? 0.62 : 0;
    }

    const hitIntersections = new Set<number>();

    if (moversRef.current) {
      const positions = moversRef.current.geometry.getAttribute('position') as THREE.BufferAttribute;
      movers.movers.forEach((mover, index) => {
        const i = index * 3;
        const wrapped = (mover.phase + elapsed * mover.speed * mover.direction + 1000) % 1;
        if (mover.horizontal) {
          const y = (mover.lineIndex - (GRID_ROWS - 1) / 2) * GRID_SPACING;
          const columnProgress = wrapped * (GRID_COLUMNS - 1);
          const column = Math.round(columnProgress);
          positions.array[i] = -GRID_WIDTH / 2 + wrapped * GRID_WIDTH;
          positions.array[i + 1] = y;
          if (Math.abs(columnProgress - column) < 0.045) {
            hitIntersections.add(mover.lineIndex * GRID_COLUMNS + column);
          }
        } else {
          const x = (mover.lineIndex - (GRID_COLUMNS - 1) / 2) * GRID_SPACING;
          const rowProgress = wrapped * (GRID_ROWS - 1);
          const row = Math.round(rowProgress);
          positions.array[i] = x;
          positions.array[i + 1] = -GRID_HEIGHT / 2 + wrapped * GRID_HEIGHT;
          if (Math.abs(rowProgress - row) < 0.045) {
            hitIntersections.add(row * GRID_COLUMNS + mover.lineIndex);
          }
        }
        positions.array[i + 2] = GRID_Z;
      });
      positions.needsUpdate = true;
    }

    if (intersectionsRef.current) {
      const colors = intersectionsRef.current.geometry.getAttribute('color') as THREE.BufferAttribute;
      for (let index = 0; index < GRID_COLUMNS * GRID_ROWS; index += 1) {
        const i = index * 3;
        const brightness = hitIntersections.has(index) ? 1 : 0.8;
        colors.array[i] = brightness;
        colors.array[i + 1] = brightness;
        colors.array[i + 2] = brightness;
      }
      colors.needsUpdate = true;
    }

    if (hitDotsRef.current) {
      const positions = hitDotsRef.current.geometry.getAttribute('position') as THREE.BufferAttribute;
      let slot = 0;
      hitIntersections.forEach((index) => {
        if (slot >= movers.movers.length) return;
        const row = Math.floor(index / GRID_COLUMNS);
        const column = index % GRID_COLUMNS;
        const i = slot * 3;
        positions.array[i] = (column - (GRID_COLUMNS - 1) / 2) * GRID_SPACING;
        positions.array[i + 1] = (row - (GRID_ROWS - 1) / 2) * GRID_SPACING;
        positions.array[i + 2] = GRID_Z;
        slot += 1;
      });
      for (let i = slot * 3; i < positions.array.length; i += 3) {
        positions.array[i] = 999;
        positions.array[i + 1] = 999;
        positions.array[i + 2] = GRID_Z;
      }
      positions.needsUpdate = true;
    }
  });

  return (
    <group ref={group} position={[1.35, 0, -4.1]} scale={1.08}>
      <lineSegments geometry={gridLines}>
        <lineBasicMaterial color="#ffffff" transparent opacity={0.09} />
      </lineSegments>
      <lineSegments ref={warpHighlightRef} geometry={warpHighlightLines}>
        <lineBasicMaterial color="#ffffff" transparent opacity={0} />
      </lineSegments>
      <points ref={intersectionsRef} geometry={intersections}>
        <pointsMaterial
          map={dotTexture}
          size={0.105}
          vertexColors
          transparent
          opacity={1}
          depthWrite={false}
          alphaTest={0.02}
        />
      </points>
      <points ref={hitDotsRef} geometry={hitDots}>
        <pointsMaterial
          map={dotTexture}
          color="#ffffff"
          size={0.18}
          transparent
          opacity={1}
          depthWrite={false}
          alphaTest={0.02}
        />
      </points>
      <points ref={moversRef} geometry={movers.geometry}>
        <pointsMaterial
          map={dotTexture}
          color="#ffffff"
          size={0.09}
          transparent
          opacity={0.86}
          depthWrite={false}
          alphaTest={0.02}
        />
      </points>
    </group>
  );
}

export default function WebGLBackground({ activeSection }: { activeSection: string }) {
  return (
    <div className="webgl-bg" aria-hidden="true">
      <Canvas camera={{ position: [-0.35, 0.18, 10.2], fov: 43 }} dpr={[1, 1.8]}>
        <color attach="background" args={['#02090d']} />
        <fog attach="fog" args={['#02090d', 9, 22]} />
        <GridField activeSection={activeSection} />
      </Canvas>
      <div className="webgl-vignette" />
    </div>
  );
}
