// Message Processing Service
// Handles message state, formatting, and UI interactions

export interface Message {
  id: number
  sender: 'ai' | 'user' | 'agent'
  text: string
  timestamp: Date
  agentName?: string
  confidence?: number
  reasoning?: string
  type?: 'greeting' | 'explanation' | 'analysis' | 'fallback' | 'ai-generated' | 'user-input' | 'system'
  metadata?: {
    processingTime?: number
    tokenCount?: number
    model?: string
    temperature?: number
  }
}

export interface MessageFilter {
  sender?: Message['sender']
  type?: Message['type']
  agentName?: string
  dateRange?: {
    start: Date
    end: Date
  }
}

export interface MessageStats {
  totalMessages: number
  aiMessages: number
  userMessages: number
  avgProcessingTime: number
  avgConfidence: number
  topAgents: { name: string; count: number }[]
  messageTypes: { type: string; count: number }[]
}

export class MessageProcessor {
  private messages: Message[] = []
  private maxMessages: number
  private onUpdate?: (messages: Message[]) => void

  constructor(maxMessages: number = 100, onUpdate?: (messages: Message[]) => void) {
    this.maxMessages = maxMessages
    this.onUpdate = onUpdate
  }

  /**
   * Add a new message to the conversation
   */
  addMessage(
    sender: Message['sender'],
    text: string,
    options: Partial<Omit<Message, 'id' | 'sender' | 'text' | 'timestamp'>> = {}
  ): Message {
    const message: Message = {
      id: this.generateMessageId(),
      sender,
      text: text.trim(),
      timestamp: new Date(),
      ...options
    }

    this.messages.push(message)
    this.trimMessages()
    this.notifyUpdate()

    return message
  }

  /**
   * Add user message
   */
  addUserMessage(text: string): Message {
    return this.addMessage('user', text, {
      type: 'user-input'
    })
  }

  /**
   * Add AI response message
   */
  addAIMessage(
    text: string,
    agentName?: string,
    confidence?: number,
    reasoning?: string,
    type: Message['type'] = 'ai-generated',
    metadata?: Message['metadata']
  ): Message {
    return this.addMessage('ai', text, {
      agentName,
      confidence,
      reasoning,
      type,
      metadata
    })
  }

  /**
   * Add system message
   */
  addSystemMessage(text: string): Message {
    return this.addMessage('ai', text, {
      type: 'system'
    })
  }

  /**
   * Get all messages
   */
  getMessages(): Message[] {
    return [...this.messages]
  }

  /**
   * Get filtered messages
   */
  getFilteredMessages(filter: MessageFilter): Message[] {
    return this.messages.filter(message => {
      if (filter.sender && message.sender !== filter.sender) return false
      if (filter.type && message.type !== filter.type) return false
      if (filter.agentName && message.agentName !== filter.agentName) return false
      
      if (filter.dateRange) {
        const messageTime = message.timestamp.getTime()
        if (messageTime < filter.dateRange.start.getTime() || 
            messageTime > filter.dateRange.end.getTime()) {
          return false
        }
      }
      
      return true
    })
  }

  /**
   * Get conversation statistics
   */
  getStats(): MessageStats {
    const aiMessages = this.messages.filter(m => m.sender === 'ai' || m.sender === 'agent')
    const userMessages = this.messages.filter(m => m.sender === 'user')
    
    const processingTimes = this.messages
      .map(m => m.metadata?.processingTime)
      .filter(t => t !== undefined) as number[]
    
    const confidences = this.messages
      .map(m => m.confidence)
      .filter(c => c !== undefined) as number[]
    
    // Count agents
    const agentCounts = new Map<string, number>()
    this.messages.forEach(m => {
      if (m.agentName) {
        agentCounts.set(m.agentName, (agentCounts.get(m.agentName) || 0) + 1)
      }
    })
    
    // Count message types
    const typeCounts = new Map<string, number>()
    this.messages.forEach(m => {
      if (m.type) {
        typeCounts.set(m.type, (typeCounts.get(m.type) || 0) + 1)
      }
    })

    return {
      totalMessages: this.messages.length,
      aiMessages: aiMessages.length,
      userMessages: userMessages.length,
      avgProcessingTime: processingTimes.length > 0 
        ? processingTimes.reduce((a, b) => a + b, 0) / processingTimes.length 
        : 0,
      avgConfidence: confidences.length > 0
        ? confidences.reduce((a, b) => a + b, 0) / confidences.length
        : 0,
      topAgents: Array.from(agentCounts.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5),
      messageTypes: Array.from(typeCounts.entries())
        .map(([type, count]) => ({ type, count }))
        .sort((a, b) => b.count - a.count)
    }
  }

  /**
   * Clear all messages
   */
  clearMessages(): void {
    this.messages = []
    this.notifyUpdate()
  }

  /**
   * Remove message by ID
   */
  removeMessage(id: number): boolean {
    const initialLength = this.messages.length
    this.messages = this.messages.filter(m => m.id !== id)
    
    if (this.messages.length < initialLength) {
      this.notifyUpdate()
      return true
    }
    
    return false
  }

  /**
   * Update message text
   */
  updateMessage(id: number, text: string): boolean {
    const message = this.messages.find(m => m.id === id)
    if (message) {
      message.text = text.trim()
      this.notifyUpdate()
      return true
    }
    return false
  }

  /**
   * Get last message from specific sender
   */
  getLastMessageFrom(sender: Message['sender']): Message | null {
    for (let i = this.messages.length - 1; i >= 0; i--) {
      if (this.messages[i].sender === sender) {
        return this.messages[i]
      }
    }
    return null
  }

  /**
   * Get conversation context for AI (last N messages)
   */
  getConversationContext(messageCount: number = 10): string {
    const recentMessages = this.messages.slice(-messageCount)
    
    return recentMessages
      .map(m => {
        const prefix = m.sender === 'user' ? 'User' : 
                     m.agentName ? `AI Agent ${m.agentName}` : 'AI'
        return `${prefix}: ${m.text}`
      })
      .join('\n')
  }

  /**
   * Export conversation history
   */
  exportConversation(): string {
    const stats = this.getStats()
    
    let export_text = `QuadraX AI Conversation Export\n`
    export_text += `Generated: ${new Date().toISOString()}\n`
    export_text += `Messages: ${stats.totalMessages} (${stats.userMessages} user, ${stats.aiMessages} AI)\n`
    export_text += `Average Confidence: ${(stats.avgConfidence * 100).toFixed(1)}%\n`
    export_text += `Average Processing: ${stats.avgProcessingTime.toFixed(0)}ms\n\n`
    
    export_text += `=== CONVERSATION ===\n\n`
    
    this.messages.forEach(message => {
      const timestamp = message.timestamp.toLocaleString()
      const sender = message.agentName ? `${message.agentName} (AI)` : 
                    message.sender === 'user' ? 'User' : 'AI'
      
      export_text += `[${timestamp}] ${sender}:\n${message.text}\n`
      
      if (message.confidence) {
        export_text += `  └─ Confidence: ${(message.confidence * 100).toFixed(1)}%\n`
      }
      
      export_text += '\n'
    })
    
    return export_text
  }

  /**
   * Set update callback
   */
  setUpdateCallback(callback: (messages: Message[]) => void): void {
    this.onUpdate = callback
  }

  /**
   * Generate unique message ID
   */
  private generateMessageId(): number {
    return Date.now() + Math.random() * 1000
  }

  /**
   * Trim messages to max limit
   */
  private trimMessages(): void {
    if (this.messages.length > this.maxMessages) {
      // Keep system messages and trim from oldest user/ai messages
      const systemMessages = this.messages.filter(m => m.type === 'system')
      const otherMessages = this.messages
        .filter(m => m.type !== 'system')
        .slice(-(this.maxMessages - systemMessages.length))
      
      this.messages = [...systemMessages, ...otherMessages]
        .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
    }
  }

  /**
   * Notify update callback
   */
  private notifyUpdate(): void {
    if (this.onUpdate) {
      this.onUpdate([...this.messages])
    }
  }
}

/**
 * Message formatting utilities
 */
export class MessageFormatter {
  
  /**
   * Format confidence as visual indicator
   */
  static formatConfidence(confidence?: number): string {
    if (!confidence) return ''
    
    const percentage = Math.round(confidence * 100)
    const bars = Math.round(confidence * 5)
    const filled = '█'.repeat(bars)
    const empty = '░'.repeat(5 - bars)
    
    return `${filled}${empty} ${percentage}%`
  }

  /**
   * Format processing time
   */
  static formatProcessingTime(ms?: number): string {
    if (!ms) return ''
    
    if (ms < 1000) return `${Math.round(ms)}ms`
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
    
    return `${Math.round(ms / 60000)}m ${Math.round((ms % 60000) / 1000)}s`
  }

  /**
   * Truncate long messages with ellipsis
   */
  static truncateMessage(text: string, maxLength: number = 200): string {
    if (text.length <= maxLength) return text
    
    return text.substring(0, maxLength - 3) + '...'
  }

  /**
   * Format timestamp relative to now
   */
  static formatRelativeTime(timestamp: Date): string {
    const now = new Date()
    const diff = now.getTime() - timestamp.getTime()
    
    if (diff < 60000) return 'just now'
    if (diff < 3600000) return `${Math.round(diff / 60000)}m ago`
    if (diff < 86400000) return `${Math.round(diff / 3600000)}h ago`
    
    return timestamp.toLocaleDateString()
  }

  /**
   * Add emoji indicators for message types
   */
  static addTypeEmoji(text: string, type?: Message['type']): string {
    const emojiMap: { [key: string]: string } = {
      'greeting': '👋',
      'explanation': '📚',
      'analysis': '🔍',
      'ai-generated': '🤖',
      'system': '⚙️',
      'fallback': '🤔',
      'user-input': '💬'
    }
    
    const emoji = type && emojiMap[type] ? emojiMap[type] + ' ' : ''
    return emoji + text
  }
}