import { createContext, useContext, useState, useEffect } from 'react'
import { recordCheckIn, recordConversation, getInsights, getMemoryContext } from '../lib/memory'

const UserContext = createContext()

export function UserProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('rooted-user')
    return saved ? JSON.parse(saved) : null
  })

  const [todayCheckIn, setTodayCheckIn] = useState(() => {
    const saved = localStorage.getItem('rooted-checkin-' + new Date().toDateString())
    return saved ? JSON.parse(saved) : null
  })

  // Save user data whenever it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('rooted-user', JSON.stringify(user))
    }
  }, [user])

  // Save check-in data
  useEffect(() => {
    if (todayCheckIn) {
      localStorage.setItem('rooted-checkin-' + new Date().toDateString(), JSON.stringify(todayCheckIn))
    }
  }, [todayCheckIn])

  const completeOnboarding = (userData) => {
    setUser({
      ...userData,
      createdAt: new Date().toISOString(),
      onboardingComplete: true
    })
  }

  const checkIn = (mood, energy) => {
    const checkInData = {
      mood,
      energy,
      timestamp: new Date().toISOString()
    }
    setTodayCheckIn(checkInData)

    // Record in Numa's memory
    recordCheckIn(mood, energy)

    return checkInData
  }

  // Record a conversation for Numa's memory
  const recordUserMessage = (message, emotion) => {
    recordConversation(message, emotion)
  }

  // Get Numa's insights about the user
  const getNumaInsights = () => {
    return getInsights()
  }

  // Get memory context for Numa's responses
  const getNumaMemoryContext = () => {
    return getMemoryContext()
  }

  const logout = () => {
    setUser(null)
    setTodayCheckIn(null)
    localStorage.removeItem('rooted-user')
  }

  return (
    <UserContext.Provider value={{
      user,
      todayCheckIn,
      completeOnboarding,
      checkIn,
      logout,
      isOnboarded: user?.onboardingComplete,
      // Memory functions
      recordUserMessage,
      getNumaInsights,
      getNumaMemoryContext
    }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}
