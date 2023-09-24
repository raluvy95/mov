// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
// @ts-nocheck

const { readdirSync } = require("fs");

if (!readdirSync(".").includes("database.sqlite")) {
    throw new Error(
        "Cannot find database to be detected. You must rename the database to `database.sqlite`.",
    );
}

const db = require("better-sqlite3")("database.sqlite", {
    fileMustExist: true,
});

const newdb = require("better-sqlite3")(".MOV.sqlite", {
    fileMustExist: true,
});

const rows = db.prepare("SELECT * FROM level").all();

const i = newdb.prepare("INSERT INTO level (ID, json) VALUES (?, ?)");

console.log("Start migrating from database.sqlite. Please be patient...");

for (const data of rows) {
    i.run(
        data.userid,
        JSON.stringify({
            xp: data.xp,
            level: data.level,
            totalxp: data.totalxp,
        }),
    );
}

console.log("Finished! Thank you for being veteran user!");
