'use client'

import { useState, useCallback } from 'react'
import { format, addMonths, subMonths } from 'date-fns'

export function useMonth(initialMonth?: string) {
  const [month, setMonth] = useState(
    initialMonth || format(new Date(), 'yyyy-MM')
  )

  const goToPreviousMonth = useCallback(() => {
    setMonth((current) => {
      const [year, m] = current.split('-').map(Number)
      const date = new Date(year, m - 1, 1)
      return format(subMonths(date, 1), 'yyyy-MM')
    })
  }, [])

  const goToNextMonth = useCallback(() => {
    setMonth((current) => {
      const [year, m] = current.split('-').map(Number)
      const date = new Date(year, m - 1, 1)
      return format(addMonths(date, 1), 'yyyy-MM')
    })
  }, [])

  const goToCurrentMonth = useCallback(() => {
    setMonth(format(new Date(), 'yyyy-MM'))
  }, [])

  const formatMonth = useCallback((m: string) => {
    const [year, monthNum] = m.split('-').map(Number)
    return `${year}년 ${monthNum}월`
  }, [])

  return {
    month,
    setMonth,
    goToPreviousMonth,
    goToNextMonth,
    goToCurrentMonth,
    formatMonth,
    formattedMonth: formatMonth(month),
  }
}
