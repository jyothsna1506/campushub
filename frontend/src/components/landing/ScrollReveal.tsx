import React, { type ReactNode } from 'react'

interface ScrollRevealProps {
  children: ReactNode
  className?: string
  delay?: number
  stagger?: number
  duration?: number
  yOffset?: number
  threshold?: number
  rootMargin?: string
  once?: boolean
  as?: React.ElementType
}

/**
 * Lightweight wrapper component for landing page content.
 * Section and card motion are handled synchronously by useScrollStorytelling
 * to ensure 100% continuous scroll response without IntersectionObserver lag.
 */
export default function ScrollReveal({
  children,
  className = '',
  as: Component = 'div',
}: ScrollRevealProps) {
  return (
    <Component className={`scroll-reveal ${className}`}>
      {children}
    </Component>
  )
}
