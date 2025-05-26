<template>
  <div class="processing" v-if="resultText">
    <span v-for="w in resultText" :key="w">{{ w }}</span>
  </div>
  <el-input :class="['input-area', loading && 'loading']" v-if="!result.length" v-model="inputText" :readonly="loading"
    autosize type="textarea" placeholder="每一粒字都是未醒的星辰，等待被点亮..." show-word-limit maxlength="4000"></el-input>
  <div class="conversioned" v-else>
    <span :class="`${item.delete && 'delete'} ${item.newline && 'newLine'}`" v-for="(item, index) in result"
      @click="showDialog(item, index)">
      <div class="seq" v-if="!item.newline && showSeq">
        <div class="num">{{ item.seq }}</div>
      </div>
      {{ item.rewrite }}
    </span>
  </div>
  <div class="origin" v-if="result.length">
    <span :class="`${item.delete && 'delete'} ${item.newline && 'newLine'}`" v-for="(item, index) in result"
      @click="showDialog(item, index)">
      <div class="seq" v-if="!item.newline && item.origin && showSeq">
        <div class="num">{{ item.seq }}</div>
      </div>
      {{ item.origin }}
    </span>
  </div>
  <div class="actions" v-if="result.length">
    <div class="savedTime" v-if="savedTime">保存于{{ new Date(savedTime).format('yyyy.MM.dd hh:mm:ss') }}</div>
    <div v-else></div>
    <div style="display: flex;align-items: center"> 显示序号 <el-switch v-model="showSeq"
        style="margin-left: 5px;"></el-switch></div>
  </div>
  <el-button v-if="result.length" class="save-btn" @click="handleSave">保存</el-button>
  <div v-if="result.length" class="tip">⚠️不保存者，虽智者不能善其后也</div>
  <el-dialog v-model="dialogVisible" width="50%" :close-on-click-modal="false">
    <div style="max-height: 70vh;overflow: auto;">
      <div style="margin-bottom: 10px;">原句：</div>
      <el-input v-model="currentItem.origin" maxlength="2000" placeholder="自由发挥"
        input-style="background: rgba(255,255,255,0.1);box-shadow:none;color:#fff" type="textarea" autosize></el-input>
      <div style="margin-top: 20px;margin-bottom: 10px;">改写：</div>
      <el-input v-model="currentItem.rewrite" maxlength="2000" autosize @input="currentItem.retry = true"
        input-style="background: rgba(255,255,255,0.1);box-shadow:none;color:#fff" type="textarea"></el-input>
      <div style="margin-top: 20px;" v-if="currentItem.desc">
        <span class="label">改写说明：</span>
        {{ currentItem.desc }}
      </div>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button :disabled="loading" @click="dialogVisible = false">取消</el-button>
        <el-button v-if="currentItem.delete" :disabled="loading" type="success" @click="handleRecover">恢复</el-button>
        <el-button v-else :disabled="loading" type="danger" @click="handleDelete">删除</el-button>
        <el-button :loading="loading" type="warning" @click="handleRewrite">重新改写</el-button>
        <el-button v-if="currentItem.retry" :disabled="loading" type="primary" @click="handleApplyRetry">应用</el-button>
      </span>
    </template>
  </el-dialog>
</template>
<script setup>
import { ref } from 'vue'
import {
  inputText, loading, result, resultText,
  handleProcessSentence, savedTime, handleSave
} from '../store'

const dialogVisible = ref(false)
const currentItem = ref({})
const showSeq = ref(false)

const showDialog = (item, index) => {
  currentItem.value = { ...item, index }
  dialogVisible.value = true
}

const handleRewrite = async () => {
  let result = await handleProcessSentence(currentItem.value.origin || currentItem.value.rewrite)
  currentItem.value = { ...currentItem.value, ...result, retry: true }
}
function handleApplyRetry() {
  result.value[currentItem.value.index].origin = currentItem.value.origin
  result.value[currentItem.value.index].rewrite = currentItem.value.rewrite
  dialogVisible.value = false
}
function handleDelete() {
  result.value[currentItem.value.index].delete = true
  dialogVisible.value = false
}
function handleRecover() {
  result.value[currentItem.value.index].delete = false
  dialogVisible.value = false
}
</script>
<style lang="less" scoped>
.input-area,
.origin {
  position: relative;
  background-color: #EDE0D0;
  padding: 15px;
  border-radius: 10px;
  width: 100%;
  box-sizing: border-box;

  &:deep(textarea) {
    resize: none;
    background-color: transparent;
    border: none;
    box-shadow: none;
    padding: 0;
    font-size: 16px;
    min-height: 100px !important;
    color: #000;

    &::placeholder {
      color: #FF9A3D;
    }
  }

  &:deep(.el-input__count) {
    background-color: transparent;
    color: #FF9A3D;
  }
}

.processing {
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 10px;
  color: #ffffff50;
  font-size: 14px;
  margin-bottom: 10px;
  overflow: auto;

  span {
    animation: fade-in .5s forwards;
  }
}

.conversioned,
.origin {
  font-size: 16px;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 15px;
  color: #fff;
  cursor: pointer;
  position: relative;
  line-height: 28px;

  .copy-btn {
    position: absolute;
    right: 15px;
    top: 15px;
  }

  span {
    transition: all .3s;

    &:hover {
      color: #FF9A3D;
    }

    &.delete {
      text-decoration: line-through;
      user-select: none;
      opacity: 0.2;
    }

    &.newLine {
      display: block;
    }

    .seq {
      position: relative;
      display: inline-block;
      width: 14px;
      height: 14px;
      border-radius: 50%;
      font-size: 12px;
      color: #FF9A3D;
      border: 1px solid #FF9A3D;
      pointer-events: none;
      user-select: none;

      .num {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
      }
    }
  }
}

.origin {
  margin-top: 10px;
  background-color: #EDE0D0;
  padding: 15px;
  border-radius: 10px;
  color: #000;

  .seq {
    background-color: #FF9A3D;

    .num {
      color: #fff;
    }
  }
}

.actions {
  color: #ffffff90;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 10px;

  .savedTime {
    color: #ffffff80;
    font-size: 12px;
  }
}

.save-btn {
  width: 100%;
  margin-top: 30px;
  padding: 20px;
  background-color: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.tip {
  text-align: center;
  font-size: 14px;
  color: #ffffff50;
  margin-top: 10px;
}

@keyframes fade-in {
  0% {
    opacity: 0;
  }

  100% {
    opacity: 1;
  }
}
</style>