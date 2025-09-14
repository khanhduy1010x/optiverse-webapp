// src/components/GLBModel.tsx
// @ts-nocheck
import React, { Suspense, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { EffectComposer, Bloom } from '@react-three/postprocessing';

interface ModelProps {
  url: string;
  
  dropIor?: number;
  dropThickness?: number;
  dropRoughness?: number;
  clearcoat?: number;
  clearcoatRoughness?: number;
  metalness?: number;
  envIntensity?: number;
  emissiveColor?: string | number;
  emissiveIntensity?: number;
}

function createWhiteLogoMaterial(opts?: {
  roughness?: number;
  metalness?: number;
  clearcoat?: number;
  clearcoatRoughness?: number;
  emissiveIntensity?: number;
}) {
  const {
    roughness = 0.35,
    metalness = 0.0,
    clearcoat = 0.4,            
    clearcoatRoughness = 0.25,
    emissiveIntensity = 0.25,   
  } = opts ?? {};

  const mat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,            
    metalness,
    roughness,
    clearcoat,
    clearcoatRoughness,
    transmission: 0.0,          
    transparent: false,
    opacity: 1.0,
    emissive: new THREE.Color('#ffffff'),
    emissiveIntensity,
    specularIntensity: 1.0,
    specularColor: new THREE.Color('#ffffff'),
    side: THREE.DoubleSide,     
  });

  
  (mat as any).envMapIntensity = 0.6;
  return mat;
}


function createWaterDropMaterial(opts?: {
  ior?: number;
  thickness?: number;
  roughness?: number;
  clearcoat?: number;
  clearcoatRoughness?: number;
  metalness?: number;
  envIntensity?: number;
  emissiveColor?: string | number;
  emissiveIntensity?: number;
}) {
  const {
    ior = 1.9,
    thickness = 0.5,
    roughness = 0.05,
    clearcoat = 1.0,
    clearcoatRoughness = 0.05,
    metalness = 0.0,
    envIntensity = 1.8,
    emissiveColor = '#ffffff',
    emissiveIntensity = 0.0,
  } = opts ?? {};

  const mat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    metalness,
    roughness,
    transmission: 1.0,
    transparent: true,
    opacity: 1.0,
    ior,
    thickness,
    attenuationColor: new THREE.Color('#ffffff'),
    attenuationDistance: 10,
    clearcoat,
    clearcoatRoughness,
    specularIntensity: 1.0,
    specularColor: new THREE.Color('#ffffff'),
    emissive: new THREE.Color(emissiveColor as any),
    emissiveIntensity,
    side: THREE.DoubleSide,
  });
  (mat as any).envMapIntensity = envIntensity;
  return mat;
}

function applyWaterDropToScene(root: THREE.Object3D, opts?: ModelProps) {
  
  const mat = createWhiteLogoMaterial({
    roughness: 0.35,
    metalness: 0,
    clearcoat: 0.4,
    clearcoatRoughness: 0.25,
    emissiveIntensity: 0.25, 
  });

  root.traverse((child) => {
    if ((child as any).isMesh) {
      const mesh = child as THREE.Mesh;
      mesh.material = mat;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
    }
  });
}

function Model({ url, ...opts }: ModelProps) {
  const [model, setModel] = useState<THREE.Group | null>(null);

  useEffect(() => {
    const loader = new GLTFLoader();
    loader.load(
      url,
      (gltf) => {
        applyWaterDropToScene(gltf.scene, opts);
        setModel(gltf.scene);
      },
      undefined,
      (error) => {
        console.error('Error loading GLB:', error);
      }
    );
  }, [url]);

  if (!model) return null;
  return (
    <group scale={[3, 3, 3]}>
      <primitive object={model} />
    </group>
  );
}

interface GLBModelProps {
  modelPath: string;
  width?: string;
  height?: string;
  autoRotate?: boolean;
}

const GLBModel: React.FC<GLBModelProps> = ({
  modelPath,
  width = '100%',
  height = '250px',
  autoRotate = true,
}) => {
  return (
    <div style={{ width, height }}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        shadows
        gl={{ alpha: true, antialias: true }}
        style={{ background: 'transparent' }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0);
          (gl as any).outputColorSpace = THREE.SRGBColorSpace;
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.1;
        }}
      >
        <ambientLight intensity={0.35} />
        <directionalLight position={[5, 5, 5]} intensity={0.9} castShadow />
        <directionalLight position={[-4, 2, -3]} intensity={0.5} />

        <Suspense fallback={null}>
          <Model url={modelPath} />

          <Environment preset="city" background={false} />

          <EffectComposer>
            <Bloom
              intensity={0.9}          
              luminanceThreshold={0.9}  
              luminanceSmoothing={0.1}
              mipmapBlur
              radius={0.25}
            />
          </EffectComposer>
        </Suspense>

        <OrbitControls
          enablePan
          enableZoom
          enableRotate
          autoRotate={autoRotate}
          autoRotateSpeed={4}
          minDistance={1.5}
          maxDistance={10}
        />
      </Canvas>
    </div>
  );
};

export default GLBModel;
