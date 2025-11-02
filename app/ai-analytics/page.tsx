"use client"

import { useState } from "react"
import { GlassMainLayout } from "@/components/layout/glass-main-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Brain, MessageCircle, Send, Bot, User, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

export default function AIAnalyticsPage() {
  const router = useRouter()
  
  // AI Chatbot state
  const [chatMessages, setChatMessages] = useState<Array<{id: string, type: 'user' | 'ai', message: string, timestamp: string}>>([])
  const [chatInput, setChatInput] = useState('')
  const [isChatLoading, setIsChatLoading] = useState(false)

  // AI Chatbot functions
  const sendChatMessage = async () => {
    if (!chatInput.trim() || isChatLoading) return

    const userMessage = {
      id: Date.now().toString(),
      type: 'user' as const,
      message: chatInput,
      timestamp: new Date().toISOString()
    }

    setChatMessages(prev => [...prev, userMessage])
    setChatInput('')
    setIsChatLoading(true)

    try {
      const response = await fetch('http://localhost:8000/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tower_id: 0, // System-wide context for general analytics
          message: chatInput
        })
      })

      const data = await response.json()
      
      const aiMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai' as const,
        message: data.ai_response,
        timestamp: new Date().toISOString()
      }

      setChatMessages(prev => [...prev, aiMessage])
    } catch (error) {
      console.error('Chat error:', error)
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai' as const,
        message: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date().toISOString()
      }
      setChatMessages(prev => [...prev, errorMessage])
    } finally {
      setIsChatLoading(false)
    }
  }

  const handleChatKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendChatMessage()
    }
  }

  return (
    <GlassMainLayout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-blue-500/20 rounded-xl">
                <Brain className="w-6 h-6 text-blue-400" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                AI Analytics
              </h1>
            </div>
          </div>
        </div>

        {/* AI Chatbot Interface */}
        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-blue-500/20 rounded-xl">
                <MessageCircle className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">AI Assistant</h2>
                <p className="text-white/60">Ask questions about system-wide tower analytics and insights</p>
              </div>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="h-[40rem] overflow-y-auto space-y-4 p-4 bg-black/20 rounded-2xl border border-white/10 mb-4">
            {chatMessages.length === 0 ? (
              <div className="text-center text-white/60 py-8">
                <Bot className="w-12 h-12 mx-auto mb-4 text-blue-400" />
                <h3 className="text-xl font-semibold mb-2">Welcome to AI Analytics</h3>
                <p className="text-sm mb-4">I can help you analyze the entire tower system, provide insights, and answer questions about:</p>
                <div className="grid grid-cols-2 gap-2 text-sm text-white/70 max-w-md mx-auto">
                  <div className="bg-white/5 p-2 rounded-lg">• System Overview</div>
                  <div className="bg-white/5 p-2 rounded-lg">• All Towers Status</div>
                  <div className="bg-white/5 p-2 rounded-lg">• Regional Analysis</div>
                  <div className="bg-white/5 p-2 rounded-lg">• Performance Trends</div>
                  <div className="bg-white/5 p-2 rounded-lg">• Maintenance Planning</div>
                  <div className="bg-white/5 p-2 rounded-lg">• System Health</div>
                </div>
                <p className="text-sm mt-4">Try asking: "What towers do we have?" or "System overview"</p>
              </div>
            ) : (
              chatMessages.map((message) => (
                <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex items-start space-x-3 max-w-[80%] ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    <div className={`p-2 rounded-lg ${message.type === 'user' ? 'bg-blue-500/20' : 'bg-white/10'}`}>
                      {message.type === 'user' ? (
                        <User className="w-5 h-5 text-blue-400" />
                      ) : (
                        <Bot className="w-5 h-5 text-blue-400" />
                      )}
                    </div>
                    <div className={`p-4 rounded-2xl ${message.type === 'user' ? 'bg-blue-500/20 text-white' : 'bg-white/10 text-white/90'}`}>
                      <p className="text-sm whitespace-pre-wrap">{message.message}</p>
                      <p className="text-xs text-white/50 mt-2">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
            {isChatLoading && (
              <div className="flex justify-start">
                <div className="flex items-start space-x-3">
                  <div className="p-2 rounded-lg bg-white/10">
                    <Bot className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="p-4 rounded-2xl bg-white/10">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Chat Input */}
          <div className="flex space-x-3">
            <Input
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyPress={handleChatKeyPress}
              placeholder="Ask about tower analytics, performance insights, or maintenance recommendations..."
              disabled={isChatLoading}
              className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-blue-400 rounded-2xl h-12"
            />
            <Button
              onClick={sendChatMessage}
              disabled={!chatInput.trim() || isChatLoading}
              className="bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-400 rounded-2xl h-12 px-6"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </GlassMainLayout>
  )
}
