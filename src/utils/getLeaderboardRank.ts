import { client } from "../client/Client";

export async function getLeaderboardRank(id: string) {
    return (await client.database.level.getRank(id))!;
}
