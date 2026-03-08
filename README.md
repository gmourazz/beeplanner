# 🐝 Beeplanner v2.0

> Planner minimalista — React + TypeScript + **Tailwind CSS** + Node.js + PostgreSQL

## PASSOS RÁPIDOS

### 1. PostgreSQL — Criar banco

**Windows/Mac/Linux — via psql:**
```bash
psql -U postgres
```
```sql
CREATE DATABASE beeplanner;
CREATE USER beeplanner_user WITH PASSWORD 'sua_senha';
GRANT ALL PRIVILEGES ON DATABASE beeplanner TO beeplanner_user;
\c beeplanner
GRANT ALL ON SCHEMA public TO beeplanner_user;
\q
```

**Rodar migration:**
```bash
psql -U beeplanner_user -d beeplanner -f backend/migrations/001_init.sql
```

---

### 2. Setup com Python (opcional mas fácil!)

```bash
pip install psycopg2-binary python-dotenv bcrypt

# Crie .env na raiz com:
# DB_HOST=localhost
# DB_PORT=5432
# DB_USER=postgres
# DB_PASSWORD=sua_senha
# DB_NAME=beeplanner

python setup_db.py --all    # Cria tudo + dados de exemplo
python setup_db.py --status # Ver tabelas
```

---

### 3. Backend

```bash
cd backend
npm install
cp .env.example .env
# Edite .env com sua DATABASE_URL e JWT_SECRET
npm run dev
# Rodando em http://localhost:3001
```

---

### 4. Frontend (com Tailwind CSS)

```bash
cd frontend
npm install
npm run dev
# Rodando em http://localhost:5173
```

---

## Temas

Rosa Mel 🐝 | Rosa 🌸 | Roxo 🔮 | Azul Claro 🌊 | Azul Marinho 🌙 | Verde 🌿 | Lilás 💜 | Pêssego 🍑 | Dark Neon 🌈

Todos com **dark mode toggle** no header! 🌙

## Deploy

- Backend: Railway / Render
- Frontend: Vercel / Netlify  
- PostgreSQL: Railway / Supabase / Neon (todos têm plano grátis)

Veja o README completo no ZIP para instruções detalhadas de cada tabela, endpoints e deploy.

Feito com 🍯 e carinho!
