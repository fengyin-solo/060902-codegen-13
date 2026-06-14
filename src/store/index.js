import { reactive } from 'vue'

export const store = reactive({
  conversations: [],
  selectedConversation: null,
  loveLetters: [],
  anonymousPosts: [],
  locationMemories: [],
  selectedLocation: null,
  processing: false,
  error: null,

  setConversations(convs) {
    this.conversations = convs
  },

  setLoveLetters(letters) {
    this.loveLetters = letters
  },

  setSelectedConversation(conv) {
    this.selectedConversation = conv
  },

  setLocationMemories(memories) {
    this.locationMemories = memories
  },

  setSelectedLocation(location) {
    this.selectedLocation = location
  },

  addAnonymousPost(post) {
    this.anonymousPosts.unshift(post)
  },

  setProcessing(val) {
    this.processing = val
  },

  setError(err) {
    this.error = err
  },

  clearAll() {
    this.conversations = []
    this.selectedConversation = null
    this.loveLetters = []
    this.locationMemories = []
    this.selectedLocation = null
    this.error = null
  }
})
