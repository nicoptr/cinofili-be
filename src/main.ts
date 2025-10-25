import "module-alias/register";
import "reflect-metadata";

import { APIServer } from "./server";
import { initializePrismaClient } from "@utils/prisma";
import { LOGGER } from "@utils/winston";
import { seed } from "../prisma/seed";
import process from "process";
import { banner } from "@utils/banner";

async function start() {
    console.log('\x1b[1;32m%s\x1b[0m', banner);
    const prismaClient = await initializePrismaClient();

    if (process.env.SEED_DB === "true") {
        await seed(prismaClient);
    }

    const apiServer = new APIServer();
    await apiServer.start();

    const graceful = async () => {
        await prismaClient.$disconnect();
        await apiServer.stop();
        process.exit(0);
    };

    // Stop graceful
    process.on("SIGTERM", graceful);
    process.on("SIGINT", graceful);
}

start()
    .catch(err => {
        LOGGER.error(`Couldn't start server: ${err.message} ${err.stack}`);
        process.exit(-1);
    });
