const CITY_NAMES = [
  '北京', '上海', '广州', '深圳', '杭州', '成都', '重庆', '武汉', '西安', '南京',
  '苏州', '天津', '长沙', '郑州', '青岛', '大连', '宁波', '厦门', '福州', '济南',
  '哈尔滨', '沈阳', '长春', '石家庄', '太原', '合肥', '南昌', '昆明', '贵阳', '南宁',
  '兰州', '乌鲁木齐', '呼和浩特', '银川', '西宁', '拉萨', '海口', '三亚', '香港', '澳门',
  '东京', '首尔', '纽约', '伦敦', '巴黎', '罗马', '悉尼', '曼谷', '新加坡', '吉隆坡'
]

const PLACE_KEYWORDS = [
  { pattern: /电影院|影城|影院/gi, type: 'entertainment', label: '电影院' },
  { pattern: /餐厅|饭馆|饭店|菜馆|食堂|火锅店|烧烤店|咖啡店|奶茶店|甜品店/gi, type: 'food', label: '餐厅' },
  { pattern: /公园|游乐园|动物园|植物园|景区|景点|度假区/gi, type: 'park', label: '公园景点' },
  { pattern: /学校|大学|学院|中学|小学|幼儿园/gi, type: 'school', label: '学校' },
  { pattern: /公司|写字楼|大厦|办公室|产业园|科技园/gi, type: 'work', label: '公司' },
  { pattern: /机场|火车站|高铁站|汽车站|地铁站/gi, type: 'transport', label: '交通枢纽' },
  { pattern: /医院|诊所|卫生院/gi, type: 'medical', label: '医院' },
  { pattern: /商场|购物中心|超市|便利店|步行街|商业街/gi, type: 'shopping', label: '购物场所' },
  { pattern: /酒店|宾馆|旅馆|民宿|度假村/gi, type: 'hotel', label: '酒店' },
  { pattern: /图书馆|博物馆|美术馆|展览馆|科技馆/gi, type: 'culture', label: '文化场馆' },
  { pattern: /体育馆|健身房|游泳馆|球场|运动场/gi, type: 'sports', label: '运动场所' }
]

const LOCATION_PATTERNS = [
  /在(.+?)(见|等|吃饭|见面|集合|碰面|碰面|玩|逛|约会)/g,
  /去(.+?)(玩|吃饭|看电影|逛街|约会|旅游|旅行)/g,
  /到(.+?)(了|见|等|集合)/g,
  /(.+?)(见|等你|等我|碰面|集合)/g,
  /(.+?)(门口|旁边|附近|对面)/g,
  /从(.+?)(出发|回来|过来)/g
]

function extractCities(text) {
  const cities = []
  for (const city of CITY_NAMES) {
    if (text.includes(city) && !cities.includes(city)) {
      cities.push(city)
    }
  }
  return cities
}

function extractPlaceTypes(text) {
  const types = []
  for (const kw of PLACE_KEYWORDS) {
    const matches = text.match(kw.pattern)
    if (matches) {
      for (const m of matches) {
        if (!types.find(t => t.type === kw.type)) {
          types.push({ type: kw.type, label: kw.label, mention: m })
        }
      }
    }
  }
  return types
}

function extractLocationPhrases(text) {
  const phrases = []
  for (const pattern of LOCATION_PATTERNS) {
    let match
    while ((match = pattern.exec(text)) !== null) {
      const location = match[1].trim()
      if (location && location.length >= 2 && location.length <= 20) {
        if (!phrases.includes(location)) {
          phrases.push(location)
        }
      }
    }
  }
  return phrases
}

function detectLocations(message) {
  if (!message.body) return []
  
  const text = message.body
  const locations = []
  
  const cities = extractCities(text)
  for (const city of cities) {
    locations.push({
      name: city,
      type: 'city',
      confidence: 0.9
    })
  }
  
  const placeTypes = extractPlaceTypes(text)
  for (const pt of placeTypes) {
    locations.push({
      name: pt.mention,
      type: pt.type,
      label: pt.label,
      confidence: 0.7
    })
  }
  
  const phrases = extractLocationPhrases(text)
  for (const phrase of phrases) {
    const isKnown = cities.some(c => phrase.includes(c)) ||
                    placeTypes.some(p => phrase.includes(p.mention))
    if (!isKnown) {
      locations.push({
        name: phrase,
        type: 'phrase',
        confidence: 0.5
      })
    }
  }
  
  return locations
}

const locationDetector = {
  name: 'location',
  label: '地点检测',
  description: '从短信内容中识别地点线索',

  detect(conversation) {
    let score = 0
    const tags = []
    const locationMessages = []
    const allLocations = {}

    for (const msg of conversation.messages) {
      const locations = detectLocations(msg)
      if (locations.length > 0) {
        locationMessages.push({
          message: msg,
          locations
        })
        
        for (const loc of locations) {
          const key = loc.name
          if (!allLocations[key]) {
            allLocations[key] = {
              ...loc,
              count: 0,
              messages: []
            }
          }
          allLocations[key].count++
          allLocations[key].messages.push(msg)
          score += Math.round(loc.confidence * 10)
        }
      }
    }

    const cityCount = Object.values(allLocations).filter(l => l.type === 'city').length
    const placeCount = Object.values(allLocations).filter(l => l.type !== 'city' && l.type !== 'phrase').length
    const phraseCount = Object.values(allLocations).filter(l => l.type === 'phrase').length

    if (cityCount > 0) tags.push(`🏙️ ${cityCount}个城市`)
    if (placeCount > 0) tags.push(`📍 ${placeCount}个场所`)
    if (phraseCount > 0) tags.push(`🗺️ ${phraseCount}个地点线索`)

    return {
      score,
      tags,
      locationMessages,
      locations: allLocations
    }
  }
}

export function extractLocationMap(conversations) {
  const locationMap = {}
  
  for (const conv of conversations) {
    for (const msg of conv.messages) {
      const locations = detectLocations(msg)
      if (locations.length > 0) {
        for (const loc of locations) {
          const key = loc.name
          if (!locationMap[key]) {
            locationMap[key] = {
              ...loc,
              messages: [],
              conversations: new Set(),
              messageCount: 0
            }
          }
          locationMap[key].messages.push({
            ...msg,
            conversation: {
              id: conv.id || conv.address,
              name: conv.name,
              address: conv.address
            }
          })
          locationMap[key].conversations.add(conv.address)
          locationMap[key].messageCount++
        }
      }
    }
  }
  
  const result = Object.values(locationMap)
    .map(loc => ({
      ...loc,
      conversationCount: loc.conversations.size,
      conversations: Array.from(loc.conversations)
    }))
    .sort((a, b) => {
      const scoreA = a.confidence * 100 + a.messageCount * 10 + a.conversationCount * 5
      const scoreB = b.confidence * 100 + b.messageCount * 10 + b.conversationCount * 5
      return scoreB - scoreA
    })
  
  return result
}

export { detectLocations, CITY_NAMES, PLACE_KEYWORDS }
export default locationDetector
