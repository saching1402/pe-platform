import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchTasks, createTask, updateTaskStatus, addComment } from '../utils/api'
import { Card, CardHeader, Button, StatusPill, Spinner, FilterGroup, Select } from '../components/ui'

const PRIORITY_COLOR = { high: '#ef4444', med: '#f59e0b', low: '#3dd68c' }

export default function Workflow() {
  const qc = useQueryClient()
  const [selectedId, setSelectedId] = useState(null)
  const [newComment, setNewComment] = useState('')
  const [commentAuthor, setCommentAuthor] = useState('You')
  const [filterStatus, setFilterStatus] = useState('')
  const [showNew, setShowNew] = useState(false)
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'med', assignee: '', status: 'open' })

  const { data, isLoading } = useQuery({
    queryKey: ['tasks', filterStatus],
    queryFn: () => fetchTasks(filterStatus ? { status: filterStatus } : {}),
  })

  const tasks = data?.results || []
  const selected = tasks.find(t => t.id === selectedId) || tasks[0]

  const updateStatus = useMutation({
    mutationFn: ({ id, status }) => updateTaskStatus(id, status),
    onSuccess: () => qc.invalidateQueries(['tasks']),
  })

  const postComment = useMutation({
    mutationFn: () => addComment(selected.id, commentAuthor || 'You', newComment),
    onSuccess: () => { setNewComment(''); qc.invalidateQueries(['tasks']) },
  })

  const createMutation = useMutation({
    mutationFn: () => createTask(newTask),
    onSuccess: () => { setShowNew(false); setNewTask({ title: '', description: '', priority: 'med', assignee: '', status: 'open' }); qc.invalidateQueries(['tasks']) },
  })

  const byStatus = (s) => tasks.filter(t => t.status === s)

  const inputStyle = { background: 'var(--navy-light)', border: '1px solid var(--border)', color: 'var(--text)', padding: '8px 12px', borderRadius: 8, fontSize: '0.82rem', outline: 'none', width: '100%' }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '1.5rem' }}>
      {/* Sidebar */}
      <div>
        <div style={{ background: 'var(--navy-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>📋 Task Board</div>
            <Select value={filterStatus} onChange={setFilterStatus} style={{ padding: '4px 8px', fontSize: '0.75rem' }}>
              <option value="">All</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="review">In Review</option>
              <option value="done">Done</option>
            </Select>
          </div>
          {isLoading ? <Spinner /> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {['open', 'in_progress', 'review', 'done'].map(s => {
                const st = byStatus(s)
                if (!st.length && filterStatus) return null
                return (
                  <div key={s}>
                    <div style={{ fontSize: '0.68rem', color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700, padding: '4px 0', marginBottom: 4 }}>
                      {s === 'in_progress' ? 'In Progress' : s.charAt(0).toUpperCase() + s.slice(1)}
                    </div>
                    {st.map(t => (
                      <div key={t.id} onClick={() => setSelectedId(t.id)}
                        style={{ background: t.id === selectedId ? 'rgba(201,168,76,0.08)' : 'transparent', border: `1px solid ${t.id === selectedId ? 'var(--gold)' : 'var(--border)'}`, borderRadius: 10, padding: '0.75rem 1rem', marginBottom: 6, cursor: 'pointer', transition: 'all 0.2s' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                          <span style={{ fontWeight: 700, fontSize: '0.82rem' }}>{t.title}</span>
                          <StatusPill status={t.status} />
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          <span style={{ color: PRIORITY_COLOR[t.priority] }}>● {t.priority.charAt(0).toUpperCase() + t.priority.slice(1)}</span>
                          {t.assignee && ` · ${t.assignee}`}
                        </div>
                      </div>
                    ))}
                    {!st.length && <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', padding: '0.5rem 0' }}>No tasks</div>}
                  </div>
                )
              })}
            </div>
          )}
          <button onClick={() => setShowNew(true)} style={{ background: 'linear-gradient(135deg, var(--gold), var(--gold-dark))', color: '#0a1628', border: 'none', padding: 10, borderRadius: 8, fontWeight: 700, cursor: 'pointer', width: '100%', marginTop: '1rem', fontSize: '0.82rem' }}>
            + New Task
          </button>
        </div>
      </div>

      {/* Main Panel */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {showNew && (
          <Card>
            <CardHeader title="Create New Task" actions={<Button onClick={() => setShowNew(false)} variant="secondary">✕</Button>} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <input value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} placeholder="Task title" style={inputStyle} />
              <textarea value={newTask.description} onChange={e => setNewTask({...newTask, description: e.target.value})} placeholder="Description..." style={{...inputStyle, minHeight: 80, resize: 'vertical'}} />
              <div style={{ display: 'flex', gap: 8 }}>
                <select value={newTask.priority} onChange={e => setNewTask({...newTask, priority: e.target.value})} style={{...inputStyle, width: 'auto'}}>
                  <option value="high">High Priority</option>
                  <option value="med">Medium Priority</option>
                  <option value="low">Low Priority</option>
                </select>
                <input value={newTask.assignee} onChange={e => setNewTask({...newTask, assignee: e.target.value})} placeholder="Assignee" style={inputStyle} />
              </div>
              <Button onClick={() => createMutation.mutate()}>Create Task</Button>
            </div>
          </Card>
        )}

        {selected ? (
          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{selected.title}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
                  {selected.assignee && `Assigned to ${selected.assignee} · `}
                  <span style={{ color: PRIORITY_COLOR[selected.priority] }}>● {selected.priority} priority</span>
                  {selected.manager_name && ` · ${selected.manager_name}`}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <StatusPill status={selected.status} />
                <select onChange={e => updateStatus.mutate({ id: selected.id, status: e.target.value })}
                  style={{ background: 'var(--navy-light)', border: '1px solid var(--border)', color: 'var(--text)', padding: '6px 10px', borderRadius: 6, fontSize: '0.78rem', cursor: 'pointer' }}>
                  <option value="">Move to…</option>
                  {['open','in_progress','review','done'].map(s => <option key={s} value={s}>{s === 'in_progress' ? 'In Progress' : s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                </select>
              </div>
            </div>
            {selected.description && (
              <div style={{ background: 'var(--navy-light)', borderRadius: 8, padding: '0.75rem 1rem', fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '1rem' }}>
                {selected.description}
              </div>
            )}
            <div style={{ fontSize: '0.72rem', color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 700, marginBottom: '0.75rem' }}>Discussion</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
              {selected.comments?.map(c => (
                <div key={c.id} style={{ background: 'var(--navy-light)', border: '1px solid var(--border)', borderRadius: 8, padding: '0.75rem 1rem' }}>
                  <div style={{ color: 'var(--gold)', fontWeight: 700, fontSize: '0.78rem', marginBottom: 4 }}>
                    {c.author} · {new Date(c.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{c.body}</div>
                </div>
              ))}
              {!selected.comments?.length && <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>No comments yet. Be the first!</div>}
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input value={commentAuthor} onChange={e => setCommentAuthor(e.target.value)} placeholder="Your name" style={{ ...inputStyle, width: 130 }} />
              <input value={newComment} onChange={e => setNewComment(e.target.value)} placeholder="Add a comment..." style={inputStyle}
                onKeyDown={e => e.key === 'Enter' && newComment.trim() && postComment.mutate()} />
              <Button onClick={() => newComment.trim() && postComment.mutate()}>Post</Button>
            </div>
          </Card>
        ) : (
          <Card><div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Select a task from the board to view details</div></Card>
        )}

        <Card>
          <CardHeader title="📝 Activity" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {tasks.slice(0, 6).map(t => (
              <div key={t.id} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ color: 'var(--gold)', fontSize: '1rem' }}>{t.status === 'done' ? '✅' : t.status === 'review' ? '👁️' : t.status === 'in_progress' ? '🔄' : '➕'}</span>
                <div style={{ fontSize: '0.8rem' }}>
                  <span style={{ color: 'var(--text)' }}>{t.assignee || 'Team'}</span>
                  <span style={{ color: 'var(--text-muted)' }}> · <strong style={{ color: 'var(--gold)' }}>{t.title}</strong> is {t.status.replace('_', ' ')} · {new Date(t.updated_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
