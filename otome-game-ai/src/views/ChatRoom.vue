<template>
  <div class="chat-container">
    <div class="character-header">
      <van-icon name="arrow-left" class="back-button" @click="goBack" />
      <el-avatar :size="60" :src="character.image" class="character-avatar" />
      <h2 class="character-name">{{ character.name }}</h2>
    </div>
    <div class="message-area" ref="messageContainer">
      <div id="bg" class="ChatRoombackground"></div>

      <div v-for="(msg, index) in messages" :key="index" class="message-bubble" :class="{ 'user-message': msg.isUser }">
        <div class="message-content">{{ msg.content }}</div>
        <div class="message-time">{{ msg.time }}</div>
      </div>
      <div v-if="isLoading" class="message ai-message loading-indicator">
        <div class="message-bubble loading-bubble">
          <van-loading color="pink" />
        </div>
      </div>
    </div>
    <div class="input-area">
      <el-input v-model="inputMessage" placeholder="输入消息..." @keyup.enter="sendMessage" class="message-input">
        <template #append>
          <el-button type="primary" @click="sendMessage">发送</el-button>
        </template>
      </el-input>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { chatCompletion } from '@/services/api.js'
import * as THREE from 'three'

const route = useRoute()
const router = useRouter()
const store = useAppStore()
const character = ref({})

onMounted(() => {
  initThreeScene();
  const characterName = route.query.character
  if (characterName) {
    const foundCharacter = store.characters.find(c => c.name === characterName)
    if (foundCharacter) {
      character.value = foundCharacter;
      console.log(character.value);

      store.selectCharacter(foundCharacter)
    }
  }
})
// 初始化three.js场景
const initThreeScene = () => {
  const container = document.getElementById('bg')  // 修改为使用bg元素

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000)
  const renderer = new THREE.WebGLRenderer({ alpha: true })
  renderer.setSize(container.clientWidth, container.clientHeight)
  container.appendChild(renderer.domElement)

  // 创建花瓣几何体
  const petalGeometry = new THREE.PlaneGeometry(0.2, 0.4)
  const material = new THREE.MeshBasicMaterial({
    color: 0xff9eb5,
    transparent: true,
    opacity: 0.7,
    side: THREE.DoubleSide
  })

  const petals = []
  const petalCount = 200

  for (let i = 0; i < petalCount; i++) {
    const petal = new THREE.Mesh(petalGeometry, material)
    petal.position.x = (Math.random() - 0.5) * 100
    petal.position.y = Math.random() * 50
    petal.position.z = (Math.random() - 0.5) * 100
    petal.rotation.z = Math.random() * Math.PI * 2
    petals.push(petal)
    scene.add(petal)
  }

  camera.position.z = 30

  const animate = () => {
    requestAnimationFrame(animate)

    petals.forEach(petal => {
      petal.position.y -= 0.1
      petal.rotation.z += 0.01
      if (petal.position.y < -25) {
        petal.position.y = 25
      }
    })

    renderer.render(scene, camera)
  }

  animate()
}
const messages = ref([])
const inputMessage = ref('')
const messageContainer = ref(null)
const isLoading = ref(false)

const formatTime = (date) => {
  return `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`
}
const goBack = () => {
  console.log('goBack clicked')  // 添加调试信息
  router.back()
}
const sendMessage = async () => {
  if (!inputMessage.value.trim()) return
  isLoading.value = true;
  // 用户消息
  messages.value.push({
    content: inputMessage.value,
    isUser: true,
    time: formatTime(new Date())
  })

  const userMessage = inputMessage.value
  inputMessage.value = ''

  // AI回复
  try {
    const response = await chatCompletion({
      character: character.value.name,
      message: userMessage
    })

    const aiMessage = {
      content: '',
      isUser: false,
      time: formatTime(new Date()),
      isTyping: true
    }
    messages.value.push(aiMessage)

    let charIndex = 0
    const typingInterval = setInterval(() => {
      if (charIndex < response.data.length) {
        aiMessage.content += response.data.charAt(charIndex)
        charIndex++
        // 触发视图更新
        messages.value = [...messages.value]
        nextTick(() => {
          messageContainer.value.scrollTop = messageContainer.value.scrollHeight
        })
      } else {
        clearInterval(typingInterval)
        aiMessage.isTyping = false
      }
    }, 50)

    nextTick(() => {
      messageContainer.value.scrollTop = messageContainer.value.scrollHeight
    })
    isLoading.value = false;
  } catch (error) {
    console.error('聊天出错:', error);
    isLoading.value = false;

    messages.value.push({
      content: '对话服务暂时不可用，请稍后再试',
      isUser: false,
      time: formatTime(new Date())
    })
  }
}

watch(messages, () => {
  nextTick(() => {
    messageContainer.value.scrollTop = messageContainer.value.scrollHeight
  })
}, { deep: true })
</script>

<style scoped lang="scss">
.ChatRoombackground {
  position: fixed;
  width: 100vw;
  height: 100%;
  top: 8%;
  left: 0;
  z-index: 0;
}

.chat-container {
  height: 100vh;

  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 12px;
  overflow: hidden;

  .character-header {
    height: 80px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16px;
    padding: 0 20px;
    background: linear-gradient(145deg, #ffebf3, #ffeef6);
    box-shadow: 0 2px 8px rgba(255, 158, 181, 0.2);
    border-bottom: 1px solid #ffd1e0;
    position: relative;

    .back-button {
      position: absolute;
      left: 20px;
      color: #e83f6f;
      font-size: 24px;
      padding: 8px;
      transition: all 0.3s ease;
      cursor: pointer;

      &:hover {
        color: #ff5c8d;
        transform: scale(1.1);
      }
    }

    .character-avatar {
      border: 2px solid #ff9eb5;
      box-shadow: 0 2px 8px rgba(255, 158, 181, 0.3);
      transition: all 0.3s ease;

      &:hover {
        transform: scale(1.05);
        box-shadow: 0 4px 12px rgba(255, 158, 181, 0.4);
      }
    }

    .character-name {
      font-size: 24px;
      color: #e83f6f;
      text-shadow: 1px 1px 2px rgba(255, 158, 181, 0.3);
      font-family: 'Dancing Script', cursive;
      transition: all 0.3s ease;

      &:hover {
        transform: scale(1.05);
        text-shadow: 2px 2px 4px rgba(255, 158, 181, 0.4);
      }
    }
  }
}

::v-deep .el-input__wrapper {

  height: 40px;
  box-shadow: 0 0 0 0px var(--el-input-border-color, var(--el-border-color)) inset;
}

::v-deep .el-input__wrapper.is-focus {
  box-shadow: 0 0 0 0px var(--el-input-focus-border-color) inset;
}

.message-area {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background: linear-gradient(180deg, #fff5f9 0%, #ffeef6 100%);
  position: relative;
  overflow: hidden;

  canvas {
    position: fixed; // 将absolute改为fixed
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: -1;
  }

  /* 自定义滚动条 */
  scrollbar-width: thin;
  scrollbar-color: #ff9eb5 #ffeef6;
}

.message-area::-webkit-scrollbar {
  width: 8px;
}

.message-area::-webkit-scrollbar-track {
  background: #ffeef6;
  border-radius: 4px;
}

.message-area::-webkit-scrollbar-thumb {
  background: #ff9eb5;
  border-radius: 4px;
  border: 2px solid #ffeef6;
}

.message-area::-webkit-scrollbar-thumb:hover {
  background: #ff7aa2;
}

.message-bubble {
  transition: all 0.3s ease;
  min-width: 60px;
  max-width: 90%;
  z-index: 1;

  @media (max-width: 768px) {
    max-width: 95%;
    padding: 10px 15px;
    margin-bottom: 10px;
  }

  width: fit-content;
  margin-bottom: 15px;
  padding: 12px 18px;
  border-radius: 18px;
  background: #ffffff;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  position: relative;
}

.message-bubble.typing {
  border-right: 2px solid #ff7eb9;
  animation: typing 1s infinite;
}

@keyframes typing {
  50% {
    border-right-color: transparent;
  }
}

.user-message {
  margin-left: auto;
  margin-right: 10px;
  background: #ffebf3;
  border: 1px solid #ffd1e0;
  white-space: pre-wrap;
  letter-spacing: 1px;

  .message-content {
    font-family: 'Dancing Script', cursive;

  }
}

.message-content {
  font-size: 14px;

  @media (max-width: 768px) {
    font-size: 16px;
    line-height: 1.6;
  }

  line-height: 1.5;
  color: #6a1b4c;
  font-family: inherit;
}

.message-time {
  font-size: 12px;

  @media (max-width: 768px) {
    font-size: 10px;
  }

  color: #b76e94;
  text-align: right;
  margin-top: 8px;
}

.input-area {
  border-top: 1px solid #ffd1e0;
  padding: 10px;

  @media (max-width: 768px) {
    padding: 8px;

    :deep(.el-input-group__append) {
      padding: 0 12px;
    }
  }

  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 -2px 8px rgba(255, 183, 213, 0.2);
}

.message-input {
  border-radius: 25px;
  overflow: hidden;
  border: 1px solid #ffd1e0;
  transition: all 0.3s ease;
  background: #fff5f9;
  box-shadow: 0 2px 8px rgba(255, 183, 213, 0.2);
}

.message-input:hover {
  border-color: #ff9eb5;
  box-shadow: 0 0 12px rgba(255, 158, 181, 0.4);
  transform: scale(1.02);
}

.message-input :deep(.el-input__inner) {
  border-radius: 25px !important;
  padding-right: 90px;

  @media (max-width: 768px) {
    padding-right: 70px;
    font-size: 16px;
  }

  background: transparent;
  color: #e83f6f;
  font-size: 14px;
  font-family: 'Dancing Script',
  cursive;
  letter-spacing: 1px;
}

.message-input :deep(.el-input__inner::placeholder) {
  color: #ff9eb5;
  font-style: italic;
}

.message-input :deep(.el-input-group__append) {
  border-radius: 0 25px 25px 0 !important;
  background: linear-gradient(145deg, #ff9eb5, #ff7aa2);
  border: none;
  color: white;
  transition: all 0.3s ease;
  font-weight: bold;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
}

.message-input :deep(.el-input-group__append:hover) {
  background: linear-gradient(145deg, #ff7aa2, #ff5c8d);
  transform: scale(1.05);
  box-shadow: 0 2px 8px rgba(255, 158, 181, 0.4);
}
</style>