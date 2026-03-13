import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Message } from '../App'
import MessageBubble from './MessageBubble'

interface ChatAreaProps {
    messages: Message[]
    isTyping: boolean
}

/* ── Constellation config ───────────────────────────────── */
const DOTS = [
    { cx: 110, cy: 22, color: '#6B21FF', r: 5 },  // top
    { cx: 196, cy: 68, color: '#00FFD1', r: 4 },  // top-right
    { cx: 188, cy: 156, color: '#FF2D6B', r: 6 },  // bottom-right
    { cx: 110, cy: 198, color: '#FF9F00', r: 4 },  // bottom
    { cx: 32, cy: 156, color: '#00FF88', r: 5 },  // bottom-left
    { cx: 24, cy: 68, color: '#FF2DFF', r: 4 },  // top-left
]

const LINES: [number, number][] = [
    [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0],
    [0, 3], [1, 4],
]

const PROCESSING = 'PROCESSING'.split('')

/* ── Constellation Indicator ────────────────────────────── */
function ConstellationIndicator() {
    return (
        <motion.div
            key="constellation"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{
                opacity: 0,
                scale: 1.18,
                filter: 'blur(10px)',
                transition: { duration: 0.55, ease: [0.4, 0, 1, 1] },
            }}
            className="fixed inset-0 z-30 flex flex-col items-center justify-center"
            id="constellation-overlay"
        >
            {/* Subtle dark veil */}
            <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" />

            <div className="relative z-10 flex flex-col items-center gap-7">

                {/* Slowly rotating star map */}
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
                    style={{ width: 220, height: 220 }}
                >
                    <svg viewBox="0 0 220 220" width="220" height="220" overflow="visible">

                        <defs>
                            {/* Per-line gradient */}
                            {LINES.map(([a, b], idx) => (
                                <linearGradient
                                    key={`lg${idx}`}
                                    id={`lg${idx}`}
                                    gradientUnits="userSpaceOnUse"
                                    x1={DOTS[a].cx} y1={DOTS[a].cy}
                                    x2={DOTS[b].cx} y2={DOTS[b].cy}
                                >
                                    <stop offset="0%" stopColor={DOTS[a].color} stopOpacity="0.65" />
                                    <stop offset="100%" stopColor={DOTS[b].color} stopOpacity="0.65" />
                                </linearGradient>
                            ))}
                            {/* Glow filter for dots */}
                            <filter id="dotGlow" x="-80%" y="-80%" width="260%" height="260%">
                                <feGaussianBlur stdDeviation="3" result="blur" />
                                <feMerge>
                                    <feMergeNode in="blur" />
                                    <feMergeNode in="SourceGraphic" />
                                </feMerge>
                            </filter>
                        </defs>

                        {/* Animated dashed lines — draw in one by one */}
                        {LINES.map(([a, b], idx) => (
                            <motion.path
                                key={`line${idx}`}
                                d={`M ${DOTS[a].cx} ${DOTS[a].cy} L ${DOTS[b].cx} ${DOTS[b].cy}`}
                                stroke={`url(#lg${idx})`}
                                strokeWidth="0.9"
                                fill="none"
                                strokeLinecap="round"
                                initial={{ pathLength: 0, opacity: 0 }}
                                animate={{ pathLength: 1, opacity: 1 }}
                                transition={{
                                    pathLength: {
                                        delay: 0.2 + idx * 0.22,
                                        duration: 0.55,
                                        ease: 'easeInOut',
                                    },
                                    opacity: { delay: 0.2 + idx * 0.22, duration: 0.08 },
                                }}
                            />
                        ))}

                        {/* Dots — pop in sequentially */}
                        {DOTS.map((dot, i) => (
                            <g key={`dot${i}`}>
                                {/* Soft outer halo */}
                                <motion.circle
                                    cx={dot.cx} cy={dot.cy}
                                    r={dot.r * 4}
                                    fill={dot.color}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: [0, 0.14, 0.08, 0.14] }}
                                    transition={{
                                        delay: 0.1 + i * 0.15,
                                        duration: 2.2,
                                        repeat: Infinity,
                                        ease: 'easeInOut',
                                    }}
                                />
                                {/* Core dot with glow */}
                                <motion.circle
                                    cx={dot.cx} cy={dot.cy}
                                    r={dot.r}
                                    fill={dot.color}
                                    filter="url(#dotGlow)"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{
                                        delay: 0.1 + i * 0.15,
                                        duration: 0.3,
                                        ease: 'easeOut',
                                    }}
                                />
                                {/* Expanding ring pulse */}
                                <motion.circle
                                    cx={dot.cx} cy={dot.cy}
                                    r={dot.r + 1}
                                    fill="none"
                                    stroke={dot.color}
                                    strokeWidth="0.7"
                                    initial={{ opacity: 0 }}
                                    animate={{
                                        r: [dot.r + 1, dot.r * 4],
                                        opacity: [0.6, 0],
                                    }}
                                    transition={{
                                        delay: 0.4 + i * 0.15,
                                        duration: 1.8,
                                        repeat: Infinity,
                                        ease: 'easeOut',
                                    }}
                                />
                            </g>
                        ))}
                    </svg>
                </motion.div>

                {/* PROCESSING  — letters appear one by one */}
                <div className="flex items-center" style={{ letterSpacing: '0.5em' }}>
                    {PROCESSING.map((char, i) => (
                        <motion.span
                            key={i}
                            className="font-mono text-[11px] text-[#6B21FF]"
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                                delay: 0.55 + i * 0.06,
                                duration: 0.28,
                                ease: 'easeOut',
                            }}
                        >
                            {char}
                        </motion.span>
                    ))}
                    {/* Blinking cursor */}
                    <motion.span
                        className="font-mono text-[11px] text-[#00FFD1] ml-0.5"
                        animate={{ opacity: [1, 0, 1] }}
                        transition={{ duration: 0.9, repeat: Infinity, ease: 'easeInOut' }}
                    >
                        _
                    </motion.span>
                </div>

            </div>
        </motion.div>
    )
}

/* ── ChatArea ────────────────────────────────────────────── */
export default function ChatArea({ messages, isTyping }: ChatAreaProps) {
    const bottomRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages, isTyping])

    return (
        <div className="flex-1 overflow-y-auto py-4 space-y-1 relative" id="chat-scroll-area">
            <AnimatePresence initial={false}>
                {messages.map((msg, idx) => (
                    <MessageBubble
                        key={msg.id}
                        message={msg}
                        isLast={idx === messages.length - 1}
                    />
                ))}
            </AnimatePresence>

            {/* Constellation overlay — mounts/unmounts with AnimatePresence */}
            <AnimatePresence>
                {isTyping && <ConstellationIndicator />}
            </AnimatePresence>

            <div ref={bottomRef} className="h-4" />
        </div>
    )
}
