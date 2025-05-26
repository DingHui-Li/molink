<template>
  <div class="navbar">
    <div class="navbar-left" @click="router.replace('/')">
      <img src="/icon.png" alt="logo" class="logo" />
      <span class="app-name">断章取艺</span>
    </div>
    <div class="navbar-right">
      <el-button class="btn" @click="showSettings = true">
        <el-icon class="icon">
          <Setting />
        </el-icon>
      </el-button>
    </div>

    <el-dialog v-model="showSettings" title="AI配置" width="100%" style="max-width:500px" append-to-body>
      <el-form label-width="120px">
        <el-form-item label="Base URL">
          <el-input v-model="aiConfigBackup.baseUrl" placeholder="请输入API基础URL" />
        </el-form-item>
        <el-form-item label="模型">
          <el-input v-model="aiConfigBackup.model"></el-input>
        </el-form-item>
        <el-form-item label="密钥">
          <el-input v-model="aiConfigBackup.apiKey" placeholder="请输入API Key" />
          <span>
            注册 <a href="https://cloud.siliconflow.cn/i/UmLqQHN0" target="_blank" style="color:#FF5722">
              硅基流动</a>获取密钥</span>
        </el-form-item>
        <el-form-item label="改写说明">
          <el-switch v-model="aiConfigBackup.hasDesc" />
          <span style="margin-left: 10px;">(开启改写说明将增加文章生成时间)</span>
        </el-form-item>
        <el-form-item label="改写力度">
          <el-select v-model="aiConfigBackup.strength">
            <el-option value="突破原文框架，追求创意发散">突破原文框架，追求创意发散</el-option>
            <el-option value="最小干预，最大传承">最小干预，最大传承</el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showSettings = false">取消</el-button>
          <el-button type="primary" @click="saveSettings">保存</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Setting } from '@element-plus/icons-vue'
import { aiConfig, defaultKey } from '../store/index'
import { useRouter } from 'vue-router'

const router = useRouter()
const showSettings = ref(false)
const aiConfigBackup = ref({ ...aiConfig.value })
console.log(aiConfig.value)

const saveSettings = () => {
  showSettings.value = false
  aiConfig.value = { ...aiConfigBackup.value }
}
</script>

<style scoped lang="less">
.navbar {
  position: sticky;
  z-index: 9;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  padding: 0 20px;
  display: flex;
  align-items: center;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  z-index: 100;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.navbar-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo {
  width: 42px;
  height: 42px;
}

.app-name {
  font-size: 1.2rem;
  font-weight: 600;
  color: #fff;
}

.btn {
  background-color: transparent;
  border: none;

  .icon {
    font-size: 25px;
    color: #fff;
  }
}

@media (max-width: 480px) {
  .navbar {
    padding: 0 10px;
  }

  .app-name {
    font-size: 1rem;
  }

  .logo {
    width: 28px;
    height: 28px;
  }
}

#google_translate_element {
  position: relative;
  width: fit-content;
}
</style>