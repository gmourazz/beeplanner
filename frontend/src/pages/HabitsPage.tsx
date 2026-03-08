import { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Habit } from '../types';
import api from '../services/api';

const HABIT_ICONS = ['💧','🧘','📚','🏋️','🥗','😴','✍️','🏃','🎯','💊','🛁','📵','🌅','🍎','⭐'];

export default function HabitsPage() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('💧');

  useEffect(() => { api.get('/habits').then(r => setHabits(r.data)).catch(()=>{}); }, []);

  const add = async () => {
    if (!name.trim()) return;
    const r = await api.post('/habits', { name, icon });
    setHabits(prev => [...prev, { ...r.data, logs: [] }]);
    setName(''); setAdding(false);
  };

  const toggle = async (habit: Habit, date: string) => {
    const r = await api.post(`/habits/${habit.id}/toggle`, { date });
    setHabits(prev => prev.map(h => h.id === habit.id ? { ...h, logs: r.data.done ? [...h.logs, date] : h.logs.filter(l => l !== date) } : h));
  };

  const del = async (id: string) => {
    if (!confirm('Deletar hábito?')) return;
    await api.delete(`/habits/${id}`);
    setHabits(prev => prev.filter(h => h.id !== id));
  };

  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - 6 + i);
    return d.toISOString().slice(0, 10);
  });
  const dayNames = last7.map(d => new Date(d + 'T00:00:00').toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.',''));

  return (
    <div style={{ padding: '36px 40px', animation: 'fadeIn 0.35s ease' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '34px', fontStyle: 'italic' }}>Hábitos</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>Acompanhe seus hábitos diários dos últimos 7 dias</p>
        </div>
        <button onClick={() => setAdding(!adding)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 600, fontSize: '14px' }}>
          <Plus size={16} /> Novo Hábito
        </button>
      </div>

      {adding && (
        <div style={{ background: 'var(--surface)', borderRadius: '16px', padding: '20px', border: '1px solid var(--border)', marginBottom: '20px', animation: 'fadeIn 0.2s ease' }}>
          <h3 style={{ fontWeight: 600, marginBottom: '14px', fontSize: '15px' }}>Novo Hábito</h3>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '14px' }}>
            <input value={name} onChange={e => setName(e.target.value)} onKeyDown={e => e.key === 'Enter' && add()} placeholder="Ex: Beber 2L de água..." style={{ flex: 1, padding: '10px 14px' }} autoFocus />
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '14px' }}>
            {HABIT_ICONS.map(i => (
              <div key={i} onClick={() => setIcon(i)} style={{ width: '36px', height: '36px', borderRadius: '10px', background: icon === i ? 'var(--surface2)' : 'transparent', border: `2px solid ${icon === i ? 'var(--primary)' : 'var(--border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '18px' }}>{i}</div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={add} style={{ padding: '10px 20px', background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 600 }}>Criar</button>
            <button onClick={() => setAdding(false)} style={{ padding: '10px 20px', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--text-muted)' }}>Cancelar</button>
          </div>
        </div>
      )}

      {habits.length === 0 && !adding && (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>🌱</div>
          <p>Nenhum hábito ainda. Que tal criar um?</p>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {/* Header row */}
        {habits.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', paddingLeft: '60px' }}>
            <div style={{ flex: 1 }} />
            <div style={{ display: 'flex', gap: '8px' }}>
              {dayNames.map((d, i) => (
                <div key={i} style={{ width: '38px', textAlign: 'center', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)' }}>{d}</div>
              ))}
            </div>
            <div style={{ width: '28px' }} />
          </div>
        )}
        {habits.map(habit => {
          const doneCount = last7.filter(d => habit.logs.includes(d)).length;
          return (
            <div key={habit.id} style={{ background: 'var(--surface)', borderRadius: '16px', padding: '16px 20px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'var(--surface2)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', flexShrink: 0 }}>{habit.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 500, fontSize: '15px' }}>{habit.name}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>{doneCount}/7 dias esta semana</div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                {last7.map(date => {
                  const done = habit.logs.includes(date);
                  const isToday = date === new Date().toISOString().slice(0,10);
                  return (
                    <div key={date} onClick={() => toggle(habit, date)} style={{ width: '38px', height: '38px', borderRadius: '10px', border: `2px solid ${isToday ? 'var(--primary)' : 'var(--border)'}`, background: done ? 'var(--primary)' : 'var(--surface2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', fontSize: '16px' }}>
                      {done && <span style={{ color: 'white', fontSize: '14px' }}>✓</span>}
                    </div>
                  );
                })}
              </div>
              <button onClick={() => del(habit.id)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', padding: '6px' }}><Trash2 size={15} /></button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
