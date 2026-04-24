import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { Pool } from "pg";
import { getAvatarOption } from "@/lib/avatars";
import { createEmptyProgress, normalizeProgress } from "@/lib/progress";
import { hashPassword, verifyPassword } from "@/lib/server/password";
import type {
  AuthPayload,
  AuthSession,
  AvatarId,
  Grade,
  LearnerProfile,
  ParentRegistrationInput,
  SavedProgress,
  SeedCredential,
} from "@/lib/types";

const AUTH_TIMEOUT_MS = 24 * 60 * 60 * 1000;
const FILE_STORE_PATH = join(process.cwd(), ".data", "auth-store.json");

type StoredParentUser = {
  id: string;
  username: string;
  passwordHash: string;
  role: AuthSession["role"];
  parentFirstName: string;
  parentLastName: string;
  createdAt: string;
  updatedAt: string;
};

type StoredLearnerProfile = {
  id: string;
  parentUserId: string;
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
  activeLearnerId: string;
  createdAt: string;
  lastActivityAt: string;
};

type StoredProgress = {
  learnerId: string;
  data: SavedProgress;
  updatedAt: string;
};

type FileStore = {
  users: StoredParentUser[];
  learners: StoredLearnerProfile[];
  sessions: StoredSession[];
  progresses: StoredProgress[];
};

const seedUsers: Array<
  SeedCredential &
    Omit<StoredParentUser, "passwordHash" | "createdAt" | "updatedAt"> & {
      learners: Array<Omit<StoredLearnerProfile, "parentUserId" | "createdAt" | "updatedAt">>;
    }
> = [
  {
    id: "parent-admin",
    username: "admin",
    password: "admin",
    label: "Famiglia demo 1",
    role: "parent",
    parentFirstName: "Laura",
    parentLastName: "Rossi",
    learners: [
      { id: "learner-giulia", firstName: "Giulia", lastName: "Rossi", learnerGrade: "seconda", avatarId: "rocket" },
      { id: "learner-andrea", firstName: "Andrea", lastName: "Rossi", learnerGrade: "quarta", avatarId: "owl" },
    ],
  },
  {
    id: "parent-marco",
    username: "marco",
    password: "marco123",
    label: "Famiglia demo 2",
    role: "parent",
    parentFirstName: "Paolo",
    parentLastName: "Bianchi",
    learners: [{ id: "learner-marta", firstName: "Marta", lastName: "Bianchi", learnerGrade: "terza", avatarId: "fox" }],
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

function learnerProfileFromStored(learner: StoredLearnerProfile): LearnerProfile {
  return {
    id: learner.id,
    parentUserId: learner.parentUserId,
    firstName: learner.firstName,
    lastName: learner.lastName,
    fullName: `${learner.firstName} ${learner.lastName}`,
    learnerGrade: learner.learnerGrade,
    avatarId: getAvatarOption(learner.avatarId).id,
    createdAt: learner.createdAt,
    updatedAt: learner.updatedAt,
  };
}

function buildSession(user: StoredParentUser, learner: StoredLearnerProfile, session: StoredSession): AuthSession {
  return {
    userId: user.id,
    username: user.username,
    role: user.role,
    loggedInAt: session.createdAt,
    lastActivityAt: session.lastActivityAt,
    parentFirstName: user.parentFirstName,
    parentLastName: user.parentLastName,
    parentFullName: `${user.parentFirstName} ${user.parentLastName}`,
    activeLearnerId: learner.id,
    firstName: learner.firstName,
    lastName: learner.lastName,
    fullName: `${learner.firstName} ${learner.lastName}`,
    learnerGrade: learner.learnerGrade,
    avatarId: getAvatarOption(learner.avatarId).id,
  };
}

function emptyStore(): FileStore {
  return { users: [], learners: [], sessions: [], progresses: [] };
}

async function readFileStore() {
  try {
    const raw = await readFile(FILE_STORE_PATH, "utf8");
    const parsed = JSON.parse(raw) as Partial<FileStore>;

    return {
      users: Array.isArray(parsed.users) ? parsed.users : [],
      learners: Array.isArray(parsed.learners) ? parsed.learners : [],
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
  const users: StoredParentUser[] = [];
  const learners: StoredLearnerProfile[] = [];
  const progresses: StoredProgress[] = [];

  for (const user of seedUsers) {
    users.push({
      id: user.id,
      username: user.username,
      passwordHash: hashPassword(user.password),
      role: user.role,
      parentFirstName: user.parentFirstName,
      parentLastName: user.parentLastName,
      createdAt: seededAt,
      updatedAt: seededAt,
    });

    for (const learner of user.learners) {
      learners.push({
        id: learner.id,
        parentUserId: user.id,
        firstName: learner.firstName,
        lastName: learner.lastName,
        learnerGrade: learner.learnerGrade,
        avatarId: learner.avatarId,
        createdAt: seededAt,
        updatedAt: seededAt,
      });

      progresses.push({
        learnerId: learner.id,
        data: createEmptyProgress(learner.learnerGrade),
        updatedAt: seededAt,
      });
    }
  }

  const nextStore = { users, learners, sessions: [], progresses };
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
        parent_first_name TEXT NOT NULL,
        parent_last_name TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL,
        updated_at TIMESTAMPTZ NOT NULL
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS learner_profiles (
        id TEXT PRIMARY KEY,
        parent_user_id TEXT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
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
        active_learner_id TEXT NOT NULL REFERENCES learner_profiles(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ NOT NULL,
        last_activity_at TIMESTAMPTZ NOT NULL
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS app_progress (
        learner_id TEXT PRIMARY KEY REFERENCES learner_profiles(id) ON DELETE CASCADE,
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
            id, username, password_hash, role, parent_first_name, parent_last_name, created_at, updated_at
          ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
        `,
        [user.id, user.username, hashPassword(user.password), user.role, user.parentFirstName, user.parentLastName, seededAt, seededAt],
      );

      for (const learner of user.learners) {
        await client.query(
          `
            INSERT INTO learner_profiles (
              id, parent_user_id, first_name, last_name, learner_grade, avatar_id, created_at, updated_at
            ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
          `,
          [learner.id, user.id, learner.firstName, learner.lastName, learner.learnerGrade, learner.avatarId, seededAt, seededAt],
        );
        await client.query(
          `INSERT INTO app_progress (learner_id, data, updated_at) VALUES ($1, $2::jsonb, $3)`,
          [learner.id, JSON.stringify(createEmptyProgress(learner.learnerGrade)), seededAt],
        );
      }
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
  return {
    store,
    user: store.users.find((item) => item.username === username.toLowerCase()) ?? null,
  };
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
        parent_first_name AS "parentFirstName",
        parent_last_name AS "parentLastName",
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      FROM app_users
      WHERE username = $1
      LIMIT 1
    `,
    [username.toLowerCase()],
  );

  return (result.rows[0] as StoredParentUser | undefined) ?? null;
}

async function getFileLearners(parentUserId: string) {
  const store = await ensureFileSeeded();
  return store.learners.filter((item) => item.parentUserId === parentUserId);
}

async function getDatabaseLearners(parentUserId: string) {
  await ensureDatabaseSeeded();
  const result = await getPool().query(
    `
      SELECT
        id,
        parent_user_id AS "parentUserId",
        first_name AS "firstName",
        last_name AS "lastName",
        learner_grade AS "learnerGrade",
        avatar_id AS "avatarId",
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      FROM learner_profiles
      WHERE parent_user_id = $1
      ORDER BY created_at ASC
    `,
    [parentUserId],
  );

  return result.rows as StoredLearnerProfile[];
}

async function createFileSession(user: StoredParentUser, activeLearnerId: string) {
  const store = await ensureFileSeeded();
  const createdAt = nowIso();
  const session: StoredSession = {
    id: randomUUID(),
    userId: user.id,
    activeLearnerId,
    createdAt,
    lastActivityAt: createdAt,
  };
  store.sessions = [...store.sessions.filter((item) => item.userId !== user.id), session];
  await writeFileStore(store);
  return session;
}

async function createDatabaseSession(user: StoredParentUser, activeLearnerId: string) {
  await ensureDatabaseSeeded();
  const createdAt = nowIso();
  const session: StoredSession = {
    id: randomUUID(),
    userId: user.id,
    activeLearnerId,
    createdAt,
    lastActivityAt: createdAt,
  };

  await getPool().query("DELETE FROM app_sessions WHERE user_id = $1", [user.id]);
  await getPool().query(
    `INSERT INTO app_sessions (id, user_id, active_learner_id, created_at, last_activity_at) VALUES ($1,$2,$3,$4,$5)`,
    [session.id, session.userId, session.activeLearnerId, session.createdAt, session.lastActivityAt],
  );

  return session;
}

async function getFileProgress(learnerId: string) {
  const store = await ensureFileSeeded();
  return normalizeProgress(store.progresses.find((item) => item.learnerId === learnerId)?.data);
}

async function getDatabaseProgress(learnerId: string) {
  await ensureDatabaseSeeded();
  const result = await getPool().query<{ data: SavedProgress }>(
    `SELECT data FROM app_progress WHERE learner_id = $1 LIMIT 1`,
    [learnerId],
  );
  return normalizeProgress(result.rows[0]?.data);
}

async function buildPayload(user: StoredParentUser, session: StoredSession, learners: StoredLearnerProfile[]): Promise<AuthPayload & { sessionId: string }> {
  const activeLearner = learners.find((item) => item.id === session.activeLearnerId) ?? learners[0];
  const progress = activeLearner
    ? isDatabaseEnabled()
      ? await getDatabaseProgress(activeLearner.id)
      : await getFileProgress(activeLearner.id)
    : null;

  return {
    sessionId: session.id,
    session: activeLearner ? buildSession(user, activeLearner, session) : null,
    profiles: learners.map(learnerProfileFromStored),
    progress,
  };
}

export async function loginWithCredentials(username: string, password: string) {
  const normalizedUsername = username.trim().toLowerCase();
  const normalizedPassword = password.trim();
  if (!normalizedUsername || !normalizedPassword) return { success: false as const };

  const lookup = isDatabaseEnabled() ? { user: await findDatabaseUserByUsername(normalizedUsername) } : await findFileUserByUsername(normalizedUsername);
  const user = lookup.user;

  if (!user || !verifyPassword(normalizedPassword, user.passwordHash)) {
    return { success: false as const };
  }

  const learners = isDatabaseEnabled() ? await getDatabaseLearners(user.id) : await getFileLearners(user.id);
  const activeLearner = learners[0];
  if (!activeLearner) return { success: false as const };

  const session = isDatabaseEnabled()
    ? await createDatabaseSession(user, activeLearner.id)
    : await createFileSession(user, activeLearner.id);

  const payload = await buildPayload(user, session, learners);

  return {
    success: true as const,
    ...payload,
  };
}

async function getFileSession(sessionId: string) {
  const store = await ensureFileSeeded();
  const session = store.sessions.find((item) => item.id === sessionId);
  if (!session) return null;
  const user = store.users.find((item) => item.id === session.userId);
  if (!user) return null;
  const learners = store.learners.filter((item) => item.parentUserId === user.id);
  return { store, session, user, learners };
}

async function getDatabaseSession(sessionId: string) {
  await ensureDatabaseSeeded();
  const result = await getPool().query(
    `
      SELECT
        s.id,
        s.user_id AS "userId",
        s.active_learner_id AS "activeLearnerId",
        s.created_at AS "createdAt",
        s.last_activity_at AS "lastActivityAt",
        u.username,
        u.password_hash AS "passwordHash",
        u.role,
        u.parent_first_name AS "parentFirstName",
        u.parent_last_name AS "parentLastName",
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
    activeLearnerId: row.activeLearnerId as string,
    createdAt: row.createdAt as string,
    lastActivityAt: row.lastActivityAt as string,
  };

  const user: StoredParentUser = {
    id: row.userId as string,
    username: row.username as string,
    passwordHash: row.passwordHash as string,
    role: row.role as AuthSession["role"],
    parentFirstName: row.parentFirstName as string,
    parentLastName: row.parentLastName as string,
    createdAt: row.userCreatedAt as string,
    updatedAt: row.updatedAt as string,
  };

  const learners = await getDatabaseLearners(user.id);
  return { session, user, learners };
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

  return { user: found.user, session: found.session, learners: found.learners };
}

async function touchDatabaseSession(sessionId: string) {
  const found = await getDatabaseSession(sessionId);
  if (!found) return null;

  found.session.lastActivityAt = nowIso();
  await getPool().query(`UPDATE app_sessions SET last_activity_at = $2 WHERE id = $1`, [sessionId, found.session.lastActivityAt]);

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

  return buildPayload(found.user, found.session, found.learners);
}

export async function logoutSession(sessionId: string) {
  if (!sessionId) return;
  if (isDatabaseEnabled()) return deleteDatabaseSession(sessionId);
  return deleteFileSession(sessionId);
}

export async function switchActiveLearner(sessionId: string, learnerId: string) {
  if (isDatabaseEnabled()) {
    const found = await getDatabaseSession(sessionId);
    if (!found) return null;
    if (!found.learners.some((item) => item.id === learnerId)) return null;

    found.session.activeLearnerId = learnerId;
    found.session.lastActivityAt = nowIso();
    await getPool().query(
      `UPDATE app_sessions SET active_learner_id = $2, last_activity_at = $3 WHERE id = $1`,
      [sessionId, learnerId, found.session.lastActivityAt],
    );
    return buildPayload(found.user, found.session, found.learners);
  }

  const found = await getFileSession(sessionId);
  if (!found) return null;
  if (!found.learners.some((item) => item.id === learnerId)) return null;

  found.session.activeLearnerId = learnerId;
  found.session.lastActivityAt = nowIso();
  found.store.sessions = found.store.sessions.map((item) => (item.id === sessionId ? found.session : item));
  await writeFileStore(found.store);

  return buildPayload(found.user, found.session, found.learners);
}

export async function createLearnerProfile(parentUserId: string, input: {
  firstName: string;
  lastName: string;
  learnerGrade: Grade;
  avatarId: AvatarId;
}) {
  const createdAt = nowIso();
  const learner: StoredLearnerProfile = {
    id: randomUUID(),
    parentUserId,
    firstName: input.firstName.trim(),
    lastName: input.lastName.trim(),
    learnerGrade: input.learnerGrade,
    avatarId: input.avatarId,
    createdAt,
    updatedAt: createdAt,
  };

  if (isDatabaseEnabled()) {
    await ensureDatabaseSeeded();
    await getPool().query(
      `
        INSERT INTO learner_profiles (
          id, parent_user_id, first_name, last_name, learner_grade, avatar_id, created_at, updated_at
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      `,
      [learner.id, learner.parentUserId, learner.firstName, learner.lastName, learner.learnerGrade, learner.avatarId, learner.createdAt, learner.updatedAt],
    );
    await getPool().query(
      `INSERT INTO app_progress (learner_id, data, updated_at) VALUES ($1, $2::jsonb, $3)`,
      [learner.id, JSON.stringify(createEmptyProgress(learner.learnerGrade)), createdAt],
    );
    return learnerProfileFromStored(learner);
  }

  const store = await ensureFileSeeded();
  store.learners.push(learner);
  store.progresses.push({
    learnerId: learner.id,
    data: createEmptyProgress(learner.learnerGrade),
    updatedAt: createdAt,
  });
  await writeFileStore(store);

  return learnerProfileFromStored(learner);
}

export async function updateAvatar(learnerId: string, avatarId: AvatarId) {
  if (isDatabaseEnabled()) {
    await ensureDatabaseSeeded();
    await getPool().query(`UPDATE learner_profiles SET avatar_id = $2, updated_at = $3 WHERE id = $1`, [learnerId, avatarId, nowIso()]);
    return;
  }

  const store = await ensureFileSeeded();
  store.learners = store.learners.map((learner) => (learner.id === learnerId ? { ...learner, avatarId, updatedAt: nowIso() } : learner));
  await writeFileStore(store);
}

export async function saveProgressForLearner(learnerId: string, progress: SavedProgress) {
  const normalized = normalizeProgress(progress);

  if (isDatabaseEnabled()) {
    await ensureDatabaseSeeded();
    await getPool().query(
      `
        INSERT INTO app_progress (learner_id, data, updated_at)
        VALUES ($1, $2::jsonb, $3)
        ON CONFLICT (learner_id)
        DO UPDATE SET data = EXCLUDED.data, updated_at = EXCLUDED.updated_at
      `,
      [learnerId, JSON.stringify(normalized), nowIso()],
    );
    return normalized;
  }

  const store = await ensureFileSeeded();
  const existing = store.progresses.find((item) => item.learnerId === learnerId);
  const updatedAt = nowIso();

  if (existing) {
    existing.data = normalized;
    existing.updatedAt = updatedAt;
  } else {
    store.progresses.push({ learnerId, data: normalized, updatedAt });
  }
  await writeFileStore(store);
  return normalized;
}

export async function registerParent(input: ParentRegistrationInput) {
  const username = input.username.trim().toLowerCase();
  const password = input.password.trim();
  if (!username || !password || !input.parentFirstName.trim() || !input.childFirstName.trim()) {
    return { success: false as const, reason: "invalid" as const };
  }

  const existingUser = isDatabaseEnabled()
    ? await findDatabaseUserByUsername(username)
    : (await findFileUserByUsername(username)).user;

  if (existingUser) {
    return { success: false as const, reason: "exists" as const };
  }

  const createdAt = nowIso();
  const user: StoredParentUser = {
    id: randomUUID(),
    username,
    passwordHash: hashPassword(password),
    role: "parent",
    parentFirstName: input.parentFirstName.trim(),
    parentLastName: input.parentLastName.trim() || input.parentFirstName.trim(),
    createdAt,
    updatedAt: createdAt,
  };

  const learner: StoredLearnerProfile = {
    id: randomUUID(),
    parentUserId: user.id,
    firstName: input.childFirstName.trim(),
    lastName: input.childLastName.trim() || input.parentLastName.trim() || input.parentFirstName.trim(),
    learnerGrade: input.childGrade,
    avatarId: input.childAvatarId,
    createdAt,
    updatedAt: createdAt,
  };

  if (isDatabaseEnabled()) {
    await ensureDatabaseSeeded();
    await getPool().query(
      `
        INSERT INTO app_users (
          id, username, password_hash, role, parent_first_name, parent_last_name, created_at, updated_at
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      `,
      [user.id, user.username, user.passwordHash, user.role, user.parentFirstName, user.parentLastName, createdAt, createdAt],
    );
    await getPool().query(
      `
        INSERT INTO learner_profiles (
          id, parent_user_id, first_name, last_name, learner_grade, avatar_id, created_at, updated_at
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      `,
      [learner.id, learner.parentUserId, learner.firstName, learner.lastName, learner.learnerGrade, learner.avatarId, createdAt, createdAt],
    );
    await getPool().query(
      `INSERT INTO app_progress (learner_id, data, updated_at) VALUES ($1, $2::jsonb, $3)`,
      [learner.id, JSON.stringify(createEmptyProgress(learner.learnerGrade)), createdAt],
    );
  } else {
    const store = await ensureFileSeeded();
    store.users.push(user);
    store.learners.push(learner);
    store.progresses.push({
      learnerId: learner.id,
      data: createEmptyProgress(learner.learnerGrade),
      updatedAt: createdAt,
    });
    await writeFileStore(store);
  }

  const session = isDatabaseEnabled()
    ? await createDatabaseSession(user, learner.id)
    : await createFileSession(user, learner.id);

  const payload = await buildPayload(user, session, [learner]);

  return {
    success: true as const,
    ...payload,
  };
}
