'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, MeshTransmissionMaterial, Float } from '@react-three/drei';
import * as THREE from 'three';

/* ------------------------------------------------------------------ */
/*  Floating Bubble Particles                                          */
/* ------------------------------------------------------------------ */
function Bubbles({ count = 40 }: { count?: number }) {
    const meshRef = useRef<THREE.InstancedMesh>(null);
    const dummy = useMemo(() => new THREE.Object3D(), []);

    // Generate random positions, speeds, and sizes
    const particles = useMemo(() => {
        return Array.from({ length: count }, () => ({
            position: [
                (Math.random() - 0.5) * 6,
                (Math.random() - 0.5) * 6,
                (Math.random() - 0.5) * 6,
            ] as [number, number, number],
            speed: 0.2 + Math.random() * 0.5,
            scale: 0.04 + Math.random() * 0.12,
            offset: Math.random() * Math.PI * 2,
        }));
    }, [count]);

    useFrame(({ clock }) => {
        if (!meshRef.current) return;
        const t = clock.getElapsedTime();

        particles.forEach((p, i) => {
            const y = ((p.position[1] + t * p.speed * 0.3 + 3) % 6) - 3;
            const wobbleX = Math.sin(t * 0.5 + p.offset) * 0.3;
            const wobbleZ = Math.cos(t * 0.4 + p.offset * 1.3) * 0.3;
            dummy.position.set(p.position[0] + wobbleX, y, p.position[2] + wobbleZ);
            dummy.scale.setScalar(p.scale);
            dummy.updateMatrix();
            meshRef.current!.setMatrixAt(i, dummy.matrix);
        });

        meshRef.current.instanceMatrix.needsUpdate = true;
    });

    return (
        <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
            <sphereGeometry args={[1, 16, 16]} />
            <meshStandardMaterial
                color="#7dd3fc"
                transparent
                opacity={0.35}
                roughness={0.1}
                metalness={0.1}
            />
        </instancedMesh>
    );
}

/* ------------------------------------------------------------------ */
/*  Orbiting Ring — symbolic "delivery route"                          */
/* ------------------------------------------------------------------ */
function OrbitRing() {
    const ringRef = useRef<THREE.Mesh>(null);

    useFrame(({ clock }) => {
        if (!ringRef.current) return;
        ringRef.current.rotation.z = clock.getElapsedTime() * 0.2;
        ringRef.current.rotation.x = Math.PI / 3 + Math.sin(clock.getElapsedTime() * 0.15) * 0.1;
    });

    return (
        <mesh ref={ringRef} rotation={[Math.PI / 3, 0, 0]}>
            <torusGeometry args={[2.8, 0.04, 16, 100]} />
            <meshStandardMaterial color="#38bdf8" transparent opacity={0.5} roughness={0} metalness={0.8} />
        </mesh>
    );
}

function OrbitRing2() {
    const ringRef = useRef<THREE.Mesh>(null);

    useFrame(({ clock }) => {
        if (!ringRef.current) return;
        ringRef.current.rotation.z = -clock.getElapsedTime() * 0.15;
        ringRef.current.rotation.x = Math.PI / 2.5 + Math.cos(clock.getElapsedTime() * 0.12) * 0.08;
    });

    return (
        <mesh ref={ringRef} rotation={[Math.PI / 2.5, 0, 0]}>
            <torusGeometry args={[3.3, 0.025, 16, 100]} />
            <meshStandardMaterial color="#a5f3fc" transparent opacity={0.3} roughness={0} metalness={0.8} />
        </mesh>
    );
}

/* ------------------------------------------------------------------ */
/*  Small orbiting sphere — symbolic "delivery in transit"             */
/* ------------------------------------------------------------------ */
function OrbitDot() {
    const dotRef = useRef<THREE.Mesh>(null);

    useFrame(({ clock }) => {
        if (!dotRef.current) return;
        const t = clock.getElapsedTime() * 0.4;
        const r = 2.8;
        const tilt = Math.PI / 3;
        dotRef.current.position.set(
            Math.cos(t) * r,
            Math.sin(t) * r * Math.cos(tilt),
            Math.sin(t) * r * Math.sin(tilt)
        );
    });

    return (
        <mesh ref={dotRef}>
            <sphereGeometry args={[0.12, 16, 16]} />
            <meshStandardMaterial color="#ffffff" emissive="#38bdf8" emissiveIntensity={2} />
        </mesh>
    );
}

/* ------------------------------------------------------------------ */
/*  Crystal Water Drop — the symbolic centrepiece                      */
/* ------------------------------------------------------------------ */
function WaterDrop() {
    const dropRef = useRef<THREE.Group>(null);

    // Create a custom drop shape using Lathe geometry
    const dropGeometry = useMemo(() => {
        const points: THREE.Vector2[] = [];
        const segments = 32;
        for (let i = 0; i <= segments; i++) {
            const t = i / segments;
            // Classic drop silhouette: wide at bottom, tapering to a point at top
            let r: number;
            if (t < 0.7) {
                // Bottom bulb — sine curve
                r = Math.sin(t / 0.7 * Math.PI) * 1.0;
            } else {
                // Top taper — smooth curve to point
                const tt = (t - 0.7) / 0.3;
                r = Math.cos(tt * Math.PI / 2) * Math.sin(Math.PI) * (1 - tt) * 0.7;
            }
            const y = t * 3.0 - 1.0; // height range
            points.push(new THREE.Vector2(Math.max(r, 0.001), y));
        }
        return new THREE.LatheGeometry(points, 48);
    }, []);

    useFrame(({ clock }) => {
        if (!dropRef.current) return;
        dropRef.current.rotation.y = clock.getElapsedTime() * 0.15;
    });

    return (
        <group ref={dropRef}>
            <mesh geometry={dropGeometry}>
                <MeshTransmissionMaterial
                    backside
                    samples={6}
                    resolution={512}
                    transmission={0.95}
                    roughness={0.05}
                    thickness={0.5}
                    ior={1.5}
                    chromaticAberration={0.06}
                    anisotropy={0.1}
                    distortion={0.2}
                    distortionScale={0.3}
                    temporalDistortion={0.1}
                    color="#bae6fd"
                />
            </mesh>
        </group>
    );
}

/* ------------------------------------------------------------------ */
/*  Main Scene Composition                                             */
/* ------------------------------------------------------------------ */
export default function DeliveryScene() {
    return (
        <div style={{ width: '100%', height: '100%', minHeight: '500px' }}>
            <Canvas
                dpr={[1, 1.5]}
                gl={{ antialias: true, alpha: true }}
                camera={{ position: [0, 0.5, 7], fov: 45 }}
            >
                {/* Lighting */}
                <ambientLight intensity={0.4} />
                <directionalLight position={[5, 8, 5]} intensity={1.5} color="#ffffff" />
                <pointLight position={[-4, 3, -3]} intensity={0.6} color="#7dd3fc" />
                <pointLight position={[3, -2, 4]} intensity={0.4} color="#a5f3fc" />

                <Float speed={1.5} rotationIntensity={0.15} floatIntensity={0.4}>
                    <group position={[0, -0.2, 0]}>
                        <WaterDrop />
                        <OrbitRing />
                        <OrbitRing2 />
                        <OrbitDot />
                    </group>
                </Float>

                <Bubbles count={35} />

                <Environment preset="city" />
            </Canvas>
        </div>
    );
}
