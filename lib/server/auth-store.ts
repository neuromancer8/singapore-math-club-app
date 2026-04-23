import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { Pool } from "pg";
import { getAvatarOption } from "@/lib/avatars";
import { createEmptyProgress, normalizeProgress } from "@/lib/progress";
import { hashPassword, verifyPassword } from "@/lib/server/password";
import type { AuthSession, AvatarId, Grade, SavedProgress, SeedCredential } from "@/lib/types";

const AUTH_TIMEOUT_MS = 24 * 60 * 60 * 1000;
const FILE_STORE_PATH = join(process.cwd(), ".data", "auth-store.json");

type StoredUser = {
  id: string;
  username: string;
  passwordHash: string;
  role: AuthSession["role"];
  firstName: string;
  lastName: string;
  learnerGrade: Grade;
  avatarId: AvatarId;
  createdAt: string;
  updatedAt: string;
};

type StoredSession = {
  id: string;
  userId: string;
  createdAt: string;
  lastActivityAt: string;
};

type StoredProgress = {
  userId: string;
  data: SavedProgress;
  updatedAt: string;
};

type FileStore = {
  users: StoredUser[];
  sessions: StoredSession[];
  progresses: StoredProgress[];
};

const seedUsers: Array<SeedCredential & Omit<StoredUser, "passwordHash" | "createdAt" | "updatedAt">> = [
  {
    id: "user-admin",
    username: "admin",
    password: "admin",
    label: "Admin demo",
    role: "admin",
    firstName: "Giulia",
    lastName: "Rossi",
    learnerGrade: "seconda",
    avatarId: "rocket",
  },
  {
    id: "user-marco",
    username: "marco",
    password: "marco123",
    label: "Learner demo",
    role: "learner",
    firstName: "Marco",
    lastName: "Bianchi",
    learnerGrade: "terza",
    avatarId: "fox",
  },
];

let pool: Pool | null = null;

function nowIso() {
  return new Date().toISOString();
}

function databaseUrl() {
  return process.env.DATABASE_URL?.trim();
}

function isDatabaseEnabled() {
  return Boolean(databaseUrl());
}

function getPool() {
  if (!pool) {
    pool = new Pool({ connectionString: databaseUrl() });
  }

  return pool;
}

function toAuthSession(user: StoredUser, session: StoredSession): AuthSession {
  return {
    userId: user.id,
    username: user.username,
    role: user.role,
    loggedInAt: session.createdAt,
    lastActivityAt: session.lastActivityAt,
    firstName: user.firstName,
    lastName: user.lastName,
    fullName: `${user.firstName} ${user.lastName}`,
    learnerGrade: user.learnerGrade,
    avatarId: getAvatarOption(user.avatarId).id,
  };
}

function emptyStore(): FileStore {
  return { users: [], sessions: [], progresses: [] };
}

async function readFileStore() {
  try {
    const raw = await readFile(FILE_STORE_PATH, "utf8");
    const parsed = JSON.parse(raw) as Partial<FileStore>;

    return {
      users: Array.isArray(parsed.users) ? parsed.users : [],
      sessions: Array.isArray(parsed.sessions) ? parsed.sessions : [],
      progresses: Array.isArray(parsed.progresses) ? parsed.progresses : [],
    } satisfies FileStore;
  } catch {
    return emptyStore();
  }
}

async function writeFileStore(store: FileStore) {
  await mkdir(dirname(FILE_STORE_PATH), { recursive: true });
  await writeFile(FILE_STORE_PATH, JSON.stringify(store, null, 2) + "\n", "utf8");
}

async function ensureFileSeeded() {
  const store = await readFileStore();

  if (store.users.length > 0) return store;

  const seededAt = nowIso();
  const users = seedUsers.map((user) => ({
    id: user.id,
    username: user.username,
    passwordHash: hashPassword(user.password),
    role: user.role,
    firstName: user.firstName,
    lastName: user.lastName,
    learnerGrade: user.learnerGrade,
    avatarId: user.avatarId,
    createdAt: seededAt,
    updatedAt: seededAt,
  }));

  const progresses = users.map((user) => ({
    userId: user.id,
    data: createEmptyProgress(user.learnerGrade),
    updatedAt: seededAt,
  }));

  const nextStore = { users, sessions: [], progresses };
  await writeFileStore(nextStore);

  return nextStore;
}

async function ensureDatabaseSchema() {
  const client = await getPool().connect();

  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS app_users (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        learner_grade TEXT NOT NULL,
        avatar_id TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL,
        updated_at TIMESTAMPTZ NOT NULL
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS app_sessions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ NOT NULL,
        last_activity_at TIMESTAMPTZ NOT NULL
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS app_progress (
        user_id TEXT PRIMARY KEY REFERENCES app_users(id) ON DELETE CASCADE,
        data JSONB NOT NULL,
        updated_at TIMESTAMPTZ NOT NULL
      );
    `);
  } finally {
    client.release();
  }
}

async function ensureDatabaseSeeded() {
  await ensureDatabaseSchema();
  const client = await getPool().connect();

  try {
    const result = await client.query<{ count: string }>("SELECT COUNT(*)::text AS count FROM app_users");
    if (Number(result.rows[0]?.count ?? "0") > 0) return;

    const seededAt = nowIso();
    for (const user of seedUsers) {
      await client.query(
        `
          INSERT INTO app_users (
            id, username, password_hash, role, first_name, last_name, learner_grade, avatar_id, created_at, updated_at
          ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
        `,
        [
          user.id,
          user.username,
          hashPassword(user.password),
          user.role,
          user.firstName,
          user.lastName,
          user.learnerGrade,
          user.avatarId,
          seededAt,
          seededAt,
        ],
      );

      await client.query(
        `INSERT INTO app_progress (user_id, data, updated_at) VALUES ($1, $2::jsonb, $3)`,
        [user.id, JSON.stringify(createEmptyProgress(user.learnerGrade)), seededAt],
      );
    }
  } finally {
    client.release();
  }
}

export async function ensureAuthStore() {
  if (isDatabaseEnabled()) {
    await ensureDatabaseSeeded();
    return;
  }

  await ensureFileSeeded();
}

export function getSeedCredentials() {
  return seedUsers.map(({ username, password, label }) => ({ username, password, label }));
}

async function findFileUserByUsername(username: string) {
  const store = await ensureFileSeeded();
  return store.users.find((user) => user.username === username.toLowerCase());
}

async function findDatabaseUserByUsername(username: string) {
  await ensureDatabaseSeeded();
  const result = await getPool().query(
    `
      SELECT
        id,
        username,
        password_hash AS "passwordHash",
        role,
        first_name AS "firstName",
        last_name AS "lastName",
        learner_grade AS "learnerGrade",
        avatar_id AS "avatarId",
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      FROM app_users
      WHERE username = $1
      LIMIT 1
    `,
    [username.toLowerCase()],
  );

  return (result.rows[0] as StoredUser | undefined) ?? null;
}

async function createFileSession(user: StoredUser) {
  const store = await ensureFileSeeded();
  const createdAt = nowIso();
  const session: StoredSession = {
    id: randomUUID(),
    userId: user.id,
    createdAt,
    lastActivityAt: createdAt,
  };

  store.sessions = [...store.sessions.filter((item) => item.userId !== user.id), session];
  await writeFileStore(store);

  return session;
}

async function createDatabaseSession(user: StoredUser) {
  await ensureDatabaseSeeded();
  const createdAt = nowIso();
  const session: StoredSession = {
    id: randomUUID(),
    userId: user.id,
    createdAt,
    lastActivityAt: createdAt,
  };

  await getPool().query("DELETE FROM app_sessions WHERE user_id = $1", [user.id]);
  await getPool().query(
    `INSERT INTO app_sessions (id, user_id, created_at, last_activity_at) VALUES ($1, $2, $3, $4)`,
    [session.id, session.userId, session.createdAt, session.lastActivityAt],
  );

  return session;
}

async function getFileProgress(userId: string) {
  const store = await ensureFileSeeded();
  const record = store.progresses.find((item) => item.userId === userId);

  return normalizeProgress(record?.data);
}

async function getDatabaseProgress(userId: string) {
  await ensureDatabaseSeeded();
  const result = await getPool().query<{ data: SavedProgress }>(
    `SELECT data FROM app_progress WHERE user_id = $1 LIMIT 1`,
    [userId],
  );

  return normalizeProgress(result.rows[0]?.data);
}

export async function loginWithCredentials(username: string, password: string) {
  const normalizedUsername = username.trim().toLowerCase();
  if (!normalizedUsername || !password.trim()) return { success: false as const };

  const user = isDatabaseEnabled()
    ? await findDatabaseUserByUsername(normalizedUsername)
    : await findFileUserByUsername(normalizedUsername);

  if (!user || !verifyPassword(password.trim(), user.passwordHash)) {
    return { success: false as const };
  }

  const session = isDatabaseEnabled() ? await createDatabaseSession(user) : await createFileSession(user);
  const progress = isDatabaseEnabled() ? await getDatabaseProgress(user.id) : await getFileProgress(user.id);

  return {
    success: true as const,
    sessionId: session.id,
    session: toAuthSession(user, session),
    progress,
  };
}

async function getFileSession(sessionId: string) {
  const store = await ensureFileSeeded();
  const session = store.sessions.find((item) => item.id === sessionId);
  if (!session) return null;
  const user = store.users.find((item) => item.id === session.userId);
  if (!user) return null;

  return { store, user, session };
}

async function getDatabaseSession(sessionId: string) {
  await ensureDatabaseSeeded();
  const result = await getPool().query(
    `
      SELECT
        s.id,
        s.user_id AS "userId",
        s.created_at AS "createdAt",
        s.last_activity_at AS "lastActivityAt",
        u.username,
        u.password_hash AS "passwordHash",
        u.role,
        u.first_name AS "firstName",
        u.last_name AS "lastName",
        u.learner_grade AS "learnerGrade",
        u.avatar_id AS "avatarId",
        u.created_at AS "userCreatedAt",
        u.updated_at AS "updatedAt"
      FROM app_sessions s
      JOIN app_users u ON u.id = s.user_id
      WHERE s.id = $1
      LIMIT 1
    `,
    [sessionId],
  );

  const row = result.rows[0];
  if (!row) return null;

  const session: StoredSession = {
    id: row.id as string,
    userId: row.userId as string,
    createdAt: row.createdAt as string,
    lastActivityAt: row.lastActivityAt as string,
  };

  const user: StoredUser = {
    id: row.userId as string,
    username: row.username as string,
    passwordHash: row.passwordHash as string,
    role: row.role as AuthSession["role"],
    firstName: row.firstName as string,
    lastName: row.lastName as string,
    learnerGrade: row.learnerGrade as Grade,
    avatarId: row.avatarId as AvatarId,
    createdAt: row.userCreatedAt as string,
    updatedAt: row.updatedAt as string,
  };

  return { user, session };
}

async function deleteFileSession(sessionId: string) {
  const store = await ensureFileSeeded();
  store.sessions = store.sessions.filter((item) => item.id !== sessionId);
  await writeFileStore(store);
}

async function deleteDatabaseSession(sessionId: string) {
  await ensureDatabaseSeeded();
  await getPool().query(`DELETE FROM app_sessions WHERE id = $1`, [sessionId]);
}

async function touchFileSession(sessionId: string) {
  const found = await getFileSession(sessionId);
  if (!found) return null;

  found.session.lastActivityAt = nowIso();
  found.store.sessions = found.store.sessions.map((item) => (item.id === sessionId ? found.session : item));
  await writeFileStore(found.store);

  return { user: found.user, session: found.session };
}

async function touchDatabaseSession(sessionId: string) {
  const found = await getDatabaseSession(sessionId);
  if (!found) return null;

  const lastActivityAt = nowIso();
  await getPool().query(`UPDATE app_sessions SET last_activity_at = $2 WHERE id = $1`, [sessionId, lastActivityAt]);
  found.session.lastActivityAt = lastActivityAt;

  return found;
}

export async function readSession(sessionId: string, options: { refresh?: boolean } = {}) {
  if (!sessionId) return null;

  const found = isDatabaseEnabled()
    ? options.refresh === false
      ? await getDatabaseSession(sessionId)
      : await touchDatabaseSession(sessionId)
    : options.refresh === false
      ? await getFileSession(sessionId)
      : await touchFileSession(sessionId);

  if (!found) return null;

  const idleMs = Date.now() - Date.parse(found.session.lastActivityAt);
  if (!Number.isFinite(idleMs) || idleMs > AUTH_TIMEOUT_MS) {
    if (isDatabaseEnabled()) {
      await deleteDatabaseSession(sessionId);
    } else {
      await deleteFileSession(sessionId);
    }
    return null;
  }

  const progress = isDatabaseEnabled()
    ? await getDatabaseProgress(found.user.id)
    : await getFileProgress(found.user.id);

  return {
    sessionId: found.session.id,
    session: toAuthSession(found.user, found.session),
    progress,
  };
}

export async function logoutSession(sessionId: string) {
  if (!sessionId) return;
  if (isDatabaseEnabled()) {
    await deleteDatabaseSession(sessionId);
    return;
  }
  await deleteFileSession(sessionId);
}

export async function updateAvatar(userId: string, avatarId: AvatarId) {
  if (isDatabaseEnabled()) {
    await ensureDatabaseSeeded();
    await getPool().query(`UPDATE app_users SET avatar_id = $2, updated_at = $3 WHERE id = $1`, [userId, avatarId, nowIso()]);
    return;
  }

  const store = await ensureFileSeeded();
  store.users = store.users.map((user) => (user.id === userId ? { ...user, avatarId, updatedAt: nowIso() } : user));
  await writeFileStore(store);
}

export async function saveProgressForUser(userId: string, progress: SavedProgress) {
  const normalized = normalizeProgress(progress);

  if (isDatabaseEnabled()) {
    await ensureDatabaseSeeded();
    await getPool().query(
      `
        INSERT INTO app_progress (user_id, data, updated_at)
        VALUES ($1, $2::jsonb, $3)
        ON CONFLICT (user_id)
        DO UPDATE SET data = EXCLUDED.data, updated_at = EXCLUDED.updated_at
      `,
      [userId, JSON.stringify(normalized), nowIso()],
    );
    return normalized;
  }

  const store = await ensureFileSeeded();
  const updatedAt = nowIso();
  const existing = store.progresses.find((item) => item.userId === userId);

  if (existing) {
    existing.data = normalized;
    existing.updatedAt = updatedAt;
  } else {
    store.progresses.push({ userId, data: normalized, updatedAt });
  }

  await writeFileStore(store);

  return normalized;
}
