import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Environment, ContactShadows, Float } from '@react-three/drei'
import { Suspense, useState, useRef, useMemo } from 'react'
import * as THREE from 'three'
import CandleGLBModel from './CandleGLBModel'

// ─── Componente Llama Estilizada "Vector-Clay" (Multicapa y Orgánica) ─────────
const StylizedFlame = ({ lit, position }) => {
  const flameGroupRef = useRef()
  const lightRef = useRef()
  const currentScale = useRef(lit ? 1.0 : 0.0)

  // Definimos las siluetas vectoriales de la llama inspiradas en la ilustración
  const shapes = useMemo(() => {
    // 1. Silueta Exterior Orgánica (Naranja fuego)
    const outer = new THREE.Shape()
    outer.moveTo(0, 0)
    // Curva izquierda y punta lateral
    outer.quadraticCurveTo(-0.04, 0.03, -0.04, 0.08)
    outer.quadraticCurveTo(-0.04, 0.12, -0.015, 0.15)
    outer.lineTo(-0.025, 0.13)
    outer.quadraticCurveTo(-0.045, 0.17, -0.015, 0.21)
    // Punta central alta
    outer.quadraticCurveTo(-0.005, 0.25, 0.0, 0.30)
    outer.quadraticCurveTo(0.005, 0.25, 0.015, 0.21)
    // Punta lateral derecha
    outer.lineTo(0.025, 0.13)
    outer.quadraticCurveTo(0.045, 0.17, 0.015, 0.15)
    outer.quadraticCurveTo(0.04, 0.12, 0.04, 0.08)
    outer.quadraticCurveTo(0.04, 0.03, 0, 0)

    // 2. Silueta Interior (Núcleo amarillo brillante)
    const inner = new THREE.Shape()
    inner.moveTo(0, 0.01)
    inner.quadraticCurveTo(-0.025, 0.03, -0.025, 0.06)
    inner.quadraticCurveTo(-0.025, 0.09, -0.008, 0.11)
    inner.lineTo(-0.015, 0.10)
    inner.quadraticCurveTo(-0.03, 0.13, -0.01, 0.16)
    // Punta central amarilla
    inner.quadraticCurveTo(-0.002, 0.19, 0.0, 0.22)
    inner.quadraticCurveTo(0.002, 0.19, 0.01, 0.16)
    // Punta lateral derecha
    inner.lineTo(0.015, 0.10)
    inner.quadraticCurveTo(0.03, 0.13, 0.008, 0.11)
    inner.quadraticCurveTo(0.025, 0.09, 0.025, 0.06)
    inner.quadraticCurveTo(0.025, 0.03, 0, 0.01)

    return { outer, inner }
  }, [])

  // Parámetros de extrusión para dar volumen a las capas vectoriales
  const extrudeSettings = useMemo(() => ({
    depth: 0.002,
    bevelEnabled: true,
    bevelSegments: 2,
    steps: 1,
    bevelSize: 0.001,
    bevelThickness: 0.001
  }), [])

  // Animaciones por cuadro (flicker y escala)
  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime()

    // Transición suave de encendido/apagado
    const targetScale = lit ? 1.0 : 0.0
    currentScale.current += (targetScale - currentScale.current) * delta * 7
    const s = currentScale.current

    // Oscilación de llama y parpadeo orgánico
    const flicker = s * (1.0 + Math.sin(t * 13) * 0.04 + Math.sin(t * 7.5) * 0.02)

    if (flameGroupRef.current) {
      // Escalado dinámico en 3D (Reducido a la mitad: factor de 0.45)
      const baseScale = 0.45
      flameGroupRef.current.scale.set(
        baseScale * (flicker * 1.0 + Math.sin(t * 5.1) * 0.03),
        baseScale * (flicker * 1.0 + Math.cos(t * 6.3) * 0.04),
        baseScale * (flicker * 1.0 + Math.sin(t * 4.7) * 0.03)
      )
      // Balanceo sutil por el aire
      flameGroupRef.current.position.x = position[0] + Math.sin(t * 3.5 + position[0]) * 0.004
      flameGroupRef.current.position.z = position[2] + Math.cos(t * 4.0 + position[2]) * 0.003
    }

    if (lightRef.current) {
      // Variación de intensidad realista
      lightRef.current.intensity = s * (1.2 + Math.sin(t * 11 + position[0]) * 0.2 + Math.sin(t * 7) * 0.1)
    }
  })

  // Renderizador de capas cruzadas (0° y 90°) para crear efecto volumétrico 3D
  const renderFlameMeshes = () => (
    <>
      {/* Capa 1: Llama exterior naranja */}
      <mesh>
        <extrudeGeometry args={[shapes.outer, extrudeSettings]} />
        <meshStandardMaterial
          color="#ff5000"
          emissive="#ff2c00"
          emissiveIntensity={3.5}
          transparent
          opacity={0.92}
          roughness={0.1}
          metalness={0.0}
        />
      </mesh>

      {/* Capa 2: Núcleo interior amarillo brillante */}
      <mesh position={[0, 0, 0.002]}>
        <extrudeGeometry args={[shapes.inner, extrudeSettings]} />
        <meshStandardMaterial
          color="#fff6cc"
          emissive="#ffffff"
          emissiveIntensity={5.0}
          transparent
          opacity={0.96}
          roughness={0.0}
          metalness={0.0}
        />
      </mesh>
    </>
  )

  return (
    <group>
      {/* Luz cálida puntual de cada llama (Ajustada en altura por el cambio de escala) */}
      <pointLight
        ref={lightRef}
        color="#ff8420"
        intensity={lit ? 1.2 : 0}
        distance={3.5}
        decay={2}
        position={[position[0], position[1] + 0.05, position[2]]}
      />

      {/* Grupo contenedor que anima todo */}
      <group ref={flameGroupRef} position={position}>
        {/* Plano Frontal (0°) */}
        <group>{renderFlameMeshes()}</group>
        {/* Plano Cruzado (90°) para volumen */}
        <group rotation={[0, Math.PI / 2, 0]}>{renderFlameMeshes()}</group>
      </group>
    </group>
  )
}

// ─── Componente Escena Principal ─────────────────────────────────────────────
const CandleModelAScene = ({ lit: propLit, setLit: propSetLit }) => {
  const GLB_FILE = 'candle-a.glb'

  // Coordenadas matemáticas exactas detectadas de las 3 mechas (ajustadas al offset y = -0.5)
  const FLAMES = useMemo(() => [
    { id: 'left', pos: [-0.10005, -0.31, 0.175] }, // Llama izquierda (Mediana)
    { id: 'center', pos: [-0.0045, -0.31, 0.3] }, // Llama central (Alta)
    { id: 'right', pos: [0.135, -0.34, 0.19] }   // Llama derecha (Baja)
  ], [])

  const [localLit, setLocalLit] = useState(true)
  const lit = propLit !== undefined ? propLit : localLit
  const setLit = propSetLit !== undefined ? propSetLit : setLocalLit

  return (
    <Canvas
      shadows
      camera={{ position: [0.5, 2, 3.5], fov: 50 }}
      gl={{
        antialias: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.3,
        outputColorSpace: THREE.SRGBColorSpace,
      }}
      style={{ background: 'transparent' }}
    >
      <Suspense fallback={null}>
        {/* Environment base (sunset) */}
        <Environment preset="sunset" />

        {/* Luces del ambiente generales */}
        <ambientLight intensity={0.2} color="#ffd6a0" />

        <directionalLight
          position={[-3, 5, 2]}
          intensity={0.6}
          color="#fff0d8"
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />

        {/* Luz de volumen inferior */}
        <pointLight position={[0, -1, 2]} intensity={0.3} color="#ff9a40" distance={5} />

        {/* Luz trasera ambiental ultra-cálida (halo de fondo) */}
        <pointLight
          position={[0, 0.5, -2.5]}
          intensity={lit ? 2.5 : 0.4}
          color="#ff591a"
          distance={8}
          decay={1.8}
        />

        {/* Respiración natural - Levitación ultra-smooth sin rotación */}
        <Float speed={0.8} rotationIntensity={0} floatIntensity={0.12}>
          {/* El click en la vela apaga/prende las 3 llamas en conjunto */}
          <group
            scale={1.5}
            position={[0, 0.18, 0]}
            onClick={(e) => {
              e.stopPropagation()
              setLit(prev => !prev)
            }}
          >
            <CandleGLBModel
              file={GLB_FILE}
              scale={1}
              position={[0, -0.5, 0]}
              autoRotate={false}
            />

            {/* Las 3 Llamas estilizadas posadas exactamente sobre las 3 mechas */}
            {FLAMES.map((flame) => (
              <StylizedFlame key={flame.id} lit={lit} position={flame.pos} />
            ))}
          </group>

        </Float>



        {/* Sombra de contacto en el piso */}
        <ContactShadows
          position={[0, -1.42, 0]}
          opacity={0.5}
          scale={3}
          blur={2.5}
          far={4}
          color="#2a0d00"
        />
      </Suspense>
    </Canvas>
  )
}

export default CandleModelAScene

