import { useState, useEffect } from 'react';
import { Calendar, FileText, Star, Sprout, CheckCircle2, Circle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme, PROFESSIONS } from '../contexts/ThemeContext';
import { useTasks } from '@/hooks/usetask';
import { useDates } from '@/hooks/usedates';
import { useHabits } from '@/hooks/usehabits';
import { noteService } from '@/services';
import { taskService } from '../services/taskService';
import { quoteService } from '@/services';
import type { Quote } from '@/types';
import type { Note } from '../types/note';
import type { Task } from '../types/task';
import type { ProfessionTheme } from '../types/user';

const MONTHS = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
const DAYS_PT = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];

const FALLBACK_FRASES = [
  { text: 'Cada pequeno passo conta. Você está construindo algo incrível.', reference: '— Para você 🌸' },
  { text: 'Progresso, não perfeição. Um dia de cada vez.', reference: '— Lembre-se ✨' },
  { text: 'A disciplina é a ponte entre metas e realizações.', reference: '— Jim Rohn 🍯' },
  { text: 'Você é mais capaz do que imagina. Siga em frente.', reference: '— Para você 💛' },
  { text: 'Foque no que você pode controlar. O resto vem.', reference: '— Estoicismo 🌿' },
];

function getWeekDays() {
  const today = new Date();
  const day = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - day + (day === 0 ? -6 : 1));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { profession } = useTheme();
  const todayStr = new Date().toISOString().slice(0, 10);

  const { tasks, toggle } = useTasks(todayStr);
  const { dates } = useDates();
  const { habits } = useHabits();

  const [notes, setNotes] = useState<Note[]>([]);
  const [weekTasks, setWeekTasks] = useState<Record<string, Task[]>>({});
  const [quote, setQuote] = useState<Quote | null>(null);
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());

  const weekDays = getWeekDays();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';
  const todayDone = tasks.filter(t => t.done).length;
  const todayPending = tasks.filter(t => !t.done);
  const pct = tasks.length > 0 ? Math.round((todayDone / tasks.length) * 100) : 0;
  const profInfo = PROFESSIONS[profession as ProfessionTheme];

  const upcomingDates = [...dates]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 4);

  const fallback = FALLBACK_FRASES[new Date().getDay() % FALLBACK_FRASES.length];
  const fraseText = quote?.text ?? fallback.text;
  const fraseRef  = quote ? (quote.reference || '') : fallback.reference;

  useEffect(() => {
    noteService.getAll().then(setNotes).catch(() => {});
    quoteService.getToday().then(setQuote).catch(() => {});

    Promise.all(
      weekDays.map(d => {
        const ds = d.toISOString().slice(0, 10);
        return taskService.getAll(ds)
          .then(t => ({ date: ds, tasks: t }))
          .catch(() => ({ date: ds, tasks: [] }));
      })
    ).then(results => {
      const map: Record<string, Task[]> = {};
      results.forEach(r => { map[r.date] = r.tasks; });
      setWeekTasks(map);
    });
  }, []);

  const toggleDay = (date: string) =>
    setExpandedDays(prev => { const n = new Set(prev); n.has(date) ? n.delete(date) : n.add(date); return n; });

  const s: Record<string, React.CSSProperties> = {
    page:         { padding: '40px 52px', maxWidth: '1200px', animation: 'fadeIn 0.4s ease' },
    card:         { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '18px', padding: '22px' },
    cardTitle:    { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 700, color: 'var(--text)', marginBottom: '16px' },
    cardBadge:    { marginLeft: 'auto', fontSize: '11px', background: 'var(--surface2)', color: 'var(--text-muted)', padding: '2px 10px', borderRadius: '20px', fontWeight: 600 },
    emptyState:   { textAlign: 'center' as const, color: 'var(--text-muted)', fontSize: '13px', padding: '24px 0' },
    taskRow:      { display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 0', borderBottom: '1px solid var(--border)', cursor: 'pointer', transition: 'opacity 0.15s' },
    habitRow:     { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid var(--border)' },
    dateRow:      { display: 'flex', alignItems: 'center', gap: '12px', padding: '9px 0', borderBottom: '1px solid var(--border)' },
    dateBadge:    { width: '42px', height: '42px', borderRadius: '12px', background: 'linear-gradient(135deg,var(--primary),var(--primary-dark))', display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0 },
    weekGrid:     { display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: '10px' },
    progressBar:  { height: '5px', background: 'var(--surface2)', borderRadius: '99px', overflow: 'hidden' },
    progressFill: { height: '100%', background: 'linear-gradient(90deg,var(--primary),var(--primary-dark))', borderRadius: '99px', transition: 'width 0.6s ease' },
  };

  return (
    <div style={s.page}>

      {/* ── HERO: saudação + widget frase ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '20px', alignItems: 'center', marginBottom: '28px' }}>

        {/* Saudação */}
        <div>
          <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '2.5px', textTransform: 'uppercase' as const, color: 'var(--primary-dark)', opacity: 0.65, display: 'block', marginBottom: '6px' }}>
            {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </span>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '38px', fontWeight: 800, color: 'var(--text)', lineHeight: 1.05, marginBottom: '16px' }}>
            {greeting}, {user?.name?.split(' ')[0]} {profInfo?.icon || '🐝'}
          </h1>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' as const }}>
            {[
              { icon: <Calendar size={13}/>,     value: tasks.length,  label: 'tarefas hoje', color: '#F4A5B8' },
              { icon: <CheckCircle2 size={13}/>, value: todayDone,     label: 'concluídas',   color: '#A8D5A2' },
              { icon: <FileText size={13}/>,     value: notes.length,  label: 'notas',        color: '#C3B8F5' },
              { icon: <Sprout size={13}/>,       value: habits.length, label: 'hábitos',      color: '#F9C784' },
            ].map((st, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '7px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '30px', padding: '7px 14px' }}>
                <span style={{ color: st.color }}>{st.icon}</span>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '15px', fontWeight: 800, color: 'var(--text)' }}>{st.value}</span>
                <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>{st.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Widget frase do dia */}
        <div style={{ position: 'relative', height: '180px', borderRadius: '24px', overflow: 'hidden', background: 'linear-gradient(145deg, #fce8ee 0%, #fdf3ea 100%)', border: '1px solid var(--border)' }}>
          <svg style={{ position: 'absolute', left: 0, bottom: 0, opacity: 0.6 }} width="120" height="140" viewBox="0 0 120 140" fill="none">
            <path d="M-20 140 C10 100 0 60 30 40 C60 20 80 60 60 100 C40 140 0 140 -20 140Z" fill="#E8A0B0" opacity="0.5"/>
            <path d="M-10 140 C5 110 20 80 10 50 C0 20 -30 40 -30 80 C-30 120 -20 140 -10 140Z" fill="#C97D95" opacity="0.4"/>
          </svg>
          <svg style={{ position: 'absolute', right: -10, top: -10, opacity: 0.3 }} width="80" height="80" viewBox="0 0 80 80">
            <circle cx="60" cy="20" r="40" fill="#F4A5B8"/>
          </svg>
          <div style={{ position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px 28px', textAlign: 'center' }}>
            <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase' as const, color: 'var(--primary-dark)', opacity: 0.6, marginBottom: '10px', display: 'block' }}>Frase do dia</span>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '14.5px', fontWeight: 600, color: '#5C3347', lineHeight: 1.55, marginBottom: '10px', fontStyle: 'italic' as const }}>
              "{fraseText}"
            </p>
            {fraseRef && <span style={{ fontSize: '11px', color: 'var(--primary-dark)', fontWeight: 600, opacity: 0.75 }}>{fraseRef}</span>}
          </div>
        </div>
      </div>

      {/* ── TAREFAS DA SEMANA ── */}
      <div style={{ ...s.card, marginBottom: '18px' }}>
        <div style={{ ...s.cardTitle, marginBottom: '14px' }}>
          <Calendar size={14} style={{ color: 'var(--primary)' }}/> Tarefas da semana
          {tasks.length > 0 && <span style={s.cardBadge}>{pct}% hoje</span>}
        </div>
        <div style={s.weekGrid}>
          {weekDays.map(d => {
            const ds = d.toISOString().slice(0,10);
            const isToday = ds === todayStr;
            const dayTasks = isToday ? tasks : (weekTasks[ds] || []);
            const expanded = expandedDays.has(ds);
            const visible = expanded ? dayTasks : dayTasks.slice(0,3);
            const hidden = dayTasks.length - 3;
            return (
              <div key={ds}
                style={{ background: isToday ? 'linear-gradient(155deg,var(--primary),var(--primary-dark))' : 'var(--surface2)', borderRadius: '14px', padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: '8px', minHeight: '130px', border: isToday ? 'none' : '1px solid var(--border)', cursor: hidden > 0 ? 'pointer' : 'default', transition: 'all 0.2s' }}
                onClick={() => hidden > 0 && toggleDay(ds)}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', paddingBottom: '8px', borderBottom: `1px solid ${isToday ? 'rgba(255,255,255,0.25)' : 'var(--border)'}` }}>
                  <span style={{ fontSize: '9.5px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' as const, color: isToday ? 'rgba(255,255,255,0.8)' : 'var(--text-muted)' }}>{DAYS_PT[d.getDay()]}</span>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: '21px', fontWeight: 800, color: isToday ? 'white' : 'var(--text)', lineHeight: 1 }}>{d.getDate()}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', flex: 1 }}>
                  {visible.length === 0
                    ? <span style={{ fontSize: '10px', color: isToday ? 'rgba(255,255,255,0.35)' : 'var(--border)', textAlign: 'center', marginTop: '10px' }}>—</span>
                    : visible.map(t => (
                      <span key={t.id} style={{ fontSize: '11px', color: isToday ? (t.done ? 'rgba(255,255,255,0.45)' : 'white') : (t.done ? 'var(--text-muted)' : 'var(--text)'), textDecoration: t.done ? 'line-through' : 'none', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>· {t.text}</span>
                    ))
                  }
                  {!expanded && hidden > 0 && <span style={{ fontSize: '10.5px', fontWeight: 700, color: isToday ? 'rgba(255,255,255,0.65)' : 'var(--text-muted)', marginTop: '2px' }}>+{hidden} mais</span>}
                  {expanded && hidden > 0 && <span style={{ fontSize: '10.5px', fontWeight: 700, color: isToday ? 'rgba(255,255,255,0.65)' : 'var(--text-muted)' }}>ver menos ↑</span>}
                </div>
              </div>
            );
          })}
        </div>

        {/* Progresso visual */}
        {tasks.length > 0 && (
          <div style={{ marginTop: '20px', padding: '16px 18px', background: 'var(--surface2)', borderRadius: '14px', display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ position: 'relative', width: '56px', height: '56px', flexShrink: 0 }}>
              <svg width="56" height="56" viewBox="0 0 56 56" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="28" cy="28" r="22" fill="none" stroke="var(--border)" strokeWidth="5"/>
                <circle cx="28" cy="28" r="22" fill="none" stroke="var(--primary-dark)" strokeWidth="5"
                  strokeDasharray={`${2 * Math.PI * 22}`}
                  strokeDashoffset={`${2 * Math.PI * 22 * (1 - todayDone / tasks.length)}`}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dashoffset 0.6s ease' }}/>
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: '13px', fontWeight: 800, color: 'var(--primary-dark)' }}>
                {pct}%
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--text)' }}>Progresso de hoje</span>
                <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>{todayDone} de {tasks.length} tarefas</span>
              </div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' as const }}>
                {tasks.map(t => (
                  <div key={t.id} title={t.text}
                    style={{ width: '28px', height: '28px', borderRadius: '50%', background: t.done ? 'linear-gradient(135deg,var(--primary),var(--primary-dark))' : 'var(--surface)', border: `2px solid ${t.done ? 'var(--primary)' : 'var(--border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s' }}>
                    {t.done && <span style={{ color: 'white', fontSize: '11px' }}>✓</span>}
                  </div>
                ))}
                <div style={{ display: 'flex', alignItems: 'center', marginLeft: '4px' }}>
                  <span style={{ fontSize: '11.5px', color: 'var(--primary-dark)', fontWeight: 600, fontStyle: 'italic' as const }}>
                    {pct === 100 ? '🎉 Tudo feito!' : pct >= 50 ? '🌸 Ótimo ritmo!' : '💪 Você consegue!'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── 3 colunas ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '18px', marginBottom: '18px' }}>

        {/* Pendentes */}
        <div style={s.card}>
          <div style={s.cardTitle}><Circle size={14} style={{ color: 'var(--primary)' }}/> Pendentes hoje <span style={s.cardBadge}>{todayPending.length}</span></div>
          {todayPending.length === 0
            ? <div style={s.emptyState}>Tudo em dia! 🌸</div>
            : todayPending.slice(0,5).map(task => (
              <div key={task.id} style={s.taskRow}
                onClick={() => toggle(task)}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity='0.65'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity='1'}>
                <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: '2px solid var(--border)', flexShrink: 0 }}/>
                <span style={{ fontSize: '13px', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{task.text}</span>
                {task.priority === 'high' && <span style={{ fontSize: '10px', background: '#FFE8EE', color: '#E8799A', padding: '2px 7px', borderRadius: '20px', fontWeight: 700, flexShrink: 0 }}>!</span>}
              </div>
            ))
          }
        </div>

        {/* Hábitos */}
        <div style={s.card}>
          <div style={s.cardTitle}><Sprout size={14} style={{ color: 'var(--primary)' }}/> Hábitos <span style={s.cardBadge}>{habits.length} ativos</span></div>
          {habits.length === 0
            ? <div style={s.emptyState}>Nenhum hábito 🌱</div>
            : habits.slice(0,5).map(h => (
              <div key={h.id} style={s.habitRow}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '16px' }}>{h.emoji ||'🌿'}</span>
                  <span style={{ fontSize: '12.5px', color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const, maxWidth: '90px' }}>{h.name}</span>
                </div>
                <div style={{ display: 'flex', gap: '3px' }}>
                  {Array.from({ length: 7 }).map((_,i) => (
                    <div key={i} style={{ width: '7px', height: '7px', borderRadius: '50%', background: i < (h.streak || 0) % 8 ? 'var(--primary)' : 'var(--border)' }}/>
                  ))}
                </div>
              </div>
            ))
          }
        </div>

        {/* Datas */}
        <div style={s.card}>
          <div style={s.cardTitle}><Star size={14} style={{ color: 'var(--accent)' }}/> Próximas datas</div>
          {upcomingDates.length === 0
            ? <div style={s.emptyState}>Nenhuma data ⭐</div>
            : upcomingDates.map(d => {
              const dd = new Date(d.date + 'T00:00:00');
              return (
                <div key={d.id} style={s.dateRow}>
                  <div style={s.dateBadge}>
                    <span style={{ fontSize: '8px', textTransform: 'uppercase' as const, opacity: 0.85, letterSpacing: '0.5px' }}>{MONTHS[dd.getMonth()]}</span>
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: '17px', fontWeight: 800, lineHeight: 1 }}>{dd.getDate()}</span>
                  </div>
                  <div style={{ overflow: 'hidden' }}>
                    <div style={{ fontSize: '13px', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{d.emoji} {d.title}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{dd.getFullYear()}</div>
                  </div>
                </div>
              );
            })
          }
        </div>
      </div>

      {/* Notas */}
      {notes.length > 0 && (
        <div style={s.card}>
          <div style={s.cardTitle}><FileText size={14} style={{ color: 'var(--primary)' }}/> Notas recentes <span style={s.cardBadge}>{notes.length} notas</span></div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '10px' }}>
            {notes.slice(0,6).map(n => (
              <div key={n.id}
                style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px 16px', cursor: 'pointer', transition: 'all 0.15s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor='var(--primary)'; (e.currentTarget as HTMLElement).style.transform='translateY(-2px)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor='var(--border)'; (e.currentTarget as HTMLElement).style.transform='none'; }}>
                <div style={{ fontWeight: 700, fontSize: '12.5px', marginBottom: '5px', color: 'var(--primary-dark)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{n.title || 'Sem título'}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const, overflow: 'hidden' }}>{n.content?.slice(0,80) || '—'}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}