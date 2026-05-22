import { DEFAULT_SERVER_SETTINGS } from "../constant/defaultConfig";
import { ILevelDB } from "../interfaces/database";

declare function require(id: string): any;

interface IDatabaseOptions {
    filePath?: string;
    cacheValues?: boolean;
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
    protected database: ISQLiteDatabase;
    private table: string;
    private cacheValues: boolean;
    private valueCache = new Map<string, unknown>();

    constructor(table: string, opt?: IDatabaseOptions) {
        this.table = table;
        this.cacheValues = opt?.cacheValues || false;
        this.database = getDatabase(opt?.filePath || DEFAULT_DB_FILE);
        this.database.exec?.(
            `CREATE TABLE IF NOT EXISTS ${this.table} (ID TEXT PRIMARY KEY, json TEXT NOT NULL)`,
        );
    }

    protected get tableName() {
        return this.table;
    }

    private readCachedRow(id: string) {
        if (!this.cacheValues || !this.valueCache.has(id)) return undefined;
        return cloneValue(this.valueCache.get(id));
    }

    private cacheRow(id: string, value: unknown) {
        if (!this.cacheValues) return;
        this.valueCache.set(id, cloneValue(value));
    }

    private dropCachedRow(id: string) {
        if (!this.cacheValues) return;
        this.valueCache.delete(id);
    }

    private getRow(id: string) {
        const cached = this.readCachedRow(id);
        if (cached !== undefined) return cached;

        const row = this.database
            .prepare<{ json: string | null }>(
                `SELECT json FROM ${this.table} WHERE ID = ?`,
            )
            .get(id);

        if (!row?.json) return undefined;
        const parsed = JSON.parse(row.json) as unknown;
        this.cacheRow(id, parsed);
        return cloneValue(parsed);
    }

    private upsertRow(id: string, value: unknown) {
        this.cacheRow(id, value);
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
            this.dropCachedRow(id);
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
        this.valueCache.clear();
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

    async count() {
        const row = this.database
            .prepare<{ count: number }>(
                `SELECT COUNT(*) as count FROM ${this.table}`,
            )
            .get();
        return row?.count || 0;
    }
}

export class SettingsDB extends MovDB {
    private guildID: string;

    constructor(guildID: string) {
        super("serversettings", {
            cacheValues: true,
        });
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

    private parseEntry(row: { ID: string; json: string }) {
        return {
            id: row.ID,
            value: JSON.parse(row.json) as ILevelDB,
        };
    }

    async topByTotalXP(limit: number, offset = 0) {
        try {
            const rows = this.database
                .prepare<{ ID: string; json: string }>(
                    `SELECT ID, json
                     FROM ${this.tableName}
                     ORDER BY CAST(json_extract(json, '$.totalxp') AS INTEGER) DESC, ID ASC
                     LIMIT ? OFFSET ?`,
                )
                .all(limit, offset);

            return rows.map((row) => this.parseEntry(row));
        } catch {
            const rows = await this.all<ILevelDB>();
            return rows
                .sort((a, b) => b.value.totalxp - a.value.totalxp)
                .slice(offset, offset + limit);
        }
    }

    async getRank(id: string) {
        const entry = await this.get<ILevelDB>(id);

        if (!entry) return undefined;

        try {
            const row = this.database
                .prepare<{ rank: number }>(
                    `SELECT COUNT(*) + 1 as rank
                     FROM ${this.tableName}
                     WHERE CAST(json_extract(json, '$.totalxp') AS INTEGER) > ?`,
                )
                .get(entry.totalxp);

            return {
                id,
                rank: row?.rank || 1,
                data: entry,
            };
        } catch {
            const rows = await this.all<ILevelDB>();
            const rank =
                rows
                    .sort((a, b) => b.value.totalxp - a.value.totalxp)
                    .findIndex((row) => row.id === id) + 1;

            return {
                id,
                rank: rank <= 0 ? 1 : rank,
                data: entry,
            };
        }
    }
}

export class UserDB extends MovDB {
    constructor() {
        super("usersettings", {
            cacheValues: true,
        });
    }
}

export class CmdStatDB extends MovDB {
    constructor() {
        super("cmdstats");
    }
}
