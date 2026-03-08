import { useState, useEffect, useCallback } from "react";
import { Plus, Star, Trash } from "lucide-react";
import { Page, Note, Task } from "../types";
import api from "../services/api";

interface Props {
  page: Page;
  onUpdate: (p: Page) => void;
}

const PAGE_TYPES: { value: Page["page_type"]; label: string; icon: string }[] =
  [
    { value: "note", label: "Nota", icon: "📝" },
    { value: "weekly", label: "Semana", icon: "📅" },
    { value: "kanban", label: "Kanban", icon: "📋" },
  ];

const NOTE_COLORS = [
  "#FFF0EC",
  "#FFF5E0",
  "#E8F5E9",
  "#E3F2FD",
  "#F3E5F5",
  "#FCE4EC",
];

export default function PageEditor({ page, onUpdate }: Props) {
  const [title, setTitle] = useState(page.title);
  const [notes, setNotes] = useState<Note[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newNote, setNewNote] = useState({
    title: "",
    body: "",
    color: "#FFF0EC",
  });
  const [addingNote, setAddingNote] = useState(false);
  const [newTask, setNewTask] = useState("");

  useEffect(() => {
    setTitle(page.title);
    if (page.page_type === "note")
      api
        .get(`/notes`)
        .then((r) =>
          setNotes(
            r.data.filter(
              (n: Note) =>
                (n as Note & { page_id: string }).page_id === page.id,
            ),
          ),
        )
        .catch(() => {});
    if (page.page_type === "weekly")
      api
        .get(`/tasks`)
        .then((r) =>
          setTasks(
            r.data.filter(
              (t: Task) =>
                (t as Task & { page_id: string }).page_id === page.id,
            ),
          ),
        )
        .catch(() => {});
  }, [page.id]);

  const saveTitle = useCallback(
    async (t: string) => {
      const r = await api.put(`/pages/${page.id}`, { ...page, title: t });
      onUpdate(r.data);
    },
    [page],
  );

  const addNote = async () => {
    if (!newNote.title && !newNote.body) return;
    const r = await api.post("/notes", { ...newNote, page_id: page.id });
    setNotes((prev) => [r.data, ...prev]);
    setNewNote({ title: "", body: "", color: "#FFF0EC" });
    setAddingNote(false);
  };

  const deleteNote = async (id: string) => {
    await api.delete(`/notes/${id}`);
    setNotes((prev) => prev.filter((n) => n.id !== id));
  };

  const addTask = async () => {
    if (!newTask.trim()) return;
    const r = await api.post("/tasks", { text: newTask, page_id: page.id });
    setTasks((prev) => [...prev, r.data]);
    setNewTask("");
  };

  const toggleTask = async (task: Task) => {
    const r = await api.put(`/tasks/${task.id}`, { ...task, done: !task.done });
    setTasks((prev) => prev.map((t) => (t.id === task.id ? r.data : t)));
  };

  const toggleFav = async () => {
    const r = await api.put(`/pages/${page.id}`, {
      ...page,
      is_favorite: !page.is_favorite,
    });
    onUpdate(r.data);
  };

  return (
    <div
      style={{
        padding: "40px 48px",
        maxWidth: "860px",
        animation: "fadeIn 0.3s ease",
      }}
    >
      {/* Page header */}
      <div style={{ marginBottom: "32px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "8px",
          }}
        >
          <span style={{ fontSize: "32px" }}>{page.icon}</span>
          <button
            onClick={toggleFav}
            style={{
              background: "none",
              border: "none",
              color: page.is_favorite ? "var(--accent)" : "var(--text-muted)",
              padding: "4px",
            }}
          >
            <Star size={18} fill={page.is_favorite ? "currentColor" : "none"} />
          </button>
        </div>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={() => saveTitle(title)}
          style={{
            width: "100%",
            fontSize: "32px",
            fontFamily: "var(--font-display)",
            fontStyle: "italic",
            fontWeight: 600,
            background: "transparent",
            border: "none",
            color: "var(--text)",
            padding: "4px 0",
            borderBottom: "2px solid transparent",
            outline: "none",
          }}
          onFocus={(e) =>
            ((e.target as HTMLInputElement).style.borderBottomColor =
              "var(--border)")
          }
          placeholder="Sem título"
        />
        <div
          style={{
            fontSize: "12px",
            color: "var(--text-muted)",
            marginTop: "4px",
          }}
        >
          Criado em {new Date(page.created_at).toLocaleDateString("pt-BR")}
        </div>
      </div>

      {/* Content by type */}
      {page.page_type === "note" && (
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginBottom: "16px",
            }}
          >
            <button
              onClick={() => setAddingNote(!addingNote)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 16px",
                background:
                  "linear-gradient(135deg, var(--primary), var(--primary-dark))",
                color: "white",
                border: "none",
                borderRadius: "10px",
                fontSize: "13px",
                fontWeight: 600,
              }}
            >
              <Plus size={14} /> Nova nota
            </button>
          </div>
          {addingNote && (
            <div
              style={{
                background: "var(--surface)",
                borderRadius: "16px",
                padding: "20px",
                border: "1px solid var(--border)",
                marginBottom: "16px",
                animation: "fadeIn 0.2s ease",
              }}
            >
              <input
                value={newNote.title}
                onChange={(e) =>
                  setNewNote((p) => ({ ...p, title: e.target.value }))
                }
                placeholder="Título..."
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  marginBottom: "10px",
                  fontWeight: 600,
                }}
                autoFocus
              />
              <textarea
                value={newNote.body}
                onChange={(e) =>
                  setNewNote((p) => ({ ...p, body: e.target.value }))
                }
                placeholder="Escreva aqui..."
                rows={4}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  marginBottom: "10px",
                  resize: "vertical",
                }}
              />
              <div
                style={{ display: "flex", gap: "8px", marginBottom: "12px" }}
              >
                {NOTE_COLORS.map((c) => (
                  <div
                    key={c}
                    onClick={() => setNewNote((p) => ({ ...p, color: c }))}
                    style={{
                      width: "24px",
                      height: "24px",
                      borderRadius: "50%",
                      background: c,
                      border: `2px solid ${newNote.color === c ? "var(--primary)" : "var(--border)"}`,
                      cursor: "pointer",
                    }}
                  />
                ))}
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  onClick={addNote}
                  style={{
                    padding: "8px 16px",
                    background:
                      "linear-gradient(135deg, var(--primary), var(--primary-dark))",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    fontWeight: 600,
                    fontSize: "13px",
                  }}
                >
                  Salvar
                </button>
                <button
                  onClick={() => setAddingNote(false)}
                  style={{
                    padding: "8px 16px",
                    background: "var(--surface2)",
                    border: "1px solid var(--border)",
                    borderRadius: "8px",
                    color: "var(--text-muted)",
                    fontSize: "13px",
                  }}
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
              gap: "14px",
            }}
          >
            {notes.map((note) => (
              <div
                key={note.id}
                style={{
                  background: note.color,
                  borderRadius: "14px",
                  padding: "16px",
                  border: "1px solid var(--border)",
                  position: "relative",
                  minHeight: "120px",
                }}
              >
                <div
                  style={{
                    fontWeight: 600,
                    fontSize: "14px",
                    marginBottom: "8px",
                  }}
                >
                  {note.title}
                </div>
                <div
                  style={{
                    fontSize: "13px",
                    color: "var(--text-muted)",
                    lineHeight: 1.6,
                  }}
                >
                  {note.body}
                </div>
                <button
                  onClick={() => deleteNote(note.id)}
                  style={{
                    position: "absolute",
                    top: "10px",
                    right: "10px",
                    background: "none",
                    border: "none",
                    color: "var(--text-muted)",
                    opacity: 0.6,
                    padding: "2px",
                  }}
                >
                  <Trash size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {page.page_type === "weekly" && (
        <div>
          <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
            <input
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addTask()}
              placeholder="Adicionar tarefa a esta página..."
              style={{ flex: 1, padding: "10px 14px" }}
            />
            <button
              onClick={addTask}
              style={{
                padding: "10px 20px",
                background:
                  "linear-gradient(135deg, var(--primary), var(--primary-dark))",
                color: "white",
                border: "none",
                borderRadius: "10px",
                fontWeight: 600,
              }}
            >
              <Plus size={16} />
            </button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {tasks.map((task) => (
              <div
                key={task.id}
                onClick={() => toggleTask(task)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "12px 16px",
                  background: "var(--surface)",
                  borderRadius: "12px",
                  border: "1px solid var(--border)",
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                <div
                  style={{
                    width: "20px",
                    height: "20px",
                    borderRadius: "50%",
                    border: `2px solid ${task.done ? "var(--primary)" : "var(--border)"}`,
                    background: task.done ? "var(--primary)" : "transparent",
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {task.done && (
                    <span style={{ color: "white", fontSize: "11px" }}>✓</span>
                  )}
                </div>
                <span
                  style={{
                    textDecoration: task.done ? "line-through" : "none",
                    opacity: task.done ? 0.5 : 1,
                  }}
                >
                  {task.text}
                </span>
              </div>
            ))}
            {tasks.length === 0 && (
              <p
                style={{
                  color: "var(--text-muted)",
                  fontSize: "14px",
                  textAlign: "center",
                  padding: "30px 0",
                }}
              >
                Nenhuma tarefa ainda
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
