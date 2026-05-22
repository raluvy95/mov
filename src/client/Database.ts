import { DEFAULT_SERVER_SETTINGS } from "../constant/defaultConfig";

declare function require(id: string): any;

interface IDatabaseOptions {
    filePath?: string;
}

interface IRow<T = unknown> {
    ID: string;
    json: string;
    value: T;
}

interface IStatementResult<T = unknown> {
    get(...params: unknown[]): T;
    all(...params: unknown[]): T[];
    run(...params: unknown[]): unknown;
}

interface ISQLiteDatabase {
    prepare<T = unknown>(query: string): IStatementResult<T>;
    exec?(query: string): unknown;
    pragma?(query: string): unknown;
}

type DatabaseCtor = new (
    filePath: string,
    options?: Record<string, unknown>,
) => ISQLiteDatabase;

const DEFAULT_DB_FILE = ".MOV.sqlite";

let sharedDatabase: ISQLiteDatabase | null = null;

function getDatabaseConstructor(): DatabaseCtor {
    if (typeof (globalThis as { Bun?: unknown }).Bun !== "undefined") {
        const bunSqlite = require("bun:sqlite") as {
            Database: DatabaseCtor;
        };
        return bunSqlite.Database;
    }

    return require("better-sqlite3") as DatabaseCtor;
}

function getDatabase(filePath: string): ISQLiteDatabase {
    if (sharedDatabase) return sharedDatabase;

    const Database = getDatabaseConstructor();
    sharedDatabase = new Database(filePath);
    sharedDatabase.pragma?.("journal_mode = WAL");
    sharedDatabase.pragma?.("synchronous = NORMAL");
    return sharedDatabase;
}

function parsePath(key: string) {
    const parts = key.split(".");
    return {
        id: parts.shift()!,
        path: parts,
    };
}

function cloneValue<T>(value: T): T {
    if (value === undefined) {
        return value;
    }
    return JSON.parse(JSON.stringify(value)) as T;
}

function isObject(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getNestedValue(source: unknown, path: string[]) {
    let current = source;

    for (const part of path) {
        if (
            typeof current !== "object" ||
            current === null ||
            !(part in (current as Record<string, unknown>))
        ) {
            return undefined;
        }
        current = (current as Record<string, unknown>)[part];
    }

    return current;
}

function setNestedValue(source: unknown, path: string[], value: unknown) {
    if (path.length === 0) {
        return cloneValue(value);
    }

    const root = isObject(source) ? cloneValue(source) : {};
    let cursor = root as Record<string, unknown>;

    for (const part of path.slice(0, -1)) {
        const next = cursor[part];
        if (!isObject(next)) {
            cursor[part] = {};
        }
        cursor = cursor[part] as Record<string, unknown>;
    }

    cursor[path[path.length - 1]] = cloneValue(value);
    return root;
}

function deleteNestedValue(source: unknown, path: string[]) {
    if (!isObject(source)) return source;
    if (path.length === 0) return undefined;

    const root = cloneValue(source) as Record<string, unknown>;
    let cursor: Record<string, unknown> = root;

    for (const part of path.slice(0, -1)) {
        const next = cursor[part];
        if (!isObject(next)) {
            return root;
        }
        cursor = next;
    }

    delete cursor[path[path.length - 1]];
    return root;
}

export class MovDB {
    private database: ISQLiteDatabase;
    private table: string;

    constructor(table: string, opt?: IDatabaseOptions) {
        this.table = table;
        this.database = getDatabase(opt?.filePath || DEFAULT_DB_FILE);
        this.database.exec?.(
            `CREATE TABLE IF NOT EXISTS ${this.table} (ID TEXT PRIMARY KEY, json TEXT NOT NULL)`,
        );
    }

    private getRow(id: string) {
        const row = this.database
            .prepare<{ json: string | null }>(
                `SELECT json FROM ${this.table} WHERE ID = ?`,
            )
            .get(id);

        if (!row?.json) return undefined;
        return JSON.parse(row.json) as unknown;
    }

    private upsertRow(id: string, value: unknown) {
        this.database
            .prepare(
                `INSERT INTO ${this.table} (ID, json) VALUES (?, ?)
                 ON CONFLICT(ID) DO UPDATE SET json = excluded.json`,
            )
            .run(id, JSON.stringify(value));
    }

    async get<T = unknown>(key: string) {
        const { id, path } = parsePath(key);
        const row = this.getRow(id);

        if (row === undefined) return undefined;
        if (path.length === 0) return row as T;

        return getNestedValue(row, path) as T | undefined;
    }

    async set<T = unknown>(key: string, value: T) {
        const { id, path } = parsePath(key);

        if (path.length === 0) {
            this.upsertRow(id, value);
            return value;
        }

        const current = this.getRow(id);
        const next = setNestedValue(current, path, value);
        this.upsertRow(id, next);
        return value;
    }

    async has(key: string) {
        return (await this.get(key)) !== undefined;
    }

    async add(key: string, value: number) {
        const current = await this.get<number>(key);
        const next = (typeof current === "number" ? current : 0) + value;
        await this.set(key, next);
        return next;
    }

    async delete(key: string) {
        const { id, path } = parsePath(key);

        if (path.length === 0) {
            const result = this.database
                .prepare(`DELETE FROM ${this.table} WHERE ID = ?`)
                .run(id) as { changes?: number };
            return (result?.changes || 0) > 0;
        }

        const current = this.getRow(id);
        if (current === undefined) return false;

        const existed = getNestedValue(current, path) !== undefined;
        if (!existed) return false;

        const next = deleteNestedValue(current, path);
        if (next === undefined) {
            await this.delete(id);
            return true;
        }

        this.upsertRow(id, next);
        return true;
    }

    async deleteAll() {
        this.database.prepare(`DELETE FROM ${this.table}`).run();
    }

    async all<T = unknown>() {
        const rows = this.database
            .prepare<Pick<IRow<T>, "ID" | "json">>(
                `SELECT ID, json FROM ${this.table}`,
            )
            .all();

        return rows.map((row) => ({
            id: row.ID,
            value: JSON.parse(row.json) as T,
        }));
    }
}

export class SettingsDB extends MovDB {
    private guildID: string;

    constructor(guildID: string) {
        super("serversettings");
        this.guildID = guildID;
        this.init();
    }

    async init() {
        if (!(await this.has(this.guildID))) {
            await this.set(this.guildID, DEFAULT_SERVER_SETTINGS);
        }
    }
}

export class LevelDB extends MovDB {
    constructor() {
        super("level");
    }
}

export class UserDB extends MovDB {
    constructor() {
        super("usersettings");
    }
}

export class CmdStatDB extends MovDB {
    constructor() {
        super("cmdstats");
    }
}
