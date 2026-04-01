'use client'

import { useRef, useMemo, useEffect, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Float, MeshDistortMaterial, Sphere, Box, Torus, Stars } from '@react-three/drei'
import * as THREE from 'three'
import { useFinanceStore } from '@/lib/store'

function FloatingOrb({ position, color, speed = 1, distort = 0.4, size = 1, isDark }: {
  position: [number, number, number]
  color: string
  speed?: number
  distort?: number
  size?: number
  isDark: boolean
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
          roughness={isDark ? 0.2 : 0.4}
          metalness={isDark ? 0.8 : 0.6}
          transparent
          opacity={isDark ? 0.7 : 0.5}
        />
      </Sphere>
    </Float>
  )
}

function FloatingCube({ position, color, speed = 1, isDark }: {
  position: [number, number, number]
  color: string
  speed?: number
  isDark: boolean
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
          opacity={isDark ? 0.5 : 0.4}
          roughness={isDark ? 0.1 : 0.3}
          metalness={isDark ? 0.9 : 0.7}
        />
      </Box>
    </Float>
  )
}

function FloatingRing({ position, color, speed = 1, isDark }: {
  position: [number, number, number]
  color: string
  speed?: number
  isDark: boolean
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
          opacity={isDark ? 0.6 : 0.4}
          roughness={isDark ? 0.1 : 0.3}
          metalness={isDark ? 0.9 : 0.7}
        />
      </Torus>
    </Float>
  )
}

function Particles({ count = 200, isDark }: { count?: number; isDark: boolean }) {
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
        color={isDark ? "#2dd4bf" : "#0d9488"}
        transparent
        opacity={isDark ? 0.6 : 0.4}
        sizeAttenuation
      />
    </points>
  )
}

function GridFloor({ isDark }: { isDark: boolean }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -4, 0]}>
      <planeGeometry args={[50, 50, 50, 50]} />
      <meshBasicMaterial
        color={isDark ? "#2dd4bf" : "#0d9488"}
        wireframe
        transparent
        opacity={isDark ? 0.1 : 0.05}
      />
    </mesh>
  )
}

function BackgroundColor({ isDark }: { isDark: boolean }) {
  const { scene } = useThree()
  
  useEffect(() => {
    if (isDark) {
      scene.background = new THREE.Color('#0f0f1a')
    } else {
      scene.background = new THREE.Color('#f0f9ff')
    }
  }, [isDark, scene])
  
  return null
}

function Scene({ isDark }: { isDark: boolean }) {
  const primaryColor = isDark ? '#2dd4bf' : '#0d9488'
  const accentColor = isDark ? '#ec4899' : '#db2777'
  const tertiaryColor = isDark ? '#a78bfa' : '#8b5cf6'
  
  return (
    <>
      <BackgroundColor isDark={isDark} />
      
      <ambientLight intensity={isDark ? 0.3 : 0.5} />
      <directionalLight position={[10, 10, 5]} intensity={isDark ? 0.5 : 0.7} color="#ffffff" />
      <pointLight position={[-10, -10, -5]} intensity={isDark ? 0.3 : 0.2} color={primaryColor} />
      <pointLight position={[10, -10, 5]} intensity={isDark ? 0.3 : 0.2} color={accentColor} />
      
      {/* Stars only in dark mode */}
      {isDark && <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />}
      
      {/* Main floating elements */}
      <FloatingOrb position={[-4, 2, -3]} color={primaryColor} speed={1.2} distort={0.5} size={1.5} isDark={isDark} />
      <FloatingOrb position={[4, -1, -5]} color={accentColor} speed={0.8} distort={0.3} size={1.2} isDark={isDark} />
      <FloatingOrb position={[0, 3, -8]} color={tertiaryColor} speed={1} distort={0.4} size={2} isDark={isDark} />
      
      {/* Cubes */}
      <FloatingCube position={[-3, -2, -4]} color={isDark ? '#22d3ee' : '#06b6d4'} speed={1.5} isDark={isDark} />
      <FloatingCube position={[5, 2, -6]} color={isDark ? '#fbbf24' : '#f59e0b'} speed={1.2} isDark={isDark} />
      
      {/* Rings */}
      <FloatingRing position={[2, 0, -5]} color={primaryColor} speed={1} isDark={isDark} />
      <FloatingRing position={[-5, 1, -7]} color={isDark ? '#f472b6' : '#ec4899'} speed={0.7} isDark={isDark} />
      
      {/* Particles */}
      <Particles count={300} isDark={isDark} />
      
      {/* Grid floor */}
      <GridFloor isDark={isDark} />
    </>
  )
}

export default function ThreeScene() {
  const theme = useFinanceStore((state) => state.theme)
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])
  
  if (!mounted) {
    return <div className="fixed inset-0 -z-10 bg-background transition-colors duration-500" />
  }

  return (
    <div className="fixed inset-0 -z-10 transition-colors duration-500">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 60 }}
        gl={{ antialias: true, alpha: true }}
      >
        <Scene isDark={theme === 'dark'} />
      </Canvas>
    </div>
  )
}
