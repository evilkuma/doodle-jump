import React, { useRef, useEffect, useState, useCallback } from 'react';
import styled from 'styled-components';
import { observer } from 'mobx-react-lite';
import { gameStore } from '../../stores/gameStore';

const JoystickContainer = styled.div`
  position: relative;
  width: 120px;
  height: 120px;
  pointer-events: auto;
  touch-action: none;
  
  /* Адаптивные размеры для мобильных */
  @media (max-width: 768px) {
    width: 100px;
    height: 100px;
  }

  @media (max-width: 480px) {
    width: 90px;
    height: 90px;
  }

  /* Для очень маленьких экранов */
  @media (max-width: 360px) {
    width: 80px;
    height: 80px;
  }
`;

const JoystickBase = styled.div`
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.5);
  border-radius: 50%;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
`;

const JoystickHandle = styled.div<{ x: number; y: number }>`
  position: absolute;
  width: 50px;
  height: 50px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) translate(
    ${props => props.x * 25}px, 
    ${props => props.y * 25}px
  );
  transition: transform 0.1s ease-out;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  border: 2px solid rgba(255, 255, 255, 0.8);

  /* Адаптивные размеры для мобильных */
  @media (max-width: 768px) {
    width: 45px;
    height: 45px;
    transform: translate(-50%, -50%) translate(
      ${props => props.x * 22}px, 
      ${props => props.y * 22}px
    );
  }

  @media (max-width: 480px) {
    width: 40px;
    height: 40px;
    transform: translate(-50%, -50%) translate(
      ${props => props.x * 20}px, 
      ${props => props.y * 20}px
    );
  }

  @media (max-width: 360px) {
    width: 35px;
    height: 35px;
    transform: translate(-50%, -50%) translate(
      ${props => props.x * 18}px, 
      ${props => props.y * 18}px
    );
  }
`;

const Joystick: React.FC = observer(() => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Определяем мобильное устройство
  useEffect(() => {
    const checkMobile = () => {
      return window.innerWidth <= 768 || 'ontouchstart' in window;
    };
    
    setIsMobile(checkMobile());
    
    const handleResize = () => {
      setIsMobile(checkMobile());
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const updateJoystick = useCallback((clientX: number, clientY: number) => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const deltaX = (clientX - centerX) / (rect.width / 2);
    const deltaY = (clientY - centerY) / (rect.height / 2);
    
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const limitedDistance = Math.min(distance, 1);
    
    const angle = Math.atan2(deltaY, deltaX);
    const limitedX = Math.cos(angle) * limitedDistance;
    const limitedY = Math.sin(angle) * limitedDistance;
    
    gameStore.setJoystickPosition(limitedX, -limitedY);
  }, []);

  const handleStart = useCallback((clientX: number, clientY: number) => {
    setIsDragging(true);
    updateJoystick(clientX, clientY);
  }, [updateJoystick]);

  const handleMove = useCallback((clientX: number, clientY: number) => {
    if (!isDragging) return;
    updateJoystick(clientX, clientY);
  }, [isDragging, updateJoystick]);

  const handleEnd = useCallback(() => {
    setIsDragging(false);
    gameStore.setJoystickPosition(0, 0);
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;

    // Touch events
    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      if (e.touches.length > 0) {
        handleStart(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      if (e.touches.length > 0) {
        handleMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      e.preventDefault();
      handleEnd();
    };

    const handleTouchCancel = (e: TouchEvent) => {
      e.preventDefault();
      handleEnd();
    };

    // Mouse events
    const handleMouseDown = (e: MouseEvent) => {
      handleStart(e.clientX, e.clientY);
    };

    const handleMouseMove = (e: MouseEvent) => {
      handleMove(e.clientX, e.clientY);
    };

    const handleMouseUp = () => {
      handleEnd();
    };

    // Add event listeners
    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);
    container.addEventListener('touchcancel', handleTouchCancel);
    
    container.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      // Remove event listeners
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
      container.removeEventListener('touchcancel', handleTouchCancel);
      
      container.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleStart, handleMove, handleEnd]);

  return (
    <JoystickContainer 
      ref={containerRef}
      style={{
        marginLeft: isMobile ? '5px' : '0',
        marginBottom: isMobile ? '5px' : '0'
      }}
    >
      <JoystickBase />
      <JoystickHandle 
        x={gameStore.joystickPosition.x} 
        y={gameStore.joystickPosition.y} 
      />
    </JoystickContainer>
  );
});

export default Joystick;