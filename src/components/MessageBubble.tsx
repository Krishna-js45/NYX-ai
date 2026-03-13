import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Copy, Check, User } from 'lucide-react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import type { Message } from '../App'

interface MessageBubbleProps {
    message: Message
    isLast: boolean
}

// Detects ```lang\n...\n``` blocks and returns segments
function parseContent(content: string): Array<{ type: 'text' | 'code'; value: string; lang: string }> {
    const segments: Array<{ type: 'text' | 'code'; value: string; lang: string }> = []
    const regex = /```(\w*)\n([\s\S]*?)```/g
    let lastIndex = 0
    let match

    while ((match = regex.exec(content)) !== null) {
        if (match.index > lastIndex) {
            segments.push({ type: 'text', value: content.slice(lastIndex, match.index), lang: '' })
        }
        segments.push({ type: 'code', value: match[2], lang: match[1] || 'text' })
        lastIndex = regex.lastIndex
    }

    if (lastIndex < content.length) {
        segments.push({ type: 'text', value: content.slice(lastIndex), lang: '' })
    }

    return segments
}

// Render markdown-lite: bold, inline code
function renderText(text: string) {
    const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g)
    return parts.map((part, i) => {
        if (part.startsWith('`') && part.endsWith('`')) {
            return (
                <code
                    key={i}
                    className="px-1.5 py-0.5 rounded text-[#00FFD1] font-mono text-[0.8em]"
                    style={{ background: 'rgba(0,255,209,0.08)', border: '1px solid rgba(0,255,209,0.12)' }}
                >
                    {part.slice(1, -1)}
                </code>
            )
        }
        if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={i} className="text-white font-semibold">{part.slice(2, -2)}</strong>
        }
        // Render line breaks
        return part.split('\n').map((line, j, arr) => (
            <span key={`${i}-${j}`}>
                {line}
                {j < arr.length - 1 && <br />}
            </span>
        ))
    })
}

function CodeBlock({ code, lang }: { code: string; lang: string }) {
    const [copied, setCopied] = useState(false)

    const handleCopy = useCallback(() => {
        navigator.clipboard.writeText(code).catch(() => { })
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }, [code])

    return (
        <div
            className="relative rounded-xl overflow-hidden my-3"
            style={{ border: '1px solid rgba(107,33,255,0.2)' }}
        >
            {/* Header */}
            <div
                className="flex items-center justify-between px-4 py-2"
                style={{ background: 'rgba(107,33,255,0.12)', borderBottom: '1px solid rgba(107,33,255,0.15)' }}
            >
                <span className="text-[11px] font-mono text-[#6B21FF] uppercase tracking-widest">
                    {lang || 'code'}
                </span>
                <button
                    id={`copy-${Math.random().toString(36).slice(2)}`}
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 text-[11px] font-mono transition-colors"
                    style={{ color: copied ? '#00FFD1' : 'rgba(255,255,255,0.4)' }}
                >
                    <AnimatePresence mode="wait">
                        {copied ? (
                            <motion.span
                                key="check"
                                initial={{ scale: 0.5, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.5, opacity: 0 }}
                                className="flex items-center gap-1"
                            >
                                <Check size={12} /> Copied!
                            </motion.span>
                        ) : (
                            <motion.span
                                key="copy"
                                initial={{ scale: 0.5, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.5, opacity: 0 }}
                                className="flex items-center gap-1"
                            >
                                <Copy size={12} /> Copy
                            </motion.span>
                        )}
                    </AnimatePresence>
                </button>
            </div>

            {/* Code */}
            <div className="code-block text-sm">
                <SyntaxHighlighter
                    language={lang || 'text'}
                    style={oneDark}
                    customStyle={{
                        margin: 0,
                        background: 'rgba(6,3,18,0.95)',
                        padding: '16px',
                        borderRadius: 0,
                    }}
                    showLineNumbers
                    lineNumberStyle={{
                        color: 'rgba(107,33,255,0.35)',
                        paddingRight: '16px',
                        fontSize: '11px',
                    }}
                >
                    {code.trim()}
                </SyntaxHighlighter>
            </div>
        </div>
    )
}

export default function MessageBubble({ message, isLast }: MessageBubbleProps) {
    const isUser = message.role === 'user'
    const segments = parseContent(message.content)

    return (
        <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            className={`flex items-end gap-3 px-4 py-1.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            id={`msg-${message.id}`}
        >
            {/* Avatar */}
            {isUser ? (
                <div
                    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mb-1"
                    style={{
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.12), rgba(255,255,255,0.06))',
                        border: '1px solid rgba(255,255,255,0.1)',
                    }}
                >
                    <User size={14} className="text-nyx-subtext" />
                </div>
            ) : (
                <div
                    className="nyx-orb flex-shrink-0 mb-1"
                    style={{ width: 32, height: 32 }}
                />
            )}

            {/* Bubble */}
            <div className={`max-w-[75%] ${isUser ? 'items-end' : 'items-start'} flex flex-col`}>
                <div
                    className={`px-4 py-3 rounded-2xl text-sm font-mono leading-relaxed ${isUser
                            ? 'rounded-br-sm'
                            : 'rounded-bl-sm'
                        }`}
                    style={
                        isUser
                            ? {
                                background: 'linear-gradient(135deg, rgba(107,33,255,0.35), rgba(107,33,255,0.2))',
                                border: '1px solid rgba(107,33,255,0.35)',
                                color: '#e0e0f0',
                            }
                            : {
                                background: 'rgba(255,255,255,0.03)',
                                border: '1px solid rgba(255,255,255,0.07)',
                                backdropFilter: 'blur(16px)',
                                color: '#e0e0f0',
                            }
                    }
                >
                    {segments.map((seg, i) =>
                        seg.type === 'code' ? (
                            <CodeBlock key={i} code={seg.value} lang={seg.lang} />
                        ) : (
                            <span key={i}>{renderText(seg.value)}</span>
                        )
                    )}
                </div>

                {/* Timestamp */}
                <span className="text-[10px] text-nyx-muted mt-1 px-1 font-mono">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    {!isUser && isLast && (
                        <span className="ml-2 text-[#00FFD1] opacity-70">● NYX</span>
                    )}
                </span>
            </div>
        </motion.div>
    )
}
