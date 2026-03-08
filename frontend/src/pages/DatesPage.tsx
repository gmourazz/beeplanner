import { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { ImportantDate } from '../types';
import api from '../services/api';

const MONTHS_SHORT = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];

export function DatesPage() {
  const [dates, setDates] = useState<ImportantDate[]>([]);
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [emoji, setEmoji] = useState('⭐');
  const [repeat, setRepeat] = useState(false);
  const EMOJIS = ['🎂','💼','❤️','🎉','📚','🏥','✈️','⭐','🏆','🎓','💕','🌸'];

  useEffect(() => { api.get('/dates').then(r => setDates(r.data)).catch(()=>{}); }, []);

  const add = async () => {
    if (!title.trim() || !date) return;
    const r = await api.post('/dates', { title, date, emoji, repeat_yearly: repeat });
    setDates(prev => [...prev, r.data].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
    setTitle(''); setDate(''); setAdding(false);
  };

  const del = async (id: string) => {
    await api.delete(`/dates/${id}`);
    setDates(prev => prev.filter(d => d.id !== id));
  };

  return (
    <div style={{ padding: '36px 40px', animation: 'fadeIn 0.35s ease' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '34px', fontStyle: 'italic' }}>Datas Importantes</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>Aniversários, eventos e lembretes especiais</p>
        </div>
        <button onClick={() => setAdding(!adding)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 600, fontSize: '14px' }}>
          <Plus size={16} /> Adicionar
        </button>
      </div>

      {adding && (
        <div style={{ background: 'var(--surface)', borderRadius: '16px', padding: '20px', border: '1px solid var(--border)', marginBottom: '20px', animation: 'fadeIn 0.2s ease' }}>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Ex: Aniversário da mamãe 🎂" style={{ flex: 1, padding: '10px 14px' }} autoFocus />
            <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ padding: '10px 14px' }} />
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
            {EMOJIS.map(e => (
              <div key={e} onClick={() => setEmoji(e)} style={{ width: '36px', height: '36px', borderRadius: '10px', border: `2px solid ${emoji === e ? 'var(--primary)' : 'var(--border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '18px' }}>{e}</div>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <input type="checkbox" id="repeat" checked={repeat} onChange={e => setRepeat(e.target.checked)} style={{ width: '16px', height: '16px' }} />
            <label htmlFor="repeat" style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Repetir todo ano</label>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={add} style={{ padding: '10px 20px', background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 600 }}>Salvar</button>
            <button onClick={() => setAdding(false)} style={{ padding: '10px 20px', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--text-muted)' }}>Cancelar</button>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {dates.length === 0 && !adding && (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>⭐</div>
            <p>Nenhuma data cadastrada ainda</p>
          </div>
        )}
        {dates.map(d => {
          const dd = new Date(d.date + 'T00:00:00');
          return (
            <div key={d.id} style={{ background: 'var(--surface)', borderRadius: '14px', padding: '16px 20px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '16px', transition: 'all 0.2s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateX(4px)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--primary)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateX(0)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; }}>
              <div style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))', borderRadius: '12px', padding: '8px 14px', textAlign: 'center', minWidth: '56px', color: 'white', flexShrink: 0 }}>
                <div style={{ fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>{MONTHS_SHORT[dd.getMonth()]}</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '24px', lineHeight: 1 }}>{dd.getDate()}</div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 500, fontSize: '15px' }}>{d.title}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>{dd.getFullYear()} {d.repeat_yearly && '· Repete todo ano'}</div>
              </div>
              <div style={{ fontSize: '28px' }}>{d.emoji}</div>
              <button onClick={() => del(d.id)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', padding: '6px' }}><Trash2 size={15} /></button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
