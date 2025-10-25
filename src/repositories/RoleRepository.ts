import { Service } from "fastify-decorators";
import { provide } from "inversify-binding-decorators";
import { getPrismaClient, mapPrismaErrorToHttpError } from "@utils/prisma";
import { Prisma, Role } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";


@Service()
@provide(RoleRepository)
export class RoleRepository {
    roles = getPrismaClient().role;

    public async findMany(query: Prisma.RoleWhereInput): Promise<Role[] | undefined> {
        try {
            return await this.roles.findMany({
                where: query
            })
        } catch (err) {
            mapPrismaErrorToHttpError(err as PrismaClientKnownRequestError)
        }
    }
}
