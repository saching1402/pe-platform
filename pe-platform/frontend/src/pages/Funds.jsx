import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchFunds } from '../utils/api'
import { fmt, fmtX } from '../utils/format'
import { Card, FilterBar, FilterGroup, Select, Input, Button, MetricPill, QuartileBadge, Spinner, Badge, Table, Tr, Td } from '../components/ui'

const VINTAGES = Array.from({ length: 23 }, (_, i) => 2000 + i)

export default function Funds() {
  const [search, setSearch] = useState('')
  const [vintage, setVintage] = useState('')
  const [fundType, setFundType] = useState('')
  const [quartile, setQuartile] = useState('')
  const [minIRR, setMinIRR] = useState('')
  const [page, setPage] = useState(1)

  const params = {
    ...(search && { search }),
    ...(vintage && { vintage }),
    ...(fundType && { fund_type: fundType }),
    ...(quartile && { quartile }),
    ...(minIRR && { min_irr: minIRR }),
    page,
    page_size: 25,
    ordering: '-irr',
  }

  const { data, isLoading } = useQuery({
    queryKey: ['funds', params],
    queryFn: () => fetchFunds(params),
  })

  const funds = data?.results || []
  const totalPages = Math.ceil((data?.count || 0) / 25)

  const reset = () => { setSearch(''); setVintage(''); setFundType(''); setQuartile(''); setMinIRR(''); setPage(1) }

  return (
    <div>
      <FilterBar>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>🔍</span>
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} placeholder="Search fund or manager name..."
            style={{ background: 'var(--navy-light)', border: '1px solid var(--border)', color: 'var(--text)', padding: '8px 14px 8px 32px', borderRadius: 8, fontSize: '0.85rem', width: '100%', outline: 'none' }} />
        </div>
        <FilterGroup label="Vintage">
          <Select value={vintage} onChange={v => { setVintage(v); setPage(1) }} style={{ minWidth: 100 }}>
            <option value="">All Years</option>
            {VINTAGES.map(v => <option key={v} value={v}>{v}</option>)}
          </Select>
        </FilterGroup>
        <FilterGroup label="Type">
          <Select value={fundType} onChange={v => { setFundType(v); setPage(1) }}>
            <option value="">All Types</option>
            <option value="Buyout">Buyout</option>
            <option value="Growth/Expansion">Growth/Expansion</option>
            <option value="Diversified Private Equity">Diversified PE</option>
          </Select>
        </FilterGroup>
        <FilterGroup label="Quartile">
          <Select value={quartile} onChange={v => { setQuartile(v); setPage(1) }}>
            <option value="">All</option>
            <option value="1">Q1 Top</option>
            <option value="2">Q2 Upper</option>
            <option value="3">Q3 Lower</option>
            <option value="4">Q4 Bottom</option>
          </Select>
        </FilterGroup>
        <FilterGroup label="Min IRR">
          <Input value={minIRR} onChange={v => { setMinIRR(v); setPage(1) }} placeholder="0" type="number" style={{ width: 90 }} />
        </FilterGroup>
        <Button onClick={reset} variant="secondary">Reset</Button>
        <Badge>{data?.count ?? '…'} funds</Badge>
      </FilterBar>

      {isLoading ? <Spinner /> : (
        <Card>
          <Table headers={['Fund ID','Manager','Fund Name','Vintage','Size ($M)','Type','# Inv.','IRR','TVPI','DPI','RVPI','Quartile','As Of','Geography']}>
            {funds.map(f => (
              <Tr key={f.id}>
                <Td style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{f.fund_id}</Td>
                <Td><strong style={{ color: 'var(--gold)' }}>{f.manager_name}</strong></Td>
                <Td>{f.fund_name}</Td>
                <Td style={{ color: 'var(--text-muted)' }}>{f.vintage || '—'}</Td>
                <Td>{f.fund_size ? '$' + f.fund_size.toFixed(0) + 'M' : '—'}</Td>
                <Td style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{f.fund_type || '—'}</Td>
                <Td style={{ color: 'var(--text-muted)' }}>{f.investments?.toFixed(0) || '—'}</Td>
                <Td>{f.irr !== null ? <MetricPill value={fmt(f.irr)} type="irr" /> : '—'}</Td>
                <Td>{f.tvpi !== null ? <MetricPill value={fmtX(f.tvpi)} type="tvpi" /> : '—'}</Td>
                <Td>{f.dpi !== null ? <MetricPill value={fmtX(f.dpi)} type="dpi" /> : '—'}</Td>
                <Td style={{ color: 'var(--text-muted)' }}>{f.rvpi !== null ? fmtX(f.rvpi) : '—'}</Td>
                <Td><QuartileBadge quartile={f.fund_quartile} /></Td>
                <Td style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{f.as_of_quarter || '—'}</Td>
                <Td style={{ fontSize: '0.72rem', color: 'var(--text-muted)', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.preferred_geography || '—'}</Td>
              </Tr>
            ))}
          </Table>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: '1.5rem' }}>
            {[...Array(Math.min(totalPages, 8))].map((_, i) => (
              <button key={i+1} onClick={() => setPage(i+1)} style={{
                background: i+1 === page ? 'linear-gradient(135deg, var(--gold), var(--gold-dark))' : 'var(--navy-card)',
                color: i+1 === page ? '#0a1628' : 'var(--text-muted)',
                border: '1px solid var(--border)', padding: '6px 12px', borderRadius: 6,
                cursor: 'pointer', fontSize: '0.8rem', fontWeight: i+1 === page ? 700 : 400,
              }}>{i+1}</button>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
