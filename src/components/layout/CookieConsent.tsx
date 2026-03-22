'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

const STORAGE_KEY = 'hypeon-cookie-consent'

export default function CookieConsent() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem(STORAGE_KEY)
    if (!consent) {
      // Small delay so the banner animates in after page load
      const timer = setTimeout(() => setVisible(true), 1000)
      return () => clearTimeout(timer)
    }
  }, [])

  function handleAccept() {
    localStorage.setItem(STORAGE_KEY, 'accepted')
    setVisible(false)
  }

  // Don't render at all if consent was already given (avoids flash)
  const [shouldRender, setShouldRender] = useState(true)

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY)) {
      setShouldRender(false)
    }
  }, [])

  if (!shouldRender) return null

  return (
    <div className={`cookie-banner${visible ? ' visible' : ''}`} role="banner" aria-label="Cookie consent">
      <p>
        We use cookies for essential site functionality.{' '}
        <Link href="/privacy">Learn more</Link>
      </p>
      <button onClick={handleAccept} type="button">
        Accept
      </button>
    </div>
  )
}
