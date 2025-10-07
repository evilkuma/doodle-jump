import { createGlobalStyle } from 'styled-components';

export const GlobalStyles = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: 'Arial', sans-serif;
    overflow: hidden;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    user-select: none;
    touch-action: none;
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    -khtml-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
  }

  #root {
    width: 100vw;
    height: 100vh;
    position: relative;
  }

  .controls-overlay {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    display: flex;
    justify-content: center;
    padding: 20px;
    pointer-events: none;
    z-index: 1000;
  }

  /* Мобильные стили */
  @media (max-width: 768px) {
    .controls-overlay {
      /* padding: 15px; */
      //bottom: env(safe-area-inset-bottom, 15px); /* Учет безопасных зон */
    }
  }

  @media (max-width: 480px) {
    .controls-overlay {
      bottom: 50px;
      /* padding: 10px; */
      /* bottom: env(safe-area-inset-bottom, 10px); */
    }
  }

  /* Предотвращение выделения текста на мобильных */
  * {
    -webkit-tap-highlight-color: transparent;
  }
`;