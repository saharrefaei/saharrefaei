import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { MeshDistortMaterial, Sphere, Float, Stars, Torus } from '@react-three/drei';
import * as THREE from 'three';

function MainSphere() {
  const meshRef = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.08;
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.12;

      const targetX = state.pointer.x * 2.5 + 2.5;
      const targetY = state.pointer.y * 1.5;
      meshRef.current.position.x = THREE.MathUtils.lerp(meshRef.current.position.x, targetX, 0.04);
      meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, targetY, 0.04);
    }
  });

  return (
    <Float speed={1.8} rotationIntensity={0.8} floatIntensity={1.5}>
      <Sphere args={[2.2, 64, 64]} ref={meshRef} position={[2.5, 0, -2]}>
        <MeshDistortMaterial
          color="#6b46c1"
          attach="material"
          distort={0.45}
          speed={2.5}
          roughness={0.15}
          metalness={0.85}
          wireframe
        />
      </Sphere>
    </Float>
  );
}

function FloatingTorus() {
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
      <Torus args={[1, 0.35, 16, 60]} ref={meshRef} position={[-4, 1.5, -4]}>
        <meshStandardMaterial
          color="#0ea5e9"
          wireframe
          opacity={0.35}
          transparent
        />
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
      <MeshDistortMaterial
        color="#10b981"
        distort={0.3}
        speed={3}
        roughness={0.1}
        metalness={0.9}
        wireframe
        opacity={0.4}
        transparent
      />
    </Sphere>
  );
}

export default function Background3D() {
  const isMobile = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: -1, pointerEvents: 'none' }}>
      <Canvas camera={{ position: [0, 0, 8] }} gl={{ antialias: !isMobile, powerPreference: isMobile ? 'low-power' : 'high-performance' }}>
        <ambientLight intensity={0.3} />
        {!isMobile && <directionalLight position={[-3, 5, 3]} intensity={0.8} color="#ffffff" />}
        {!isMobile && <pointLight position={[5, 3, 2]} intensity={1.5} color="#6b46c1" />}
        {!isMobile && <pointLight position={[-5, -3, -2]} intensity={0.8} color="#0ea5e9" />}
        <Stars
          radius={100}
          depth={50}
          count={isMobile ? 2000 : 6000}
          factor={4}
          saturation={0}
          fade
          speed={isMobile ? 0.3 : 0.8}
        />
        {!isMobile && <MainSphere />}
        {!isMobile && <FloatingTorus />}
        {!isMobile && <SmallOrb />}
      </Canvas>
    </div>
  );
}
