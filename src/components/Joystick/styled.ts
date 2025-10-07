import styled from 'styled-components';

export const JoystickContainer = styled.div`
  position: relative;
  width: 120px;
  height: 120px;
  pointer-events: auto;
  
  @media (max-width: 768px) {
    width: 100px;
    height: 100px;
  }
`;

export const JoystickBase = styled.div`
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.5);
  border-radius: 50%;
  backdrop-filter: blur(10px);
`;

export const JoystickHandle = styled.div<{ x: number; y: number }>`
  position: absolute;
  width: 50px;
  height: 50px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 50%;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) translate(${props => props.x * 30}px, ${props => props.y * 30}px);
  transition: transform 0.1s;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
`;
