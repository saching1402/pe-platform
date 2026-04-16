import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchManagers, fetchManager } from '../utils/api'
import { fmt, fmtX, fmtM, truncate, quartileLabel } from '../utils/format'
import {
  Card, CardHeader, FilterBar, FilterGroup, Select, Input, Button,
  MetricPill, QuartileBadge, Spinner, Badge, Table, Tr, Td,
} from '../components/ui'

function ManagerDetail({ manager, onClose }) {
  if (!manager) return null
  return (
    <div style={{ marginTop: '1.5rem' }}>
      <div style={{ background: 'var(--navy-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '1.5rem', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
          <div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--gold)' }}>{manager.name}</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 6 }}>
              {manager.strategy && <Badge>{manager.strategy}</Badge>}
              {manager.aum_usd_m && <Badge>AUM: {fmtM(manager.aum_usd_m)}</Badge>}
              {manager.year_founded && <Badge>Founded {manager.year_founded}</Badge>}
              {manager.pb_score > 0 && <Badge>PB Score: {manager.pb_score?.toFixed(1)}</Badge>}
              <Badge>{manager.fund_count} Funds</Badge>
            </div>
          </div>
          <Button onClick={onClose} variant="secondary">✕ Close</Button>
        </div>
        {manager.description && (
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.6, padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.02)', borderRadius: 8, borderLeft: '2px solid var(--gold)', marginBottom: '1rem' }}>
            {manager.description}
          </div>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem' }}>
          {[
            { val: fmt(manager.avg_irr), lbl: 'Avg IRR' },
            { val: fmtX(manager.avg_tvpi), lbl: 'Avg TVPI' },
            { val: fmtX(manager.avg_dpi), lbl: 'Avg DPI' },
            { val: fmtX(manager.avg_rvpi), lbl: 'Avg RVPI' },
            { val: manager.top_quartile_count, lbl: 'Q1 Funds' },
            { val: manager.total_investments?.toFixed(0) ?? '—', lbl: 'Total Investments' },
          ].map(({ val, lbl }) => (
            <div key={lbl} style={{ background: 'var(--navy-light)', border: '1px solid var(--border)', borderRadius: 8, padding: '0.75rem', textAlign: 'center' }}>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--gold)' }}>{val}</div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginTop: 3 }}>{lbl}</div>
            </div>
          ))}
        </div>
      </div>

      <Card>
        <CardHeader title="Fund Track Record" />
        <Table headers={['Fund Name', 'Vintage', 'Size ($M)', 'IRR', 'TVPI', 'DPI', 'Quartile', 'As Of']}>
          {(manager.funds || []).sort((a, b) => (a.vintage || 0) - (b.vintage || 0)).map(f => (
            <Tr key={f.id}>
              <Td><strong style={{ color: 'var(--gold-light)' }}>{f.fund_name}</strong></Td>
              <Td style={{ color: 'var(--text-muted)' }}>{f.vintage || '—'}</Td>
              <Td>{f.fund_size ? '$' + f.fund_size.toFixed(0) + 'M' : '—'}</Td>
              <Td>{f.irr !== null ? <MetricPill value={fmt(f.irr)} type="irr" /> : '—'}</Td>
              <Td>{f.tvpi !== null ? <MetricPill value={fmtX(f.tvpi)} type="tvpi" /> : '—'}</Td>
              <Td>{f.dpi !== null ? <MetricPill value={fmtX(f.dpi)} type="dpi" /> : '—'}</Td>
              <Td><QuartileBadge quartile={f.fund_quartile} /></Td>
              <Td style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>{f.as_of_quarter || '—'}</Td>
            </Tr>
          ))}
        </Table>
      </Card>
    </div>
  )
}

export default function Managers() {
  const [search, setSearch] = useState('')
  const [strategy, setStrategy] = useState('')
  const [sort, setSort] = useState('-avg_irr')
  const [view, setView] = useState('table')
  const [page, setPage] = useState(1)
  const [selectedId, setSelectedId] = useState(null)

  const params = {
    ...(search && { search }),
    ...(strategy && { strategy }),
    ordering: sort,
    page,
    page_size: 20,
  }

  const { data, isLoading } = useQuery({
    queryKey: ['managers', params],
    queryFn: () => fetchManagers(params),
  })

  const { data: detail, isLoading: loadingDetail } = useQuery({
    queryKey: ['manager-detail', selectedId],
    queryFn: () => fetchManager(selectedId),
    enabled: !!selectedId,
  })

  const managers = data?.results || []
  const totalPages = Math.ceil((data?.count || 0) / 20)

  return (
    <div>
      <FilterBar>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>🔍</span>
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} placeholder="Search by manager name or description..."
            style={{ background: 'var(--navy-light)', border: '1px solid var(--border)', color: 'var(--text)', padding: '8px 14px 8px 32px', borderRadius: 8, fontSize: '0.85rem', width: '100%', outline: 'none' }} />
        </div>
        <FilterGroup label="Strategy">
          <Select value={strategy} onChange={v => { setStrategy(v); setPage(1) }} style={{ minWidth: 100 }}>
            <option value="">All</option>
            <option value="MM">MM</option>
            <option value="LMM">LMM</option>
          </Select>
        </FilterGroup>
        <FilterGroup label="Sort By">
          <Select value={sort} onChange={setSort} style={{ minWidth: 140 }}>
            <option value="-avg_irr">Avg IRR ↓</option>
            <option value="-avg_tvpi">Avg TVPI ↓</option>
            <option value="-avg_dpi">Avg DPI ↓</option>
            <option value="-pb_score">PB Score ↓</option>
            <option value="-aum_usd_m">AUM ↓</option>
            <option value="-fund_count">Fund Count ↓</option>
          </Select>
        </FilterGroup>
        <FilterGroup label="View">
          <Select value={view} onChange={setView} style={{ minWidth: 100 }}>
            <option value="table">Table</option>
            <option value="cards">Cards</option>
          </Select>
        </FilterGroup>
        <Badge>{data?.count ?? '…'} managers</Badge>
      </FilterBar>

      {isLoading ? <Spinner /> : view === 'table' ? (
        <Card>
          <Table headers={['#','Manager','Strategy','AUM','Funds','Avg IRR','Avg TVPI','Avg DPI','PB Score','Founded','Q1 Funds']}>
            {managers.map((m, i) => (
              <Tr key={m.id} onClick={() => setSelectedId(m.id === selectedId ? null : m.id)}>
                <Td style={{ color: 'var(--text-muted)' }}>{(page - 1) * 20 + i + 1}</Td>
                <Td><strong style={{ color: 'var(--gold-light)' }}>{m.name}</strong></Td>
                <Td>{m.strategy ? <MetricPill value={m.strategy} type="irr" /> : '—'}</Td>
                <Td style={{ fontWeight: 700 }}>{fmtM(m.aum_usd_m)}</Td>
                <Td style={{ color: 'var(--text-muted)' }}>{m.fund_count}</Td>
                <Td>{m.avg_irr !== null ? <MetricPill value={fmt(m.avg_irr)} type="irr" /> : '—'}</Td>
                <Td>{m.avg_tvpi !== null ? <MetricPill value={fmtX(m.avg_tvpi)} type="tvpi" /> : '—'}</Td>
                <Td>{m.avg_dpi !== null ? <MetricPill value={fmtX(m.avg_dpi)} type="dpi" /> : '—'}</Td>
                <Td style={{ color: '#60a5fa', fontWeight: 700 }}>{m.pb_score > 0 ? m.pb_score?.toFixed(1) : '—'}</Td>
                <Td style={{ color: 'var(--text-muted)' }}>{m.year_founded || '—'}</Td>
                <Td style={{ color: '#3dd68c', fontWeight: 700 }}>{m.top_quartile_count || 0}</Td>
              </Tr>
            ))}
          </Table>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: '1.5rem' }}>
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setPage(p)} style={{
                background: p === page ? 'linear-gradient(135deg, var(--gold), var(--gold-dark))' : 'var(--navy-card)',
                color: p === page ? '#0a1628' : 'var(--text-muted)',
                border: '1px solid var(--border)', padding: '6px 12px', borderRadius: 6,
                cursor: 'pointer', fontSize: '0.8rem', fontWeight: p === page ? 700 : 400,
              }}>{p}</button>
            ))}
          </div>
        </Card>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1rem' }}>
          {managers.map(m => (
            <div key={m.id} onClick={() => setSelectedId(m.id === selectedId ? null : m.id)}
              style={{ background: 'var(--navy-card)', border: `1px solid ${m.id === selectedId ? 'var(--gold)' : 'var(--border)'}`, borderRadius: 12, padding: '1.25rem', cursor: 'pointer' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--gold)' }}>{m.name}</div>
                {m.strategy && <MetricPill value={m.strategy} type="irr" />}
              </div>
              {m.description && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 10 }}>{truncate(m.description, 100)}</div>}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
                {[{ val: fmt(m.avg_irr), lbl: 'Avg IRR', color: '#60a5fa' }, { val: fmtX(m.avg_tvpi), lbl: 'Avg TVPI', color: '#3dd68c' }, { val: fmtX(m.avg_dpi), lbl: 'Avg DPI', color: 'var(--gold)' }].map(({ val, lbl, color }) => (
                  <div key={lbl} style={{ textAlign: 'center' }}>
                    <div style={{ fontWeight: 800, color, fontSize: '0.95rem' }}>{val}</div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{lbl}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                <span>{m.fund_count} funds</span>
                <span>{fmtM(m.aum_usd_m)} AUM</span>
                <span>Founded {m.year_founded || '—'}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {loadingDetail && <Spinner />}
      {detail && <ManagerDetail manager={detail} onClose={() => setSelectedId(null)} />}
    </div>
  )
}
