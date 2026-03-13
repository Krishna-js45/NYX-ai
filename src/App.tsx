import { useState, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Sidebar from './components/Sidebar'
import ChatArea from './components/ChatArea'
import InputBar from './components/InputBar'
import SuggestionChips from './components/SuggestionChips'

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  isCode?: boolean
  codeLanguage?: string
}

export interface Conversation {
  id: string
  title: string
  messages: Message[]
  createdAt: Date
}

const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: 'c1',
    title: 'Debug async race condition',
    messages: [],
    createdAt: new Date(Date.now() - 3600000 * 2),
  },
  {
    id: 'c2',
    title: 'Explain transformer architecture',
    messages: [],
    createdAt: new Date(Date.now() - 3600000 * 5),
  },
  {
    id: 'c3',
    title: 'Review React performance',
    messages: [],
    createdAt: new Date(Date.now() - 3600000 * 24),
  },
  {
    id: 'c4',
    title: 'Build a REST API in Go',
    messages: [],
    createdAt: new Date(Date.now() - 3600000 * 48),
  },
]

function generateId() {
  return Math.random().toString(36).slice(2, 10)
}

const ASSISTANT_REPLIES: { [key: string]: Partial<Message> } = {
  debug: {
    content: `I've identified the issue in your async flow. Here's the fix:\n\`\`\`typescript\nasync function fetchData(id: string) {\n  try {\n    const controller = new AbortController();\n    const res = await fetch(\`/api/data/\${id}\`, {\n      signal: controller.signal\n    });\n    if (!res.ok) throw new Error(\`HTTP \${res.status}\`);\n    return await res.json();\n  } catch (err) {\n    if (err instanceof DOMException) return; // aborted\n    throw err;\n  }\n}\`\`\`\nThe race condition was caused by missing AbortController — requests were completing out of order. This ensures only the latest request is processed.`,
    isCode: false,
  },
  explain: {
    content: `A **transformer** is a neural network architecture built around the concept of *self-attention*.\n\n**Key components:**\n- **Multi-Head Attention** — allows the model to attend to different positions simultaneously\n- **Positional Encoding** — injects sequence order information\n- **Feed-Forward Layers** — applies non-linear transformations\n- **Layer Normalization** — stabilizes training\n\nThe core insight is that attention weights let each token "look at" every other token, enabling parallel processing unlike RNNs.`,
    isCode: false,
  },
  default: {
    content: `I've analyzed your request. Here's what I suggest:\n\n\`\`\`typescript\n// Optimized implementation\nexport const solution = async <T>(input: T): Promise<T> => {\n  const processed = await transform(input);\n  return validate(processed);\n};\n\`\`\`\n\nThis approach is **3× faster** than the naive solution and handles edge cases correctly. Want me to walk through each step?`,
    isCode: false,
  },
}

function getReply(content: string): Partial<Message> {
  const lower = content.toLowerCase()
  if (lower.includes('debug') || lower.includes('fix') || lower.includes('error')) return ASSISTANT_REPLIES.debug
  if (lower.includes('explain') || lower.includes('what') || lower.includes('how')) return ASSISTANT_REPLIES.explain
  return ASSISTANT_REPLIES.default
}

export default function App() {
  const [conversations, setConversations] = useState<Conversation[]>(INITIAL_CONVERSATIONS)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [isTyping, setIsTyping] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const activeConversation = conversations.find(c => c.id === activeId) ?? null

  const handleNewChat = useCallback(() => {
    const newConv: Conversation = {
      id: generateId(),
      title: 'New conversation',
      messages: [],
      createdAt: new Date(),
    }
    setConversations(prev => [newConv, ...prev])
    setActiveId(newConv.id)
  }, [])

  const handleSelectChat = useCallback((id: string) => {
    setActiveId(id)
  }, [])

  const handleSend = useCallback((content: string) => {
    if (!content.trim()) return

    let targetId = activeId
    if (!targetId) {
      const newConv: Conversation = {
        id: generateId(),
        title: content.slice(0, 40) + (content.length > 40 ? '…' : ''),
        messages: [],
        createdAt: new Date(),
      }
      setConversations(prev => [newConv, ...prev])
      targetId = newConv.id
      setActiveId(newConv.id)
    }

    const userMsg: Message = {
      id: generateId(),
      role: 'user',
      content,
      timestamp: new Date(),
    }

    setConversations(prev =>
      prev.map(c =>
        c.id === targetId
          ? {
            ...c,
            title: c.messages.length === 0 ? (content.slice(0, 40) + (content.length > 40 ? '…' : '')) : c.title,
            messages: [...c.messages, userMsg],
          }
          : c
      )
    )

    setIsTyping(true)
    const delay = 1200 + Math.random() * 1000

    setTimeout(() => {
      const reply = getReply(content)
      const assistantMsg: Message = {
        id: generateId(),
        role: 'assistant',
        content: reply.content!,
        timestamp: new Date(),
        isCode: reply.isCode,
      }
      setConversations(prev =>
        prev.map(c =>
          c.id === targetId
            ? { ...c, messages: [...c.messages, assistantMsg] }
            : c
        )
      )
      setIsTyping(false)
    }, delay)
  }, [activeId])

  const handleChipClick = useCallback((text: string) => {
    handleSend(text)
  }, [handleSend])

  const isEmpty = !activeConversation || activeConversation.messages.length === 0

  // ── Dynamic greeting ──────────────────────────────────────
  const hour = new Date().getHours()
  const greeting =
    hour >= 5 && hour < 12 ? 'Good Morning, Rajkrishna.' :
      hour >= 12 && hour < 17 ? 'Good Afternoon, Rajkrishna.' :
        hour >= 17 && hour < 21 ? 'Good Evening, Rajkrishna.' :
          'Good Night, Rajkrishna.'

  const _now = new Date()
  const dateString =
    _now.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase() + ' · ' +
    _now.toLocaleDateString('en-US', { month: 'long' }).toUpperCase() + ' ' +
    _now.getDate() + ' · ' + _now.getFullYear()

  return (
    <div className="flex h-screen w-screen bg-black overflow-hidden">
      {/* Ambient background glows */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#6B21FF] opacity-[0.06] blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-[#00FFD1] opacity-[0.04] blur-[140px]" />
        <div className="absolute top-[40%] right-[20%] w-[300px] h-[300px] rounded-full bg-[#6B21FF] opacity-[0.04] blur-[100px]" />
      </div>

      {/* Sidebar */}
      <AnimatePresence mode="wait">
        {sidebarOpen && (
          <Sidebar
            conversations={conversations}
            activeId={activeId}
            onNewChat={handleNewChat}
            onSelectChat={handleSelectChat}
          />
        )}
      </AnimatePresence>

      {/* Main area */}
      <div className="flex flex-col flex-1 relative z-10 overflow-hidden">
        {/* Top bar */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5">
          <button
            id="sidebar-toggle"
            onClick={() => setSidebarOpen(o => !o)}
            className="p-2 rounded-lg hover:bg-white/5 transition-colors text-nyx-subtext hover:text-nyx-text"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <rect x="2" y="4" width="14" height="1.5" rx="0.75" fill="currentColor" />
              <rect x="2" y="8.25" width="14" height="1.5" rx="0.75" fill="currentColor" />
              <rect x="2" y="12.5" width="14" height="1.5" rx="0.75" fill="currentColor" />
            </svg>
          </button>
          <span className="font-orbitron text-xs text-nyx-subtext tracking-widest uppercase">
            {activeConversation ? activeConversation.title : 'NYX'}
          </span>
          <div className="ml-auto flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#00FFD1] shadow-[0_0_8px_#00FFD1] animate-pulse" />
            <span className="text-xs text-nyx-subtext font-mono">Online</span>
          </div>
        </div>

        {/* Chat area or greeting */}
        <div className="flex-1 overflow-hidden">
          {isEmpty ? (
            <motion.div
              key="greeting"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -24 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="flex flex-col items-center justify-center h-full px-6 gap-5"
            >
              {/* Greeting */}
              <motion.div
                className="text-center"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.15, ease: 'easeOut' }}
              >
                <h1
                  id="nyx-greeting"
                  className="font-orbitron font-bold"
                  style={{
                    fontSize: 'clamp(1.8rem, 4vw, 3rem)',
                    background: 'linear-gradient(135deg, #ffffff 0%, #A78BFA 50%, #6B21FF 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    lineHeight: 1.15,
                  }}
                >
                  {greeting}
                </h1>
                <motion.p
                  className="font-mono text-xs mt-2 tracking-[0.22em]"
                  style={{ color: '#444' }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.35 }}
                >
                  {dateString}
                </motion.p>
              </motion.div>

              {/* NYX Orb — small gap via margin */}
              <div className="nyx-orb-lg mt-1" />

              {/* Input + chips stacked */}
              <div className="w-full max-w-2xl space-y-4">
                <InputBar onSend={handleSend} autoFocus />
                <SuggestionChips onChipClick={handleChipClick} />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col h-full"
            >
              <ChatArea
                messages={activeConversation!.messages}
                isTyping={isTyping}
              />
              <div className="px-4 pb-4 pt-2">
                <InputBar onSend={handleSend} />
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
