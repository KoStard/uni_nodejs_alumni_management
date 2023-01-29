import { Redis } from "ioredis";
import { Alumnus } from "./alumnus";

export class AlumniAccessor {
    private redisClient: Redis;
    public constructor(redisClient: Redis) {
        this.redisClient = redisClient;
    }
    public async getAlumni(): Promise<any> {
        console.log("Getting all alumni");
        const keys = await this.redisClient.keys("alumni:objects:*");
        const multi = this.redisClient.multi();
        keys.forEach((key) => {
            multi.hgetall(key);
        });
        const alumni = await multi.exec();
        return alumni!.map(([err, alumnusRaw], index) => {
            if (err !== null) {
                console.error("Got error when reading for key: ", keys[index], err);
            }
            return this.convertRedisToAlumnus(alumnusRaw);
        });
    }

    public async getAlumnus(id: number): Promise<any> {
        console.log("Getting alumni with id: " + id);
        const alumnusRaw = await this.redisClient.hgetall(`alumni:objects:${id}`);
        return this.convertRedisToAlumnus(alumnusRaw);
    }

    public async addAlumnus(alumnus: Alumnus): Promise<void> {
        const id = await this.redisClient.incr("alumni:id");
        alumnus.id = id;
        console.log("Adding alumni with id: " + id);
        await this.redisClient.hset(`alumni:objects:${id}`, ... new Array(...this.convertAlumnusToRedis(alumnus).entries()).flat());
    }

    public async updateAlumnus(alumnus: Alumnus): Promise<void> {
        console.log("Updating alumni with id: " + alumnus.id);
        await this.redisClient.hset(`alumni:objects:${alumnus.id}`, ... new Array(...this.convertAlumnusToRedis(alumnus).entries()).flat());
    }

    public async deleteAlumnus(id: any): Promise<void> {
        console.log("Deleting alumni with id: " + id);
        await this.redisClient.del(`alumni:objects:${id}`);
    }

    private convertAlumnusToRedis(alumnus: Alumnus): Map<string, string> {
        const alumnusRedis: Map<string, string> = new Map();
        for (const key of Object.keys(alumnus) as [keyof Alumnus]) {
            alumnusRedis.set(key, JSON.stringify(alumnus[key]));
        }
        return alumnusRedis;
    }

    private convertRedisToAlumnus(alumnusRedis: any): Alumnus | null {
        if (alumnusRedis === undefined || alumnusRedis.id === undefined) {
            return null;
        }
        const alumnus: Alumnus = {
            id: alumnusRedis.id,
            fullName: JSON.parse(alumnusRedis.fullName),
            currentEmployer: JSON.parse(alumnusRedis.currentEmployer),
            previousEmployers: JSON.parse(alumnusRedis.previousEmployers),
            studyStartDate: JSON.parse(alumnusRedis.studyStartDate),
            studyEndDate: JSON.parse(alumnusRedis.studyEndDate),
            description: JSON.parse(alumnusRedis.description),
        };
        return alumnus;
    }
}