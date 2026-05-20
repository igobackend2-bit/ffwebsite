'use client';

import React, { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshTransmissionMaterial, PerspectiveCamera, Environment, Billboard, Image as DreiImage, ContactShadows, Text } from '@react-three/drei';
import * as THREE from 'three';

function ProductStage({ url, position, scale = 1, rotation = [0, 0, 0] }: { url: string, position: [number, number, number], scale?: number, rotation?: [number, number, number] }) {
  return (
    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={1}>
      <group position={position} rotation={rotation as [number, number, number]}>
        <mesh position={[0, -scale * 0.6, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[scale * 1.2, scale * 1.2]} />
          <MeshTransmissionMaterial 
            backside
            samples={4}
            thickness={1}
            chromaticAberration={0.02}
            anisotropy={0.1}
            distortion={0.1}
            distortionScale={0.1}
            temporalDistortion={0.1}
            color="#ffffff"
          />
        </mesh>
        <Billboard position={[0, 0, 0]}>
          <DreiImage 
            url={url} 
            transparent 
            scale={scale} 
            opacity={1}
          />
        </Billboard>
      </group>
    </Float>
  );
}

function GlassShape({ position, scale = 1, rotation = [0, 0, 0], color = "#ffffff" }: { position: [number, number, number], scale?: number, rotation?: [number, number, number], color?: string }) {
  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
      <mesh position={position} rotation={rotation as [number, number, number]} scale={scale}>
        <torusKnotGeometry args={[1, 0.3, 128, 32]} />
        <MeshTransmissionMaterial 
          backside
          samples={8}
          thickness={0.5}
          chromaticAberration={0.05}
          anisotropy={0.3}
          distortion={0.3}
          distortionScale={0.5}
          temporalDistortion={0.2}
          color={color}
          attenuationDistance={0.5}
          attenuationColor={color}
        />
      </mesh>
    </Float>
  );
}

function Scene() {
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 12]} />
      <ambientLight intensity={0.5} />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={2} />
      <pointLight position={[-10, -10, -10]} intensity={1} />
      
      {/* Premium Product Staging */}
      <ProductStage url="/Fruits/apple.jfif" position={[6, 3, -2]} scale={3} />
      <ProductStage url="/Vegetables/TomatoCountry.jfif" position={[-6, -2, 2]} scale={2.5} />
      <ProductStage url="/Fruits/MangoBanganapalli.jfif" position={[4, -4, 0]} scale={2.8} />
      <ProductStage url="/Vegetables/ooty-carrot.jpg" position={[-5, 4, -1]} scale={3.2} />

      {/* Professional Glass Elements */}
      <GlassShape position={[8, 0, -5]} scale={1.5} color="#10b981" />
      <GlassShape position={[-8, 2, -4]} scale={1.2} color="#f59e0b" />
      <GlassShape position={[0, -6, -3]} scale={2} color="#ef4444" />
      
      <ContactShadows 
        position={[0, -9, 0]} 
        opacity={0.4} 
        scale={40} 
        blur={2} 
        far={10} 
        resolution={256} 
        color="#000000" 
      />

      <Environment preset="apartment" />
    </>
  );
}

export default function ThreeHero() {
  return (
    <div className="absolute inset-0 z-0 opacity-70 pointer-events-none md:pointer-events-auto">
      <Canvas>
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
    </div>
  );
}
