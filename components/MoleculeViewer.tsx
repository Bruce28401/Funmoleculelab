
import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Center, Text, Float, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { Atom, Bond, MoleculeData } from '../types';

// Component to render a single Atom
const AtomSphere: React.FC<{ atom: Atom }> = ({ atom }) => {
  return (
    /* mesh and other Three.js elements are managed by React Three Fiber's own type definitions */
    <mesh position={[atom.x, atom.y, atom.z]}>
      <sphereGeometry args={[atom.radius, 32, 32]} />
      <meshPhysicalMaterial 
        color={atom.color} 
        roughness={0.2} 
        metalness={0.1} 
        clearcoat={0.5}
      />
      <Text
        position={[0, 0, atom.radius + 0.1]}
        fontSize={atom.radius * 0.8}
        color="black"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="white"
      >
        {atom.element}
      </Text>
    </mesh>
  );
};

// Component to render a Bond (Cylinder)
const BondCylinder: React.FC<{ start: THREE.Vector3; end: THREE.Vector3 }> = ({ start, end }) => {
  const ref = useRef<THREE.Mesh>(null);
  
  // Math to orient cylinder
  const curve = useMemo(() => {
    return new THREE.LineCurve3(start, end);
  }, [start, end]);

  return (
    <mesh>
      <tubeGeometry args={[curve, 1, 0.15, 8, false]} />
      <meshStandardMaterial color="#cccccc" roughness={0.3} />
    </mesh>
  );
};

const RotatingMolecule: React.FC<{ data: MoleculeData }> = ({ data }) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.2; // Slow auto-rotation
    }
  });

  // Convert atom positions to Vector3 for bond calculations
  const atomVectors = useMemo(() => {
    return data.atoms.map(a => new THREE.Vector3(a.x, a.y, a.z));
  }, [data.atoms]);

  return (
    <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
      <group ref={groupRef}>
        {data.atoms.map((atom) => (
          <AtomSphere key={`atom-${atom.id}`} atom={atom} />
        ))}
        {data.bonds.map((bond, idx) => (
          <BondCylinder 
            key={`bond-${idx}`} 
            start={atomVectors[bond.source]} 
            end={atomVectors[bond.target]} 
          />
        ))}
      </group>
    </Float>
  );
};

interface MoleculeViewerProps {
  data: MoleculeData;
}

const MoleculeViewer: React.FC<MoleculeViewerProps> = ({ data }) => {
  return (
    /* Standard HTML tags like div are now correctly typed after removing the destructive global JSX augmentation */
    <div className="w-full h-full min-h-[400px] relative bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-white/10">
      <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
        <color attach="background" args={['#0f172a']} />
        
        {/* Lighting replacement for Environment map */}
        <ambientLight intensity={0.8} />
        <pointLight position={[10, 10, 10]} intensity={1.5} />
        <spotLight position={[-10, -10, -10]} intensity={1} />
        <directionalLight position={[0, 10, 5]} intensity={1} />
        
        {/* Environment Decor */}
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

        {/* The Molecule */}
        <Center>
          <RotatingMolecule data={data} />
        </Center>

        <OrbitControls makeDefault autoRotate={false} />
      </Canvas>
    </div>
  );
};

export default MoleculeViewer;
