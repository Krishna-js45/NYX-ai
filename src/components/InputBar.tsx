import { useState, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowUp, Paperclip, Mic } from 'lucide-react'

interface InputBarProps {
    onSend: (content: string) => void
    autoFocus?: boolean
}

export default function InputBar({ onSend, autoFocus = false }: InputBarProps) {
    const [value, setValue] = useState('')
    const [focused, setFocused] = useState(false)
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    useEffect(() => {
        if (autoFocus) textareaRef.current?.focus()
    }, [autoFocus])

    // Auto-resize textarea
    useEffect(() => {
        const el = textareaRef.current
        if (!el) return
        el.style.height = 'auto'
        el.style.height = Math.min(el.scrollHeight, 160) + 'px'
    }, [value])

    const handleSend = useCallback(() => {
        const trimmed = value.trim()
        if (!trimmed) return
        onSend(trimmed)
        setValue('')
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto'
        }
    }, [value, onSend])

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }, [handleSend])

    const canSend = value.trim().length > 0

    return (
        <motion.div
            animate={{
                boxShadow: focused
                    ? '0 0 0 1px rgba(107,33,255,0.5), 0 0 30px rgba(107,33,255,0.2), 0 8px 32px rgba(0,0,0,0.4)'
                    : '0 0 0 1px rgba(255,255,255,0.08), 0 8px 32px rgba(0,0,0,0.3)',
            }}
            transition={{ duration: 0.25 }}
            className="relative rounded-2xl overflow-hidden"
            style={{
                background: 'rgba(12,8,28,0.95)',
                backdropFilter: 'blur(20px)',
            }}
            id="input-bar"
        >
            {/* Top gradient line when focused */}
            <AnimatePresence>
                {focused && (
                    <motion.div
                        initial={{ scaleX: 0, opacity: 0 }}
                        animate={{ scaleX: 1, opacity: 1 }}
                        exit={{ scaleX: 0, opacity: 0 }}
                        className="absolute top-0 left-0 right-0 h-[1px]"
                        style={{
                            background: 'linear-gradient(90deg, transparent, #6B21FF, #00FFD1, #6B21FF, transparent)',
                        }}
                    />
                )}
            </AnimatePresence>

            <div className="flex items-end gap-3 px-4 py-3">
                {/* Left actions */}
                <div className="flex items-center gap-1 pb-0.5">
                    <button
                        id="attach-btn"
                        className="p-1.5 rounded-lg text-nyx-muted hover:text-nyx-text hover:bg-white/5 transition-all"
                        title="Attach file"
                    >
                        <Paperclip size={15} />
                    </button>
                </div>

                {/* Textarea */}
                <textarea
                    ref={textareaRef}
                    id="chat-input"
                    value={value}
                    onChange={e => setValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    placeholder="Ask NYX anything…"
                    rows={1}
                    className="flex-1 bg-transparent resize-none text-sm text-nyx-text placeholder-nyx-muted/60 font-mono leading-relaxed focus:outline-none"
                    style={{ minHeight: 24, maxHeight: 160 }}
                />

                {/* Right actions */}
                <div className="flex items-center gap-1 pb-0.5">
                    <button
                        id="mic-btn"
                        className="p-1.5 rounded-lg text-nyx-muted hover:text-nyx-text hover:bg-white/5 transition-all"
                        title="Voice input"
                    >
                        <Mic size={15} />
                    </button>

                    {/* Send button */}
                    <motion.button
                        id="send-btn"
                        onClick={handleSend}
                        disabled={!canSend}
                        animate={{
                            background: canSend
                                ? 'linear-gradient(135deg, #6B21FF, #8B3FFF)'
                                : 'rgba(255,255,255,0.06)',
                            boxShadow: canSend
                                ? '0 0 16px rgba(107,33,255,0.6), 0 0 40px rgba(107,33,255,0.2)'
                                : 'none',
                        }}
                        whileHover={canSend ? { scale: 1.08 } : {}}
                        whileTap={canSend ? { scale: 0.93 } : {}}
                        transition={{ duration: 0.2 }}
                        className="p-2 rounded-xl flex items-center justify-center transition-all"
                        title="Send message (Enter)"
                    >
                        <ArrowUp
                            size={16}
                            className={canSend ? 'text-white' : 'text-nyx-muted'}
                        />
                    </motion.button>
                </div>
            </div>

            {/* Footer hint */}
            <div className="px-4 pb-2 flex items-center gap-3">
                <span className="text-[10px] text-nyx-muted/50 font-mono">
                    Enter to send · Shift+Enter for newline
                </span>
            </div>
        </motion.div>
    )
}
