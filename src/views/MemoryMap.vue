<template>
  <div class="memory-map-page">
    <div class="map-header">
      <h2>🗺️ 回忆地图</h2>
      <p>从短信中识别地点线索，带你重回那些一起走过的地方</p>
      
      <div class="filter-bar" v-if="sortedMemories.length > 0">
        <span class="filter-label">筛选类型：</span>
        <button 
          v-for="type in locationTypes" 
          :key="type.value"
          class="type-btn"
          :class="{ active: activeType === type.value }"
          @click="activeType = type.value"
        >
          <span class="type-icon">{{ type.icon }}</span>
          <span class="type-label">{{ type.label }}</span>
          <span class="type-count">{{ getTypeCount(type.value) }}</span>
        </button>
      </div>
    </div>

    <div v-if="sortedMemories.length === 0" class="empty-state">
      <div class="icon">📍</div>
      <h3>还没有地点回忆</h3>
      <p>先去首页上传短信备份，或者加载演示数据看看效果吧</p>
      <router-link to="/" class="btn btn-primary">去上传</router-link>
    </div>

    <div v-else class="map-container">
      <div class="location-map">
        <div 
          v-for="(memory, index) in filteredMemories" 
          :key="memory.name"
          class="location-pin"
          :class="{ 
            active: selectedMemory?.name === memory.name,
            [`type-${memory.type}`]: true 
          }"
          :style="getPinStyle(memory, index)"
          @click="selectMemory(memory)"
        >
          <div class="pin-icon">{{ getTypeIcon(memory.type) }}</div>
          <div class="pin-label">{{ memory.name }}</div>
          <div class="pin-count">{{ memory.messageCount }}条</div>
        </div>
      </div>

      <div class="memory-sidebar">
        <div class="memory-list">
          <h3>地点列表</h3>
          <div 
            v-for="memory in filteredMemories" 
            :key="'list-' + memory.name"
            class="memory-item card"
            :class="{ active: selectedMemory?.name === memory.name }"
            @click="selectMemory(memory)"
          >
            <div class="memory-icon">{{ getTypeIcon(memory.type) }}</div>
            <div class="memory-info">
              <h4>{{ memory.name }}</h4>
              <div class="memory-meta">
                <span>💬 {{ memory.messageCount }} 条消息</span>
                <span>👥 {{ memory.conversationCount }} 位联系人</span>
              </div>
              <div class="memory-tags">
                <span class="tag" :class="'tag-' + memory.type">
                  {{ memory.label || getTypeLabel(memory.type) }}
                </span>
              </div>
            </div>
            <div class="memory-arrow">→</div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="selectedMemory" class="memory-detail-modal" @click.self="selectedMemory = null">
      <div class="modal-content card">
        <div class="modal-header">
          <div class="modal-title">
            <span class="title-icon">{{ getTypeIcon(selectedMemory.type) }}</span>
            <h3>{{ selectedMemory.name }}</h3>
          </div>
          <button class="close-btn" @click="selectedMemory = null">✕</button>
        </div>
        
        <div class="modal-body">
          <div class="memory-summary">
            <div class="summary-item">
              <span class="summary-value">{{ selectedMemory.messageCount }}</span>
              <span class="summary-label">条相关消息</span>
            </div>
            <div class="summary-item">
              <span class="summary-value">{{ selectedMemory.conversationCount }}</span>
              <span class="summary-label">位联系人</span>
            </div>
            <div class="summary-item">
              <span class="summary-value">{{ formatDateRange(selectedMemory.messages) }}</span>
              <span class="summary-label">时间跨度</span>
            </div>
          </div>

          <div class="messages-section">
            <h4>📝 代表消息</h4>
            <div class="messages-list">
              <div 
                v-for="msg in sortedMessages" 
                :key="msg.id"
                class="memory-message"
                :class="{ sent: msg.isSent, received: msg.isReceived }"
              >
                <div class="msg-header">
                  <span class="msg-contact">{{ msg.conversation?.name || '未知联系人' }}</span>
                  <span class="msg-time">{{ formatDate(msg.date) }}</span>
                </div>
                <div class="msg-bubble">
                  {{ msg.body }}
                </div>
                <div class="msg-type">
                  {{ msg.isSent ? '📤 发送' : '📥 接收' }}
                </div>
              </div>
            </div>
          </div>

          <div class="contacts-section">
            <h4>👥 相关联系人</h4>
            <div class="contacts-list">
              <span 
                v-for="addr in selectedMemory.conversations" 
                :key="addr"
                class="contact-chip"
              >
                {{ getContactName(addr) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { store } from '@/store'
import { extractLocationMap } from '@/detectors'

const activeType = ref('all')
const selectedMemory = ref(null)

const locationTypes = [
  { value: 'all', label: '全部', icon: '🗺️' },
  { value: 'city', label: '城市', icon: '🏙️' },
  { value: 'food', label: '餐厅', icon: '🍽️' },
  { value: 'entertainment', label: '娱乐', icon: '🎬' },
  { value: 'park', label: '公园', icon: '🌳' },
  { value: 'school', label: '学校', icon: '🏫' },
  { value: 'work', label: '公司', icon: '💼' },
  { value: 'transport', label: '交通', icon: '🚄' },
  { value: 'shopping', label: '购物', icon: '🛍️' },
  { value: 'hotel', label: '酒店', icon: '🏨' },
  { value: 'phrase', label: '其他', icon: '📍' }
]

const sortedMemories = computed(() => {
  if (store.locationMemories && store.locationMemories.length > 0) {
    return store.locationMemories
  }
  if (store.conversations && store.conversations.length > 0) {
    const memories = extractLocationMap(store.conversations)
    store.setLocationMemories(memories)
    return memories
  }
  return []
})

const filteredMemories = computed(() => {
  if (activeType.value === 'all') {
    return sortedMemories.value
  }
  return sortedMemories.value.filter(m => m.type === activeType.value)
})

const sortedMessages = computed(() => {
  if (!selectedMemory.value) return []
  return [...selectedMemory.value.messages].sort((a, b) => b.date - a.date)
})

function getTypeCount(type) {
  if (type === 'all') return sortedMemories.value.length
  return sortedMemories.value.filter(m => m.type === type).length
}

function getTypeIcon(type) {
  const typeMap = {
    city: '🏙️',
    food: '🍽️',
    entertainment: '🎬',
    park: '🌳',
    school: '🏫',
    work: '💼',
    transport: '🚄',
    medical: '🏥',
    shopping: '🛍️',
    hotel: '🏨',
    culture: '🏛️',
    sports: '⚽',
    phrase: '📍'
  }
  return typeMap[type] || '📍'
}

function getTypeLabel(type) {
  const typeMap = {
    city: '城市',
    food: '餐厅美食',
    entertainment: '娱乐场所',
    park: '公园景点',
    school: '学校',
    work: '工作场所',
    transport: '交通枢纽',
    medical: '医疗机构',
    shopping: '购物场所',
    hotel: '酒店住宿',
    culture: '文化场馆',
    sports: '运动场所',
    phrase: '地点线索'
  }
  return typeMap[type] || '地点'
}

function getPinStyle(memory, index) {
  const total = filteredMemories.value.length
  const angle = (index / Math.max(total, 1)) * 360
  const radius = 120 + (index % 3) * 60
  const x = 50 + Math.cos(angle * Math.PI / 180) * (radius / 4)
  const y = 50 + Math.sin(angle * Math.PI / 180) * (radius / 4)
  
  return {
    left: `${Math.min(Math.max(x, 10), 90)}%`,
    top: `${Math.min(Math.max(y, 15), 85)}%`,
    animationDelay: `${index * 0.1}s`
  }
}

function selectMemory(memory) {
  selectedMemory.value = memory
  store.setSelectedLocation(memory)
}

function getContactName(address) {
  const conv = store.conversations.find(c => c.address === address)
  return conv ? conv.name : address
}

function formatDate(timestamp) {
  const d = new Date(timestamp)
  const month = d.getMonth() + 1
  const day = d.getDate()
  const hour = d.getHours().toString().padStart(2, '0')
  const minute = d.getMinutes().toString().padStart(2, '0')
  return `${month}/${day} ${hour}:${minute}`
}

function formatDateRange(messages) {
  if (!messages || messages.length === 0) return '暂无'
  const dates = messages.map(m => m.date)
  const earliest = new Date(Math.min(...dates))
  const latest = new Date(Math.max(...dates))
  const diffDays = Math.ceil((latest - earliest) / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return '同一天'
  if (diffDays < 30) return `${diffDays}天`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}个月`
  return `${Math.floor(diffDays / 365)}年`
}

onMounted(() => {
  if (store.selectedLocation) {
    selectedMemory.value = store.selectedLocation
  }
})
</script>

<style scoped>
.memory-map-page {
  max-width: 1400px;
  margin: 0 auto;
}

.map-header {
  text-align: center;
  margin-bottom: 2rem;
}

.map-header h2 {
  font-size: 2rem;
  color: var(--love-red);
  margin-bottom: 0.5rem;
}

.map-header > p {
  color: var(--text-light);
  margin-bottom: 1.5rem;
}

.filter-bar {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.filter-label {
  color: var(--text-light);
  margin-right: 0.5rem;
}

.type-btn {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.5rem 0.85rem;
  border: 2px solid var(--border);
  background: white;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 0.9rem;
}

.type-btn:hover {
  border-color: var(--love-pink);
  transform: translateY(-2px);
}

.type-btn.active {
  background: linear-gradient(135deg, var(--love-red), var(--love-pink));
  color: white;
  border-color: transparent;
}

.type-icon {
  font-size: 1rem;
}

.type-count {
  font-size: 0.8rem;
  opacity: 0.8;
}

.map-container {
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 1.5rem;
  min-height: 600px;
}

@media (max-width: 900px) {
  .map-container {
    grid-template-columns: 1fr;
  }
}

.location-map {
  position: relative;
  background: linear-gradient(135deg, #fff5f5 0%, #f0f8ff 50%, #f5f5ff 100%);
  border-radius: 20px;
  min-height: 500px;
  overflow: hidden;
  border: 2px solid var(--border);
}

.location-map::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: repeating-linear-gradient(90deg, var(--border) 0px, var(--border) 10px, transparent 10px, transparent 20px);
  transform: translateY(-50%);
}

.location-map::after {
  content: '';
  position: absolute;
  left: 50%;
  top: 0;
  bottom: 0;
  width: 1px;
  background: repeating-linear-gradient(0deg, var(--border) 0px, var(--border) 10px, transparent 10px, transparent 20px);
  transform: translateX(-50%);
}

.location-pin {
  position: absolute;
  transform: translate(-50%, -50%);
  cursor: pointer;
  transition: all 0.3s;
  text-align: center;
  z-index: 2;
  animation: pinDrop 0.5s ease-out both;
}

@keyframes pinDrop {
  0% {
    opacity: 0;
    transform: translate(-50%, -100%);
  }
  100% {
    opacity: 1;
    transform: translate(-50%, -50%);
  }
}

.location-pin:hover {
  transform: translate(-50%, -50%) scale(1.1);
  z-index: 10;
}

.location-pin.active {
  transform: translate(-50%, -50%) scale(1.15);
  z-index: 10;
}

.pin-icon {
  font-size: 2rem;
  margin-bottom: 0.25rem;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
}

.pin-label {
  font-size: 0.8rem;
  font-weight: bold;
  color: var(--text-dark);
  background: white;
  padding: 0.25rem 0.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  white-space: nowrap;
}

.pin-count {
  font-size: 0.7rem;
  color: var(--text-light);
  margin-top: 0.25rem;
}

.location-pin.active .pin-label {
  background: linear-gradient(135deg, var(--love-red), var(--love-pink));
  color: white;
}

.memory-sidebar {
  display: flex;
  flex-direction: column;
}

.memory-list h3 {
  margin-bottom: 1rem;
  color: var(--text-dark);
  font-size: 1.1rem;
}

.memory-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  margin-bottom: 0.75rem;
  cursor: pointer;
  transition: all 0.3s;
}

.memory-item:hover {
  transform: translateX(4px);
  box-shadow: 0 4px 12px rgba(231, 76, 60, 0.1);
}

.memory-item.active {
  border-color: var(--love-red);
  background: #fff5f5;
}

.memory-icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.memory-info {
  flex: 1;
  min-width: 0;
}

.memory-info h4 {
  font-size: 1rem;
  color: var(--text-dark);
  margin-bottom: 0.25rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.memory-meta {
  display: flex;
  gap: 0.75rem;
  font-size: 0.8rem;
  color: var(--text-light);
  margin-bottom: 0.5rem;
}

.memory-tags {
  display: flex;
  gap: 0.35rem;
  flex-wrap: wrap;
}

.memory-arrow {
  color: var(--text-light);
  font-size: 1.2rem;
  flex-shrink: 0;
}

.memory-detail-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 2rem;
}

.modal-content {
  max-width: 650px;
  width: 100%;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border);
}

.modal-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.title-icon {
  font-size: 2rem;
}

.modal-title h3 {
  color: var(--love-red);
  margin: 0;
  font-size: 1.4rem;
}

.close-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: var(--bg-light);
  border-radius: 50%;
  cursor: pointer;
  font-size: 1.2rem;
  transition: all 0.3s;
}

.close-btn:hover {
  background: var(--love-red);
  color: white;
}

.modal-body {
  overflow-y: auto;
  flex: 1;
}

.memory-summary {
  display: flex;
  justify-content: space-around;
  padding: 1.5rem;
  background: linear-gradient(135deg, #fff5f5 0%, #fff0f6 100%);
  border-radius: 12px;
  margin-bottom: 1.5rem;
}

.summary-item {
  text-align: center;
}

.summary-value {
  display: block;
  font-size: 1.8rem;
  font-weight: bold;
  color: var(--love-red);
  margin-bottom: 0.25rem;
}

.summary-label {
  font-size: 0.85rem;
  color: var(--text-light);
}

.messages-section {
  margin-bottom: 1.5rem;
}

.messages-section h4 {
  margin-bottom: 1rem;
  color: var(--text-dark);
}

.messages-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.memory-message {
  padding: 1rem;
  background: var(--bg-light);
  border-radius: 12px;
  position: relative;
}

.memory-message.sent {
  border-left: 3px solid var(--love-red);
}

.memory-message.received {
  border-left: 3px solid var(--accent);
}

.msg-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.msg-contact {
  font-size: 0.85rem;
  font-weight: bold;
  color: var(--text-dark);
}

.msg-time {
  font-size: 0.75rem;
  color: var(--text-light);
}

.msg-bubble {
  font-size: 0.95rem;
  line-height: 1.6;
  color: var(--text-dark);
  padding: 0.75rem;
  background: white;
  border-radius: 8px;
  margin-bottom: 0.5rem;
}

.msg-type {
  font-size: 0.75rem;
  color: var(--text-light);
  text-align: right;
}

.contacts-section h4 {
  margin-bottom: 1rem;
  color: var(--text-dark);
}

.contacts-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.contact-chip {
  padding: 0.4rem 0.85rem;
  background: var(--bg-light);
  border-radius: 16px;
  font-size: 0.85rem;
  color: var(--text-dark);
}

.tag {
  display: inline-block;
  padding: 0.2rem 0.6rem;
  border-radius: 12px;
  font-size: 0.75rem;
  background: var(--bg-light);
  color: var(--text-light);
}

.tag-city { background: #e3f2fd; color: #1565c0; }
.tag-food { background: #fff3e0; color: #e65100; }
.tag-entertainment { background: #f3e5f5; color: #6a1b9a; }
.tag-park { background: #e8f5e9; color: #2e7d32; }
.tag-school { background: #fffde7; color: #f57f17; }
.tag-work { background: #eceff1; color: #37474f; }
.tag-transport { background: #e0f7fa; color: #00838f; }
.tag-shopping { background: #fce4ec; color: #ad1457; }
.tag-hotel { background: #fbe9e7; color: #bf360c; }
.tag-phrase { background: #f5f5f5; color: #616161; }
</style>
