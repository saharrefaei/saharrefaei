import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { MeshDistortMaterial, Sphere, Float, Stars, Torus, Icosahedron, MeshWobbleMaterial, Box } from '@react-three/drei';
import * as THREE from 'three';

function MainSphere({ mobile }: { mobile: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null!);
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.08;
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.12;
      if (!mobile) {
        const targetX = state.pointer.x * 2.5 + 2.5;
        const targetY = state.pointer.y * 1.5;
        meshRef.current.position.x = THREE.MathUtils.lerp(meshRef.current.position.x, targetX, 0.04);
        meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, targetY, 0.04);
      }
    }
  });
  return (
    <Float speed={1.8} rotationIntensity={0.8} floatIntensity={1.5}>
      <Sphere args={mobile ? [1.6, 24, 24] : [2.2, 64, 64]} ref={meshRef} position={mobile ? [1.5, 0, -3] : [2.5, 0, -2]}>
        <MeshDistortMaterial color="#6b46c1" attach="material" distort={mobile ? 0.3 : 0.45} speed={2.5} roughness={0.15} metalness={0.85} wireframe />
      </Sphere>
    </Float>
  );
}

function FloatingTorus({ mobile }: { mobile: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null!);
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.2;
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.1;
      meshRef.current.rotation.z = state.clock.getElapsedTime() * 0.05;
    }
  });
  return (
    <Float speed={1.2} rotationIntensity={1.2} floatIntensity={1}>
      <Torus args={mobile ? [0.8, 0.28, 12, 40] : [1, 0.35, 16, 60]} ref={meshRef} position={mobile ? [-2.5, 1.5, -4] : [-4, 1.5, -4]}>
        <meshStandardMaterial color="#0ea5e9" wireframe opacity={0.35} transparent />
      </Torus>
    </Float>
  );
}

function SmallOrb() {
  const meshRef = useRef<THREE.Mesh>(null!);
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = Math.sin(state.clock.getElapsedTime() * 0.8) * 0.8 - 2;
      meshRef.current.position.x = Math.cos(state.clock.getElapsedTime() * 0.5) * 0.5 - 5;
    }
  });
  return (
    <Sphere args={[0.6, 32, 32]} ref={meshRef} position={[-5, -2, -3]}>
      <MeshDistortMaterial color="#10b981" distort={0.3} speed={3} roughness={0.1} metalness={0.9} wireframe opacity={0.4} transparent />
    </Sphere>
  );
}

function FloatingIcosahedron() {
  const meshRef = useRef<THREE.Mesh>(null!);
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.15;
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.25;
      meshRef.current.rotation.z = state.clock.getElapsedTime() * 0.1;
    }
  });
  return (
    <Float speed={2} rotationIntensity={2} floatIntensity={2}>
      <Icosahedron args={[0.8, 1]} ref={meshRef} position={[4, -2, -3]}>
        <meshStandardMaterial color="#f59e0b" wireframe opacity={0.5} transparent />
      </Icosahedron>
    </Float>
  );
}

function WobblyOrb() {
  const meshRef = useRef<THREE.Mesh>(null!);
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.x = Math.sin(state.clock.getElapsedTime() * 0.4) * 1.5 - 3;
      meshRef.current.position.y = Math.cos(state.clock.getElapsedTime() * 0.3) * 1 + 2;
    }
  });
  return (
    <Sphere args={[0.9, 32, 32]} ref={meshRef} position={[-3, 2, -4]}>
      <MeshWobbleMaterial color="#ec4899" factor={0.4} speed={2} roughness={0.1} metalness={0.8} wireframe opacity={0.45} transparent />
    </Sphere>
  );
}

function FloatingBox() {
  const meshRef = useRef<THREE.Mesh>(null!);
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.18;
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.22;
      meshRef.current.rotation.z = state.clock.getElapsedTime() * 0.08;
    }
  });
  return (
    <Float speed={1.5} rotationIntensity={1.5} floatIntensity={1.2}>
      <Box args={[1, 1, 1]} ref={meshRef} position={[5, 2.5, -5]}>
        <meshStandardMaterial color="#9f7aea" wireframe opacity={0.3} transparent />
      </Box>
    </Float>
  );
}

function SecondTorus() {
  const meshRef = useRef<THREE.Mesh>(null!);
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.1;
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.3;
    }
  });
  return (
    <Float speed={0.8} rotationIntensity={0.6} floatIntensity={0.8}>
      <Torus args={[0.6, 0.2, 12, 40]} ref={meshRef} position={[0, -3, -3]}>
        <meshStandardMaterial color="#10b981" wireframe opacity={0.4} transparent />
      </Torus>
    </Float>
  );
}

export default function Background3D() {
  const isMobile = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: -1, pointerEvents: 'none' }}>
      <Canvas
        camera={{ position: [0, 0, 8] }}
        gl={{ antialias: !isMobile, powerPreference: isMobile ? 'low-power' : 'high-performance' }}
      >
        <ambientLight intensity={0.3} />
        <directionalLight position={[-3, 5, 3]} intensity={isMobile ? 0.4 : 0.8} color="#ffffff" />
        <pointLight position={[5, 3, 2]} intensity={isMobile ? 0.8 : 1.5} color="#6b46c1" />
        <pointLight position={[-5, -3, -2]} intensity={isMobile ? 0.4 : 0.8} color="#0ea5e9" />

        <Stars radius={100} depth={50} count={isMobile ? 3000 : 6000} factor={4} saturation={0} fade speed={isMobile ? 0.4 : 0.8} />

        <MainSphere mobile={isMobile} />
        <FloatingTorus mobile={isMobile} />

        {/* Extra objects — desktop only */}
        {!isMobile && <SmallOrb />}
        {!isMobile && <FloatingIcosahedron />}
        {!isMobile && <WobblyOrb />}
        {!isMobile && <FloatingBox />}
        {!isMobile && <SecondTorus />}
      </Canvas>
    </div>
  );
}
