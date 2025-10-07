import React from 'react';
import { observer } from 'mobx-react-lite';
import { gameStore, type Platform } from '../../stores/gameStore';

const PlatformComponent: React.FC<{ platform: Platform }> = ({ platform }) => {
  const getPlatformColor = (type: string) => {
    switch (type) {
      case 'moving':
        return '#ffa500'; // Оранжевый для движущихся
      case 'breakable':
        return '#ff4444'; // Красный для ломающихся
      default:
        return '#4CAF50'; // Зеленый для обычных
    }
  };

  const getPlatformProps = (type: string) => {
    switch (type) {
      case 'moving':
        return {
          position: [
            platform.x + Math.sin(Date.now() * 0.001) * 1.5, // Движение вперед-назад
            platform.y,
            0
          ] as [number, number, number]
        };
      case 'breakable':
        return {
          position: [platform.x, platform.y, 0] as [number, number, number],
          scale: [1, 0.8, 1] as [number, number, number] // Немного тоньше
        };
      default:
        return {
          position: [platform.x, platform.y, 0] as [number, number, number]
        };
    }
  };

  const platformProps = getPlatformProps(platform.type);

  return (
    <mesh {...platformProps}>
      <boxGeometry args={[platform.width, 0.1, 1]} />
      <meshStandardMaterial color={getPlatformColor(platform.type)} />
    </mesh>
  );
};

const Platforms: React.FC = observer(() => {
  return (
    <>
      {gameStore.platforms.map(platform => (
        <PlatformComponent key={platform.id} platform={platform} />
      ))}
    </>
  );
});

export default Platforms;