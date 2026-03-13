import { motion } from 'framer-motion'
import { Plus, MessageSquare, Sparkles, Clock } from 'lucide-react'
import type { Conversation } from '../App'

interface SidebarProps {
    conversations: Conversation[]
    activeId: string | null
    onNewChat: () => void
    onSelectChat: (id: string) => void
}

function timeAgo(date: Date): string {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
    if (seconds < 60) return 'just now'
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    return `${Math.floor(hours / 24)}d ago`
}

function groupConversations(convs: Conversation[]) {
    const now = Date.now()
    const today: Conversation[] = []
    const yesterday: Conversation[] = []
    const older: Conversation[] = []

    for (const c of convs) {
        const age = now - c.createdAt.getTime()
        if (age < 86400000) today.push(c)
        else if (age < 172800000) yesterday.push(c)
        else older.push(c)
    }
    return { today, yesterday, older }
}

export default function Sidebar({ conversations, activeId, onNewChat, onSelectChat }: SidebarProps) {
    const { today, yesterday, older } = groupConversations(conversations)

    const renderGroup = (label: string, items: Conversation[]) => {
        if (items.length === 0) return null
        return (
            <div key={label} className="mb-4">
                <div className="flex items-center gap-2 px-3 mb-2">
                    <Clock size={10} className="text-nyx-muted" />
                    <span className="text-[10px] text-nyx-muted font-mono uppercase tracking-widest">{label}</span>
                </div>
                <div className="space-y-0.5">
                    {items.map(conv => (
                        <motion.button
                            key={conv.id}
                            id={`conv-${conv.id}`}
                            onClick={() => onSelectChat(conv.id)}
                            whileHover={{ x: 3 }}
                            transition={{ duration: 0.15 }}
                            className={`w-full text-left px-3 py-2.5 rounded-lg flex items-start gap-2.5 group transition-all duration-200 ${activeId === conv.id
                                    ? 'bg-[rgba(107,33,255,0.18)] border border-[rgba(107,33,255,0.3)]'
                                    : 'hover:bg-white/[0.04] border border-transparent'
                                }`}
                        >
                            <MessageSquare
                                size={13}
                                className={`mt-0.5 flex-shrink-0 transition-colors ${activeId === conv.id ? 'text-[#6B21FF]' : 'text-nyx-muted group-hover:text-nyx-subtext'
                                    }`}
                            />
                            <div className="flex-1 min-w-0">
                                <p className={`text-xs truncate font-mono leading-tight ${activeId === conv.id ? 'text-white' : 'text-nyx-subtext group-hover:text-nyx-text'
                                    }`}>
                                    {conv.title}
                                </p>
                                <p className="text-[10px] text-nyx-muted mt-0.5">{timeAgo(conv.createdAt)}</p>
                            </div>
                            {activeId === conv.id && (
                                <div className="w-1 h-1 rounded-full bg-[#6B21FF] self-center shadow-[0_0_6px_#6B21FF] flex-shrink-0" />
                            )}
                        </motion.button>
                    ))}
                </div>
            </div>
        )
    }

    return (
        <motion.aside
            initial={{ x: -280, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -280, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            className="w-[260px] flex-shrink-0 flex flex-col h-full relative z-10"
            style={{
                background: 'rgba(5,3,12,0.96)',
                borderRight: '1px solid rgba(255,255,255,0.06)',
            }}
        >
            {/* Logo */}
            <div className="px-4 pt-5 pb-4">
                <div className="flex items-center gap-2.5">
                    <div className="nyx-orb" style={{ width: 30, height: 30 }} />
                    <div>
                        <div className="font-orbitron text-sm font-bold text-white tracking-wider">XOANON</div>
                        <div className="font-orbitron text-[9px] text-[#6B21FF] tracking-[0.3em] uppercase">NYX</div>
                    </div>
                    <div className="ml-auto">
                        <Sparkles size={13} className="text-[#00FFD1] opacity-70" />
                    </div>
                </div>
            </div>

            {/* New Chat Button */}
            <div className="px-3 pb-4">
                <motion.button
                    id="new-chat-btn"
                    onClick={onNewChat}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-mono text-xs text-white transition-all duration-200 gradient-border"
                    style={{
                        background: 'linear-gradient(135deg, rgba(107,33,255,0.25), rgba(107,33,255,0.1))',
                    }}
                >
                    <Plus size={15} className="text-[#6B21FF]" />
                    New Chat
                    <span className="ml-auto text-[10px] text-nyx-muted font-mono">⌘K</span>
                </motion.button>
            </div>

            {/* Divider */}
            <div className="mx-3 mb-4 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

            {/* Conversations */}
            <div className="flex-1 overflow-y-auto px-1 pb-4">
                {conversations.length === 0 ? (
                    <div className="text-center py-8">
                        <MessageSquare size={24} className="text-nyx-muted mx-auto mb-2 opacity-40" />
                        <p className="text-nyx-muted text-xs font-mono">No conversations yet</p>
                    </div>
                ) : (
                    <>
                        {renderGroup('Today', today)}
                        {renderGroup('Yesterday', yesterday)}
                        {renderGroup('Older', older)}
                    </>
                )}
            </div>

            {/* Bottom user section */}
            <div className="px-3 py-3 border-t border-white/[0.06]">
                <div className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-white/[0.04] transition-colors cursor-pointer">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#6B21FF] to-[#00FFD1] flex items-center justify-center text-white text-[10px] font-bold font-orbitron flex-shrink-0">
                        X
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs text-nyx-text font-mono truncate">XOANON User</p>
                        <p className="text-[10px] text-nyx-muted">Free Plan</p>
                    </div>
                    <div className="w-1.5 h-1.5 rounded-full bg-[#00FFD1] shadow-[0_0_6px_#00FFD1]" />
                </div>
            </div>
        </motion.aside>
    )
}
