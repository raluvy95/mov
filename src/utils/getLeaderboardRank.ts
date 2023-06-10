import { client } from "../client/Client";
import { ILevelDB } from "../interfaces/database";

export async function getLeaderboardRank(id: string) {
    const all = (await client.database.level.all()).sort((a, b) => {
        return b.value.totalxp - a.value.totalxp;
    });
    const result: { id: string; rank: number; data: ILevelDB }[] = [];
    let rankNr = 1;
    for (const entry of all) {
        result.push({
            id: entry.id,
            rank: rankNr,
            data: entry.value,
        });
        rankNr++;
    }
    return result.find((m) => m.id === id)!;
}
