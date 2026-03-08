import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, Trash2 } from 'lucide-react';
import { Task } from '../types';
import api from '../services/api';

const DAYS = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];
const MONTHS = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

function getWeekDates(offset: number): Date[] {
  const today = new Date();
  const first = new Date(today);
  first.setDate(today.getDate() - today.getDay() + offset * 7);
  return Array.from({ length: 7 }, (_, i) => { const d = new Date(first); d.setDate(first.getDate() + i); return d; });
}

export default function WeeklyPage() {
  const [offset, setOffset] = useState(0);
  const [tasks, setTasks] = useState<Record<string, Task[]>>({});
  const [addingDay, setAddingDay] = useState<string | null>(null);
  const [newTask, setNewTask] = useState('');
  const [priority, setPriority] = useState<Task['priority']>('normal');
  const dates = getWeekDates(offset);
  const todayStr = new Date().toDateString();

  useEffect(() => {
    dates.forEach(d => {
      const key = d.toISOString().slice(0,10);
      api.get(`/tasks?date=${key}`).then(r => setTasks(prev => ({ ...prev, [key]: r.data }))).catch(()=>{});
    });
  }, [offset]);

  const addTask = async (day: string) => {
    if (!newTask.trim()) return;
    const r = await api.post('/tasks', { text: newTask, priority, scheduled_date: day });
    setTasks(prev => ({ ...prev, [day]: [...(prev[day] || []), r.data] }));
    setNewTask(''); setAddingDay(null);
  };

  const toggleTask = async (day: string, task: Task) => {
    const r = await api.put(`/tasks/${task.id}`, { ...task, done: !task.done });
    setTasks(prev => ({ ...prev, [day]: prev[day].map(t => t.id === task.id ? r.data : t) }));
  };

  const deleteTask = async (day: string, taskId: string) => {
    await api.delete(`/tasks/${taskId}`);
    setTasks(prev => ({ ...prev, [day]: prev[day].filter(t => t.id !== taskId) }));
  };

  const start = dates[0], end = dates[6];
  const weekLabel = `${start.getDate()} ${MONTHS[start.getMonth()].slice(0,3)} — ${end.getDate()} ${MONTHS[end.getMonth()].slice(0,3)} ${end.getFullYear()}`;

  const priorityColor = { low: '#A8E6C0', normal: 'var(--primary)', high: '#F4A5A5' };

  return (
    <div style={{ padding: '36px 40px', animation: 'fadeIn 0.35s ease' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '34px', color: 'var(--text)', fontStyle: 'italic' }}>Semana</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginTop: '12px' }}>
          <button onClick={() => setOffset(o => o-1)} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '8px 14px', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <ChevronLeft size={15} /> Anterior
          </button>
          <span style={{ fontWeight: 500, fontSize: '15px' }}>{weekLabel}</span>
          <button onClick={() => setOffset(o => o+1)} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '8px 14px', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            Próxima <ChevronRight size={15} />
          </button>
          <button onClick={() => setOffset(0)} style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '10px', padding: '8px 14px', color: 'var(--text-muted)', fontSize: '13px' }}>
            Hoje
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '12px' }}>
        {dates.map(d => {
          const key = d.toISOString().slice(0,10);
          const isToday = d.toDateString() === todayStr;
          const dayTasks = tasks[key] || [];

          return (
            <div key={key} style={{ background: 'var(--surface)', borderRadius: '16px', padding: '14px', border: `1.5px solid ${isToday ? 'var(--primary)' : 'var(--border)'}`, minHeight: '260px', boxShadow: isToday ? '0 0 0 3px var(--shadow)' : 'none', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div>
                <div style={{ fontSize: '10.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)' }}>{DAYS[d.getDay()]}</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '28px', color: isToday ? 'var(--primary-dark)' : 'var(--text)', lineHeight: 1.1 }}>{d.getDate()}</div>
              </div>

              {dayTasks.map(task => (
                <div key={task.id} style={{ fontSize: '12px', padding: '6px 8px', background: 'var(--surface2)', borderRadius: '8px', borderLeft: `3px solid ${priorityColor[task.priority]}`, cursor: 'pointer', display: 'flex', alignItems: 'flex-start', gap: '6px', textDecoration: task.done ? 'line-through' : 'none', opacity: task.done ? 0.55 : 1 }}
                  onClick={() => toggleTask(key, task)}>
                  <span style={{ flex: 1 }}>{task.text}</span>
                  <button onClick={e => { e.stopPropagation(); deleteTask(key, task.id); }} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', padding: 0, opacity: 0.5 }}><Trash2 size={10} /></button>
                </div>
              ))}

              {addingDay === key ? (
                <div style={{ marginTop: '4px' }}>
                  <input value={newTask} onChange={e => setNewTask(e.target.value)} onKeyDown={e => e.key === 'Enter' && addTask(key)} placeholder="Tarefa..." style={{ width: '100%', padding: '6px 8px', fontSize: '12px', marginBottom: '4px' }} autoFocus />
                  <select value={priority} onChange={e => setPriority(e.target.value as Task['priority'])} style={{ width: '100%', padding: '4px 6px', fontSize: '11px' }}>
                    <option value="low">🟢 Baixa</option>
                    <option value="normal">🌸 Normal</option>
                    <option value="high">🔴 Alta</option>
                  </select>
                  <div style={{ display: 'flex', gap: '4px', marginTop: '4px' }}>
                    <button onClick={() => addTask(key)} style={{ flex: 1, padding: '5px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '7px', fontSize: '11px' }}>+</button>
                    <button onClick={() => setAddingDay(null)} style={{ flex: 1, padding: '5px', background: 'var(--surface2)', color: 'var(--text-muted)', border: '1px solid var(--border)', borderRadius: '7px', fontSize: '11px' }}>✕</button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setAddingDay(key)} style={{ marginTop: 'auto', width: '100%', padding: '6px', background: 'transparent', border: '1.5px dashed var(--border)', borderRadius: '8px', color: 'var(--text-muted)', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                  <Plus size={12} /> tarefa
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
