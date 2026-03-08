#!/usr/bin/env python3
"""
╔══════════════════════════════════════════════════════╗
║        🐝 BEEPLANNER — SETUP DO BANCO DE DADOS       ║
║           Script Python de configuração               ║
╚══════════════════════════════════════════════════════╝

Como usar:
  1. Instale o psycopg2: pip install psycopg2-binary python-dotenv
  2. Configure suas credenciais abaixo ou em .env
  3. Execute: python setup_db.py

Opções:
  python setup_db.py --create    Cria o banco e as tabelas
  python setup_db.py --drop      Apaga todas as tabelas (cuidado!)
  python setup_db.py --seed      Insere dados de exemplo
  python setup_db.py --status    Mostra status do banco
  python setup_db.py --all       Faz tudo: cria + seed
"""

import sys
import os
import argparse
from datetime import datetime, timedelta

try:
    import psycopg2
    from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
    from dotenv import load_dotenv
except ImportError:
    print("❌ Dependências faltando. Execute:")
    print("   pip install psycopg2-binary python-dotenv")
    sys.exit(1)

load_dotenv()

# ─── CONFIGURAÇÃO ───────────────────────────────────────
DB_CONFIG = {
    "host": os.getenv("DB_HOST", "localhost"),
    "port": os.getenv("DB_PORT", "5432"),
    "user": os.getenv("DB_USER", "postgres"),
    "password": os.getenv("DB_PASSWORD", ""),
    "dbname": os.getenv("DB_NAME", "beeplanner"),
}
# ────────────────────────────────────────────────────────

CREATE_DB_SQL = """
CREATE DATABASE beeplanner;
"""

MIGRATION_SQL = """
-- Extensão UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ──────────────────────────────────────────────
--  USERS
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name            VARCHAR(100) NOT NULL,
    email           VARCHAR(255) UNIQUE NOT NULL,
    password_hash   VARCHAR(255) NOT NULL,
    avatar_emoji    VARCHAR(10) DEFAULT '🐝',
    theme           VARCHAR(50) DEFAULT 'default',
    profession      VARCHAR(50) DEFAULT 'default',
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ──────────────────────────────────────────────
--  WORKSPACES (pastas/espaços estilo Notion)
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS workspaces (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
    name        VARCHAR(100) NOT NULL,
    icon        VARCHAR(10) DEFAULT '📁',
    color       VARCHAR(30) DEFAULT '#F4A5B8',
    position    INTEGER DEFAULT 0,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ──────────────────────────────────────────────
--  PAGES (páginas dentro dos workspaces)
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS pages (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id    UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
    parent_id       UUID REFERENCES pages(id) ON DELETE CASCADE,
    title           VARCHAR(255) NOT NULL DEFAULT 'Sem título',
    icon            VARCHAR(10) DEFAULT '📄',
    page_type       VARCHAR(30) DEFAULT 'note',
    -- page_type: note | weekly | monthly | kanban | habits | dates
    content         JSONB DEFAULT '{}',
    position        INTEGER DEFAULT 0,
    is_favorite     BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ──────────────────────────────────────────────
--  TASKS
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tasks (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    page_id         UUID REFERENCES pages(id) ON DELETE CASCADE,
    user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
    text            VARCHAR(500) NOT NULL,
    done            BOOLEAN DEFAULT FALSE,
    priority        VARCHAR(10) DEFAULT 'normal',
    -- priority: low | normal | high
    scheduled_date  DATE,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ──────────────────────────────────────────────
--  NOTES
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notes (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    page_id     UUID REFERENCES pages(id) ON DELETE CASCADE,
    user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
    title       VARCHAR(255) NOT NULL DEFAULT 'Nova nota',
    body        TEXT DEFAULT '',
    color       VARCHAR(30) DEFAULT '#FFF0EC',
    tags        TEXT[] DEFAULT '{}',
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ──────────────────────────────────────────────
--  IMPORTANT DATES
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS important_dates (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
    title           VARCHAR(255) NOT NULL,
    date            DATE NOT NULL,
    emoji           VARCHAR(10) DEFAULT '⭐',
    repeat_yearly   BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ──────────────────────────────────────────────
--  HABITS
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS habits (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
    name        VARCHAR(200) NOT NULL,
    icon        VARCHAR(10) DEFAULT '🌱',
    color       VARCHAR(30) DEFAULT '#F4A5B8',
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ──────────────────────────────────────────────
--  HABIT LOGS
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS habit_logs (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    habit_id    UUID REFERENCES habits(id) ON DELETE CASCADE,
    user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
    date        DATE NOT NULL,
    UNIQUE(habit_id, date)
);

-- ──────────────────────────────────────────────
--  KANBAN COLUMNS
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS kanban_columns (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    page_id     UUID REFERENCES pages(id) ON DELETE CASCADE,
    title       VARCHAR(100) NOT NULL,
    color       VARCHAR(30) DEFAULT '#F4A5B8',
    position    INTEGER DEFAULT 0
);

-- ──────────────────────────────────────────────
--  KANBAN CARDS
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS kanban_cards (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    column_id   UUID REFERENCES kanban_columns(id) ON DELETE CASCADE,
    user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
    title       VARCHAR(255) NOT NULL,
    description TEXT,
    due_date    DATE,
    tags        TEXT[] DEFAULT '{}',
    position    INTEGER DEFAULT 0,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ──────────────────────────────────────────────
--  FUNÇÃO: atualizar updated_at automaticamente
-- ──────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_pages_updated_at ON pages;
CREATE TRIGGER update_pages_updated_at
    BEFORE UPDATE ON pages FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_notes_updated_at ON notes;
CREATE TRIGGER update_notes_updated_at
    BEFORE UPDATE ON notes FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ──────────────────────────────────────────────
--  ÍNDICES (para performance)
-- ──────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_workspaces_user_id ON workspaces(user_id);
CREATE INDEX IF NOT EXISTS idx_pages_user_id ON pages(user_id);
CREATE INDEX IF NOT EXISTS idx_pages_workspace_id ON pages(workspace_id);
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_scheduled_date ON tasks(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id);
CREATE INDEX IF NOT EXISTS idx_habits_user_id ON habits(user_id);
CREATE INDEX IF NOT EXISTS idx_habit_logs_habit_id ON habit_logs(habit_id);
CREATE INDEX IF NOT EXISTS idx_important_dates_user_id ON important_dates(user_id);
"""

DROP_ALL_SQL = """
DROP TABLE IF EXISTS kanban_cards CASCADE;
DROP TABLE IF EXISTS kanban_columns CASCADE;
DROP TABLE IF EXISTS habit_logs CASCADE;
DROP TABLE IF EXISTS habits CASCADE;
DROP TABLE IF EXISTS important_dates CASCADE;
DROP TABLE IF EXISTS notes CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS pages CASCADE;
DROP TABLE IF EXISTS workspaces CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column CASCADE;
"""

def get_connection(dbname=None):
    cfg = DB_CONFIG.copy()
    if dbname:
        cfg["dbname"] = dbname
    return psycopg2.connect(**cfg)

def create_database():
    """Cria o banco de dados se não existir"""
    try:
        conn = get_connection(dbname="postgres")
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cur = conn.cursor()
        cur.execute("SELECT 1 FROM pg_catalog.pg_database WHERE datname = %s", (DB_CONFIG["dbname"],))
        exists = cur.fetchone()
        if not exists:
            cur.execute(f"CREATE DATABASE {DB_CONFIG['dbname']}")
            print(f"  ✅ Banco '{DB_CONFIG['dbname']}' criado!")
        else:
            print(f"  ℹ️  Banco '{DB_CONFIG['dbname']}' já existe.")
        cur.close()
        conn.close()
    except Exception as e:
        print(f"  ❌ Erro ao criar banco: {e}")
        print("  💡 Verifique se o PostgreSQL está rodando e as credenciais estão corretas.")
        sys.exit(1)

def run_migration():
    """Cria todas as tabelas"""
    try:
        conn = get_connection()
        cur = conn.cursor()
        cur.execute(MIGRATION_SQL)
        conn.commit()
        cur.close()
        conn.close()
        print("  ✅ Tabelas criadas com sucesso!")
    except Exception as e:
        print(f"  ❌ Erro na migration: {e}")
        sys.exit(1)

def drop_all():
    """Apaga todas as tabelas"""
    confirm = input("  ⚠️  ATENÇÃO: Isso apagará TODOS os dados. Digite 'CONFIRMAR' para continuar: ")
    if confirm != "CONFIRMAR":
        print("  Operação cancelada.")
        return
    try:
        conn = get_connection()
        cur = conn.cursor()
        cur.execute(DROP_ALL_SQL)
        conn.commit()
        cur.close()
        conn.close()
        print("  ✅ Todas as tabelas apagadas.")
    except Exception as e:
        print(f"  ❌ Erro: {e}")

def seed_data():
    """Insere dados de exemplo"""
    import bcrypt
    from uuid import uuid4
    
    try:
        conn = get_connection()
        cur = conn.cursor()
        
        # Usuário demo
        user_id = str(uuid4())
        hashed = bcrypt.hashpw(b"senha123", bcrypt.gensalt()).decode()
        cur.execute("""
            INSERT INTO users (id, name, email, password_hash, avatar_emoji, theme, profession)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (email) DO NOTHING
        """, (user_id, "Usuária Demo", "demo@beeplanner.app", hashed, "🐝", "default", "design"))
        
        # Workspace
        ws_id = str(uuid4())
        cur.execute("""
            INSERT INTO workspaces (id, user_id, name, icon, color) VALUES (%s, %s, %s, %s, %s)
        """, (ws_id, user_id, "Meu Espaço", "🏠", "#F4A5B8"))
        
        # Hábitos de exemplo
        habits = [
            ("💧", "Beber 2L de água"), ("📚", "Leitura diária"), ("🧘", "Meditação")
        ]
        today = datetime.now().date()
        for icon, name in habits:
            habit_id = str(uuid4())
            cur.execute("INSERT INTO habits (id, user_id, name, icon) VALUES (%s,%s,%s,%s)", (habit_id, user_id, name, icon))
            for i in range(5):
                try:
                    d = today - timedelta(days=i)
                    cur.execute("INSERT INTO habit_logs (habit_id, user_id, date) VALUES (%s,%s,%s)", (habit_id, user_id, d))
                except: pass
        
        # Datas importantes
        dates = [
            ("Aniversário da mamãe", "2025-06-15", "🎂", True),
            ("Formatura", "2025-12-10", "🎓", False),
        ]
        for title, date, emoji, repeat in dates:
            cur.execute("INSERT INTO important_dates (user_id, title, date, emoji, repeat_yearly) VALUES (%s,%s,%s,%s,%s)",
                       (user_id, title, date, emoji, repeat))
        
        conn.commit()
        cur.close()
        conn.close()
        print("  ✅ Dados de exemplo inseridos!")
        print("  📧 Login: demo@beeplanner.app")
        print("  🔑 Senha: senha123")
    except ImportError:
        print("  ⚠️  Para seed, instale bcrypt: pip install bcrypt")
    except Exception as e:
        print(f"  ❌ Erro no seed: {e}")

def show_status():
    """Mostra status do banco"""
    try:
        conn = get_connection()
        cur = conn.cursor()
        tables = ['users', 'workspaces', 'pages', 'tasks', 'notes', 'habits', 'habit_logs', 'important_dates']
        print(f"\n  📊 Banco: {DB_CONFIG['dbname']} @ {DB_CONFIG['host']}:{DB_CONFIG['port']}")
        print("  " + "─" * 40)
        for table in tables:
            try:
                cur.execute(f"SELECT COUNT(*) FROM {table}")
                count = cur.fetchone()[0]
                print(f"  {'✅' if count >= 0 else '❌'} {table:<25} {count:>6} registros")
            except:
                print(f"  ❌ {table:<25} {'não existe':>6}")
        cur.close()
        conn.close()
    except Exception as e:
        print(f"  ❌ Não foi possível conectar: {e}")

def main():
    parser = argparse.ArgumentParser(description='🐝 Beeplanner — Setup do banco')
    parser.add_argument('--create', action='store_true', help='Cria banco e tabelas')
    parser.add_argument('--drop', action='store_true', help='Apaga todas as tabelas')
    parser.add_argument('--seed', action='store_true', help='Insere dados de exemplo')
    parser.add_argument('--status', action='store_true', help='Mostra status')
    parser.add_argument('--all', action='store_true', help='Cria + seed')
    args = parser.parse_args()

    print("\n🐝 Beeplanner — Configuração do Banco de Dados\n")

    if args.drop:
        drop_all()
    elif args.status:
        show_status()
    elif args.create or args.all:
        print("1. Criando banco de dados...")
        create_database()
        print("2. Criando tabelas...")
        run_migration()
        if args.all or args.seed:
            print("3. Inserindo dados de exemplo...")
            seed_data()
        show_status()
    elif args.seed:
        seed_data()
    else:
        print("Use uma das opções:")
        print("  python setup_db.py --create    Cria banco e tabelas")
        print("  python setup_db.py --all       Cria + dados de exemplo")
        print("  python setup_db.py --status    Status do banco")
        print("  python setup_db.py --drop      Apaga tudo (cuidado!)")
        print("  python setup_db.py --seed      Insere dados de exemplo")

if __name__ == "__main__":
    main()
