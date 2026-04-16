export const fmt = (v, suffix = '%', decimals = 1) => {
  if (v === null || v === undefined || isNaN(v)) return '—'
  return v.toFixed(decimals) + suffix
}

export const fmtX = (v) => fmt(v, 'x', 2)

export const fmtM = (v) => {
  if (!v) return '—'
  if (v >= 1_000_000) return '$' + (v / 1_000_000).toFixed(1) + 'T'
  if (v >= 1000) return '$' + (v / 1000).toFixed(1) + 'B'
  return '$' + v.toFixed(0) + 'M'
}

export const fmtPct = (v) => fmt(v, '%', 1)

export const truncate = (s, n = 100) => {
  if (!s) return ''
  return s.length > n ? s.slice(0, n) + '…' : s
}

export const quartileLabel = (q) => {
  if (!q) return null
  if (q.includes('1')) return { label: 'Q1 Top', color: '#3dd68c' }
  if (q.includes('2')) return { label: 'Q2 Upper', color: '#60a5fa' }
  if (q.includes('3')) return { label: 'Q3 Lower', color: '#f59e0b' }
  if (q.includes('4')) return { label: 'Q4 Bottom', color: '#ef4444' }
  return null
}
