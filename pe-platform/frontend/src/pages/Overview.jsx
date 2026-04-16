import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts'
import { fetchOverviewStats, fetchTopPerformers, fetchManagers } from '../utils/api'
import { fmt, fmtX, fmtM } from '../utils/format'
import { KpiCard, Card, CardHeader, FilterBar, FilterGroup, Select, Input, Button, MetricPill, Table, Tr, Td, Spinner, Badge } from '../components/ui'

const GOLD = '#c9a84c'
const NAVY_LIGHT = '#1e3058'

function TopTable({ metric, managers }) {
  const sorted = [...managers]
    .filter(m => m[metric] !== null)
    .sort((a, b) => b[metric] - a[metric])
    .slice(0, 10)

  return (
    <div>
      {sorted.map((m, i) => {
        const val = metric === 'avg_irr' ? fmt(m[metric]) : metric === 'pb_score' ? m[metric]?.toFixed(1) : fmtX(m[metric])
        const color = metric === 'avg_irr' ? '#60a5fa' : metric === 'avg_tvpi' ? '#3dd68c' : metric === 'pb_score' ? '#60a5fa' : GOLD
        return (
          <div key={m.name} style={{
            display: 'flex', alignItems: 'center', gap: '0.75rem',
            padding: '8px 0', borderBottom: '1px solid rgba(201,168,76,0.07)',
          }}>
            <div style={{ width: 20, textAlign: 'center', fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>{i + 1}</div>
            <div style={{ flex: 1, fontSize: '0.82rem' }}>{m.name}</div>
            <div style={{ fontWeight: 800, color, fontSize: '0.9rem' }}>{val}</div>
          </div>
        )
      })}
    </div>
  )
}

export default function Overview() {
  const [strategy, setStrategy] = useState('')
  const [minIRR, setMinIRR] = useState('')
  const [minTVPI, setMinTVPI] = useState('')
  const [minPB, setMinPB] = useState('')

  const params = {
    ...(strategy && { strategy }),
    ...(minIRR && { min_irr: minIRR }),
    ...(minTVPI && { min_tvpi: minTVPI }),
    ...(minPB && { min_pb_score: minPB }),
  }

  const { data: stats, isLoading: loadingStats } = useQuery({
    queryKey: ['overview-stats', params],
    queryFn: () => fetchOverviewStats(params),
  })

  const { data: managersData, isLoading: loadingMgrs } = useQuery({
    queryKey: ['managers-list', params],
    queryFn: () => fetchManagers({ ...params, page_size: 200, ordering: '-avg_irr' }),
  })

  const managers = managersData?.results || []

  const topIRR = [...managers].filter(m => m.avg_irr !== null).sort((a, b) => b.avg_irr - a.avg_irr).slice(0, 15)

  // IRR distribution bins
  const bins = [0, 10, 15, 20, 25, 30, 35, 40, 50]
  const binLabels = ['0–10%', '10–15%', '15–20%', '20–25%', '25–30%', '30–35%', '35–40%', '40–50%', '50%+']
  const irrDist = binLabels.map((label, i) => ({
    label,
    count: managers.filter(m => {
      if (m.avg_irr === null) return false
      if (i === bins.length - 1) return m.avg_irr >= bins[i]
      return m.avg_irr >= bins[i] && m.avg_irr < bins[i + 1]
    }).length,
  }))

  // AUM top 20
  const aum20 = [...managers].filter(m => m.aum_usd_m).sort((a, b) => b.aum_usd_m - a.aum_usd_m).slice(0, 20)

  const reset = () => { setStrategy(''); setMinIRR(''); setMinTVPI(''); setMinPB('') }

  return (
    <div>
      <FilterBar>
        <FilterGroup label="Strategy">
          <Select value={strategy} onChange={setStrategy} style={{ minWidth: 100 }}>
            <option value="">All</option>
            <option value="MM">MM</option>
            <option value="LMM">LMM</option>
          </Select>
        </FilterGroup>
        <FilterGroup label="Min IRR">
          <Input value={minIRR} onChange={setMinIRR} placeholder="e.g. 20" type="number" style={{ width: 100 }} />
        </FilterGroup>
        <FilterGroup label="Min TVPI">
          <Input value={minTVPI} onChange={setMinTVPI} placeholder="e.g. 1.5" type="number" style={{ width: 100 }} />
        </FilterGroup>
        <FilterGroup label="Min PB Score">
          <Input value={minPB} onChange={setMinPB} placeholder="e.g. 60" type="number" style={{ width: 100 }} />
        </FilterGroup>
        <Button onClick={reset} variant="secondary">Reset</Button>
      </FilterBar>

      {loadingStats ? <Spinner /> : stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          <KpiCard label="Avg IRR" value={fmt(stats.avg_irr)} sub={`Median: ${fmt(stats.median_irr)}`} icon="📈" />
          <KpiCard label="Avg TVPI" value={fmtX(stats.avg_tvpi)} sub="Total value multiple" icon="💰" />
          <KpiCard label="Avg DPI" value={fmtX(stats.avg_dpi)} sub="Distributed value" icon="🏦" />
          <KpiCard label="Managers" value={stats.total_managers} sub={`With IRR data: ${stats.managers_with_irr}`} icon="🏢" />
          <KpiCard label="Total Funds" value={stats.total_funds} sub={`Vintages ${stats.vintage_range?.[0]}–${stats.vintage_range?.[1]}`} icon="📁" />
          <KpiCard label="Total AUM" value={fmtM(stats.total_aum_usd_m)} sub="Reported AUM" icon="💎" />
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <Card>
          <CardHeader title="🏆 Top Managers by Avg IRR" subtitle="Best risk-adjusted returns" badge={`Top ${topIRR.length}`} />
          {loadingMgrs ? <Spinner /> : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                <thead>
                  <tr>{['#','Manager','Avg IRR','Avg TVPI','Avg DPI','PB Score','Funds'].map(h => (
                    <th key={h} style={{ background:'var(--navy-light)', color:'var(--gold)', fontSize:'0.68rem', textTransform:'uppercase', letterSpacing:'0.8px', padding:'9px 12px', textAlign:'left', fontWeight:700, borderBottom:'1px solid var(--border)' }}>{h}</th>
                  ))}</tr>
                </thead>
                <tbody>
                  {topIRR.map((m, i) => (
                    <tr key={m.name} style={{ borderBottom: '1px solid rgba(201,168,76,0.05)' }}>
                      <Td><span style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', width:24, height:24, borderRadius:'50%', fontSize:'0.72rem', fontWeight:700, background: i===0?'linear-gradient(135deg,#FFD700,#B8860B)':i===1?'linear-gradient(135deg,#C0C0C0,#808080)':i===2?'linear-gradient(135deg,#CD7F32,#8B4513)':'var(--navy-light)', color: i<3?'#000':'var(--text-muted)' }}>{i+1}</span></Td>
                      <Td><strong style={{ color:'var(--gold-light)' }}>{m.name}</strong>{m.strategy && <><br/><span style={{ fontSize:'0.68rem', color:'var(--text-muted)' }}>{m.strategy}</span></>}</Td>
                      <Td><MetricPill value={fmt(m.avg_irr)} type="irr" /></Td>
                      <Td><MetricPill value={fmtX(m.avg_tvpi)} type="tvpi" /></Td>
                      <Td><MetricPill value={fmtX(m.avg_dpi)} type="dpi" /></Td>
                      <Td style={{ color:'#60a5fa', fontWeight:700 }}>{m.pb_score > 0 ? m.pb_score?.toFixed(1) : '—'}</Td>
                      <Td style={{ color:'var(--text-muted)' }}>{m.fund_count}</Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Card>
          <CardHeader title="📊 IRR Distribution" subtitle="Manager count by IRR bucket" />
          {loadingMgrs ? <Spinner /> : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={irrDist}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="label" tick={{ fill: '#8a9bb5', fontSize: 9 }} />
                <YAxis tick={{ fill: '#8a9bb5', fontSize: 10 }} />
                <Tooltip contentStyle={{ background: '#132040', border: '1px solid rgba(201,168,76,0.3)', borderRadius: 8 }} />
                <Bar dataKey="count" name="Managers" radius={[4, 4, 0, 0]}>
                  {irrDist.map((entry, i) => (
                    <Cell key={i} fill={i >= 4 ? 'rgba(201,168,76,0.85)' : 'rgba(201,168,76,0.35)'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <Card>
          <CardHeader title="💰 Top 10 by TVPI" badge="TVPI" />
          {loadingMgrs ? <Spinner /> : <TopTable metric="avg_tvpi" managers={managers} />}
        </Card>
        <Card>
          <CardHeader title="🏦 Top 10 by DPI" badge="DPI" />
          {loadingMgrs ? <Spinner /> : <TopTable metric="avg_dpi" managers={managers} />}
        </Card>
        <Card>
          <CardHeader title="⭐ Top 10 by PB Score" badge="Score" />
          {loadingMgrs ? <Spinner /> : <TopTable metric="pb_score" managers={managers} />}
        </Card>
      </div>

      <Card>
        <CardHeader title="🏛️ AUM Distribution — Top 20 Managers" subtitle="Total AUM in USD Millions" />
        {loadingMgrs ? <Spinner /> : (
          <ResponsiveContainer width="100%" height={380}>
            <BarChart data={aum20} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis type="number" tick={{ fill: '#8a9bb5', fontSize: 9 }} tickFormatter={v => '$' + (v / 1000).toFixed(0) + 'B'} />
              <YAxis dataKey="name" type="category" width={70} tick={{ fill: 'var(--gold)', fontSize: 9 }} />
              <Tooltip contentStyle={{ background: '#132040', border: '1px solid rgba(201,168,76,0.3)', borderRadius: 8 }}
                formatter={v => ['$' + v.toLocaleString() + 'M', 'AUM']} />
              <Bar dataKey="aum_usd_m" fill="rgba(201,168,76,0.5)" stroke="rgba(201,168,76,0.9)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Card>
    </div>
  )
}
