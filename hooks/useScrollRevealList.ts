'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

type RevealDirection = 'left' | 'right' | 'alternate'

type ScrollRevealListOptions = {
  threshold?: number
  offset?: number
  direction?: RevealDirection
  durationMs?: number
  delayMs?: number
  easing?: string
  enableOpacity?: boolean
  enableScrollProgress?: boolean
}

export type ScrollRevealStyle = {
  opacity: number
  transform: string
  transitionDelay?: string
  willChange: string
}

export function useScrollRevealList(options: ScrollRevealListOptions = {}) {
  const {
    threshold = 0.15,
    offset = 18,
    direction = 'left',
    durationMs = 560,
    delayMs = 120,
    easing = 'cubic-bezier(.2,.9,.2,1)',
    enableOpacity = true,
    enableScrollProgress = true
  } = options

  const itemRefs = useRef<Array<HTMLElement | null>>([])
  const [visible, setVisible] = useState<number[]>([])
  const visibleRef = useRef<number[]>([])
  const [isMounted, setIsMounted] = useState(false) // 👈 add this

  useEffect(() => {
    setIsMounted(true) // 👈 fires after hydration, safe to diverge from server
  }, [])

  useEffect(() => {
    visibleRef.current = visible
  }, [visible])

  const setItemRef = useCallback(
    (index: number) => (el: HTMLElement | null) => {
      itemRefs.current[index] = el
    },
    []
  )

  const resolveDirection = (index: number) => {
    if (direction === 'alternate') {
      return index % 2 === 0 ? 'left' : 'right'
    }
    return direction
  }

  const getItemStyle = useCallback(
    (index: number): ScrollRevealStyle => {
      if (!isMounted) {
        // 👈 match server: fully visible, no transform
        return {
          opacity: 1,
          transform: 'translateX(0)',
          willChange: 'transform, opacity'
        }
      }

      const isVisible = visible.includes(index)
      const dir = resolveDirection(index)
      const translateX = dir === 'left' ? -offset : offset

      return {
        opacity: enableOpacity ? (isVisible ? 1 : 0) : 1,
        transform: isVisible ? 'translateX(0)' : `translateX(${translateX}px)`,
        transitionDelay: isVisible ? `${index * delayMs}ms` : '0ms',
        willChange: 'transform, opacity'
      }
    },
    [isMounted, delayMs, offset, visible, direction, enableOpacity]
  )

  useEffect(() => {
    if (!itemRefs.current || itemRefs.current.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const idx = itemRefs.current.findIndex((el) => el === entry.target)
          if (entry.isIntersecting && idx >= 0) {
            setVisible((prev) => (prev.includes(idx) ? prev : [...prev, idx]))
          }
        })
      },
      { threshold }
    )

    itemRefs.current.forEach((el) => {
      if (el) observer.observe(el)
    })

    let ticking = false
    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        itemRefs.current.forEach((el, i) => {
          if (!el) return
          const rect = el.getBoundingClientRect()
          const visibleHeight = Math.max(0, Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0))
          const ratio = rect.height > 0 ? visibleHeight / rect.height : 0
          const progress = Math.max(0, Math.min(1, ratio))
          const dir = resolveDirection(i)
          const translateX = (1 - progress) * (dir === 'left' ? -offset : offset)

          if (enableOpacity) {
            el.style.opacity = String(progress)
          } else {
            el.style.opacity = '1'
          }
          el.style.transform = `translateX(${translateX}px)`
        })
        ticking = false
      })
    }

    if (enableScrollProgress) {
      window.addEventListener('scroll', onScroll, { passive: true })
      onScroll()
    }

    return () => {
      observer.disconnect()
      if (enableScrollProgress) {
        window.removeEventListener('scroll', onScroll)
      }
    }
  }, [threshold, offset, direction, enableOpacity, enableScrollProgress])

  return {
    setItemRef,
    getItemStyle,
    durationMs,
    easing
  }
}
