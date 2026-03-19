'use client'

import dynamic from 'next/dynamic'

const ChartSkeleton = () => (
  <div className="h-[300px] animate-pulse bg-muted rounded" />
)

export const CategoryPieChart = dynamic(
  () => import('./category-pie-chart').then((mod) => mod.CategoryPieChart),
  { ssr: false, loading: () => <ChartSkeleton /> }
)

export const MonthlyTrendChart = dynamic(
  () => import('./monthly-trend-chart').then((mod) => mod.MonthlyTrendChart),
  { ssr: false, loading: () => <ChartSkeleton /> }
)

export const BudgetBarChart = dynamic(
  () => import('./budget-bar-chart').then((mod) => mod.BudgetBarChart),
  { ssr: false, loading: () => <ChartSkeleton /> }
)
