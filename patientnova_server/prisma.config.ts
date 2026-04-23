import "dotenv/config";
import type { PrismaConfig } from "prisma";
import { env } from "prisma/config";

export default {
    schema: "./schema.prisma",
    migrations: {
        path: "./migrations",
        seed: "tsx src/prisma/seed.ts",
    },
    datasource: {
        url: env("DATABASE_URL"),
    },
} satisfies PrismaConfig;