import { useState, useEffect, useRef } from 'react'

/**
 * Numa - The animated water droplet companion
 *
 * States:
 * - calm: gentle breathing animation with blinking (default)
 * - listening: expanded, rippling (when user is speaking)
 * - thinking: subtle shimmer (processing)
 * - responding: gentle pulse (when Numa speaks)
 *
 * Features:
 * - Cute eyes with blinking animation
 * - Idle breathing with subtle vertical bounce
 * - Mood-based color shifts
 */

const MOOD_COLORS = {
  great: {
    primary: '#7BA7BC',    // calm blue-sage
    secondary: '#A8C49A',  // sage highlight
    glow: 'rgba(135, 168, 120, 0.3)'
  },
  good: {
    primary: '#8AAEC4',    // soft blue
    secondary: '#B5D4E8',  // light blue
    glow: 'rgba(138, 174, 196, 0.3)'
  },
  okay: {
    primary: '#9BB5C4',    // neutral blue
    secondary: '#C5D5E0',  // pale blue
    glow: 'rgba(155, 181, 196, 0.25)'
  },
  low: {
    primary: '#B8A89C',    // warm muted
    secondary: '#D9CEC4',  // soft sand
    glow: 'rgba(184, 168, 156, 0.3)'
  },
  stressed: {
    primary: '#C4A898',    // warm terracotta hint
    secondary: '#E0D0C4',  // soft cream
    glow: 'rgba(196, 168, 152, 0.3)'
  }
}

const STATE_ANIMATIONS = {
  calm: 'numa-breathe',
  listening: 'numa-listen',
  thinking: 'numa-think',
  responding: 'numa-respond'
}

export default function Numa({
  mood = 'okay',
  state = 'calm',
  size = 120,
  className = ''
}) {
  const [currentColors, setCurrentColors] = useState(MOOD_COLORS[mood] || MOOD_COLORS.okay)
  const [isBlinking, setIsBlinking] = useState(false)
  const blinkTimeoutRef = useRef(null)

  // Smooth color transition when mood changes
  useEffect(() => {
    setCurrentColors(MOOD_COLORS[mood] || MOOD_COLORS.okay)
  }, [mood])

  // Random blinking effect
  useEffect(() => {
    const scheduleBlink = () => {
      // Random delay between 2-5 seconds
      const delay = 2000 + Math.random() * 3000
      blinkTimeoutRef.current = setTimeout(() => {
        setIsBlinking(true)
        // Blink duration
        setTimeout(() => {
          setIsBlinking(false)
          scheduleBlink()
        }, 150)
      }, delay)
    }

    scheduleBlink()

    return () => {
      if (blinkTimeoutRef.current) {
        clearTimeout(blinkTimeoutRef.current)
      }
    }
  }, [])

  const animationClass = STATE_ANIMATIONS[state] || STATE_ANIMATIONS.calm

  return (
    <div
      className={`numa-container ${className}`}
      style={{
        width: size,
        height: size * 1.2,
        position: 'relative'
      }}
    >
      {/* Glow effect behind Numa */}
      <div
        className={`numa-glow ${animationClass}-glow`}
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: size * 1.5,
          height: size * 1.5,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${currentColors.glow} 0%, transparent 70%)`,
          transition: 'all 1s ease'
        }}
      />

      {/* Main droplet SVG */}
      <svg
        viewBox="0 0 100 120"
        width={size}
        height={size * 1.2}
        className={animationClass}
        style={{ position: 'relative', zIndex: 1 }}
      >
        <defs>
          {/* Gradient for depth */}
          <radialGradient id={`numa-gradient-${mood}`} cx="30%" cy="30%" r="70%">
            <stop offset="0%" stopColor={currentColors.secondary} />
            <stop offset="100%" stopColor={currentColors.primary} />
          </radialGradient>

          {/* Highlight for glassy effect */}
          <radialGradient id="numa-highlight" cx="35%" cy="25%" r="30%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.6)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </radialGradient>

          {/* Filter for soft edges */}
          <filter id="numa-soft" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="0.5" />
          </filter>
        </defs>

        {/* Droplet shape */}
        <path
          d="M50 10
             C50 10, 85 50, 85 75
             C85 97, 69 110, 50 110
             C31 110, 15 97, 15 75
             C15 50, 50 10, 50 10Z"
          fill={`url(#numa-gradient-${mood})`}
          filter="url(#numa-soft)"
          style={{ transition: 'fill 1s ease' }}
        />

        {/* Inner highlight */}
        <ellipse
          cx="38"
          cy="45"
          rx="12"
          ry="18"
          fill="url(#numa-highlight)"
          opacity="0.7"
        />

        {/* Small reflection dot */}
        <circle
          cx="35"
          cy="35"
          r="4"
          fill="rgba(255,255,255,0.8)"
        />

        {/* Eyes */}
        <g className="numa-eyes">
          {/* Left eye */}
          <ellipse
            cx="38"
            cy="68"
            rx={isBlinking ? 4 : 4}
            ry={isBlinking ? 1 : 5}
            fill="#4A5568"
            style={{ transition: 'ry 0.1s ease' }}
          />
          {/* Left eye highlight */}
          {!isBlinking && (
            <circle cx="36" cy="66" r="1.5" fill="white" opacity="0.8" />
          )}

          {/* Right eye */}
          <ellipse
            cx="62"
            cy="68"
            rx={isBlinking ? 4 : 4}
            ry={isBlinking ? 1 : 5}
            fill="#4A5568"
            style={{ transition: 'ry 0.1s ease' }}
          />
          {/* Right eye highlight */}
          {!isBlinking && (
            <circle cx="60" cy="66" r="1.5" fill="white" opacity="0.8" />
          )}
        </g>

        {/* Cute little smile */}
        <path
          d="M42 82 Q50 88 58 82"
          fill="none"
          stroke="#4A5568"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.6"
        />

        {/* Ripple effects (visible in listening state) */}
        {state === 'listening' && (
          <>
            <circle
              cx="50"
              cy="75"
              r="20"
              fill="none"
              stroke={currentColors.secondary}
              strokeWidth="1"
              opacity="0.5"
              className="numa-ripple-1"
            />
            <circle
              cx="50"
              cy="75"
              r="30"
              fill="none"
              stroke={currentColors.secondary}
              strokeWidth="0.5"
              opacity="0.3"
              className="numa-ripple-2"
            />
          </>
        )}
      </svg>

      {/* CSS Animations */}
      <style>{`
        /* Breathing animation - calm state with subtle bounce */
        .numa-breathe {
          animation: breathe 4s ease-in-out infinite, subtle-bounce 2s ease-in-out infinite;
        }

        @keyframes breathe {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.03);
          }
        }

        @keyframes subtle-bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-3px);
          }
        }

        .numa-breathe-glow {
          animation: breathe-glow 4s ease-in-out infinite;
        }

        @keyframes breathe-glow {
          0%, 100% {
            opacity: 0.6;
            transform: translate(-50%, -50%) scale(1);
          }
          50% {
            opacity: 0.8;
            transform: translate(-50%, -50%) scale(1.1);
          }
        }

        /* Eyes subtle movement when calm */
        .numa-eyes {
          animation: eye-look 8s ease-in-out infinite;
        }

        @keyframes eye-look {
          0%, 45%, 55%, 100% {
            transform: translateX(0);
          }
          50% {
            transform: translateX(1px);
          }
        }

        /* Listening animation - expanded, attentive */
        .numa-listen {
          animation: listen 2s ease-in-out infinite;
        }

        @keyframes listen {
          0%, 100% {
            transform: scale(1.05);
          }
          50% {
            transform: scale(1.08);
          }
        }

        .numa-listen-glow {
          animation: listen-glow 2s ease-in-out infinite;
        }

        @keyframes listen-glow {
          0%, 100% {
            opacity: 0.8;
            transform: translate(-50%, -50%) scale(1.2);
          }
          50% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1.3);
          }
        }

        /* Ripple animations for listening */
        .numa-ripple-1 {
          animation: ripple 2s ease-out infinite;
        }

        .numa-ripple-2 {
          animation: ripple 2s ease-out infinite 0.5s;
        }

        @keyframes ripple {
          0% {
            r: 15;
            opacity: 0.6;
          }
          100% {
            r: 40;
            opacity: 0;
          }
        }

        /* Thinking animation - subtle shimmer */
        .numa-think {
          animation: think 1.5s ease-in-out infinite;
        }

        @keyframes think {
          0%, 100% {
            transform: scale(1);
            filter: brightness(1);
          }
          50% {
            transform: scale(1.02);
            filter: brightness(1.1);
          }
        }

        .numa-think-glow {
          animation: think-glow 1.5s ease-in-out infinite;
        }

        @keyframes think-glow {
          0%, 100% {
            opacity: 0.7;
          }
          50% {
            opacity: 0.9;
          }
        }

        /* Responding animation - gentle pulse */
        .numa-respond {
          animation: respond 0.8s ease-in-out infinite;
        }

        @keyframes respond {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.04);
          }
        }

        .numa-respond-glow {
          animation: respond-glow 0.8s ease-in-out infinite;
        }

        @keyframes respond-glow {
          0%, 100% {
            opacity: 0.7;
            transform: translate(-50%, -50%) scale(1);
          }
          50% {
            opacity: 0.9;
            transform: translate(-50%, -50%) scale(1.15);
          }
        }
      `}</style>
    </div>
  )
}
