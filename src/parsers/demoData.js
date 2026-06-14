import { groupConversations } from './index'

export function generateDemoData() {
  const conversations = [
    {
      address: '+8613800138000',
      name: '亲爱的TA',
      messages: [
        { id: '1', body: '晚安，梦里见 🌙', date: Date.now() - 86400000 * 30 + 3600000 * 22, type: 2, isSent: true, isReceived: false },
        { id: '2', body: '晚安呀，明天见 ❤️', date: Date.now() - 86400000 * 30 + 3600000 * 22 + 60000, type: 1, isSent: false, isReceived: true },
        { id: '3', body: '今天好累，想你了', date: Date.now() - 86400000 * 25 + 3600000 * 19, type: 2, isSent: true, isReceived: false },
        { id: '4', body: '我也想你，抱抱你 🤗', date: Date.now() - 86400000 * 25 + 3600000 * 19 + 120000, type: 1, isSent: false, isReceived: true },
        { id: '5', body: '周末一起去看电影好不好？我们去万达影城吧', date: Date.now() - 86400000 * 20 + 3600000 * 14, type: 1, isSent: false, isReceived: true },
        { id: '6', body: '好呀好呀，我也想你了，在北京等你哦', date: Date.now() - 86400000 * 20 + 3600000 * 14 + 300000, type: 2, isSent: true, isReceived: false },
        { id: '7', body: '对不起，今天不能陪你吃饭了，公司加班', date: Date.now() - 86400000 * 15 + 3600000 * 12, type: 2, isSent: true, isReceived: false },
        { id: '8', body: '没关系啦，工作重要。晚上记得想我哦，我在公园等你下班', date: Date.now() - 86400000 * 15 + 3600000 * 12 + 180000, type: 1, isSent: false, isReceived: true },
        { id: '9', body: '想你想你想你！上海的夜景好美，可惜你不在身边', date: Date.now() - 86400000 * 10 + 3600000 * 23, type: 2, isSent: true, isReceived: false },
        { id: '10', body: '我也想你，晚安亲爱的。等你从上海回来我们去吃火锅', date: Date.now() - 86400000 * 10 + 3600000 * 23 + 120000, type: 1, isSent: false, isReceived: true },
        { id: '11', body: '今天好想你，你在干嘛呢', date: Date.now() - 86400000 * 5 + 3600000 * 15, type: 1, isSent: false, isReceived: true },
        { id: '12', body: '在想你呀 😘 周末我们去西湖玩吧', date: Date.now() - 86400000 * 5 + 3600000 * 15 + 60000, type: 2, isSent: true, isReceived: false },
        { id: '13', body: '好呀！杭州西湖我还没去过呢', date: Date.now() - 86400000 * 5 + 3600000 * 15 + 120000, type: 1, isSent: false, isReceived: true },
        { id: '14', body: '我们在学校门口见吧，下午三点', date: Date.now() - 86400000 * 3 + 3600000 * 10, type: 2, isSent: true, isReceived: false },
        { id: '15', body: '好的，到时候带你去吃那家新开的奶茶店', date: Date.now() - 86400000 * 3 + 3600000 * 10 + 300000, type: 1, isSent: false, isReceived: true },
      ]
    },
    {
      address: '+8613900139000',
      name: '小傲娇',
      messages: [
        { id: '101', body: '哼，不理你了！', date: Date.now() - 86400000 * 20, type: 1, isSent: false, isReceived: true },
        { id: '102', body: '怎么啦，我错了还不行吗 😢', date: Date.now() - 86400000 * 20 + 60000, type: 2, isSent: true, isReceived: false },
        { id: '103', body: '哪里错了？', date: Date.now() - 86400000 * 20 + 120000, type: 1, isSent: false, isReceived: true },
        { id: '104', body: '我哪里都错了，不该让你不高兴的', date: Date.now() - 86400000 * 20 + 180000, type: 2, isSent: true, isReceived: false },
        { id: '105', body: '哼，算你识相。下次不许了！', date: Date.now() - 86400000 * 20 + 300000, type: 1, isSent: false, isReceived: true },
        { id: '106', body: '你最好了，原谅我嘛好不好', date: Date.now() - 86400000 * 18, type: 2, isSent: true, isReceived: false },
        { id: '107', body: '不要撒娇，没用的', date: Date.now() - 86400000 * 18 + 60000, type: 1, isSent: false, isReceived: true },
        { id: '108', body: '嘤嘤嘤，人家错了嘛 🥺', date: Date.now() - 86400000 * 18 + 120000, type: 2, isSent: true, isReceived: false },
      ]
    },
    {
      address: '+8613700137000',
      name: '欢喜冤家',
      messages: [
        { id: '201', body: '你能不能别这么笨！', date: Date.now() - 86400000 * 40, type: 1, isSent: false, isReceived: true },
        { id: '202', body: '我怎么笨了？你才笨！', date: Date.now() - 86400000 * 40 + 30000, type: 2, isSent: true, isReceived: false },
        { id: '203', body: '说谁呢你！找打是吧？', date: Date.now() - 86400000 * 40 + 60000, type: 1, isSent: false, isReceived: true },
        { id: '204', body: '我说你呢，笨蛋笨蛋大笨蛋！', date: Date.now() - 86400000 * 40 + 90000, type: 2, isSent: true, isReceived: false },
        { id: '205', body: '你死定了！绝交！', date: Date.now() - 86400000 * 40 + 120000, type: 1, isSent: false, isReceived: true },
        { id: '206', body: '对不起对不起，我错了，别不理我', date: Date.now() - 86400000 * 40 + 300000, type: 2, isSent: true, isReceived: false },
        { id: '207', body: '晚了！', date: Date.now() - 86400000 * 40 + 360000, type: 1, isSent: false, isReceived: true },
        { id: '208', body: '我请你吃一周的奶茶！学校门口那家奶茶店', date: Date.now() - 86400000 * 40 + 420000, type: 2, isSent: true, isReceived: false },
        { id: '209', body: '两周！还要去游乐园玩！', date: Date.now() - 86400000 * 40 + 480000, type: 1, isSent: false, isReceived: true },
        { id: '210', body: '成交！周末北京游乐园见！', date: Date.now() - 86400000 * 40 + 540000, type: 2, isSent: true, isReceived: false },
        { id: '211', body: '对了，上次在成都吃的火锅还想去', date: Date.now() - 86400000 * 30, type: 1, isSent: false, isReceived: true },
        { id: '212', body: '吃吃吃就知道吃！不过那家火锅店确实好吃', date: Date.now() - 86400000 * 30 + 60000, type: 2, isSent: true, isReceived: false },
      ]
    },
    {
      address: '+8613600136000',
      name: '温柔的人',
      messages: [
        { id: '301', body: '今天天气真好，想和你一起去公园散步', date: Date.now() - 86400000 * 50, type: 2, isSent: true, isReceived: false },
        { id: '302', body: '好呀，晚上吃完饭一起吧，西湖边风景很好', date: Date.now() - 86400000 * 50 + 600000, type: 1, isSent: false, isReceived: true },
        { id: '303', body: '和你在一起的每一天都很开心', date: Date.now() - 86400000 * 45, type: 2, isSent: true, isReceived: false },
        { id: '304', body: '我也是，谢谢你出现在我的生命里', date: Date.now() - 86400000 * 45 + 300000, type: 1, isSent: false, isReceived: true },
        { id: '305', body: '晚安，愿你做个好梦', date: Date.now() - 86400000 * 42, type: 2, isSent: true, isReceived: false },
        { id: '306', body: '晚安，梦里有你就是好梦', date: Date.now() - 86400000 * 42 + 120000, type: 1, isSent: false, isReceived: true },
        { id: '307', body: '想你了，真的好想。你在深圳还好吗？', date: Date.now() - 86400000 * 35, type: 1, isSent: false, isReceived: true },
        { id: '308', body: '我也想你，等我忙完这段时间就去杭州陪你', date: Date.now() - 86400000 * 35 + 180000, type: 2, isSent: true, isReceived: false },
        { id: '309', body: '我们公司楼下新开了一家咖啡店，味道不错', date: Date.now() - 86400000 * 20, type: 2, isSent: true, isReceived: false },
        { id: '310', body: '下次带我去尝尝呀，我也喜欢咖啡店的氛围', date: Date.now() - 86400000 * 20 + 120000, type: 1, isSent: false, isReceived: true },
        { id: '311', body: '周末去图书馆看书吗？', date: Date.now() - 86400000 * 10, type: 1, isSent: false, isReceived: true },
        { id: '312', body: '好呀，市图书馆见，下午两点', date: Date.now() - 86400000 * 10 + 60000, type: 2, isSent: true, isReceived: false },
      ]
    }
  ]
  
  return groupConversations(conversations.flatMap(c => 
    c.messages.map(m => ({
      ...m,
      address: c.address,
      threadId: c.address
    }))
  ))
}
