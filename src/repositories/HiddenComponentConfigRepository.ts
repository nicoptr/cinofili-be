import { getPaginationMetadata, getPrismaClient, mapPrismaErrorToHttpError, setPagination } from "@utils/prisma";
import { Service } from "fastify-decorators";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { HiddenComponentConfig, Prisma } from "@prisma/client";
import { provide } from "inversify-binding-decorators";
import { HiddenComponentDTO } from "../DTOs/HiddenComponentDTO";
import { PaginateOptions } from "@utils/exz";
import { PaginateDatasource } from "@models/Paginate";
import {
    HiddenComponentConfigCreateDTO,
    HiddenComponentConfigCreateSchema,
    HiddenComponentConfigDTO,
    HiddenComponentConfigSchema
} from "@models/HiddenComponentConfig";

@Service()
@provide(HiddenComponentConfigRepository)
export class HiddenComponentConfigRepository {

    hiddenComponentConfig = getPrismaClient().hiddenComponentConfig;

    public async save(dto: HiddenComponentConfigCreateDTO){
        try {
            return await this.hiddenComponentConfig.createManyAndReturn({
                data: dto.roles.map(role => ({
                    ...HiddenComponentConfigSchema.parse({ ...dto, ...{ roleName: role } }),
                }))
            })
        } catch (err) {
            throw mapPrismaErrorToHttpError(err as PrismaClientKnownRequestError);
        }
    }

    public async findHiddenComponentsForRolesCombination(userId: number): Promise<Array<HiddenComponentDTO>> {
        try {

            const query: string = `
            SELECT DISTINCT h.context, h.section, h.component
                            FROM "HiddenComponentConfig" h
                            WHERE h."isActive" = true
                            AND h."roleName" IN (
                                SELECT rtu."roleName"
                                FROM "User" u
                                JOIN "RoleToUser" rtu on u.id = rtu."userId"
                                where "userId" = ${userId}
                                )
                            AND (
                                SELECT COUNT(DISTINCT hh."roleName")
                                    FROM "HiddenComponentConfig" hh
                                    WHERE hh.context = h.context
                                    AND hh.section = h.section
                                    AND hh.component = h.component
                                    AND hh."isActive" = true
                                    AND hh."roleName" = h."roleName"
                            ) = (SELECT COUNT(DISTINCT rtu2."id")
                                    FROM "User" u2
                                    JOIN "RoleToUser" rtu2 on u2.id = rtu2."userId"
                                    WHERE u2."id" = ${userId});
            `

            return  getPrismaClient().$transaction(async prisma => {
                return prisma.$queryRawUnsafe(query);
            });

        } catch (err) {
            throw mapPrismaErrorToHttpError(err as PrismaClientKnownRequestError);
        }
    }

    public async findById(id: number): Promise<HiddenComponentConfig> {
        try {
            return await this.hiddenComponentConfig.findUniqueOrThrow({ where: { id } });
        } catch (err) {
            throw mapPrismaErrorToHttpError(err as PrismaClientKnownRequestError);
        }
    }
    
    async paginate(query: Prisma.HiddenComponentConfigWhereInput, options: PaginateOptions): Promise<PaginateDatasource<HiddenComponentConfig> | null> {
        try {
            const docs = await this.hiddenComponentConfig.findMany({
                where: query,
                ...setPagination(options)
            });
            const totalDocs = await this.hiddenComponentConfig.count({ where: query });
            return {
                docs: docs,
                ...getPaginationMetadata(options, totalDocs)
            } as PaginateDatasource<HiddenComponentConfig>;
        } catch (err) {
            throw mapPrismaErrorToHttpError(err as PrismaClientKnownRequestError);
        }
    }

    public async updateById(id: number, dto: HiddenComponentConfigDTO): Promise<HiddenComponentConfig> {
        try {
            return await this.hiddenComponentConfig.update({
                where: { id },
                data: {
                    ...HiddenComponentConfigCreateSchema.partial().parse(dto),
                },
            })
        } catch (err) {
            throw mapPrismaErrorToHttpError(err as PrismaClientKnownRequestError);
        }
    }

}
