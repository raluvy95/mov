import { sync } from "cross-spawn";

export function asyncSafeExec(command: string, prompt: string[]) {
    return new Promise<string>((res, rej) => {
        const child = sync(command, prompt);
        if (child.error) {
            rej(child.error);
        } else if (child.status !== 0) {
            rej(new Error(`Process exited with ${child.status}`));
        }
        let result = "";
        for (const o of child.output) {
            if (!(o instanceof Buffer)) continue;
            result += o?.toString() + "\n";
        }
        res(result);
    });
}
