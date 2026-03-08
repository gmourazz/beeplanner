-- migrations/002_oauth.sql
-- Adiciona suporte a OAuth (Google, GitHub) e torna password_hash opcional
-- Execute: psql -U seu_usuario -d beeplanner -f migrations/002_oauth.sql

-- Colunas de provider OAuth
ALTER TABLE users ADD COLUMN IF NOT EXISTS provider   VARCHAR(20) DEFAULT 'local';
ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id  VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS github_id  VARCHAR(100);

-- password_hash agora é opcional (usuários OAuth não têm senha local)
ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;

-- Índices únicos para evitar duplicatas de OAuth
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id) WHERE google_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_github_id ON users(github_id) WHERE github_id IS NOT NULL;
