import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Task, ImportantDate } from '../types';
import api from '../services/api';

const MONTHS = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
const DAYS = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];

export default function MonthlyPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [dates, setDates] = useState<ImportantDate[]>([]);

  useEffect(() => {
    api.get('/tasks').then(r => setTasks(r.data)).catch(()=>{});
    api.get('/dates').then(r => setDates(r.data)).catch(()=>{});
  }, []);

  const changeMonth = (dir: number) => {
    let m = month + dir, y = year;
    if (m > 11) { m = 0; y++; } if (m < 0) { m = 11; y--; }
    setMonth(m); setYear(y);
  };

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();

  const getDayTasks = (d: number) => {
    const key = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    return tasks.filter(t => t.scheduled_date === key);
  };
  const getDayDates = (d: number) => dates.filter(dt => {
    const dd = new Date(dt.date + 'T00:00:00');
    return dd.getDate() === d && dd.getMonth() === month;
  });

  return (
    <div style={{ padding: '36px 40px', animation: 'fadeIn 0.35s ease' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '28px' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '34px', fontStyle: 'italic' }}>Calendário</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginLeft: '16px' }}>
          <button onClick={() => changeMonth(-1)} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '8px 12px', color: 'var(--text)' }}><ChevronLeft size={15} /></button>
          <span style={{ fontWeight: 600, fontSize: '18px', minWidth: '180px', textAlign: 'center' }}>{MONTHS[month]} {year}</span>
          <button onClick={() => changeMonth(1)} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '8px 12px', color: 'var(--text)' }}><ChevronRight size={15} /></button>
          <button onClick={() => { setMonth(now.getMonth()); setYear(now.getFullYear()); }} style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '10px', padding: '8px 14px', color: 'var(--text-muted)', fontSize: '13px' }}>Hoje</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', background: 'var(--border)', borderRadius: '16px', overflow: 'hidden' }}>
        {DAYS.map(d => (
          <div key={d} style={{ background: 'var(--surface)', padding: '10px', textAlign: 'center', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)' }}>{d}</div>
        ))}
        {Array.from({ length: firstDay }, (_, i) => (
          <div key={`e${i}`} style={{ background: 'var(--surface2)', minHeight: '90px', opacity: 0.4 }} />
        ))}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const d = i + 1;
          const isToday = d === today.getDate() && month === today.getMonth() && year === today.getFullYear();
          const dayTasks = getDayTasks(d);
          const dayDates = getDayDates(d);
          return (
            <div key={d} style={{ background: 'var(--surface)', minHeight: '90px', padding: '10px', cursor: 'pointer', transition: 'background 0.15s', border: isToday ? '2px solid var(--primary)' : 'none' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--surface2)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'var(--surface)'}>
              <div style={{ fontWeight: 600, fontSize: '13px', color: isToday ? 'var(--primary-dark)' : 'var(--text)', marginBottom: '6px' }}>{d}</div>
              {dayTasks.slice(0,2).map(t => (
                <div key={t.id} style={{ fontSize: '11px', padding: '2px 6px', background: 'var(--primary)', color: 'white', borderRadius: '6px', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', opacity: t.done ? 0.6 : 1 }}>{t.text}</div>
              ))}
              {dayDates.map(dt => (
                <div key={dt.id} style={{ fontSize: '11px', padding: '2px 6px', background: 'var(--accent)', borderRadius: '6px', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{dt.emoji} {dt.title}</div>
              ))}
              {dayTasks.length > 2 && <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>+{dayTasks.length-2}</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
