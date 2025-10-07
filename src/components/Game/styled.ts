import styled from 'styled-components';

export const GameContainer = styled.div`
  width: 100%;
  height: 100vh;
  position: relative;
`;

export const UIOverlay = styled.div`
  position: absolute;
  top: 20px;
  left: 0;
  width: 100%;
  padding: 20px;
  pointer-events: none;
  z-index: 100;
`;

export const Score = styled.div`
  color: white;
  font-size: 24px;
  font-weight: bold;
  text-align: center;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
`;

export const ControlButtons = styled.div`
  position: absolute;
  top: 20px;
  right: 20px;
  display: flex;
  gap: 10px;
  pointer-events: auto;
`;

export const Button = styled.button`
  padding: 10px 15px;
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.5);
  border-radius: 10px;
  color: white;
  font-weight: bold;
  backdrop-filter: blur(10px);
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }

  &.active {
    background: rgba(255, 255, 255, 0.4);
    border-color: white;
  }
`;

export const GameOverScreen = styled.div`
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
`;

export const RestartButton = styled.button`
  padding: 15px 30px;
  background: #4CAF50;
  border: none;
  border-radius: 10px;
  color: white;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  margin-top: 20px;

  &:hover {
    background: #45a049;
  }
`;