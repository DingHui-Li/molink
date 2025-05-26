import { ref, watch, computed } from 'vue'
import OpenAI from 'openai'
import { aiConfig } from '@/store/index'
import { ElMessage } from 'element-plus'
import styleList from '@/store/style.js'
import { useRouter } from 'vue-router'

//article
export const id = ref('')
export const savedResults = ref({})
//form-result-item
export const style = ref(styleList[9])
export const resultId = ref()
export const inputText = ref('')
export const title = ref('')
export const result = ref([])
export const savedTime = ref()
//state
export const resultText = ref('')
export const titleLoading = ref(false)
export const loading = ref(false)

try {
  let t = localStorage['style']
  if (t) {
    style.value = JSON.parse(t)
  }
} catch { }


let openai = new OpenAI({
  baseURL: aiConfig.value.baseUrl,
  apiKey: aiConfig.value.apiKey,
  dangerouslyAllowBrowser: true
})

watch(aiConfig, () => {
  openai = new OpenAI({
    baseURL: aiConfig.value.baseUrl,
    apiKey: aiConfig.value.apiKey,
    dangerouslyAllowBrowser: true
  })
}, { deep: true })
watch(style, () => {
  localStorage['style'] = JSON.stringify(style.value)
}, { deep: true })
watch(savedResults, () => {
  localStorage[`article-${id.value}`] = JSON.stringify({
    id: id.value,
    results: { ...savedResults.value }
  })
}, { deep: true })

export const resultPureText = computed(() => {
  return result.value
    .filter(item => !item.delete)
    .map(item => item.rewrite)
    .join('')
})
export function init(idParam) {
  if (idParam) {
    let t = {}
    try {
      t = JSON.parse(localStorage[`article-${idParam}`])
    } catch { }
    id.value = idParam
    savedResults.value = t.results || {}

    let firstResult = {}
    try {
      firstResult = t.results[Object.keys(t.results)[0]] || {}
    } catch { }
    resultId.value = firstResult.id || ''
    savedTime.value = firstResult.savedTime || ''
    title.value = firstResult.title || ''
    inputText.value = firstResult.inputText || ''
    result.value = firstResult.result || []
    style.value = firstResult.style || style.value
  } else {
    id.value = new Date().getTime()
    try {
      style.value = JSON.parse(localStorage['style'])
    } catch {
      style.value = styleList[3]
    }
    savedResults.value = []
    savedTime.value = ''
    title.value = ''
    inputText.value = ''
    result.value = []
    useRouter().replace('/article?id=' + id.value)
  }
}

export function handleSave() {
  if (resultId.value) {
    savedTime.value = new Date().getTime()
    let t = savedResults.value
    t[`${resultId.value}`] = {
      id: resultId.value,
      title: title.value,
      inputText: inputText.value,
      result: result.value,
      savedTime: savedTime.value,
      style: style.value
    }
    savedResults.value = t
    ElMessage.success('保存成功')
  }
}
export function handleRemove(rid) {
  if (rid) {
    delete savedResults.value[`${rid}`]
    ElMessage.success('删除成功')
  }
}
export function handleChooseResult(rid) {
  if (rid) {
    const t = savedResults.value[`${rid}`]
    if (t) {
      resultId.value = t.id
      savedTime.value = t.savedTime
      title.value = t.title
      inputText.value = t.inputText
      result.value = t.result || []
      style.value = t.style || style.value
    }
  }
}

let cancelProcess = false
export function handleCancelProcess() {
  cancelProcess = true
}
export async function handleProcess() {
  if (!aiConfig.value.apiKey) {
    ElMessage.error('请先填写API key')
    return
  }
  if (!inputText.value) {
    throw new Error('请输入内容')
  }
  try {
    loading.value = true
    resultText.value = ''

    resultId.value = new Date().getTime()
    result.value = []
    title.value = ''
    savedTime.value = ''

    const completion = await openai.chat.completions.create({
      model: aiConfig.value.model,
      messages: [{
        role: 'user',
        content: `
          [角色设定]
          你是一个擅长【${style.value.name}】风格的作家，文风：${style.value.style};
          当前时间：${new Date().toLocaleString()}

          [要求]
          - 不要生成无关的内容；
          - 严格按照原文分段换行(现代诗风格时忽略)；
          - 改写力度：${aiConfig.value.strength}

          [输出格式]
          - 输出格式为JSON对象数组，数组元素为原文和改写后的对象，每句话为一个对象；
          - 对象格式为：{origin:"",rewrite:""${aiConfig.value.hasDesc ? ',desc:""' : ""}}；
          - ${aiConfig.value.strength == "最小干预，最大传承" ? '严格按照原文-改写的格式输出' : ''}；
          - 遇到换行则输出空对象；

          [当前任务]
          基于以下原文，改写生成符合要求的文章：
          ${inputText.value}
          `
      }],
      stream: true,
      timeout: 600000
    })
    let resultStr = ''

    for await (const chunk of completion) {
      if (cancelProcess) {
        throw { message: "已取消" }
      }
      const content = chunk.choices[0]?.delta?.content || ''
      const reasoning_content = chunk.choices[0]?.delta?.reasoning_content || ''
      if (reasoning_content) {
        resultText.value += reasoning_content
      }
      resultText.value += content.replace(/[^\u4e00-\u9fa5，:。origin rewrite]/g, '')
      resultStr += content
    }
    result.value = JSON.parse(resultStr.replace('```json', '').replace('```', ''))
    let seq = 1
    result.value = result.value.map((item) => {
      if (item.rewrite) {
        item.seq = seq++
      } else {
        item.origin = '\n\r'
        item.rewrite = '\n\r'
        item.newline = true
      }
      return item
    })
    resultText.value = ''
    console.log(result.value)
  } catch (err) {
    console.log(err)
    ElMessage.error(err.message || JSON.stringify(err))
  } finally {
    cancelProcess = false
    loading.value = false
  }
}

export async function handleProcessSentence(sentence) {
  try {
    loading.value = true

    const completion = await openai.chat.completions.create({
      model: aiConfig.value.model,
      messages: [{
        role: 'user',
        content: `
          [角色设定]
          你是一个擅长【${style.value.name}】风格的作家，文风：${style.value.style};
          当前时间：${new Date().toLocaleString()}

          [要求]
          - 不要生成无关的内容；
          - 按照原文分段；
          - 注意句子在原文中的上下文关系；
          - 改写力度：${aiConfig.value.strength}

          [输出格式]
          - 输出格式为JSON对象；
          - 对象格式为：{rewrite:""${aiConfig.value.hasDesc ? ',desc:""' : ""}}；
          - ${aiConfig.value.strength == "最小干预，最大传承" ? '严格按照原文-改写的格式输出' : ''}；
          - 严格按照以上格式输出；

          [原文]
          ${inputText.value}

          [当前任务]
          基于以下句子，改写生成符合要求的句子：
          ${sentence}
          `
      }],
    })
    return JSON.parse(completion.choices[0].message.content.replace('```json', '').replace('```', ''))
  } catch (err) {
    console.log(err)
    ElMessage.error(err.message || JSON.stringify(err))
  } finally {
    loading.value = false
  }
}

export async function handleGetTitle() {
  try {
    titleLoading.value = true
    const completion = await openai.chat.completions.create({
      model: aiConfig.value.model,
      messages: [{
        role: 'user',
        content: `
          [角色设定]
          你是一个擅长【${style.value.name}】风格的作家，文风：${style.value.style};
          当前时间：${new Date().toLocaleString()}

          [限制]
          - 不要生成无关的内容；

          [输出格式]
          - 输出格式为字符串；

          [当前任务]
          基于以下文章，生成符合要求和风格的标题：
          ${resultPureText.value}
          `
      }],
    })
    title.value = completion.choices[0].message.content
    console.log(title.value)
  } catch (err) {
    console.log(err)
    ElMessage.error(err.message || JSON.stringify(err))
  } finally {
    titleLoading.value = false
  }
}

