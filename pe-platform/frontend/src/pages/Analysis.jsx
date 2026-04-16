import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, BarChart, Bar, Legend, Cell,
} from 'recharts'
import { fetchScatterData, fetchVintageStats } from '../utils/api'
import { Card, CardHeader, FilterBar, FilterGroup, Select, Input, Button, Spinner } from '../components/ui'

const CustomTooltip = ({ active, payload, xLabel, yLabel }) => {
  if (!active || !payload?.length) return null
  const d = payload[0]?.payload
  return (
    <div style={{ background: '#132040', border: '1px solid rgba(201,168,76,0.3)', borderRadius: 8, padding: '8px 12px', fontSize: '0.78rem' }}>
      <div style={{ color: 'var(--gold)', fontWeight: 700 }}>{d?.name}</div>
      {d?.strategy && <div style={{ color: 'var(--text-muted)' }}>Strategy: {d.strategy}</div>}
      <div>{xLabel}: <strong>{payload[0]?.value?.toFixed(2)}</strong></div>
      <div>{yLabel}: <strong>{payload[1]?.value?.toFixed(2)}</strong></div>
    </div>
  )
}

function ScatterPlot({ data, xKey, yKey, xLabel, yLabel }) {
  const byStrat = {}
  ;(data || []).forEach(d => {
    const k = d.strategy || 'Other'
    if (!byStrat[k]) byStrat[k] = []
    byStrat[k].push(d)
  })
  const colors = { MM: '#60a5fa', LMM: '#3dd68c', Other: '#c9a84c' }

  return (
    <ResponsiveContainer width="100%" height={380}>
      <ScatterChart>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
        <XAxis dataKey={xKey} name={xLabel} type="number" tick={{ fill: '#8a9bb5', fontSize: 10 }}
          label={{ value: xLabel, position: 'insideBottom', offset: -5, fill: '#8a9bb5', fontSize: 11 }} />
        <YAxis dataKey={yKey} name={yLabel} type="number" tick={{ fill: '#8a9bb5', fontSize: 10 }}
          label={{ value: yLabel, angle: -90, position: 'insideLeft', fill: '#8a9bb5', fontSize: 11 }} />
        <Tooltip content={<CustomTooltip xLabel={xLabel} yLabel={yLabel} />} />
        <Legend wrapperStyle={{ color: '#8a9bb5', fontSize: 11 }} />
        {Object.entries(byStrat).map(([strat, pts]) => (
          <Scatter key={strat} name={strat} data={pts} fill={colors[strat] || '#c9a84c'} fillOpacity={0.75} />
        ))}
      </ScatterChart>
    </ResponsiveContainer>
  )
}

export default function Analysis() {
  const [strategy, setStrategy] = useState('')
  const [minIRR, setMinIRR] = useState('')
  const [maxIRR, setMaxIRR] = useState('')

  const params = {
    ...(strategy && { strategy }),
    ...(minIRR && { min_irr: minIRR }),
    ...(maxIRR && { max_irr: maxIRR }),
  }

  const { data: scatter, isLoading: ls } = useQuery({
    queryKey: ['scatter', params],
    queryFn: () => fetchScatterData(params),
  })

  const { data: vintage, isLoading: lv } = useQuery({
    queryKey: ['vintage-stats'],
    queryFn: fetchVintageStats,
  })

  const reset = () => { setStrategy(''); setMinIRR(''); setMaxIRR('') }

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
        <FilterGroup label="Min IRR %">
          <Input value={minIRR} onChange={setMinIRR} placeholder="0" type="number" style={{ width: 90 }} />
        </FilterGroup>
        <FilterGroup label="Max IRR %">
          <Input value={maxIRR} onChange={setMaxIRR} placeholder="100" type="number" style={{ width: 90 }} />
        </FilterGroup>
        <Button onClick={reset} variant="secondary">Reset</Button>
        <div style={{ marginLeft: 'auto', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          <span style={{ color: '#60a5fa' }}>● MM</span>
          <span style={{ color: '#3dd68c', marginLeft: 12 }}>● LMM</span>
          <span style={{ color: 'var(--gold)', marginLeft: 12 }}>● Other</span>
        </div>
      </FilterBar>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <Card>
          <CardHeader title="Avg IRR vs Avg TVPI" subtitle="Higher IRR vs. total value generated" />
          {ls ? <Spinner /> : <ScatterPlot data={scatter?.map(d => ({ ...d, x: d.avg_irr, y: d.avg_tvpi }))} xKey="avg_irr" yKey="avg_tvpi" xLabel="Avg IRR (%)" yLabel="Avg TVPI (x)" />}
        </Card>
        <Card>
          <CardHeader title="Avg IRR vs PB Score" subtitle="Pitchbook manager quality vs performance" />
          {ls ? <Spinner /> : <ScatterPlot data={scatter?.filter(d => d.pb_score > 0).map(d => ({ ...d, x: d.avg_irr, y: d.pb_score }))} xKey="avg_irr" yKey="pb_score" xLabel="Avg IRR (%)" yLabel="PB Score" />}
        </Card>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <Card>
          <CardHeader title="Avg IRR vs Avg DPI" subtitle="Returns vs. capital distributed" />
          {ls ? <Spinner /> : <ScatterPlot data={scatter?.map(d => ({ ...d, x: d.avg_irr, y: d.avg_dpi }))} xKey="avg_irr" yKey="avg_dpi" xLabel="Avg IRR (%)" yLabel="Avg DPI (x)" />}
        </Card>
        <Card>
          <CardHeader title="TVPI vs DPI" subtitle="Total value vs. realized value" />
          {ls ? <Spinner /> : <ScatterPlot data={scatter?.map(d => ({ ...d, x: d.avg_tvpi, y: d.avg_dpi }))} xKey="avg_tvpi" yKey="avg_dpi" xLabel="Avg TVPI (x)" yLabel="Avg DPI (x)" />}
        </Card>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <Card>
          <CardHeader title="📅 IRR by Vintage Year" subtitle="Average fund IRR per vintage cohort" />
          {lv ? <Spinner /> : (
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={vintage?.filter(v => v.avg_irr !== null)}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="vintage" tick={{ fill: '#8a9bb5', fontSize: 10 }} />
                <YAxis tick={{ fill: '#8a9bb5', fontSize: 10 }} tickFormatter={v => v?.toFixed(0) + '%'} />
                <Tooltip contentStyle={{ background: '#132040', border: '1px solid rgba(201,168,76,0.3)', borderRadius: 8 }} formatter={v => [v?.toFixed(1) + '%', 'Avg IRR']} />
                <Line type="monotone" dataKey="avg_irr" stroke="var(--gold)" strokeWidth={2} dot={{ fill: 'var(--gold)', r: 4 }} activeDot={{ r: 7 }} name="Avg IRR (%)" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </Card>
        <Card>
          <CardHeader title="📅 TVPI & DPI by Vintage Year" subtitle="Average multiples per vintage cohort" />
          {lv ? <Spinner /> : (
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={vintage}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="vintage" tick={{ fill: '#8a9bb5', fontSize: 10 }} />
                <YAxis tick={{ fill: '#8a9bb5', fontSize: 10 }} tickFormatter={v => v?.toFixed(1) + 'x'} />
                <Tooltip contentStyle={{ background: '#132040', border: '1px solid rgba(201,168,76,0.3)', borderRadius: 8 }} formatter={v => [v?.toFixed(2) + 'x']} />
                <Legend wrapperStyle={{ color: '#8a9bb5', fontSize: 11 }} />
                <Bar dataKey="avg_tvpi" name="Avg TVPI" fill="rgba(61,214,140,0.55)" stroke="rgba(61,214,140,0.9)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="avg_dpi" name="Avg DPI" fill="rgba(96,165,250,0.55)" stroke="rgba(96,165,250,0.9)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>
    </div>
  )
}
