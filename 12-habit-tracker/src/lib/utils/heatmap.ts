/**
 * Get heatmap background color class based on completion rate
 *
 * Color scale:
 * - 0%: gray-100 (no activity)
 * - 1-25%: green-200 (low)
 * - 26-50%: green-400 (medium-low)
 * - 51-75%: green-600 (medium-high)
 * - 76-100%: green-800 (high)
 */
export function getHeatmapColor(completionRate: number): string {
  if (completionRate === 0) return 'bg-gray-100'
  if (completionRate <= 0.25) return 'bg-green-200'
  if (completionRate <= 0.50) return 'bg-green-400'
  if (completionRate <= 0.75) return 'bg-green-600'
  return 'bg-green-800'
}

/**
 * Get text color class for heatmap cell (for readability)
 */
export function getHeatmapTextColor(completionRate: number): string {
  if (completionRate <= 0.50) return 'text-gray-700'
  return 'text-white'
}

/**
 * Format completion rate as percentage
 */
export function formatCompletionRate(rate: number): string {
  return `${Math.round(rate * 100)}%`
}
