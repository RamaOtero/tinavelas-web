import { useRef, useEffect } from 'react'
import { useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'

const CandleGLBModel = ({
  file,
  scale = 1,
  position = [0, 0, 0],
  autoRotate = false,
}) => {
  const groupRef = useRef()

  // 💡 NOTA: Ajusta esta ruta según dónde guardaste tu .glb en el Paso 2
  const { scene } = useGLTF(`/assets/${file}`)

  // Generar las normales al cargar el modelo si no las tiene (Fix crítico que descubrimos)
  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true
        child.receiveShadow = true

        if (child.geometry && !child.geometry.attributes.normal) {
          child.geometry.computeVertexNormals()
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
