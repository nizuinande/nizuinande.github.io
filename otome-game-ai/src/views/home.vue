<script setup>
import videoPause from '@/assets/images/video-pause.svg'
import videoplay from '@/assets/images/video-play.svg'
import { onMounted, onUnmounted, ref, computed } from 'vue'
import { useAppStore } from '@/stores/app'
import { useRouter } from 'vue-router'
import ChatDialog from '@/components/ChatDialog.vue'
import { initSeasonParticles } from '@/utils/seasonParticles'
const isMobile = ref(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent))
const store = useAppStore()
console.log(store, 'storestorestorestorestorestorestorestorestorestorestore');

const router = useRouter()
const showChatDialog = ref(false)
const currentTheme = computed(() => store.currentTheme)

const handleTouchStart = (event) => {
  event.currentTarget.classList.add('touch-active')
}

const handleTouchEnd = (event) => {
  event.currentTarget.classList.remove('touch-active')
}

const handleSelectCharacter = (char) => {
  store.selectCharacter(char)
  if (isMobile.value) {
    router.push({
      path: '/chat-room',
      query: { character: char.name }
    })
  } else {
    showChatDialog.value = true
  }
}


onMounted(() => {

  const updateIsMobile = () => {
    isMobile.value = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  }



  // 初始化粒子系统

  window.particleSystem = initSeasonParticles(document.getElementById('season-canvas'), {
    theme: store.currentTheme,
    particleType: currentTheme.value === 'spring' ? 'sakura' : 'leaf'
  })

  console.log(window.particleSystem);


  // 窗口resize处理
  const handleResize = () => {
    updateIsMobile()
    if (window.particleSystem) {
      window.particleSystem.resize()
    }
  }

  // 初始化时更新一次
  updateIsMobile()

  // 监听窗口大小变化
  window.addEventListener('resize', handleResize)
  // 组件卸载时移除监听
  onUnmounted(() => {
    window.removeEventListener('resize', updateIsMobile)
    if (window.particleSystem) {
      window.particleSystem.destroy()
    }
  })
})

// 主题切换方法
const changeTheme = (season) => {
  store.updateTheme(season)
  document.documentElement.setAttribute('data-theme', season)
  if (window.particleSystem) {
    window.particleSystem.destroy()
    window.particleSystem = initSeasonParticles(document.getElementById('season-canvas'), {
      theme: store.currentTheme,
      particleType: store.currentTheme === 'spring' ? 'sakura' : 'leaf',
      color: getComputedStyle(document.documentElement).getPropertyValue('--theme-particle-color')
    })
  }
}

const isPlaying = (char) => {
  return store.currentPlaying === char.name
}

const toggleVoice = (char) => {
  store.togglePlay({
    name: char.name,
    voiceSample: char.voiceSample
  })
}



</script>

<template>
  <el-main>
    <div class="theme-switcher">
      <button v-for="season in ['spring', 'summer', 'autumn', 'winter']" :key="season" class="season-btn"
        :class="{ active: currentTheme === season }" @click="changeTheme(season)"
        :style="{ backgroundColor: `var(--theme-btn-color)` }">
        {{ { spring: '🌸', summer: '🌿', autumn: '🍂', winter: '❄️' }[season] }}
      </button>
    </div>
    <canvas id="season-canvas" style="position: fixed; top: 0; left: 0; z-index: 0; pointer-events: none;" />
    <el-container class="pa-8">
      <el-row justify="center" style="height:100%">
        <el-col :span="24" :md="20" style="  display: flex; align-items: center;justify-content: center;">
          <el-card class="glass-card rounded-xl pa-6">
            <el-row class="el-row--flex  flex-nowrap justify-space-between" :gutter="20">
              <el-col v-for="(char, i) in store.characters" :key="i" :span="6" class="mb-8 px-2">
                <div :class="['character-card', currentTheme + '-theme']" @touchstart.passive="handleTouchStart"
                  @touchend="handleTouchEnd">
                  <div class="character-info">
                    <h3 class="character-name">{{ char.name }}</h3>
                    <div class="tags">
                      <el-tag :class="currentTheme + '-theme'" effect="dark" size="large"
                        style="padding:8px 16px; border-radius:24px; font-family: 'Comic Sans MS', cursive;">
                        <i :class="['iconfont', {
        'icon-cherry-blossom': currentTheme === 'spring',
        'icon-palm': currentTheme === 'summer',
        'icon-maple-leaf': currentTheme === 'autumn',
        'icon-snowflake': currentTheme === 'winter'
      }]" />
                        {{ char.personality }}
                      </el-tag>
                    </div>
                  </div>
                  <img @click="handleSelectCharacter(char)" :src="char.image"
                    style="width: 100%; object-fit: contain" />
                  <el-icon class="voice-icon" :size="36" :color="isPlaying(char) ? '#FF4081' : '#E91E63'"
                    @click="toggleVoice(char)">
                    <img :src="isPlaying(char) ? videoPause : videoplay" />
                  </el-icon>
                </div>
              </el-col>
            </el-row>
          </el-card>
        </el-col>
      </el-row>
    </el-container>
    <el-dialog v-model="showChatDialog" :title="store.selectedCharacter ? store.selectedCharacter.name : '对话'"
      width="60%" custom-class="chat-dialog" :show-close="false">
      <div class="sakura"></div>
      <div class="sakura"></div>
      <div class="sakura"></div>
      <div class="sakura"></div>
      <div class="sakura"></div>
      <ChatDialog :character="store.selectedCharacter" />
    </el-dialog>
  </el-main>
</template>

<style lang="scss">
:root {
  /* 季节主题变量已迁移到全局文件 */
  --theme-border-glow-3: #FFFFFF;
  --theme-play-btn-color: #FF4081;
  --theme-pause-btn-color: #E91E63;
  cursor: var(--theme-cursor, auto);
}

.theme-switcher {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1;
}

.el-main {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
}

.my-header {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  gap: 16px;
}

.el-container {
  width: 100vw;
  height: 100%;

}

.el-dialog {
  background: rgba(255, 255, 255, 0.85) !important;
  backdrop-filter: blur(25px) saturate(200%) !important;
  border: 1px solid rgba(255, 255, 255, 0.5) !important;
  box-shadow: 0 12px 40px rgba(231, 156, 210, 0.3) !important;
  border-radius: 20px !important;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(45deg, rgba(255, 214, 232, 0.6) 0%, rgba(255, 241, 248, 0.8) 100%);
    opacity: 0.5;
    mix-blend-mode: overlay;
    z-index: -1;
    border-radius: inherit;
  }

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.2) 0%, transparent 60%);
    pointer-events: none;
  }
}

.background {
  position: fixed;
  width: 100vw;
  height: 100%;
  top: 0;
  left: 0;
  z-index: 0;
}

.glass-card {
  background: transparent;
  // background:
  //   linear-gradient(135deg,
  //     var(--theme-glass-gradient-from) 0%,
  //     var(--theme-glass-gradient-to) 100%) !important;
  // backdrop-filter: blur(24px) saturate(200%);
  border: 0px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 0 0 0 !important;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(45deg,
        rgba(255, 255, 255, 0.1) 0%,
        rgba(255, 255, 255, 0.3) 50%,
        transparent 100%);
    animation: glassFlow 3s linear infinite;
    mask: linear-gradient(transparent 20%, white 50%, transparent 80%);
  }

  &::after {
    content: '';
    position: absolute;
    inset: -2px;
    background: conic-gradient(from 180deg at 50% 50%,
        var(--theme-border-glow-1),
        var(--theme-border-glow-2),
        var(--theme-border-glow-3),
        var(--theme-border-glow-2),
        var(--theme-border-glow-1));
    z-index: -1;
    border-radius: inherit;
    animation: borderRotate 3s linear infinite;
    opacity: 0.6;
  }

  box-shadow: 0 8px 32px rgba(231, 156, 210, 0.2);

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(45deg, #ffd6e8 0%, #fff1f8 100%);
    opacity: 0.4;
    mix-blend-mode: overlay;
    z-index: -1;
    border-radius: inherit;
  }

  &::after {
    content: '';
    position: absolute;
    inset: -2px;
    background: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23FFFFFF' stroke-width='1' opacity='0.2'%3E%3Cpath d='M0 50h100M50 0v100'/%3E%3C/g%3E%3C/svg%3E");
    opacity: 0.15;
    z-index: -1;
    border-radius: inherit;
  }
}

.el-dialog__title {
  font-family: 'Dancing Script', cursive;
  font-size: 2rem;
  color: #e83f6f;
  text-shadow: 1px 1px 2px rgba(255, 255, 255, 0.8);
  position: relative;

  &::after {
    content: '';
    position: absolute;
    bottom: -8px;
    left: 50%;
    width: 80%;
    height: 2px;
    background: linear-gradient(90deg, transparent 0%, #ffffff 50%, transparent 100%);
    transform: translateX(-50%);
  }
}


.character-card {
  position: relative;
  overflow: hidden;
  cursor: pointer;
  border-radius: 16px;
  padding: 12px;
  --glass-bg: rgba(255, 255, 255, 0.15);
  transition: all 0.3s ease;

  &::before {
    content: '';
    position: absolute;
    inset: -2px;
    background: linear-gradient(45deg,
        rgba(var(--theme-card-gradient-from-rgb), 0.1),
        rgba(var(--theme-card-gradient-to-rgb), 0.1));
    z-index: -1;
    border-radius: 16px;
  }

  &[class$='-theme'] {
    background: var(--theme-card-bg);
    border: 2px solid var(--theme-card-border);
    box-shadow: var(--theme-card-shadow);
  }

  &.spring-theme {
    --theme-play-btn-color: #FFB7D5;
    --theme-pause-btn-color: #FF9EB5;
    --theme-card-gradient-from: #FFB7D5;
    --theme-card-gradient-to: #FFDEEB;
    --theme-card-bg: linear-gradient(45deg, rgba(255, 245, 249, 0.8), rgba(255, 238, 244, 0.8));
    --theme-card-border: rgba(255, 183, 213, 0.3);
    --theme-card-shadow: 0 8px 32px rgba(255, 183, 213, 0.2);
  }

  &.summer-theme {
    --theme-play-btn-color: #B7E1FF;
    --theme-pause-btn-color: #9ED2FF;
    --theme-card-gradient-from: #B7E1FF;
    --theme-card-gradient-to: #D4EDFF;
    --theme-card-bg: linear-gradient(45deg, rgba(245, 252, 255, 0.8), rgba(232, 247, 255, 0.8));
    --theme-card-border: rgba(183, 225, 255, 0.3);
    --theme-card-shadow: 0 8px 32px rgba(183, 225, 255, 0.2);
  }

  &.autumn-theme {
    --theme-play-btn-color: #FFD7B7;
    --theme-pause-btn-color: #FFC49E;
    --theme-card-gradient-from: #FFD7B7;
    --theme-card-gradient-to: #FFE8D6;
    --theme-card-bg: linear-gradient(45deg, rgba(255, 248, 245, 0.8), rgba(255, 243, 238, 0.8));
    --theme-card-border: rgba(255, 215, 183, 0.3);
    --theme-card-shadow: 0 8px 32px rgba(255, 215, 183, 0.2);
  }

  &.winter-theme {
    --theme-play-btn-color: #D5B7FF;
    --theme-pause-btn-color: #C49EFF;
    --theme-card-gradient-from: #D5B7FF;
    --theme-card-gradient-to: #E8D6FF;
    --theme-card-bg: linear-gradient(45deg, rgba(251, 245, 255, 0.8), rgba(247, 240, 255, 0.8));
    --theme-card-border: rgba(213, 183, 255, 0.3);
    --theme-card-shadow: 0 8px 32px rgba(213, 183, 255, 0.2);
  }

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h60v60H0z' fill='none'/%3E%3Cpath d='M30 5c13.8 0 25 11.2 25 25S43.8 55 30 55 5 43.8 5 30 16.2 5 30 5zm0-5C13.4 0 0 13.4 0 30s13.4 30 30 30 30-13.4 30-30S46.6 0 30 0z' fill='%23ffffff' opacity='0.1'/%3E%3C/svg%3E");
    opacity: 0.2;
  }

  .character-name {
    font-family: 'Dancing Script', cursive;
    font-size: 2rem;
    color: #e83f6f;
    text-shadow: 1px 1px 2px rgba(255, 255, 255, 0.8);
    position: relative;

    &::after {
      content: '';
      position: absolute;
      bottom: -8px;
      left: 50%;
      width: 80%;
      height: 2px;
      background: linear-gradient(90deg, transparent 0%, #ffffff 50%, transparent 100%);
      transform: translateX(-50%);
    }
  }

  &:hover {
    transform: translateY(-8px) scale(1.05) rotate(-2deg);
    box-shadow: var(--theme-card-shadow) !important;

    .tags {
      transform: translateY(-10px);
      opacity: 1;
    }

    .character-name {
      &::after {
        width: 100%;
      }
    }
  }

  .tags {
    transition: all 0.3s ease;
    opacity: 0.8;

    .el-tag {
      position: relative;
      overflow: hidden;

      &::before {
        content: '';
        position: absolute;
        top: -50%;
        left: -50%;
        width: 200%;
        height: 200%;
        background: linear-gradient(45deg, transparent 25%, rgba(255, 255, 255, 0.4) 50%, transparent 75%);
        animation: badgeGlow 2s infinite linear;
      }
    }
  }

  img {
    transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    z-index: 2;
    filter: drop-shadow(0 4px 12px rgba(232, 63, 111, 0.2));
  }
}

@keyframes badgeGlow {
  0% {
    transform: rotate(0deg) translateX(-50%);
  }

  100% {
    transform: rotate(360deg) translateX(-50%);
  }
}

@import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&display=swap');

@keyframes petalFall {
  0% {
    transform: translateY(-100%) rotate(0deg);
  }

  100% {
    transform: translateY(100vh) rotate(360deg);
  }
}

.character-card:hover::after {
  content: '';
  position: absolute;
  top: -20px;
  left: -20px;
  right: -20px;
  bottom: -20px;
  background: linear-gradient(45deg, transparent 40%, rgba(255, 183, 213, 0.3) 60%, transparent 70%),
    repeating-linear-gradient(-45deg, rgba(255, 255, 255, 0.1) 0 2px, transparent 2px 4px);
  animation: petalFall 8s linear infinite;
  pointer-events: none;
}

.el-tag {
  background: var(--theme-tag-bg) !important;
  border: var(--theme-tag-border) !important;
  box-shadow: var(--theme-tag-shadow);
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(45deg,
        var(--theme-tag-glow-from) 0%,
        var(--theme-tag-glow-to) 50%,
        transparent 100%);
    opacity: 0.3;
    animation: tagGlow 2s infinite linear;
  }

  &:hover {
    transform: translateY(-2px);
    filter: brightness(1.1);
  }
}

.spring-theme {
  --theme-play-btn-color: #FFB7D5;
  --theme-pause-btn-color: #FF9EB5;
  --theme-tag-bg: linear-gradient(145deg, #FFB7D5, #FF9EB5);
  --theme-tag-border: 1px solid rgba(255, 214, 232, 0.5) !important;
  --theme-tag-shadow: 0 4px 16px rgba(255, 183, 213, 0.3);
  --theme-tag-glow-from: #FFE4F3;
  --theme-tag-glow-to: #FFB7D5;
}

.summer-theme {
  --theme-play-btn-color: #B7E1FF;
  --theme-pause-btn-color: #9ED2FF;
  --theme-tag-bg: linear-gradient(145deg, #B7E1FF, #9ED2FF);
  --theme-tag-border: 1px solid rgba(183, 225, 255, 0.5) !important;
  --theme-tag-shadow: 0 4px 16px rgba(183, 225, 255, 0.3);
  --theme-tag-glow-from: #E4F4FF;
  --theme-tag-glow-to: #B7E1FF;
}

.autumn-theme {
  --theme-play-btn-color: #FFD7B7;
  --theme-pause-btn-color: #FFC49E;
  --theme-tag-bg: linear-gradient(145deg, #FFD7B7, #FFC49E);
  --theme-tag-border: 1px solid rgba(255, 215, 183, 0.5) !important;
  --theme-tag-shadow: 0 4px 16px rgba(255, 215, 183, 0.3);
  --theme-tag-glow-from: #FFEEDD;
  --theme-tag-glow-to: #FFD7B7;
}

.winter-theme {
  --theme-play-btn-color: #D5B7FF;
  --theme-pause-btn-color: #C49EFF;
  --theme-tag-bg: linear-gradient(145deg, #D5B7FF, #C49EFF);
  --theme-tag-border: 1px solid rgba(213, 183, 255, 0.5) !important;
  --theme-tag-shadow: 0 4px 16px rgba(213, 183, 255, 0.3);
  --theme-tag-glow-from: #EEE4FF;
  --theme-tag-glow-to: #D5B7FF;
}

@keyframes tagGlow {
  0% {
    transform: translateX(-100%);
  }

  100% {
    transform: translateX(100%);
  }
}

@keyframes glassFlow {
  0% {
    transform: translateX(-100%) skew(-15deg);
  }

  100% {
    transform: translateX(200%) skew(-15deg);
  }
}

@keyframes borderRotate {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

.voice-icon {
  transition: all 0.3s ease;

  &:active {
    background-color: var(--theme-play-btn-color);
    box-shadow: 0 0 8px var(--theme-pause-btn-color);
    transform: scale(1.2);
    filter: drop-shadow(0 0 8px rgba(232, 63, 111, 0.8));
  }

  position: relative;
  z-index: 999;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

@media (max-width: 768px) {
  .el-col {
    flex: 0 0 100% !important;
    max-width: 100% !important;
  }

  .character-card {
    padding: 8px;
    margin-bottom: 12px;
    overflow: hidden;

    .character-name {
      font-size: 1.5rem !important;
      line-height: 1.2;
    }

    img {
      width: 100%;
      min-height: 200px;
      object-fit: contain;
    }
  }

  .glass-card {
    padding: 20px 12px 0 12px !important;
  }
}

// 添加樱花飘落动画
@keyframes sakuraFall {
  0% {
    transform: translateY(-10%) rotate(0deg);
    opacity: 1;
  }

  100% {
    transform: translateY(100vh) rotate(360deg);
    opacity: 0;
  }
}

.el-input__wrapper {


  box-shadow: 0 0 0 0px var(--el-input-border-color, var(--el-border-color)) inset;
}

.el-input__wrapper.is-focus {
  box-shadow: 0 0 0 0px var(--el-input-focus-border-color) inset;
}

.el-dialog {
  position: relative;
  overflow: hidden;

  .sakura {
    position: absolute;
    width: 15px;
    height: 15px;
    background: radial-gradient(circle, #ffb7d5 30%, transparent 70%);
    border-radius: 50%;
    animation: sakuraFall 5s linear infinite;
    pointer-events: none;

    &:nth-child(1) {
      left: 10%;
      animation-duration: 8s;
      animation-delay: 0s;
    }

    &:nth-child(2) {
      left: 30%;
      animation-duration: 6s;
      animation-delay: 2s;
    }

    &:nth-child(3) {
      left: 50%;
      animation-duration: 7s;
      animation-delay: 1s;
    }

    &:nth-child(4) {
      left: 70%;
      animation-duration: 9s;
      animation-delay: 3s;
    }

    &:nth-child(5) {
      left: 90%;
      animation-duration: 5s;
      animation-delay: 4s;
    }
  }
}

button {
  border: 0px;
}

button:hover {
  border: 0px;
}
</style>
