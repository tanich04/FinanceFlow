'use client'

import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, MeshDistortMaterial, Sphere, Box, Torus } from '@react-three/drei'
import * as THREE from 'three'

function FloatingOrb({ position, color, speed = 1, distort = 0.4, size = 1 }: {
  position: [number, number, number]
  color: string
  speed?: number
  distort?: number
  size?: number
}) {
  const meshRef = useRef<THREE.Mesh>(null)
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.1 * speed
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.15 * speed
    }
  })

  return (
    <Float speed={speed} rotationIntensity={0.5} floatIntensity={1}>
      <Sphere ref={meshRef} args={[size, 64, 64]} position={position}>
        <MeshDistortMaterial
          color={color}
          attach="material"
          distort={distort}
          speed={2}
          roughness={0.2}
          metalness={0.8}
          transparent
          opacity={0.7}
        />
      </Sphere>
    </Float>
  )
}

function FloatingCube({ position, color, speed = 1 }: {
  position: [number, number, number]
  color: string
  speed?: number
}) {
  const meshRef = useRef<THREE.Mesh>(null)
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.2 * speed
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3 * speed
    }
  })

  return (
    <Float speed={speed * 0.8} rotationIntensity={0.8} floatIntensity={0.8}>
      <Box ref={meshRef} args={[0.8, 0.8, 0.8]} position={position}>
        <meshStandardMaterial
          color={color}
          transparent
          opacity={0.5}
          roughness={0.1}
          metalness={0.9}
        />
      </Box>
    </Float>
  )
}

function FloatingRing({ position, color, speed = 1 }: {
  position: [number, number, number]
  color: string
  speed?: number
}) {
  const meshRef = useRef<THREE.Mesh>(null)
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = Math.PI / 2 + Math.sin(state.clock.elapsedTime * speed) * 0.2
      meshRef.current.rotation.z = state.clock.elapsedTime * 0.5 * speed
    }
  })

  return (
    <Float speed={speed * 0.6} rotationIntensity={0.3} floatIntensity={1.2}>
      <Torus ref={meshRef} args={[1, 0.1, 16, 100]} position={position}>
        <meshStandardMaterial
          color={color}
          transparent
          opacity={0.6}
          roughness={0.1}
          metalness={0.9}
        />
      </Torus>
    </Float>
  )
}

function Particles({ count = 200 }) {
  const particlesRef = useRef<THREE.Points>(null)
  
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count * 3; i += 3) {
      pos[i] = (Math.random() - 0.5) * 20
      pos[i + 1] = (Math.random() - 0.5) * 20
      pos[i + 2] = (Math.random() - 0.5) * 20
    }
    return pos
  }, [count])

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.02
      particlesRef.current.rotation.x = state.clock.elapsedTime * 0.01
    }
  })

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.03}
        color="#2dd4bf"
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  )
}

function GridFloor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -4, 0]}>
      <planeGeometry args={[50, 50, 50, 50]} />
      <meshBasicMaterial
        color="#2dd4bf"
        wireframe
        transparent
        opacity={0.1}
      />
    </mesh>
  )
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight position={[10, 10, 5]} intensity={0.5} color="#ffffff" />
      <pointLight position={[-10, -10, -5]} intensity={0.3} color="#2dd4bf" />
      <pointLight position={[10, -10, 5]} intensity={0.3} color="#ec4899" />
      
      {/* Main floating elements */}
      <FloatingOrb position={[-4, 2, -3]} color="#2dd4bf" speed={1.2} distort={0.5} size={1.5} />
      <FloatingOrb position={[4, -1, -5]} color="#ec4899" speed={0.8} distort={0.3} size={1.2} />
      <FloatingOrb position={[0, 3, -8]} color="#a78bfa" speed={1} distort={0.4} size={2} />
      
      {/* Cubes */}
      <FloatingCube position={[-3, -2, -4]} color="#22d3ee" speed={1.5} />
      <FloatingCube position={[5, 2, -6]} color="#fbbf24" speed={1.2} />
      
      {/* Rings */}
      <FloatingRing position={[2, 0, -5]} color="#2dd4bf" speed={1} />
      <FloatingRing position={[-5, 1, -7]} color="#f472b6" speed={0.7} />
      
      {/* Particles */}
      <Particles count={300} />
      
      {/* Grid floor */}
      <GridFloor />
    </>
  )
}

export default function ThreeScene() {
  return (
    <div className="fixed inset-0 -z-10">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 60 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'linear-gradient(180deg, #0f0f1a 0%, #1a1a2e 50%, #0f0f1a 100%)' }}
      >
        <Scene />
      </Canvas>
    </div>
  )
}
