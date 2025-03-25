<template>
  <div class="chat-container">
    <div class="message-area" ref="messageContainer">
      <div v-for="(msg, index) in messages" :key="index" class="message-bubble" :class="{ 'user-message': msg.isUser }">
        <div class="message-content">{{ msg.content }}</div>
        <div class="message-time">{{ msg.time }}</div>
      </div>
      <div v-if="isLoading" class="message ai-message loading-indicator">
        <div class="message-bubble loading-bubble">
          <van-loading :color="'var(--theme-primary-color)'" />
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
import { ref, watch, nextTick } from 'vue'
import { chatCompletion } from '@/services/api.js'

const props = defineProps({
  character: Object
})

const messages = ref([])
const inputMessage = ref('')
const messageContainer = ref(null)
const isLoading = ref(false)

const formatTime = (date) => {
  return `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`
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
      character: props.character,
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
::v-deep .el-dialog {
  background: rgba(var(--theme-primary-color), 0.9) !important;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
}

::v-deep .el-overlay {
  background-color: rgba(255, 255, 255, 0.3) !important;
  backdrop-filter: blur(3px);
}

.chat-container {
  height: 60vh;
  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 12px;
  overflow: hidden;
}

.message-area {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background: linear-gradient(180deg, #fff5f9 0%, #ffeef6 100%);

  /* 自定义滚动条 */
  scrollbar-width: thin;
  scrollbar-color: var(--theme-primary-color) rgba(var(--theme-primary-color), 0.1);
}

.message-area::-webkit-scrollbar {
  width: 8px;
}

.message-area::-webkit-scrollbar-track {
  background: #ffeef6;
  border-radius: 4px;
}

.message-area::-webkit-scrollbar-thumb {
  background: var(--theme-secondary-color);
  border-radius: 4px;
  border: 2px solid #ffeef6;
}

.message-area::-webkit-scrollbar-thumb:hover {
  background: #ff7aa2;
}

.message-bubble {
  transition: all 0.3s ease;
  min-width: 60px;
  max-width: 80%;
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
  line-height: 1.5;
  color: #6a1b4c;
  font-family: inherit;
}

.message-time {
  font-size: 12px;
  color: #b76e94;
  text-align: right;
  margin-top: 8px;
}

.input-area {
  border-top: 1px solid #ffd1e0;
  padding: 15px;
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 -2px 8px rgba(255, 183, 213, 0.2);
}

.message-input {
  border-radius: 25px;
  overflow: hidden;
  border: 1px solid var(--theme-secondary-color);
  transition: all 0.3s ease;
  background: linear-gradient(145deg, rgba(var(--theme-primary-color), 0.1), rgba(var(--theme-secondary-color), 0.05));
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
  background: transparent;
  color: #e83f6f;
  font-size: 14px;
  font-family: 'Dancing Script', cursive;
  letter-spacing: 1px;
}

.message-input :deep(.el-input__inner::placeholder) {
  color: #ff9eb5;
  font-style: italic;
}

.message-input :deep(.el-input-group__append) {
  border-radius: 0 25px 25px 0 !important;
  background: linear-gradient(145deg, var(--theme-primary-color), var(--theme-accent-color));
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