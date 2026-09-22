import { useEffect, type RefObject } from 'react'

/**
 * Continuous scroll-driven storytelling engine for CampusHub Landing Page.
 * Tracks window scroll position using requestAnimationFrame to calculate
 * exact viewport-relative progress for each major landing section:
 *
 * Incoming section:
 *   opacity: 0.65 → 1.0
 *   translateY: 48px → 0px (24px on mobile)
 *
 * Preceding section:
 *   opacity: 1.0 → 0.55
 *   translateY: 0px → -18px (-8px on mobile)
 *
 * Also calculates section-specific progressive child motion:
 * - Product Preview: restrained mockup lift
 * - Features: progressive card wave across the 5 feature cards
 * - Product Story: narrative leads, visual stack settles, supporting checkmarks follow
 * - Collaboration: team cards lead slightly with staggered entry
 * - Opportunities: connected sequence progression across the 3 pathways
 * - Final CTA: slower, grounded destination finish with 0 recede
 *
 * 100% reversible motion, zero React re-renders, GPU-accelerated transforms,
 * full accessibility with prefers-reduced-motion support.
 */
export function useScrollStorytelling(containerRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    // Accessibility: Honor prefers-reduced-motion immediately
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return

    const container = containerRef.current
    if (!container) return

    // Collect all story sections sorted by data-story-section index (0 to 6)
    const sectionNodes = Array.from(container.querySelectorAll<HTMLElement>('[data-story-section]'))
    const sections = sectionNodes.sort((a, b) => {
      const idxA = Number(a.getAttribute('data-story-section') || '0')
      const idxB = Number(b.getAttribute('data-story-section') || '0')
      return idxA - idxB
    })

    if (sections.length === 0) return

    let rafId: number | null = null
    let ticking = false

    // Natural cubic-out curve for smooth deceleration
    function easeOutCubic(t: number): number {
      return 1 - Math.pow(1 - t, 3)
    }

    // Grounded quartic-out curve for Final CTA destination
    function easeOutQuart(t: number): number {
      return 1 - Math.pow(1 - t, 4)
    }

    function update() {
      const vh = window.innerHeight
      const vw = window.innerWidth
      const isMobile = vw <= 640
      const scrollY = window.scrollY || window.pageYOffset

      const maxEntryY = isMobile ? 24 : 48
      const maxRecedeY = isMobile ? 8 : 18

      const n = sections.length
      const entryProgress: number[] = new Array(n)
      const recedeProgress: number[] = new Array(n)

      // 1. Calculate incoming entry progress (0 to 1) for each section
      sections.forEach((sec, i) => {
        if (i === 0) {
          // Hero is fully visible on load
          entryProgress[i] = 1.0
          return
        }

        const rect = sec.getBoundingClientRect()
        // Entry starts when section top enters near viewport bottom (95%)
        // and completes when section top reaches reading zone (25% for standard, 35% for CTA)
        const entryStart = vh * 0.95
        const entryEnd = vh * (i === n - 1 ? 0.35 : 0.25)
        const p = (entryStart - rect.top) / (entryStart - entryEnd)
        entryProgress[i] = Math.max(0, Math.min(1, p))
      })

      // 2. Calculate outgoing recede progress (0 to 1) as the next section enters
      for (let i = 0; i < n; i++) {
        if (i === n - 1) {
          // Final CTA is the destination; it never recedes
          recedeProgress[i] = 0.0
          continue
        }

        if (i === 0 && scrollY < 40) {
          // Hero does not recede while user is at the very top of the page
          recedeProgress[0] = 0.0
          continue
        }

        const nextRect = sections[i + 1].getBoundingClientRect()
        // Section i recedes smoothly as section i+1 advances into the reading zone
        const recedeStart = vh * 0.75
        const recedeEnd = vh * 0.20
        const p = (recedeStart - nextRect.top) / (recedeStart - recedeEnd)
        recedeProgress[i] = Math.max(0, Math.min(1, p))
      }

      // 3. Continuously apply section-level properties and section-specific motion
      sections.forEach((sec, i) => {
        const ep = entryProgress[i]
        const rp = recedeProgress[i]

        let opacity: number
        let translateY: number

        if (ep < 1) {
          // Section is entering: opacity 0.65 -> 1.0, translateY maxEntryY -> 0px
          const eased = i === n - 1 ? easeOutQuart(ep) : easeOutCubic(ep)
          opacity = 0.65 + 0.35 * eased
          const currentMaxY = i === n - 1 ? (isMobile ? 18 : 30) : maxEntryY
          translateY = (1 - eased) * currentMaxY
        } else {
          // Section is active or receding: opacity 1.0 -> 0.55, translateY 0px -> -maxRecedeY
          const eased = easeOutCubic(rp)
          opacity = 1.0 - 0.45 * eased
          translateY = -eased * maxRecedeY
        }

        sec.style.setProperty('--scroll-opacity', opacity.toFixed(3))
        sec.style.setProperty('--scroll-y', `${translateY.toFixed(1)}px`)
        sec.style.setProperty('--section-progress', ep.toFixed(3))
        sec.style.setProperty('--recede-progress', rp.toFixed(3))

        // State classes
        if (rp > 0.08) {
          sec.classList.add('is-receded')
        } else {
          sec.classList.remove('is-receded')
        }

        // Section-specific child motion:

        // Section 1: Product Preview (Restrained mockup window lift)
        if (i === 1) {
          const mockup = sec.querySelector<HTMLElement>('[data-preview-mockup]')
          if (mockup) {
            const mockupLift = (1 - easeOutCubic(ep)) * (isMobile ? 10 : 20)
            mockup.style.setProperty('--preview-lift', `${mockupLift.toFixed(1)}px`)
          }
        }

        // Section 2: Features (Progressive wave across feature cards)
        if (i === 2) {
          const cards = sec.querySelectorAll<HTMLElement>('[data-feature-card]')
          cards.forEach((card, cIdx) => {
            const start = 0.10 + cIdx * 0.08
            const cp = Math.max(0, Math.min(1, (ep - start) / 0.45))
            const eased = easeOutCubic(cp)
            const cardY = (1 - eased) * (isMobile ? 14 : 26)
            const cardOpacity = 0.55 + 0.45 * eased
            card.style.setProperty('--card-y', `${cardY.toFixed(1)}px`)
            card.style.setProperty('--card-opacity', cardOpacity.toFixed(3))
          })
        }

        // Section 3: Product Story (Narrative leads, visual settles, points follow)
        if (i === 3) {
          const visualStack = sec.querySelector<HTMLElement>('[data-story-visual]')
          if (visualStack) {
            const vp = Math.max(0, Math.min(1, (ep - 0.08) / 0.50))
            const eased = easeOutCubic(vp)
            const visualY = (1 - eased) * (isMobile ? 12 : 22)
            const visualOpacity = 0.65 + 0.35 * eased
            visualStack.style.setProperty('--visual-y', `${visualY.toFixed(1)}px`)
            visualStack.style.setProperty('--visual-opacity', visualOpacity.toFixed(3))
          }

          const storyPoints = sec.querySelectorAll<HTMLElement>('[data-story-point]')
          storyPoints.forEach((point, pIdx) => {
            const start = 0.20 + pIdx * 0.08
            const pp = Math.max(0, Math.min(1, (ep - start) / 0.45))
            const eased = easeOutCubic(pp)
            const pointY = (1 - eased) * (isMobile ? 10 : 18)
            const pointOpacity = 0.60 + 0.40 * eased
            point.style.setProperty('--point-y', `${pointY.toFixed(1)}px`)
            point.style.setProperty('--point-opacity', pointOpacity.toFixed(3))
          })
        }

        // Section 4: Collaboration (Team cards lead slightly with staggered entry)
        if (i === 4) {
          const teamCards = sec.querySelectorAll<HTMLElement>('[data-team-card]')
          teamCards.forEach((card, tIdx) => {
            const start = 0.08 + tIdx * 0.10
            const tp = Math.max(0, Math.min(1, (ep - start) / 0.45))
            const eased = easeOutCubic(tp)
            const teamY = (1 - eased) * (isMobile ? 12 : 24)
            const teamOpacity = 0.55 + 0.45 * eased
            card.style.setProperty('--team-y', `${teamY.toFixed(1)}px`)
            card.style.setProperty('--team-opacity', teamOpacity.toFixed(3))
          })
        }

        // Section 5: Opportunities (Connected sequence progression across 3 items)
        if (i === 5) {
          const oppCards = sec.querySelectorAll<HTMLElement>('[data-opp-card]')
          oppCards.forEach((card, oIdx) => {
            const start = 0.10 + oIdx * 0.12
            const op = Math.max(0, Math.min(1, (ep - start) / 0.45))
            const eased = easeOutCubic(op)
            const oppY = (1 - eased) * (isMobile ? 12 : 24)
            const oppOpacity = 0.55 + 0.45 * eased
            card.style.setProperty('--opp-y', `${oppY.toFixed(1)}px`)
            card.style.setProperty('--opp-opacity', oppOpacity.toFixed(3))
          })

          const connector = sec.querySelector<HTMLElement>('[data-opp-connector]')
          if (connector) {
            const connP = Math.max(0, Math.min(1, (ep - 0.15) / 0.60))
            connector.style.setProperty('--line-progress', `${(connP * 100).toFixed(1)}%`)
          }
        }

        // Section 6: Final CTA (Grounded destination finish)
        if (i === 6) {
          const ctaCard = sec.querySelector<HTMLElement>('[data-cta-card]')
          if (ctaCard) {
            const ctaLift = (1 - easeOutQuart(ep)) * (isMobile ? 10 : 20)
            ctaCard.style.setProperty('--cta-lift', `${ctaLift.toFixed(1)}px`)
          }
        }
      })

      ticking = false
    }

    function onScroll() {
      if (!ticking) {
        ticking = true
        rafId = requestAnimationFrame(update)
      }
    }

    function onResize() {
      update()
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize, { passive: true })

    // Initialize baseline on mount
    update()

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
      if (rafId !== null) {
        cancelAnimationFrame(rafId)
      }
    }
  }, [containerRef])
}
