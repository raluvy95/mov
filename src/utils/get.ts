import { Message, User } from "eris";
import { client } from "../client/Client";

export async function getUserByID(id: string, cacheOnly?: boolean) {
    const cache = client.users.get(id);
    if (!cache) {
        return cacheOnly ? undefined : await client.getRESTUser(id);
    } else {
        return cache;
    }
}

export async function getGuildByID(id: string) {
    const cache = client.guilds.get(id);
    if (!cache) {
        return await client.getRESTGuild(id, false);
    }
    return cache;
}

export async function getMemberByID(id: string) {
    const cache = client.guilds.get(process.env.SERVER_ID!);
    if (!cache) {
        return await client.getRESTGuildMember(process.env.SERVER_ID!, id);
    } else {
        const mcache = cache.members.get(id);
        if (!mcache) {
            return await client.getRESTGuildMember(process.env.SERVER_ID!, id);
        } else {
            return mcache;
        }
    }
}

export async function getUser(
    msg: Message<any>,
    name: string,
): Promise<User | undefined> {
    const mentioned = msg.mentions;
    if (mentioned.length > 0) {
        return mentioned[0];
    }

    if (!isNaN(Number(name))) {
        return await getUserByID(name);
    }

    const cached = client.users.find(
        (m) => m.username.includes(name) || m.username === name,
    );

    if (!cached) {
        const m = await client.searchGuildMembers(
            process.env.SERVER_ID!,
            name,
            1,
        );
        if (m.length < 1) {
            return undefined;
        } else {
            return m[0].user;
        }
    }

    return cached;
}
