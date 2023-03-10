import { client } from "../client/Client";

export async function getUser(id: string) {
    const cache = client.users.get(id)
    if (!cache) {
        return await client.getRESTUser(id)
    } else {
        return cache
    }
}

export async function getMember(id: string) {
    const cache = client.guilds.get(process.env.SERVER_ID!)
    if (!cache) {
        return await client.getRESTGuildMember(process.env.SERVER_ID!, id)
    } else {
        const mcache = cache.members.get(id)
        if (!mcache) {
            return await client.getRESTGuildMember(process.env.SERVER_ID!, id)
        } else {
            return mcache
        }
    }
}