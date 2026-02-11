import { useState, useEffect } from 'react'

/**
 * NumaSpeech - Typing text effect for Numa's words
 *
 * Creates the feeling that Numa is speaking, not displaying text.
 * Words appear gradually, with natural pauses.
 */

export default function NumaSpeech({
  text,
  speed = 40,           // ms per character
  pauseOnPunctuation = true,
  onComplete,
  className = ''
}) {
  const [displayedText, setDisplayedText] = useState('')
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    if (!text) return

    setDisplayedText('')
    setIsComplete(false)

    let index = 0
    let timeoutId

    const typeNextChar = () => {
      if (index < text.length) {
        const char = text[index]
        setDisplayedText(text.slice(0, index + 1))
        index++

        // Pause longer on punctuation for natural rhythm
        let delay = speed
        if (pauseOnPunctuation) {
          if (char === '.' || char === '?' || char === '!') {
            delay = speed * 8
          } else if (char === ',') {
            delay = speed * 4
          } else if (char === '—' || char === ':') {
            delay = speed * 3
          }
        }

        timeoutId = setTimeout(typeNextChar, delay)
      } else {
        setIsComplete(true)
        if (onComplete) onComplete()
      }
    }

    // Small delay before starting
    timeoutId = setTimeout(typeNextChar, 300)

    return () => clearTimeout(timeoutId)
  }, [text, speed, pauseOnPunctuation, onComplete])

  return (
    <p className={`numa-speech ${className}`}>
      {displayedText}
      {!isComplete && <span className="numa-cursor">|</span>}

      <style>{`
        .numa-speech {
          line-height: 1.6;
          min-height: 1.6em;
        }

        .numa-cursor {
          display: inline-block;
          margin-left: 2px;
          animation: blink 0.8s ease-in-out infinite;
          opacity: 0.6;
        }

        @keyframes blink {
          0%, 50% { opacity: 0.6; }
          51%, 100% { opacity: 0; }
        }
      `}</style>
    </p>
  )
}

/**
 * NumaMessage - A complete message from Numa with visual container
 */
export function NumaMessage({ text, speed, onComplete, className = '' }) {
  return (
    <div className={`numa-message ${className}`}>
      <NumaSpeech
        text={text}
        speed={speed}
        onComplete={onComplete}
      />

      <style>{`
        .numa-message {
          background: linear-gradient(
            135deg,
            rgba(255, 255, 255, 0.4) 0%,
            rgba(255, 255, 255, 0.1) 100%
          );
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 20px;
          padding: 20px 24px;
          max-width: 320px;
          margin: 0 auto;
        }
      `}</style>
    </div>
  )
}
