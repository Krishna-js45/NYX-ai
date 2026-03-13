import { motion } from 'framer-motion'
import { Bug, BookOpen, GitPullRequest, Zap } from 'lucide-react'

interface Chip {
    id: string
    icon: React.ReactNode
    label: string
    prompt: string
    accent: string
}

const CHIPS: Chip[] = [
    {
        id: 'chip-debug',
        icon: <Bug size={14} />,
        label: 'Debug my code',
        prompt: 'Help me debug an async race condition in my React app',
        accent: '#FF4D6D',
    },
    {
        id: 'chip-explain',
        icon: <BookOpen size={14} />,
        label: 'Explain a concept',
        prompt: 'Explain how transformer neural networks work',
        accent: '#6B21FF',
    },
    {
        id: 'chip-review',
        icon: <GitPullRequest size={14} />,
        label: 'Review my project',
        prompt: 'Review my project architecture and suggest improvements',
        accent: '#00FFD1',
    },
    {
        id: 'chip-build',
        icon: <Zap size={14} />,
        label: 'Help me build faster',
        prompt: 'Help me build a full-stack app faster with the best tools',
        accent: '#F59E0B',
    },
]

interface SuggestionChipsProps {
    onChipClick: (prompt: string) => void
}

export default function SuggestionChips({ onChipClick }: SuggestionChipsProps) {
    return (
        <div className="flex flex-wrap gap-2 justify-center" id="suggestion-chips">
            {CHIPS.map((chip, idx) => (
                <motion.button
                    key={chip.id}
                    id={chip.id}
                    onClick={() => onChipClick(chip.prompt)}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.07, duration: 0.35, ease: 'easeOut' }}
                    whileHover={{ scale: 1.04, y: -2 }}
                    whileTap={{ scale: 0.96 }}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-mono transition-all duration-200"
                    style={{
                        background: 'rgba(255,255,255,0.03)',
                        border: `1px solid rgba(255,255,255,0.09)`,
                        color: '#8888a8',
                        backdropFilter: 'blur(12px)',
                    }}
                    onMouseEnter={e => {
                        const el = e.currentTarget
                        el.style.background = `rgba(${hexToRgb(chip.accent)},0.1)`
                        el.style.borderColor = `rgba(${hexToRgb(chip.accent)},0.4)`
                        el.style.color = chip.accent
                        el.style.boxShadow = `0 0 16px rgba(${hexToRgb(chip.accent)},0.15)`
                    }}
                    onMouseLeave={e => {
                        const el = e.currentTarget
                        el.style.background = 'rgba(255,255,255,0.03)'
                        el.style.borderColor = 'rgba(255,255,255,0.09)'
                        el.style.color = '#8888a8'
                        el.style.boxShadow = 'none'
                    }}
                >
                    <span style={{ opacity: 0.8 }}>{chip.icon}</span>
                    {chip.label}
                </motion.button>
            ))}
        </div>
    )
}

function hexToRgb(hex: string): string {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    if (!result) return '107,33,255'
    return `${parseInt(result[1], 16)},${parseInt(result[2], 16)},${parseInt(result[3], 16)}`
}
