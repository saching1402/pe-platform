/** Shared UI primitives */

export function Card({ children, style = {} }) {
  return (
    <div style={{
      background: 'var(--navy-card)', border: '1px solid var(--border)',
      borderRadius: 12, padding: '1.5rem', ...style,
    }}>
      {children}
    </div>
  )
}

export function CardHeader({ title, subtitle, badge, actions }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
      <div>
        <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text)' }}>{title}</div>
        {subtitle && <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>{subtitle}</div>}
      </div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        {badge && <Badge>{badge}</Badge>}
        {actions}
      </div>
    </div>
  )
}

export function Badge({ children, color = 'gold' }) {
  return (
    <span style={{
      background: 'var(--gold-glow)', border: '1px solid var(--border)',
      color: 'var(--gold)', padding: '3px 10px', borderRadius: 20,
      fontSize: '0.7rem', fontWeight: 600,
    }}>{children}</span>
  )
}

export function KpiCard({ label, value, sub, icon }) {
  return (
    <div style={{
      background: 'var(--navy-card)', border: '1px solid var(--border)',
      borderRadius: 12, padding: '1.25rem 1.5rem', position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 2,
        background: 'linear-gradient(90deg, var(--gold), transparent)',
      }} />
      {icon && <div style={{ position: 'absolute', right: '1rem', top: '1rem', fontSize: '1.8rem', opacity: 0.12 }}>{icon}</div>}
      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600, marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: '1.9rem', fontWeight: 800, color: 'var(--gold)', lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 6 }}>{sub}</div>}
    </div>
  )
}

export function MetricPill({ value, type = 'irr' }) {
  const colors = {
    irr: { bg: 'rgba(96,165,250,0.15)', color: '#60a5fa', border: 'rgba(96,165,250,0.3)' },
    tvpi: { bg: 'rgba(61,214,140,0.15)', color: '#3dd68c', border: 'rgba(61,214,140,0.3)' },
    dpi: { bg: 'rgba(201,168,76,0.15)', color: 'var(--gold)', border: 'rgba(201,168,76,0.3)' },
  }
  const c = colors[type] || colors.irr
  return (
    <span style={{
      display: 'inline-block', padding: '3px 10px', borderRadius: 20,
      fontSize: '0.75rem', fontWeight: 700,
      background: c.bg, color: c.color, border: `1px solid ${c.border}`,
    }}>{value}</span>
  )
}

export function QuartileBadge({ quartile }) {
  if (!quartile) return null
  let color, label
  if (quartile.includes('1')) { color = '#3dd68c'; label = 'Q1 Top' }
  else if (quartile.includes('2')) { color = '#60a5fa'; label = 'Q2 Upper' }
  else if (quartile.includes('3')) { color = '#f59e0b'; label = 'Q3 Lower' }
  else if (quartile.includes('4')) { color = '#ef4444'; label = 'Q4 Bottom' }
  else return null
  return (
    <span style={{
      display: 'inline-block', padding: '2px 8px', borderRadius: 20,
      fontSize: '0.7rem', fontWeight: 700,
      background: `${color}22`, color, border: `1px solid ${color}44`,
    }}>{label}</span>
  )
}

export function FilterBar({ children }) {
  return (
    <div style={{
      background: 'var(--navy-card)', border: '1px solid var(--border)',
      borderRadius: 12, padding: '1rem 1.5rem', marginBottom: '1.5rem',
      display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center',
    }}>
      {children}
    </div>
  )
}

export function FilterGroup({ label, children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ fontSize: '0.72rem', color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>{label}</span>
      {children}
    </div>
  )
}

export function Select({ value, onChange, children, style = {} }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)} style={{
      background: 'var(--navy-light)', border: '1px solid var(--border)',
      color: 'var(--text)', padding: '7px 12px', borderRadius: 8,
      fontSize: '0.82rem', cursor: 'pointer', outline: 'none', ...style,
    }}>
      {children}
    </select>
  )
}

export function Input({ value, onChange, placeholder, style = {}, type = 'text' }) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        background: 'var(--navy-light)', border: '1px solid var(--border)',
        color: 'var(--text)', padding: '7px 12px', borderRadius: 8,
        fontSize: '0.82rem', outline: 'none', ...style,
      }}
    />
  )
}

export function Button({ onClick, children, variant = 'primary', style = {} }) {
  return (
    <button onClick={onClick} style={{
      background: variant === 'primary' ? 'linear-gradient(135deg, var(--gold), var(--gold-dark))' : 'var(--navy-light)',
      color: variant === 'primary' ? '#0a1628' : 'var(--text-muted)',
      border: variant === 'primary' ? 'none' : '1px solid var(--border)',
      padding: '8px 18px', borderRadius: 8, fontSize: '0.82rem',
      fontWeight: 700, cursor: 'pointer', ...style,
    }}>{children}</button>
  )
}

export function Table({ headers, children }) {
  return (
    <div style={{ overflowX: 'auto', borderRadius: 8 }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
        <thead>
          <tr>
            {headers.map((h, i) => (
              <th key={i} style={{
                background: 'var(--navy-light)', color: 'var(--gold)',
                fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.8px',
                padding: '10px 14px', textAlign: 'left', fontWeight: 700,
                whiteSpace: 'nowrap', borderBottom: '1px solid var(--border)',
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  )
}

export function Tr({ children, onClick }) {
  return (
    <tr
      onClick={onClick}
      style={{ borderBottom: '1px solid rgba(201,168,76,0.05)', cursor: onClick ? 'pointer' : 'default' }}
      onMouseEnter={e => { if (onClick) e.currentTarget.style.background = 'rgba(201,168,76,0.04)' }}
      onMouseLeave={e => { e.currentTarget.style.background = '' }}
    >
      {children}
    </tr>
  )
}

export function Td({ children, style = {} }) {
  return <td style={{ padding: '10px 14px', color: 'var(--text)', verticalAlign: 'middle', ...style }}>{children}</td>
}

export function Spinner() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '3rem' }}>
      <div style={{
        width: 40, height: 40, border: '3px solid var(--navy-light)',
        borderTop: '3px solid var(--gold)', borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

export function StatusPill({ status }) {
  const s = {
    open: { bg: 'rgba(139,92,246,0.15)', color: '#a78bfa', border: 'rgba(139,92,246,0.3)', label: 'Open' },
    in_progress: { bg: 'rgba(245,158,11,0.15)', color: '#f59e0b', border: 'rgba(245,158,11,0.3)', label: 'In Progress' },
    review: { bg: 'rgba(96,165,250,0.15)', color: '#60a5fa', border: 'rgba(96,165,250,0.3)', label: 'In Review' },
    done: { bg: 'rgba(61,214,140,0.15)', color: '#3dd68c', border: 'rgba(61,214,140,0.3)', label: 'Done' },
  }[status] || { bg: 'var(--navy-light)', color: 'var(--text-muted)', border: 'var(--border)', label: status }
  return (
    <span style={{
      display: 'inline-block', padding: '2px 10px', borderRadius: 20,
      fontSize: '0.7rem', fontWeight: 700,
      background: s.bg, color: s.color, border: `1px solid ${s.border}`,
    }}>{s.label}</span>
  )
}
