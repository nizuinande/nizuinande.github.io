import { defineStore } from 'pinia'
// 自动季节检测
function detectSeason () {
  const month = new Date().getMonth() + 1
  if (month >= 3 && month <= 5) return 'spring'
  if (month >= 6 && month <= 8) return 'summer'
  if (month >= 9 && month <= 11) return 'autumn'
  return 'winter'
}
export const useAppStore = defineStore('app', {
  state: () => ({
    currentTheme: detectSeason(),
    characters: [
      {
        name: '李泽言',
        image: '/otomeGame/images/character1.png',
        personality: '霸道总裁',
        voiceSample: '/otomeGame/mp3/sample1.mp3',
        background: '华锐集团总裁，商业奇才，外表冷酷内心温柔',
        personalityTraits: ['冷静', '果断', '责任感强'],
        specialSkills: ['商业谈判', '投资分析']
      },
      {
        name: '许墨',
        image: '/otomeGame/images/character2.png',
        personality: '温柔教授',
        voiceSample: 'sample2.mp3',
        background: '知名大学教授，心理学专家，神秘而温柔',
        personalityTraits: ['温柔', '耐心', '洞察力强'],
        specialSkills: ['心理咨询', '催眠治疗']
      },
      {
        name: '白起',
        image: '/otomeGame/images/character3.png',
        personality: '热血警察',
        voiceSample: 'sample3.mp3',
        background: '特警队队长，正义感强，擅长格斗和射击',
        personalityTraits: ['勇敢', '正直', '行动派'],
        specialSkills: ['格斗术', '枪械使用']
      },
      {
        name: '周棋洛',
        image: '/otomeGame/images/character4.png',
        personality: '阳光偶像',
        voiceSample: 'sample4.mp3',
        background: '当红偶像歌手，性格开朗，擅长音乐和舞蹈',
        personalityTraits: ['乐观', '幽默', '亲和力强'],
        specialSkills: ['唱歌', '跳舞']
      }
    ],
    selectedCharacter: null,
    trainingRecords: [],
    currentAudio: null,
    isPlaying: false
  }),
  actions: {
    updateTheme (season) {
      this.currentTheme = season
    },
    selectCharacter (char) {
      this.selectedCharacter = char
      this.trainingRecords = []
    },
    addTrainingRecord (record) {
      this.trainingRecords.push(record)
    },
    playAudio (url) {
      if (this.currentAudio) {
        this.currentAudio.pause()
      }
      this.currentAudio = new Audio(url)
      this.currentAudio.play()
      this.isPlaying = true
    },
    pauseAudio () {
      if (this.currentAudio) {
        this.currentAudio.pause()
        this.isPlaying = false
      }
    },
    togglePlay (payload) {
      if (this.currentPlaying === payload.name) {
        this.audioInstance.pause()
        this.currentPlaying = null
        this.audioInstance = null
      } else {
        if (this.audioInstance) {
          this.audioInstance.pause()
        }
        this.audioInstance = new Audio(`${payload.voiceSample}`)
        this.audioInstance.loop = true
        this.audioInstance.play()
        this.currentPlaying = payload.name
      }
    }
  }
})