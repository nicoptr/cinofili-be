import { PrismaClient } from '@prisma/client';
import {LOGGER} from "@utils/winston";
import {seed_users} from "./seed-data/seed_users";
import {UserCreateSchema} from "@models/User";
import {RoleToUserSchema} from "@models/RoleToUser";
import {mapPrismaErrorToConsoleError} from "@utils/prisma";
import {PrismaClientKnownRequestError} from "@prisma/client/runtime/library";
import {seed_roles} from "./seed-data/seed_roles";

export async function seed(prisma: PrismaClient) {
    LOGGER.info("Started seeding from prisma/seed.ts");

    const rolesCount = await prisma.role.count();
    const userCount = await prisma.user.count();

    if (userCount !== 0) {
        LOGGER.warn(`Cannot seed users: there are already ${userCount} users. If you want to proceed delete them and their relations with roles`);
    }

    try {
        if (rolesCount === 0) {
            LOGGER.info("Seeding roles");
            for (const role of seed_roles) {
                await prisma.role.upsert({
                    where: { name: role.name },
                    update: role,
                    create: role,
                });
            }
            LOGGER.info("Seeding roles completed");
        } else {
            LOGGER.warn("No need to seed roles");
        }
    } catch (err) {
        LOGGER.error("Error while seeding roles: ")
        mapPrismaErrorToConsoleError(err as PrismaClientKnownRequestError);
    }

    try {
        if (userCount === 0) {
            LOGGER.info("Seeding users");
            for (const user of seed_users) {
                if (user.isToBeSeeded) {
                    await prisma.user.create({
                        data: {
                            ...UserCreateSchema.parse(user.dto),
                            ...(user.dto.roles?.length ? {
                                roles: {
                                    createMany: {
                                        data: RoleToUserSchema.array().parse(user.dto.roles) ?? []
                                    }
                                }
                            } : {})
                        }
                    });
                }
            }
            LOGGER.info("Seeding users completed");
        } else {
            LOGGER.warn("No need to seed users");
        }

    } catch (err) {
        LOGGER.error("Error while seeding users: ")
        mapPrismaErrorToConsoleError(err as PrismaClientKnownRequestError);
    }
}
