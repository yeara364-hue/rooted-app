import { useState, useEffect, useRef } from 'react'

/**
 * NumaAvatar - Expressive companion with mood-based faces
 *
 * Moods: happy, sad, stressed, tired, angry, neutral
 * States: calm, thinking, responding
 */

const MOOD_COLORS = {
  happy: {
    primary: '#7BA7BC',
    secondary: '#A8C49A',
    glow: 'rgba(135, 168, 120, 0.4)'
  },
  sad: {
    primary: '#9CA8B8',
    secondary: '#B8C4D0',
    glow: 'rgba(156, 168, 184, 0.3)'
  },
  stressed: {
    primary: '#C4A898',
    secondary: '#E0D0C4',
    glow: 'rgba(196, 168, 152, 0.35)'
  },
  tired: {
    primary: '#B8ACA0',
    secondary: '#D4CCC4',
    glow: 'rgba(184, 172, 160, 0.3)'
  },
  angry: {
    primary: '#C49898',
    secondary: '#E0C4C4',
    glow: 'rgba(196, 152, 152, 0.35)'
  },
  neutral: {
    primary: '#9BB5C4',
    secondary: '#C5D5E0',
    glow: 'rgba(155, 181, 196, 0.3)'
  }
}

// Expression paths for different moods
const EXPRESSIONS = {
  happy: {
    leftEye: { cx: 38, cy: 65, rx: 5, ry: 5 },
    rightEye: { cx: 62, cy: 65, rx: 5, ry: 5 },
    mouth: 'M40 82 Q50 92 60 82', // big smile
    eyebrows: null,
    blush: true,
    extras: null
  },
  sad: {
    leftEye: { cx: 38, cy: 68, rx: 4, ry: 5 },
    rightEye: { cx: 62, cy: 68, rx: 4, ry: 5 },
    mouth: 'M42 86 Q50 80 58 86', // frown
    eyebrows: [
      { d: 'M32 58 Q38 62 44 60', stroke: '#4A5568' }, // sad left brow
      { d: 'M56 60 Q62 62 68 58', stroke: '#4A5568' }  // sad right brow
    ],
    blush: false,
    extras: { type: 'tear', cx: 66, cy: 75 }
  },
  stressed: {
    leftEye: { cx: 38, cy: 66, rx: 5, ry: 4 },
    rightEye: { cx: 62, cy: 66, rx: 5, ry: 4 },
    mouth: 'M42 84 Q50 82 58 84', // wavy worried mouth
    eyebrows: [
      { d: 'M32 56 L44 60', stroke: '#4A5568' }, // worried left
      { d: 'M56 60 L68 56', stroke: '#4A5568' }  // worried right
    ],
    blush: false,
    extras: { type: 'sweat', cx: 72, cy: 55 }
  },
  tired: {
    leftEye: { cx: 38, cy: 68, rx: 5, ry: 2 },  // half-closed
    rightEye: { cx: 62, cy: 68, rx: 5, ry: 2 }, // half-closed
    mouth: 'M44 84 Q50 86 56 84', // small neutral
    eyebrows: null,
    blush: false,
    extras: { type: 'zzz', x: 70, y: 45 }
  },
  angry: {
    leftEye: { cx: 38, cy: 68, rx: 4, ry: 4 },
    rightEye: { cx: 62, cy: 68, rx: 4, ry: 4 },
    mouth: 'M42 86 Q50 82 58 86', // frown
    eyebrows: [
      { d: 'M30 58 L44 64', stroke: '#4A5568' }, // angry left
      { d: 'M56 64 L70 58', stroke: '#4A5568' }  // angry right
    ],
    blush: false,
    extras: { type: 'vein', cx: 70, cy: 35 }
  },
  neutral: {
    leftEye: { cx: 38, cy: 68, rx: 4, ry: 5 },
    rightEye: { cx: 62, cy: 68, rx: 4, ry: 5 },
    mouth: 'M42 84 Q50 88 58 84', // gentle smile
    eyebrows: null,
    blush: false,
    extras: null
  }
}

export default function NumaAvatar({
  mood = 'neutral',
  state = 'calm',
  size = 120,
  className = ''
}) {
  const [isBlinking, setIsBlinking] = useState(false)
  const [bounceKey, setBounceKey] = useState(0)
  const blinkTimeoutRef = useRef(null)
  const prevStateRef = useRef(state)

  const colors = MOOD_COLORS[mood] || MOOD_COLORS.neutral
  const expression = EXPRESSIONS[mood] || EXPRESSIONS.neutral

  // Trigger bounce when state changes to 'responding'
  useEffect(() => {
    if (state === 'responding' && prevStateRef.current !== 'responding') {
      setBounceKey(k => k + 1)
    }
    prevStateRef.current = state
  }, [state])

  // Random blinking
  useEffect(() => {
    const scheduleBlink = () => {
      const delay = 2500 + Math.random() * 3500
      blinkTimeoutRef.current = setTimeout(() => {
        setIsBlinking(true)
        setTimeout(() => {
          setIsBlinking(false)
          scheduleBlink()
        }, 120)
      }, delay)
    }
    scheduleBlink()
    return () => clearTimeout(blinkTimeoutRef.current)
  }, [])

  const getStateClass = () => {
    switch (state) {
      case 'thinking': return 'numa-avatar-thinking'
      case 'responding': return 'numa-avatar-responding'
      default: return 'numa-avatar-calm'
    }
  }

  return (
    <div
      className={`numa-avatar-container ${className}`}
      style={{ width: size, height: size * 1.2, position: 'relative' }}
    >
      {/* Glow */}
      <div
        className={`numa-avatar-glow ${getStateClass()}-glow`}
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: size * 1.6,
          height: size * 1.6,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${colors.glow} 0%, transparent 70%)`,
          transition: 'all 0.5s ease'
        }}
      />

      {/* Main SVG */}
      <svg
        key={bounceKey}
        viewBox="0 0 100 120"
        width={size}
        height={size * 1.2}
        className={`${getStateClass()} ${bounceKey > 0 ? 'numa-bounce' : ''}`}
        style={{ position: 'relative', zIndex: 1 }}
      >
        <defs>
          <radialGradient id={`numa-grad-${mood}`} cx="30%" cy="30%" r="70%">
            <stop offset="0%" stopColor={colors.secondary} />
            <stop offset="100%" stopColor={colors.primary} />
          </radialGradient>
          <radialGradient id="numa-hl" cx="35%" cy="25%" r="30%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.6)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </radialGradient>
          <filter id="numa-blur" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="0.5" />
          </filter>
        </defs>

        {/* Droplet body */}
        <path
          d="M50 10 C50 10, 85 50, 85 75 C85 97, 69 110, 50 110 C31 110, 15 97, 15 75 C15 50, 50 10, 50 10Z"
          fill={`url(#numa-grad-${mood})`}
          filter="url(#numa-blur)"
          style={{ transition: 'fill 0.5s ease' }}
        />

        {/* Highlight */}
        <ellipse cx="38" cy="45" rx="12" ry="18" fill="url(#numa-hl)" opacity="0.7" />
        <circle cx="35" cy="35" r="4" fill="rgba(255,255,255,0.8)" />

        {/* Eyebrows */}
        {expression.eyebrows && expression.eyebrows.map((brow, i) => (
          <path
            key={i}
            d={brow.d}
            fill="none"
            stroke={brow.stroke}
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.7"
          />
        ))}

        {/* Eyes */}
        <g className="numa-avatar-eyes">
          {/* Left eye */}
          <ellipse
            cx={expression.leftEye.cx}
            cy={expression.leftEye.cy}
            rx={expression.leftEye.rx}
            ry={isBlinking ? 1 : expression.leftEye.ry}
            fill="#4A5568"
            style={{ transition: 'ry 0.08s ease' }}
          />
          {!isBlinking && expression.leftEye.ry > 2 && (
            <circle cx={expression.leftEye.cx - 2} cy={expression.leftEye.cy - 2} r="1.5" fill="white" opacity="0.9" />
          )}

          {/* Right eye */}
          <ellipse
            cx={expression.rightEye.cx}
            cy={expression.rightEye.cy}
            rx={expression.rightEye.rx}
            ry={isBlinking ? 1 : expression.rightEye.ry}
            fill="#4A5568"
            style={{ transition: 'ry 0.08s ease' }}
          />
          {!isBlinking && expression.rightEye.ry > 2 && (
            <circle cx={expression.rightEye.cx - 2} cy={expression.rightEye.cy - 2} r="1.5" fill="white" opacity="0.9" />
          )}
        </g>

        {/* Mouth */}
        <path
          d={expression.mouth}
          fill="none"
          stroke="#4A5568"
          strokeWidth="2.5"
          strokeLinecap="round"
          opacity="0.7"
        />

        {/* Blush for happy */}
        {expression.blush && (
          <>
            <ellipse cx="28" cy="78" rx="6" ry="3" fill="#E8A0A0" opacity="0.4" />
            <ellipse cx="72" cy="78" rx="6" ry="3" fill="#E8A0A0" opacity="0.4" />
          </>
        )}

        {/* Mood extras */}
        {expression.extras?.type === 'tear' && (
          <ellipse
            cx={expression.extras.cx}
            cy={expression.extras.cy}
            rx="2"
            ry="4"
            fill="#9CC5E8"
            opacity="0.7"
            className="numa-tear"
          />
        )}
        {expression.extras?.type === 'sweat' && (
          <ellipse
            cx={expression.extras.cx}
            cy={expression.extras.cy}
            rx="3"
            ry="5"
            fill="#A8D4E8"
            opacity="0.6"
            className="numa-sweat"
          />
        )}
        {expression.extras?.type === 'zzz' && (
          <text
            x={expression.extras.x}
            y={expression.extras.y}
            fontSize="12"
            fill="#8A9AAA"
            opacity="0.7"
            className="numa-zzz"
          >
            z
          </text>
        )}
        {expression.extras?.type === 'vein' && (
          <path
            d={`M${expression.extras.cx} ${expression.extras.cy} l4 4 l-4 4 l4 4`}
            fill="none"
            stroke="#D88888"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.6"
          />
        )}
      </svg>

      {/* Thinking dots */}
      {state === 'thinking' && (
        <div className="numa-thinking-dots" style={{
          position: 'absolute',
          bottom: -8,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: 4
        }}>
          <span className="thinking-dot" style={{ animationDelay: '0s' }} />
          <span className="thinking-dot" style={{ animationDelay: '0.2s' }} />
          <span className="thinking-dot" style={{ animationDelay: '0.4s' }} />
        </div>
      )}

      <style>{`
        /* Calm state */
        .numa-avatar-calm {
          animation: numa-breathe 4s ease-in-out infinite;
        }
        .numa-avatar-calm-glow {
          animation: numa-glow-breathe 4s ease-in-out infinite;
        }

        @keyframes numa-breathe {
          0%, 100% { transform: scale(1) translateY(0); }
          50% { transform: scale(1.02) translateY(-2px); }
        }
        @keyframes numa-glow-breathe {
          0%, 100% { opacity: 0.6; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 0.8; transform: translate(-50%, -50%) scale(1.05); }
        }

        /* Thinking state */
        .numa-avatar-thinking {
          animation: numa-think 1.2s ease-in-out infinite;
        }
        .numa-avatar-thinking-glow {
          animation: numa-glow-think 1.2s ease-in-out infinite;
        }

        @keyframes numa-think {
          0%, 100% { transform: scale(1); filter: brightness(1); }
          50% { transform: scale(1.03); filter: brightness(1.08); }
        }
        @keyframes numa-glow-think {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 0.9; }
        }

        /* Responding state */
        .numa-avatar-responding {
          animation: numa-respond 0.6s ease-in-out infinite;
        }
        .numa-avatar-responding-glow {
          animation: numa-glow-respond 0.6s ease-in-out infinite;
        }

        @keyframes numa-respond {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.04); }
        }
        @keyframes numa-glow-respond {
          0%, 100% { opacity: 0.7; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 1; transform: translate(-50%, -50%) scale(1.1); }
        }

        /* Bounce on reply */
        .numa-bounce {
          animation: numa-bounce-in 0.5s cubic-bezier(0.68, -0.55, 0.27, 1.55);
        }
        @keyframes numa-bounce-in {
          0% { transform: scale(1); }
          30% { transform: scale(1.15); }
          50% { transform: scale(0.95); }
          70% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }

        /* Blink animation for eyes */
        .numa-avatar-eyes {
          animation: numa-eye-idle 6s ease-in-out infinite;
        }
        @keyframes numa-eye-idle {
          0%, 40%, 60%, 100% { transform: translateX(0); }
          50% { transform: translateX(1px); }
        }

        /* Thinking dots */
        .thinking-dot {
          width: 6px;
          height: 6px;
          background: #87A878;
          border-radius: 50%;
          animation: dot-bounce 0.6s ease-in-out infinite;
        }
        @keyframes dot-bounce {
          0%, 100% { transform: translateY(0); opacity: 0.4; }
          50% { transform: translateY(-6px); opacity: 1; }
        }

        /* Tear animation */
        .numa-tear {
          animation: tear-fall 2s ease-in infinite;
        }
        @keyframes tear-fall {
          0%, 100% { opacity: 0; transform: translateY(0); }
          10% { opacity: 0.7; }
          90% { opacity: 0.7; transform: translateY(8px); }
          100% { opacity: 0; transform: translateY(10px); }
        }

        /* Sweat drip */
        .numa-sweat {
          animation: sweat-drip 1.5s ease-in-out infinite;
        }
        @keyframes sweat-drip {
          0%, 100% { opacity: 0.3; transform: translateY(0); }
          50% { opacity: 0.7; transform: translateY(3px); }
        }

        /* Zzz float */
        .numa-zzz {
          animation: zzz-float 2s ease-in-out infinite;
        }
        @keyframes zzz-float {
          0%, 100% { opacity: 0.4; transform: translate(0, 0); }
          50% { opacity: 0.8; transform: translate(4px, -6px); }
        }
      `}</style>
    </div>
  )
}
