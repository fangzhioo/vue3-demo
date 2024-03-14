<template>
  <div class="studio-page">
    <div class="studio-title">{{ activedItem?.title }}</div>
    <div class="studio-room" @keydown.esc="handleCancel" @click="handleCancel">
      <img class="studio-image" ref="refImage" :style="imgStyle" :src="studioImage" alt="studio" />
      <div
        class="pos-nav"
        :class="`pos-nav-${item.id} ${activedPos ? 'pos-hide' : ''}`"
        @click.stop="handleClick(item, $event)"
        v-for="item in pos"
        :key="item.title"
        :style="{ left: item.x, top: item.y }"
      ></div>
    </div>
  </div>
</template>

<script lang="ts" setup name="studio-room">
import { computed, ref } from 'vue'
import studioImage from './image4.png'
import { debounce } from 'lodash-es'

const activedIndex = ref()
const activedPos = ref()
const activedItem = ref()
const refImage = ref(null as unknown as HTMLImageElement)
const posX = ref(0)
const posY = ref(0)
const pos = ref([
  { x: '75%', y: '20%', title: '云上生活', id: 1 },
  { x: '85%', y: '50%', title: '云上存储', id: 2 },
  { x: '43%', y: '70%', title: '云上安全', id: 3 },
  { x: '47%', y: '54%', title: '云上AI', id: 4 },
  { x: '50%', y: '20%', title: '网关服务', id: 5 },
  { x: '22%', y: '30%', title: '互动空间', id: 6 }
])

const imgStyle = computed(() => {
  let transform = 'scale(1)'
  let transformOrigin = '0 0'
  if (activedIndex.value) {
    transform = 'scale(2.8)'
    transformOrigin = posX.value + 'px' + ' ' + posY.value + 'px'
  }
  return {
    transform,
    transformOrigin
  }
})

const handleClick = debounce(
  (item: any, $event: MouseEvent) => {
    console.log(item, $event)
    const rect = refImage.value.getBoundingClientRect()
    posX.value = $event.clientX - rect.left
    posY.value = $event.clientY - rect.top
    activedItem.value = item
    setTimeout(() => {
      activedIndex.value = true
      activedPos.value = true
    }, 1)
  },
  1501,
  { leading: true, trailing: false }
)

const handleCancel = debounce(
  () => {
    activedIndex.value = false
    activedItem.value = undefined
    setTimeout(() => {
      activedPos.value = false
    }, 1500)
  },
  1501,
  { leading: true, trailing: false }
)
</script>

<style scoped>
.studio-page {
  height: 100%;
  width: 100%;
  background-color: #12152a;
  color: #fff;
  display: flex;
  justify-content: center;
  align-items: center;
}
.studio-title {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 100px;
  line-height: 100px;
  text-align: center;
  background-color: #12152a89;
  z-index: 999;
}
.studio-room {
  width: 100%;
  position: relative;
  transform-style: preserve-3d;
}
.pos-nav {
  position: absolute;
  height: 30px;
  width: 30px;
  border: 1px solid #ffffffb9;
  border-radius: 9999px;
  animation: breathe 2.4s linear infinite;
}

.studio-image {
  display: block;
  width: 100%;
  transition: all 1.5s ease-in-out;
}

.pos-hide {
  display: none;
}
.pos-nav::before {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translateX(-50%) translateY(-50%);
  content: '';
  width: 6px;
  height: 6px;
  border-radius: 9999px;
  background-color: #ffffffe4;
}
@keyframes breathe {
  0% {
    transform: scale(0.97);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(0.97);
  }
}
.studio-item {
  padding: 20px;
  text-align: center;
}
</style>
