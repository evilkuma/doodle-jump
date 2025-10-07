import { makeAutoObservable } from 'mobx';

export interface Platform {
  id: number;
  x: number;
  y: number;
  width: number;
  type: 'normal' | 'moving' | 'breakable';
}

class GameStore {
  playerPosition = { x: 0, y: 0, z: 0 };
  playerVelocity = { x: 0, y: 0 };
  platforms: Platform[] = [];
  score = 0;
  gameOver = false;
  isJumping = false;
  controlType: 'joystick' | 'accelerometer' = 'joystick';
  joystickPosition = { x: 0, y: 0 };
  highestPlatformY = 0;
  nextPlatformId = 0;
  cameraY = 0;
  
  // ОБНОВЛЕННЫЕ КОНСТАНТЫ ДЛЯ БОЛЕЕ МЕДЛЕННОЙ ФИЗИКИ
  readonly GRAVITY = -0.005;        // Уменьшили гравитацию
  readonly JUMP_FORCE = 0.25;       // Уменьшили силу прыжка
  readonly MOVE_SPEED = 0.3;       // Уменьшили скорость движения
  readonly VIEWPORT_HEIGHT = 10;
  readonly PLATFORM_SPAWN_RATE = 2;

  // Добавляем константы для тонкой настройки
  readonly MAX_FALL_SPEED = -0.3;   // Максимальная скорость падения
  readonly PLATFORM_BOUNCE = 0.95;  // Отскок от платформы (1 = полный отскок)

  constructor() {
    makeAutoObservable(this);
    this.generateInitialPlatforms();
  }

  get cameraPosition() {
    return {
      x: 0,
      y: this.cameraY,
      z: 10
    };
  }

  updateCamera() {
    // Более плавное движение камеры
    const targetY = Math.max(0, this.playerPosition.y - 4); // Увеличили отступ камеры
    
    // Еще более плавная интерполяция
    this.cameraY += (targetY - this.cameraY) * 0.05;
  }

  generateInitialPlatforms() {
    this.platforms = [];
    this.nextPlatformId = 0;
    this.highestPlatformY = 0;
    this.cameraY = 0;
    
    // Стартовая платформа побольше
    this.addPlatform(0, 0, 2.5, 'normal');
    
    // Более плотная начальная генерация платформ
    for (let i = 1; i < 20; i++) {
      this.generatePlatformAtHeight(i * 1.8); // Уменьшили расстояние между платформами
    }
    
    this.playerPosition = { x: 0, y: 2.5, z: 0 }; // Начальная позиция выше
    this.playerVelocity = { x: 0, y: 0 };
  }

  generatePlatformAtHeight(baseY: number) {
    // Уменьшили разброс по X для более предсказуемой игры
    const x = Math.random() * 3 - 1.5;
    const width = 1.5 + Math.random() * 0.5; // Шире платформы
    const y = baseY + (Math.random() - 0.5) * 1.0; // Меньше отклонение по Y
    
    const rand = Math.random();
    let type: 'normal' | 'moving' | 'breakable' = 'normal';
    
    // Реже генерируем специальные платформы
    if (rand > 0.85) {
      type = 'moving';
    } else if (rand > 0.7) {
      type = 'breakable';
    }
    
    this.addPlatform(x, y, width, type);
  }

  addPlatform(x: number, y: number, width: number, type: 'normal' | 'moving' | 'breakable' = 'normal') {
    const platform: Platform = {
      id: this.nextPlatformId++,
      x,
      y,
      width,
      type
    };
    
    this.platforms.push(platform);
    this.highestPlatformY = Math.max(this.highestPlatformY, y);
  }

  removePlatform(id: number) {
    this.platforms = this.platforms.filter(p => p.id !== id);
  }

  updatePlatforms(playerY: number) {
    this.platforms = this.platforms.filter(platform => 
      platform.y > this.cameraY - this.VIEWPORT_HEIGHT / 2
    );

    const highestVisibleY = this.cameraY + this.VIEWPORT_HEIGHT;
    while (this.highestPlatformY < highestVisibleY) {
      this.generatePlatformAtHeight(this.highestPlatformY + this.PLATFORM_SPAWN_RATE);
    }
  }

  checkPlatformCollision(): boolean {
    const playerBottom = this.playerPosition.y - 0.2; // Увеличили зону коллизии
    const playerTop = this.playerPosition.y + 0.1;
    const playerLeft = this.playerPosition.x - 0.15;
    const playerRight = this.playerPosition.x + 0.15;

    for (const platform of this.platforms) {
      const platformTop = platform.y + 0.08; // Увеличили зону коллизии платформы
      const platformBottom = platform.y - 0.02;
      const platformLeft = platform.x - platform.width / 2;
      const platformRight = platform.x + platform.width / 2;

      // Более лояльная проверка коллизии
      if (this.playerVelocity.y <= 0.1) { // Разрешаем небольшую положительную скорость
        if (playerBottom <= platformTop && 
            playerTop >= platformBottom &&
            playerRight >= platformLeft && 
            playerLeft <= platformRight) {
          
          // Мягкий отскок от платформы
          this.playerVelocity.y = this.JUMP_FORCE * this.PLATFORM_BOUNCE;
          this.playerPosition.y = platformTop + 0.2; // Поднимаем игрока над платформой
          
          if (platform.type === 'breakable') {
            setTimeout(() => this.removePlatform(platform.id), 100); // Задержка перед удалением
          }
          
          return true;
        }
      }
    }
    return false;
  }

  updateGame() {
    if (this.gameOver) return;

    // Применяем гравитацию с ограничением максимальной скорости
    this.playerVelocity.y += this.GRAVITY;
    this.playerVelocity.y = Math.max(this.playerVelocity.y, this.MAX_FALL_SPEED);

    // Обновляем позицию
    this.playerPosition.x += this.playerVelocity.x;
    this.playerPosition.y += this.playerVelocity.y;

    // Более мягкое ограничение по горизонтали
    if (this.playerPosition.x > 2.2) {
      this.playerPosition.x = 2.2;
      this.playerVelocity.x *= 0.5; // Замедление у края
    }
    if (this.playerPosition.x < -2.2) {
      this.playerPosition.x = -2.2;
      this.playerVelocity.x *= 0.5;
    }

    // Проверка коллизий с платформами
    this.checkPlatformCollision();

    // Обновляем камеру
    this.updateCamera();

    // Обновляем платформы
    this.updatePlatforms(this.playerPosition.y);

    // Более лояльное условие конца игры
    if (this.playerPosition.y < this.cameraY - 10) {
      this.setGameOver(true);
    }

    // Обновление счета на основе высоты
    const heightScore = Math.floor(this.playerPosition.y * 8); // Меньший множитель
    if (heightScore > this.score) {
      this.updateScore(heightScore);
    }
  }

  setPlayerPosition(x: number, y: number) {
    this.playerPosition.x = x;
    this.playerPosition.y = y;
  }

  setPlayerVelocity(x: number, y: number) {
    // Ограничиваем максимальную горизонтальную скорость
    this.playerVelocity.x = Math.max(-this.MOVE_SPEED, Math.min(this.MOVE_SPEED, x));
    this.playerVelocity.y = y;
  }

  setJoystickPosition(x: number, y: number) {
    this.joystickPosition.x = x;
    this.joystickPosition.y = y;
    
    if (this.controlType === 'joystick') {
      // Плавное управление с насыщением
      this.playerVelocity.x = x * this.MOVE_SPEED;
    }
  }

  setControlType(type: 'joystick' | 'accelerometer') {
    this.controlType = type;
    if (type === 'accelerometer') {
      this.playerVelocity.x = 0;
    }
  }

  updateScore(points: number) {
    this.score = points;
  }

  setGameOver(status: boolean) {
    this.gameOver = status;
  }

  resetGame() {
    this.score = 0;
    this.gameOver = false;
    this.playerVelocity = { x: 0, y: 0 };
    this.cameraY = 0;
    this.generateInitialPlatforms();
  }
}

export const gameStore = new GameStore();