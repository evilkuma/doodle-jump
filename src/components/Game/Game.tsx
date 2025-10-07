import React, { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera } from '@react-three/drei';
import styled from 'styled-components';
import { observer } from 'mobx-react-lite';
import { gameStore } from '../../stores/gameStore';
import Player from '../Player/Player';
import Platforms from '../Platforms/Platforms';
import Joystick from '../Joystick/Joystick';

const GameContainer = styled.div`
  width: 100%;
  height: 100vh;
  position: relative;
  overflow: hidden;
`;

const UIOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  padding: 20px;
  pointer-events: none;
  z-index: 100;
`;

const ScoreContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: white;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
  }
`;

const Score = styled.div`
  font-size: 24px;
  font-weight: bold;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  
  @media (max-width: 768px) {
    font-size: 20px;
  }
  
  @media (max-width: 480px) {
    font-size: 18px;
  }
`;

const Height = styled.div`
  font-size: 18px;
  font-weight: bold;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  
  @media (max-width: 768px) {
    font-size: 16px;
  }
  
  @media (max-width: 480px) {
    font-size: 14px;
  }
`;

const ControlButtons = styled.div`
  position: absolute;
  top: 20px;
  right: 20px;
  display: flex;
  gap: 10px;
  pointer-events: auto;
  
  @media (max-width: 768px) {
    top: 10px;
    right: 10px;
    flex-direction: column;
    gap: 5px;
  }
`;

const Button = styled.button`
  padding: 10px 15px;
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.5);
  border-radius: 10px;
  color: white;
  font-weight: bold;
  backdrop-filter: blur(10px);
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }

  &.active {
    background: rgba(255, 255, 255, 0.4);
    border-color: white;
  }
  
  @media (max-width: 768px) {
    padding: 8px 12px;
    font-size: 12px;
  }
  
  @media (max-width: 480px) {
    padding: 6px 10px;
    font-size: 11px;
  }
`;

const GameOverScreen = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: white;
  z-index: 200;
  font-family: Arial, sans-serif;
  text-align: center;
  padding: 20px;
`;

const RestartButton = styled.button`
  padding: 15px 30px;
  background: #4CAF50;
  border: none;
  border-radius: 10px;
  color: white;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  margin-top: 20px;
  transition: all 0.3s ease;

  &:hover {
    background: #45a049;
    transform: scale(1.05);
  }
  
  @media (max-width: 768px) {
    padding: 12px 24px;
    font-size: 16px;
  }
`;

const GameTitle = styled.h1`
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  color: white;
  font-size: 28px;
  font-weight: bold;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  pointer-events: none;
  
  @media (max-width: 768px) {
    font-size: 24px;
    top: 15px;
  }
  
  @media (max-width: 480px) {
    font-size: 20px;
    top: 10px;
  }
`;

// Компонент камеры с улучшенным плавным движением
const SmoothCamera: React.FC = observer(() => {
  return (
    <PerspectiveCamera
      makeDefault
      position={[0, gameStore.cameraY, 12]}
      fov={70}
      near={0.1}
      far={1000}
    />
  );
});

const Game: React.FC = observer(() => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Определяем мобильное устройство
    const checkMobile = () => {
      return window.innerWidth <= 768 || 'ontouchstart' in window;
    };
    
    setIsMobile(checkMobile());
    
    const handleResize = () => {
      setIsMobile(checkMobile());
    };
    
    window.addEventListener('resize', handleResize);

    // Поддержка акселерометра
    const handleDeviceMotion = (event: DeviceMotionEvent) => {
      if (gameStore.controlType === 'accelerometer' && event.accelerationIncludingGravity) {
        const acceleration = event.accelerationIncludingGravity;
        if (acceleration.x) {
          const tilt = Math.max(-1, Math.min(1, -acceleration.x / 5));
          gameStore.setPlayerVelocity(tilt * gameStore.MOVE_SPEED, gameStore.playerVelocity.y);
        }
      }
    };

    // Запрос разрешения на использование акселерометра (для iOS)
    if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
      (DeviceMotionEvent as any).requestPermission()
        .then((permissionState: string) => {
          if (permissionState === 'granted') {
            window.addEventListener('devicemotion', handleDeviceMotion);
          }
        })
        .catch(console.error);
    } else if (window.DeviceMotionEvent) {
      window.addEventListener('devicemotion', handleDeviceMotion);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('devicemotion', handleDeviceMotion);
    };
  }, [gameStore.controlType]);

  const handleControlTypeChange = (type: 'joystick' | 'accelerometer') => {
    gameStore.setControlType(type);
  };

  const handleRestart = () => {
    gameStore.resetGame();
  };

  return (
    <GameContainer>
      <Canvas>
        <color attach="background" args={['#87CEEB']} />
        <SmoothCamera />
        <ambientLight intensity={0.6} />
        <pointLight position={[10, 10, 10]} />
        <Player />
        <Platforms />
      </Canvas>

      <GameTitle>Doodle Jump</GameTitle>

      <UIOverlay>
        <ScoreContainer>
          <Score>Счет: {gameStore.score}</Score>
          <Height>Высота: {Math.max(0, Math.floor(gameStore.playerPosition.y))}м</Height>
        </ScoreContainer>
        
        <ControlButtons>
          <Button
            className={gameStore.controlType === 'joystick' ? 'active' : ''}
            onClick={() => handleControlTypeChange('joystick')}
          >
            {isMobile ? '🕹️' : '🕹️ Джойстик'}
          </Button>
          <Button
            className={gameStore.controlType === 'accelerometer' ? 'active' : ''}
            onClick={() => handleControlTypeChange('accelerometer')}
          >
            {isMobile ? '📱' : '📱 Наклон'}
          </Button>
        </ControlButtons>
      </UIOverlay>

      {gameStore.controlType === 'joystick' && (
        <div className="controls-overlay">
          <Joystick />
          {/* Пустой div для балансировки (можно добавить другие элементы управления справа) */}
          <div style={{ width: '120px', height: '120px' }} />
        </div>
      )}

      {gameStore.gameOver && (
        <GameOverScreen>
          <h1>Игра окончена!</h1>
          <p>Ваш счет: {gameStore.score}</p>
          <p>Максимальная высота: {Math.max(0, Math.floor(gameStore.playerPosition.y))}м</p>
          <RestartButton onClick={handleRestart}>
            🎮 Играть снова
          </RestartButton>
        </GameOverScreen>
      )}
    </GameContainer>
  );
});

export default Game;