const CITY_NAMES = [
  '北京', '上海', '广州', '深圳', '杭州', '成都', '重庆', '武汉', '西安', '南京',
  '苏州', '天津', '长沙', '郑州', '青岛', '大连', '宁波', '厦门', '福州', '济南',
  '哈尔滨', '沈阳', '长春', '石家庄', '太原', '合肥', '南昌', '昆明', '贵阳', '南宁',
  '兰州', '乌鲁木齐', '呼和浩特', '银川', '西宁', '拉萨', '海口', '三亚', '香港', '澳门',
  '台湾', '东莞', '佛山', '无锡', '常州', '温州', '泉州', '烟台', '潍坊', '绍兴',
  '南通', '扬州', '镇江', '泰州', '徐州', '金华', '台州', '嘉兴', '湖州', '芜湖',
  '东京', '首尔', '纽约', '伦敦', '巴黎', '罗马', '悉尼', '曼谷', '新加坡', '吉隆坡',
  '大阪', '京都', '济州岛', '巴厘岛', '马尔代夫', '北海道', '冲绳', '夏威夷', '洛杉矶', '旧金山'
]

const PLACE_KEYWORDS = [
  { pattern: /电影院|影城|影院|IMAX厅/gi, type: 'entertainment', label: '电影院' },
  { pattern: /餐厅|饭馆|饭店|菜馆|食堂|火锅店|烧烤店|咖啡店|奶茶店|甜品店|料理店|面馆|小吃店/gi, type: 'food', label: '餐厅美食' },
  { pattern: /公园|游乐园|动物园|植物园|景区|景点|度假区|风景区|瀑布|峡谷|雪山/gi, type: 'park', label: '公园景点' },
  { pattern: /学校|大学|学院|中学|小学|幼儿园|校区|教学楼/gi, type: 'school', label: '学校' },
  { pattern: /公司|写字楼|大厦|办公室|产业园|科技园|工厂|厂区/gi, type: 'work', label: '工作场所' },
  { pattern: /机场|火车站|高铁站|汽车站|地铁站|港口|码头|客运站/gi, type: 'transport', label: '交通枢纽' },
  { pattern: /医院|诊所|卫生院|卫生站/gi, type: 'medical', label: '医疗机构' },
  { pattern: /商场|购物中心|超市|便利店|步行街|商业街|广场|百货/gi, type: 'shopping', label: '购物场所' },
  { pattern: /酒店|宾馆|旅馆|民宿|度假村|客栈/gi, type: 'hotel', label: '酒店住宿' },
  { pattern: /图书馆|博物馆|美术馆|展览馆|科技馆|纪念馆|教堂|寺庙/gi, type: 'culture', label: '文化场馆' },
  { pattern: /体育馆|健身房|游泳馆|球场|运动场|滑雪场|溜冰场/gi, type: 'sports', label: '运动场所' }
]

const STREET_KEYWORDS = ['路', '街', '道', '巷', '胡同', '大道', '大街', '广场', '桥', '站']

const EXPLICIT_LOCATION_PATTERNS = [
  /(?:^|[\s，。,！!?？、])在([\u4e00-\u9fa5A-Za-z0-9]{2,15}?)(?:见|等|吃饭|见面|集合|碰面|玩|逛|约会|碰头)/g,
  /(?:^|[\s，。,！!?？、])去([\u4e00-\u9fa5A-Za-z0-9]{2,15}?)(?:玩|吃饭|看电影|逛街|约会|旅游|旅行|逛逛|打卡)/g,
  /(?:^|[\s，。,！!?？、])到([\u4e00-\u9fa5A-Za-z0-9]{2,15}?)(?:了|见|等|集合|碰头|碰面)/g,
  /([\u4e00-\u9fa5A-Za-z0-9]{2,15}?)(?:门口|旁边|附近|对面|楼下|楼上)/g
]

const STOP_WORDS = new Set([
  '我', '你', '他', '她', '它', '我们', '你们', '他们', '她们',
  '想你', '想念', '思念', '爱你', '喜欢你', '晚安', '早安', '你好',
  '对不起', '抱歉', '不好意思', '谢谢', '感谢',
  '真的', '好想', '就是', '那么', '怎么', '什么', '为什么',
  '今天', '明天', '后天', '昨天', '晚上', '早上', '下午', '中午',
  '梦里', '心里', '身边', '家里', '这里', '那里', '哪儿', '哪里',
  '公司', '学校'
])

const INVALID_PHRASE_PATTERNS = [
  /^(想|好|太|真|最|很|非|不|没|是|的|了|啊|吧|呢|吗|哦|哈|呀)/,
  /^(我|你|他|她|我们|你们|他们)/,
  /(想你|爱你|晚安|早安|梦里|心里|想念|思念)/,
  /^.{0,1}$/,
  /^.{16,}$/,
  /^[，。,！!?？、\s]+$/
]

function isLikelyLocationName(phrase) {
  if (!phrase || typeof phrase !== 'string') return false
  
  const trimmed = phrase.trim()
  if (!trimmed) return false
  
  for (const pattern of INVALID_PHRASE_PATTERNS) {
    if (pattern.test(trimmed)) return false
  }
  
  if (STOP_WORDS.has(trimmed)) return false
  
  for (const word of STOP_WORDS) {
    if (trimmed === word || trimmed.startsWith(word + '的')) return false
  }
  
  if (/^[\u4e00-\u9fa5]{2,6}$/.test(trimmed)) {
    let hasLocationSignal = false
    for (const kw of STREET_KEYWORDS) {
      if (trimmed.endsWith(kw)) {
        hasLocationSignal = true
        break
      }
    }
    if (trimmed.includes('西湖') || trimmed.includes('东湖') || 
        trimmed.includes('南山') || trimmed.includes('北山') ||
        trimmed.includes('万达') || trimmed.includes('银泰') ||
        trimmed.includes('万象') || trimmed.includes('大悦')) {
      hasLocationSignal = true
    }
    if (!hasLocationSignal) {
      return false
    }
  }
  
  const emojiPattern = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{27BF}]/u
  if (emojiPattern.test(trimmed)) return false
  
  return true
}

function extractCities(text) {
  const cities = []
  for (const city of CITY_NAMES) {
    const regex = new RegExp(`(^|[^\\u4e00-\\u9fa5])${city}([^\\u4e00-\\u9fa5]|$)`, 'g')
    if (regex.test(text) && !cities.includes(city)) {
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
      const seen = new Set()
      for (const m of matches) {
        const normalized = m.trim()
        if (!seen.has(normalized)) {
          seen.add(normalized)
          types.push({ type: kw.type, label: kw.label, mention: normalized })
        }
      }
    }
  }
  return types
}

function extractExplicitLocations(text) {
  const phrases = []
  const seen = new Set()
  
  for (const pattern of EXPLICIT_LOCATION_PATTERNS) {
    let match
    const regex = new RegExp(pattern.source, pattern.flags)
    while ((match = regex.exec(text)) !== null) {
      let location = match[1]
      if (!location) continue
      
      location = location.trim()
      location = location.replace(/^[的了啊吧呢哦哈呀，。,！!?？、\s]+/, '')
      location = location.replace(/[的了啊吧呢哦哈呀，。,！!?？、\s]+$/, '')
      
      if (!location || location.length < 2 || location.length > 15) continue
      if (seen.has(location)) continue
      if (!isLikelyLocationName(location)) continue
      
      seen.add(location)
      phrases.push(location)
    }
  }
  
  return phrases
}

function detectLocations(message) {
  if (!message.body) return []
  
  const text = message.body
  const locations = []
  const seenNames = new Set()
  
  const cities = extractCities(text)
  for (const city of cities) {
    if (!seenNames.has(city)) {
      seenNames.add(city)
      locations.push({
        name: city,
        type: 'city',
        confidence: 0.95
      })
    }
  }
  
  const placeTypes = extractPlaceTypes(text)
  for (const pt of placeTypes) {
    if (!seenNames.has(pt.mention)) {
      seenNames.add(pt.mention)
      locations.push({
        name: pt.mention,
        type: pt.type,
        label: pt.label,
        confidence: 0.85
      })
    }
  }
  
  const explicitLocs = extractExplicitLocations(text)
  for (const loc of explicitLocs) {
    const isKnown = seenNames.has(loc) ||
                    Array.from(seenNames).some(n => loc.includes(n) || n.includes(loc))
    if (!isKnown && isLikelyLocationName(loc)) {
      seenNames.add(loc)
      locations.push({
        name: loc,
        type: 'place',
        label: '具体地点',
        confidence: 0.6
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
    const placeCount = Object.values(allLocations).filter(l => l.type !== 'city').length

    if (cityCount > 0) tags.push(`🏙️ ${cityCount}个城市`)
    if (placeCount > 0) tags.push(`📍 ${placeCount}个场所`)

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
          if (loc.confidence < 0.55) continue
          
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
    .filter(loc => loc.confidence >= 0.55)
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

export { detectLocations, CITY_NAMES, PLACE_KEYWORDS, isLikelyLocationName }
export default locationDetector
