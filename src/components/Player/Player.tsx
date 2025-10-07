import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { observer } from "mobx-react-lite";
import { gameStore } from "../../stores/gameStore";
import * as THREE from "three";

const Player: React.FC = observer(() => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (!meshRef.current) return;

    // Обновляем игровую логику
    gameStore.updateGame();

    // Обновляем позицию 3D объекта
    meshRef.current.position.set(
      gameStore.playerPosition.x,
      gameStore.playerPosition.y,
      gameStore.playerPosition.z
    );

    // Простая анимация вращения
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.01;
      meshRef.current.rotation.y += 0.01;
    }
  });

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[0.3, 0.3, 0.3]} />
      <meshStandardMaterial color="hotpink" />
    </mesh>
  );
});

export default Player;
