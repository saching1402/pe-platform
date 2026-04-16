import { NavLink, Outlet } from 'react-router-dom'

const NAV = [
  { to: '/', label: 'Overview', icon: '📊', end: true },
  { to: '/analysis', label: 'Analysis', icon: '🔬' },
  { to: '/managers', label: 'Fund Managers', icon: '🏢' },
  { to: '/funds', label: 'Fund Details', icon: '💼' },
  { to: '/workflow', label: 'Workflow', icon: '🤝' },
]

export default function Layout() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--navy)' }}>
      {/* Header */}
      <header style={{
        background: 'linear-gradient(135deg, #0a1628 0%, #132040 100%)',
        borderBottom: '1px solid var(--border)',
        padding: '0 2rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: 64, position: 'sticky', top: 0, zIndex: 100,
        boxShadow: '0 2px 20px rgba(0,0,0,0.4)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 8,
            background: 'linear-gradient(135deg, var(--gold), var(--gold-dark))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 900, color: '#0a1628', fontSize: 16,
          }}>PE</div>
          <div>
            <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text)' }}>
              Buyout Intelligence Platform
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--gold)', letterSpacing: '1px', textTransform: 'uppercase' }}>
              Middle Market Fund Manager Analytics
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {['103 Managers', '444 Funds', 'Live Data'].map(b => (
            <span key={b} style={{
              background: 'var(--gold-glow)', border: '1px solid var(--border)',
              color: 'var(--gold)', padding: '4px 10px', borderRadius: 20,
              fontSize: '0.72rem', fontWeight: 600,
            }}>{b}</span>
          ))}
        </div>
      </header>

      {/* Nav */}
      <nav style={{
        background: 'var(--navy-mid)', borderBottom: '1px solid var(--border)',
        padding: '0 2rem', display: 'flex',
      }}>
        {NAV.map(({ to, label, icon, end }) => (
          <NavLink key={to} to={to} end={end} style={({ isActive }) => ({
            padding: '14px 22px', textDecoration: 'none',
            fontSize: '0.85rem', fontWeight: 600,
            color: isActive ? 'var(--gold)' : 'var(--text-muted)',
            borderBottom: isActive ? '2px solid var(--gold)' : '2px solid transparent',
            background: isActive ? 'rgba(201,168,76,0.08)' : 'transparent',
            display: 'flex', alignItems: 'center', gap: 8,
            transition: 'all 0.2s', whiteSpace: 'nowrap',
          })}>
            <span>{icon}</span> {label}
          </NavLink>
        ))}
      </nav>

      {/* Content */}
      <main style={{ padding: '2rem', maxWidth: 1600, margin: '0 auto' }}>
        <Outlet />
      </main>
    </div>
  )
}
