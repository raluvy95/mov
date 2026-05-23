import { DEFAULT_SERVER_SETTINGS, DEFAULT_DB_FILE } from "../constant/defaultConfig";
import type { ILevelDB } from "../interfaces/database";
import { Database, Statement, type SQLQueryBindings } from "bun:sqlite";

interface IRow<T = unknown> {
    ID: string;
    json: string;
    value: T;
}

function parsePath(key: string) {
    const parts = key.split(".");
    return {
        id: parts.shift()!,
        path: parts,
    };
}

function cloneValue<T>(value: T): T {
    if (value === undefined) return value;
    return JSON.parse(JSON.stringify(value)) as T;
}

function isObject(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getNestedValue(source: unknown, path: string[]) {
    let current = source;
    for (const part of path) {
        if (typeof current !== "object" || current === null || !(part in (current as Record<string, unknown>))) {
            return undefined;
        }
        current = (current as Record<string, unknown>)[part];
    }
    return current;
}

function setNestedValue(source: unknown, path: string[], value: unknown) {
    if (path.length === 0) return cloneValue(value);
    const lastKey = path[path.length - 1];
    const root = isObject(source) ? cloneValue(source) : {};
    let cursor = root as Record<string, unknown>;

    for (const part of path.slice(0, -1)) {
        const next = cursor[part];
        if (!isObject(next)) {
            cursor[part] = {};
        }
        cursor = cursor[part] as Record<string, unknown>;
    }
    cursor[lastKey!] = cloneValue(value);
    return root;
}

function deleteNestedValue(source: unknown, path: string[]) {
    if (!isObject(source)) return source;
    if (path.length === 0) return undefined;
    const lastKey = path[path.length - 1];
    const root = cloneValue(source) as Record<string, unknown>;
    let cursor: Record<string, unknown> = root;

    for (const part of path.slice(0, -1)) {
        const next = cursor[part];
        if (!isObject(next)) return root;
        cursor = next;
    }
    delete cursor[lastKey!];
    return root;
}

export class MovDB {
    protected database: Database;
    private table: string;
    private cacheValues: boolean;
    private valueCache = new Map<string, unknown>();

    // Hold compiled statements statically
    private stmtGet!: Statement;
    private stmtUpsert!: Statement;
    private stmtDelete!: Statement;
    private stmtAll!: Statement;
    private stmtCount!: Statement;
    private stmtClear!: Statement;

    constructor(table: string, cacheValues?: boolean) {
        this.table = table;
        this.cacheValues = cacheValues || false;
        this.database = new Database(DEFAULT_DB_FILE);

        // 1. turn on write-ahead logging first for performance
        this.database.run("PRAGMA journal_mode = WAL;");

        // 2. ensure a table exists before scanning metadata fields
        this.database.run(
            `CREATE TABLE IF NOT EXISTS ${this.table} (ID TEXT PRIMARY KEY NOT NULL, json TEXT NOT NULL)`
        );

        // 3. introspect structural metadata features using PRAGMA definitions
        const tableInfo = this.database.prepare(`PRAGMA table_info(${this.table})`).all() as {
            name: string;
            pk: number;
            notnull: number;
        }[];

        const idColumn = tableInfo.find(col => col.name === "ID");

        // if pk or notnull are 0, we are dealing with a broken/legacy quick.db format table
        if (idColumn && (idColumn.pk === 0 || idColumn.notnull === 0)) {
            console.warn(`[db-migration] restructuring legacy schema constraints for table: ${this.table}`);

            this.database.transaction(() => {
                // transfer rows to safety, swap structures out, and write back clean schemas
                this.database.run(`ALTER TABLE ${this.table} RENAME TO _migration_old_${this.table}`);

                this.database.run(
                    `CREATE TABLE ${this.table} (ID TEXT PRIMARY KEY NOT NULL, json TEXT NOT NULL)`
                );

                // deduplicate rows on the fly if corrupt duplicates existed previously
                this.database.run(`
                INSERT INTO ${this.table} (ID, json) 
                SELECT ID, json FROM _migration_old_${this.table} 
                WHERE ID IS NOT NULL AND json IS NOT NULL
                ON CONFLICT(ID) DO UPDATE SET json = excluded.json
            `);

                this.database.run(`DROP TABLE _migration_old_${this.table}`);
            })();

            console.log(`[db-migration] successfully upgraded table: ${this.table}`);
        }

        // 4. compile your cached statements down safely now that schemas match
        this.compileStatements();
    }

    private compileStatements() {
        this.stmtGet = this.database.prepare(`SELECT json FROM ${this.table} WHERE ID = ?`);
        this.stmtUpsert = this.database.prepare(
            `INSERT INTO ${this.table} (ID, json) VALUES (?, ?) 
             ON CONFLICT(ID) DO UPDATE SET json = excluded.json`
        );
        this.stmtDelete = this.database.prepare(`DELETE FROM ${this.table} WHERE ID = ?`);
        this.stmtAll = this.database.prepare(`SELECT ID, json FROM ${this.table}`);
        this.stmtCount = this.database.prepare(`SELECT COUNT(*) as count FROM ${this.table}`);
        this.stmtClear = this.database.prepare(`DELETE FROM ${this.table}`);
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

        const row = this.stmtGet.get(id) as { json: string | null } | undefined;
        if (!row?.json) return undefined;

        const parsed = JSON.parse(row.json) as unknown;
        this.cacheRow(id, parsed);
        return cloneValue(parsed);
    }

    private upsertRow(id: string, value: unknown) {
        this.cacheRow(id, value);
        this.stmtUpsert.run(id, JSON.stringify(value));
    }

    // Dropped fake async context conversions since drivers run synchronously underneath 
    public get<T = unknown>(key: string): T | undefined {
        const { id, path } = parsePath(key);
        const row = this.getRow(id);

        if (row === undefined) return undefined;
        if (path.length === 0) return row as T;

        return getNestedValue(row, path) as T | undefined;
    }

    public set<T = unknown>(key: string, value: T): T {
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

    public has(key: string): boolean {
        return this.get(key) !== undefined;
    }

    public add(key: string, value: number): number {
        const current = this.get<number>(key);
        const next = (typeof current === "number" ? current : 0) + value;
        this.set(key, next);
        return next;
    }

    public delete(key: string): boolean {
        const { id, path } = parsePath(key);

        if (path.length === 0) {
            this.dropCachedRow(id);
            const result = this.stmtDelete.run(id) as { changes?: number };
            return (result?.changes || 0) > 0;
        }

        const current = this.getRow(id);
        if (current === undefined) return false;

        const existed = getNestedValue(current, path) !== undefined;
        if (!existed) return false;

        const next = deleteNestedValue(current, path);
        if (next === undefined) {
            this.delete(id);
            return true;
        }

        this.upsertRow(id, next);
        return true;
    }

    public deleteAll(): void {
        this.valueCache.clear();
        this.stmtClear.run();
    }

    public all<T = unknown>(): { id: string; value: T }[] {
        const rows = this.stmtAll.all() as { ID: string; json: string }[];
        return rows.map((row) => ({
            id: row.ID,
            value: JSON.parse(row.json) as T,
        }));
    }

    public count(): number {
        const row = this.stmtCount.get() as { count: number } | undefined;
        return row?.count || 0;
    }

    public rawExec(sql: string, ...bindings: SQLQueryBindings[]) {
        return this.database.run(sql, bindings)
    }
}

export class SettingsDB extends MovDB {
    private guildID: string;

    constructor(guildID: string) {
        super("serversettings", true);
        this.guildID = guildID;
        // Run check synchronously to avoid instance call race conditions
        this.initSync();
    }

    private initSync() {
        if (!this.has(this.guildID)) {
            this.set(this.guildID, DEFAULT_SERVER_SETTINGS);
        }
    }
}

export class LevelDB extends MovDB {
    private stmtTop!: Statement;
    private stmtRank!: Statement;

    constructor() {
        super("level");
        this.setupVirtualIndexing();
    }

    /**
     * Creates an index tracking path fields straight within sqlite engine layers
     */
    private setupVirtualIndexing() {
        try {
            // Generate index target fields inside sqlite metadata spaces
            this.database.run(
                `CREATE INDEX IF NOT EXISTS idx_level_totalxp ON ${this.tableName}(CAST(json_extract(json, '$.totalxp') AS INTEGER) DESC)`
            );
        } catch {
            // fail-silent if structural table changes are locked
        }

        this.stmtTop = this.database.prepare(
            `SELECT ID, json FROM ${this.tableName}
             ORDER BY CAST(json_extract(json, '$.totalxp') AS INTEGER) DESC, ID ASC
             LIMIT ? OFFSET ?`
        );

        this.stmtRank = this.database.prepare(
            `SELECT COUNT(*) + 1 as rank FROM ${this.tableName}
             WHERE CAST(json_extract(json, '$.totalxp') AS INTEGER) > ?`
        );
    }

    private parseEntry(row: { ID: string; json: string }) {
        return {
            id: row.ID,
            value: JSON.parse(row.json) as ILevelDB,
        };
    }

    public topByTotalXP(limit: number, offset = 0) {
        try {
            const rows = this.stmtTop.all(limit, offset) as { ID: string; json: string }[];
            return rows.map((row) => this.parseEntry(row));
        } catch {
            const rows = this.all<ILevelDB>();
            return rows
                .sort((a, b) => b.value.totalxp - a.value.totalxp)
                .slice(offset, offset + limit);
        }
    }

    public getRank(id: string) {
        const entry = this.get<ILevelDB>(id);
        if (!entry) return undefined;

        try {
            const row = this.stmtRank.get(entry.totalxp) as { rank: number } | undefined;
            return {
                id,
                rank: row?.rank || 1,
                data: entry,
            };
        } catch {
            const rows = this.all<ILevelDB>();
            const rank = rows
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
        super("usersettings", true);
    }
}

export class CmdStatDB extends MovDB {
    constructor() {
        super("cmdstats");
    }
}