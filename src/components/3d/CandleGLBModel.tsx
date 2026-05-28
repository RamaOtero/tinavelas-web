import { useRef, useEffect } from 'react'
import { useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface CandleGLBModelProps {
  file: string;
  scale?: number | [number, number, number];
  position?: [number, number, number];
  autoRotate?: boolean;
}

const CandleGLBModel = ({
  file,
  scale = 1,
  position = [0, 0, 0],
  autoRotate = false,
}: CandleGLBModelProps) => {
  const groupRef = useRef<THREE.Group>(null)

  // 💡 NOTA: Ajusta esta ruta según dónde guardaste tu .glb en el Paso 2
  const { scene } = useGLTF(`/assets/${file}`)

  // Generar las normales al cargar el modelo si no las tiene (Fix crítico que descubrimos)
  useEffect(() => {
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh
        mesh.castShadow = true
        mesh.receiveShadow = true

        if (mesh.geometry && !mesh.geometry.attributes.normal) {
          mesh.geometry.computeVertexNormals()
        }
      }
    })
  }, [scene])

  useFrame((state) => {
    if (autoRotate && groupRef.current) {
      groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.3
    }
  })

  return (
    <group ref={groupRef} position={position} scale={scale}>
      <primitive object={scene} />
    </group>
  )
}

// 💡 Preload del modelo para evitar flashes blancos al cargar la página
useGLTF.preload('/assets/candle-a.glb')

export default CandleGLBModel
