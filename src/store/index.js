
import { ref, watch } from 'vue'

// export const defaultKey = "sk-ehwgnlsoslziycdqqobafqypkssvvhqwsgfeacctdxfudhps"
let aiConfigStorage;
try {
  aiConfigStorage = JSON.parse(localStorage['aiConfig'])
} catch { }
export const aiConfig = ref(aiConfigStorage || {
  baseUrl: "https://api.siliconflow.cn/v1",
  apiKey: '',
  model: "deepseek-ai/DeepSeek-V3",
  hasDesc: false,//是否输出改写说明
  strength: "最小干预，最大传承",//改写强度
})

watch(aiConfig, (val) => {
  localStorage['aiConfig'] = JSON.stringify(val)
}, { deep: true })