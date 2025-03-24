export function initSeasonParticles (canvas, options) {
  return new SeasonParticles(canvas, options?.theme)
}

class SeasonParticles {
  drawSkyBackground () {
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height)
    gradient.addColorStop(0, this.config.skyGradient.start)
    gradient.addColorStop(1, this.config.skyGradient.end)

    this.ctx.save()
    this.ctx.fillStyle = gradient
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
    this.ctx.restore()
  }


  constructor(canvas, season = 'spring') {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')
    this.particles = []
    this.images = {
      petal: new Image(),
      leaf: new Image(),
      snowflake: new Image(),
      maple: new Image()
    }
    // 加载图片
    this.images.petal.src = '/otomeGame/images/tree/petal.svg'
    this.images.leaf.src = '/otomeGame/images/tree/leaf.svg'
    this.images.snowflake.src = '/otomeGame/images/tree/snowflake.svg'
    this.images.maple.src = '/otomeGame/images/tree/maple.svg'

    this.seasonConfig = {
      spring: {
        color: { base: '#FFB7D5', variants: ['#FF99B9', '#FFD1DC'] },
        skyGradient: { start: '#87CEEB', end: '#E0F6FF' },
        shape: 'petal',
        density: 0.7,
        motion: { angle: -30, speed: 2, turbulence: 0.3 },
        effects: ['bloom']
      },
      summer: {
        color: { base: '#A5D6A7', variants: ['#81C784', '#C8E6C9'] },
        skyGradient: { start: '#00BFFF', end: '#87CEFA' },
        shape: 'leaf',
        density: 0.5,
        motion: { angle: 0, speed: 1.5, turbulence: 0.5 },
        effects: ['sunbeam']
      },
      autumn: {
        color: { base: '#FFAB91', variants: ['#FF8A65', '#FFCCBC'] },
        skyGradient: { start: '#FFA500', end: '#FFDAB9' },
        shape: 'maple',
        density: 0.6,
        motion: { angle: 45, speed: 1.8, turbulence: 0.4 },
        effects: ['golden']
      },
      winter: {
        color: { base: '#E1F5FE', variants: ['#B3E5FC', '#F0F4C3'] },
        skyGradient: { start: '#F0F8FF', end: '#E0FFFF' },
        shape: 'snowflake',
        density: 0.8,
        motion: { angle: 90, speed: 1.2, turbulence: 0.2 },
        effects: ['sparkle']
      }
    }
    this.setSeason(season)
    this.init()
  }

  init () {
    this.canvas.width = window.innerWidth
    this.canvas.height = window.innerHeight
    this.createParticles()
    this.animate()
    window.addEventListener('resize', () => this.resize())
  }

  createParticles () {
    const MAX_STATIC_PARTICLES = 2000;
    const activeParticles = this.particles.filter(p => !p.isStatic).length;
    const aspectRatio = this.canvas.width / this.canvas.height;
    const count = Math.min(
      Math.floor((aspectRatio * this.config.density) * 150),
      MAX_STATIC_PARTICLES - (this.particles.length - activeParticles)
    );

    if (count > 0) {
      this.particles.push(...Array.from({ length: count }, () => ({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        size: Math.random() * 6 + 4,
        color: this.getRandomColor(),
        angle: (Math.PI / 180) * this.config.motion.angle,
        speed: this.config.motion.speed * (Math.random() * 0.5 + 0.5),
        rotation: Math.random() * Math.PI * 2,
        isStatic: false,
        createdAt: Date.now() // 添加创建时间戳
      })));
    }
  }

  getRandomColor () {
    const colors = [this.config.color.base, ...this.config.color.variants]
    return colors[Math.floor(Math.random() * colors.length)]
  }

  drawParticle (particle) {
    // 跳过静态粒子绘制（由堆积效果统一渲染）
    this.ctx.save();
    if (particle.isStatic) {
      this.ctx.globalAlpha = 0.3 + (particle.stackOrder * 0.05);
      this.ctx.translate(particle.x, particle.y + (particle.stackOrder * 2));
      this.ctx.rotate(particle.rotation * 0.2);
    } else {
      this.ctx.globalAlpha = Math.min(1, (Date.now() - particle.createdAt) / 2000);
      this.ctx.translate(particle.x, particle.y);
      this.ctx.rotate(particle.rotation);
    }

    const img = this.images[this.config.shape];
    const size = particle.size * 2;
    this.ctx.drawImage(img, -size / 2, -size / 2, size, size);

    this.ctx.restore();
  }

  drawPetalShape (particle) {
    this.ctx.beginPath()
    this.ctx.moveTo(0, 0)
    this.ctx.bezierCurveTo(-5, -8, -10, 5, 0, 15)
    this.ctx.bezierCurveTo(10, 5, 5, -8, 0, 0)
    this.ctx.fillStyle = particle.color
    this.ctx.globalAlpha = 0.8
    this.ctx.fill()
  }

  drawLeafShape (particle) {
    this.ctx.beginPath();
    this.ctx.ellipse(0, 0, particle.size / 2, particle.size, 0, 0, Math.PI * 2);
    // 叶脉装饰
    this.ctx.moveTo(-particle.size / 4, 0);
    this.ctx.lineTo(particle.size / 4, 0);
    this.ctx.moveTo(0, -particle.size / 2);
    this.ctx.lineTo(0, particle.size / 2);
    this.ctx.strokeStyle = this.ctx.fillStyle = particle.color;
    this.ctx.globalAlpha = 0.7;
    this.ctx.fill();
    this.ctx.stroke();
  }

  drawSnowflake (particle) {
    const branch = (length, angle) => {
      this.ctx.moveTo(0, 0);
      this.ctx.lineTo(length, 0);
      this.ctx.translate(length, 0);
      this.ctx.rotate(angle);
      this.ctx.lineTo(length / 3, 0);
      this.ctx.rotate(-angle * 2);
      this.ctx.lineTo(length / 3, 0);
      this.ctx.translate(-length, 0);
    };

    this.ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      branch(particle.size, Math.PI / 6);
      this.ctx.rotate(Math.PI / 3);
    }
    this.ctx.strokeStyle = particle.color;
    this.ctx.lineWidth = 1;
    this.ctx.globalAlpha = 0.9;
    this.ctx.stroke();
  }

  drawMapleLeaf (particle) {
    this.ctx.beginPath();
    this.ctx.moveTo(0, -particle.size);
    // 枫叶主体曲线
    this.ctx.bezierCurveTo(
      particle.size / 2, -particle.size / 2,
      particle.size, particle.size / 3,
      0, particle.size
    );
    this.ctx.bezierCurveTo(
      -particle.size, particle.size / 3,
      -particle.size / 2, -particle.size / 2,
      0, -particle.size
    );
    // 叶尖装饰
    this.ctx.moveTo(0, -particle.size / 2);
    this.ctx.lineTo(particle.size / 4, -particle.size * 1.2);
    this.ctx.lineTo(-particle.size / 4, -particle.size * 1.2);
    this.ctx.closePath();

    this.ctx.fillStyle = particle.color;
    this.ctx.globalAlpha = 0.8;
    this.ctx.fill();
  }

  updateParticles () {
    this.particles.forEach(particle => {
      if (!particle.isStatic) {
        particle.x += Math.cos(particle.angle) * particle.speed
        particle.y += Math.sin(particle.angle) * particle.speed
        particle.rotation += 0.02
        particle.angle += (Math.random() - 0.5) * this.config.motion.turbulence

        // 地面碰撞检测
        const groundLevel = this.canvas.height - particle.size * 2;
        if (particle.y >= groundLevel) {
          particle.y = Math.min(groundLevel, this.canvas.height - particle.size * (0.5 + Math.random()));
          particle.isStatic = true;
          particle.stackOrder = Math.min(
            Math.floor((this.canvas.height - particle.y) / 5),
            Math.floor(this.canvas.height / 15)
          ); // 限制最大堆积层数
          particle.y -= particle.stackOrder * 0.8; // 堆积偏移
          particle.rotationSpeed = particle.isStatic ? particle.rotation * 0.1 : particle.rotation;
        }

        if (particle.x > this.canvas.width + 20) particle.x = -20
        if (particle.x < -20) particle.x = this.canvas.width + 20
      }
    })
  }

  animate () {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

    // 绘制天空背景
    this.drawSkyBackground()

    // 添加柔光效果
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.03)'
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)

    this.particles.forEach(particle => this.drawParticle(particle))
    this.updateParticles()

    this.animationFrameId = requestAnimationFrame(() => this.animate())
  }

  setSeason (season) {
    this.config = this.seasonConfig[season] || this.seasonConfig.spring
    this.particles = []
    this.createParticles()
  }

  resize () {
    this.canvas.width = window.innerWidth
    this.canvas.height = window.innerHeight
    this.createParticles()
  }

  destroy () {
    window.removeEventListener('resize', this.handleResize)
    cancelAnimationFrame(this.animationFrameId)
    this.animationFrameId = null
    this.particles = []
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    this.canvas.width = 1
    this.canvas.height = 1
  }
}



export { SeasonParticles }