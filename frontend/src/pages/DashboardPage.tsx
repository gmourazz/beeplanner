import { useEffect, useState } from 'react';
import { Calendar, FileText, Star, Sprout, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme, PROFESSIONS } from '../contexts/ThemeContext';
import { Task, Note, ImportantDate, Habit } from '../types';
import api from '../services/api';

const MONTHS = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];

export default function DashboardPage() {
  const { user } = useAuth();
  const { profession } = useTheme();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [dates, setDates] = useState<ImportantDate[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);

  const today = new Date().toISOString().slice(0,10);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';

  useEffect(() => {
    api.get(`/tasks?date=${today}`).then(r => setTasks(r.data)).catch(()=>{});
    api.get('/notes').then(r => setNotes(r.data)).catch(()=>{});
    api.get('/dates').then(r => setDates(r.data)).catch(()=>{});
    api.get('/habits').then(r => setHabits(r.data)).catch(()=>{});
  }, []);

  const toggleTask = async (task: Task) => {
    const r = await api.put(`/tasks/${task.id}`, { ...task, done: !task.done });
    setTasks(prev => prev.map(t => t.id === task.id ? r.data : t));
  };

  const todayDone = tasks.filter(t => t.done).length;
  const profInfo = PROFESSIONS[profession as keyof typeof PROFESSIONS];
  const upcomingDates = dates.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()).slice(0,5);

  const card = { background: 'var(--surface)', borderRadius: '16px', padding: '20px', border: '1px solid var(--border)', transition: 'all 0.2s' };

  return (
    <div style={{ padding: '36px 40px', maxWidth: '1100px', animation: 'fadeIn 0.35s ease' }}>
      {/* Banner */}
      <div style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)', borderRadius: '20px', padding: '28px 36px', color: 'white', marginBottom: '28px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', right: '32px', top: '50%', transform: 'translateY(-50%)', fontSize: '64px', opacity: 0.2, animation: 'beePulse 4s infinite' }}>
          {profInfo?.icon || '🐝'}
        </div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', marginBottom: '6px' }}>
          {greeting}, {user?.name?.split(' ')[0]}! ✨
        </h2>
        <p style={{ opacity: 0.85, fontSize: '14px' }}>
          Hoje é {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
          {tasks.length > 0 && ` — ${todayDone}/${tasks.length} tarefas concluídas`}
        </p>
        {tasks.length > 0 && (
          <div style={{ marginTop: '14px', background: 'rgba(255,255,255,0.2)', borderRadius: '8px', height: '6px', width: '200px' }}>
            <div style={{ height: '100%', background: 'white', borderRadius: '8px', width: `${(todayDone/tasks.length)*100}%`, transition: 'width 0.5s ease' }} />
          </div>
        )}
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '28px' }}>
        {[
          { icon: <Calendar size={22} />, value: tasks.length, label: 'Tarefas hoje' },
          { icon: <CheckCircle size={22} />, value: todayDone, label: 'Concluídas' },
          { icon: <FileText size={22} />, value: notes.length, label: 'Notas' },
          { icon: <Sprout size={22} />, value: habits.length, label: 'Hábitos' },
        ].map((s, i) => (
          <div key={i} style={{ ...card, display: 'flex', flexDirection: 'column', gap: '8px' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 10px 30px var(--shadow)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.boxShadow = 'none'; }}>
            <div style={{ color: 'var(--primary)' }}>{s.icon}</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '32px', color: 'var(--primary-dark)', lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Two columns */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Today tasks */}
        <div style={card}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px', fontWeight: 600, marginBottom: '16px' }}>
            <Calendar size={16} style={{ color: 'var(--primary)' }} /> Tarefas de Hoje
          </h3>
          {tasks.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', padding: '20px 0' }}>Nenhuma tarefa para hoje 🌸</p>
          ) : tasks.map(task => (
            <div key={task.id} onClick={() => toggleTask(task)} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0', borderBottom: '1px solid var(--border)', cursor: 'pointer' }}>
              <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: `2px solid ${task.done ? 'var(--primary)' : 'var(--border)'}`, background: task.done ? 'var(--primary)' : 'transparent', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
                {task.done && <span style={{ color: 'white', fontSize: '10px' }}>✓</span>}
              </div>
              <span style={{ fontSize: '13.5px', textDecoration: task.done ? 'line-through' : 'none', opacity: task.done ? 0.5 : 1 }}>{task.text}</span>
              {task.priority === 'high' && <span style={{ marginLeft: 'auto', fontSize: '11px', background: '#FFE0E0', color: '#E87979', padding: '2px 8px', borderRadius: '6px' }}>alta</span>}
            </div>
          ))}
        </div>

        {/* Upcoming dates */}
        <div style={card}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px', fontWeight: 600, marginBottom: '16px' }}>
            <Star size={16} style={{ color: 'var(--accent)' }} /> Próximas Datas
          </h3>
          {upcomingDates.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', padding: '20px 0' }}>Nenhuma data cadastrada ⭐</p>
          ) : upcomingDates.map(d => {
            const dd = new Date(d.date + 'T00:00:00');
            return (
              <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                <div style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))', borderRadius: '10px', padding: '6px 10px', textAlign: 'center', minWidth: '48px', color: 'white' }}>
                  <div style={{ fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{MONTHS[dd.getMonth()]}</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '20px', lineHeight: 1 }}>{dd.getDate()}</div>
                </div>
                <div>
                  <div style={{ fontSize: '13.5px', fontWeight: 500 }}>{d.emoji} {d.title}</div>
                  <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>{dd.getFullYear()}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
