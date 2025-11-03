import { Prisma, Subscription } from "@prisma/client";
import {
    evaluateQuery,
    getPaginationMetadata,
    getPopulateOptions,
    getPrismaClient,
    mapPrismaErrorToHttpError,
    setPaginationAndPopulation
} from "@utils/prisma";
import { Service } from "fastify-decorators";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { FindOptions, PaginateOptions } from "@utils/exz";
import { PaginateDatasource } from "@models/Paginate";
import { encryptPasswordSync } from "@utils/crypto";
import {
    SubscriptionCreateSchema,
    SubscriptionDTO,
    SubscriptionUpdateDTO,
    SubscriptionUpdateSchema
} from "@models/Subscription";

@Service()
export class SubscriptionRepository {

    subscriptions = getPrismaClient().subscription;

    async save(principal: number, dto: SubscriptionDTO): Promise<Subscription | null> {
        try {
            return await this.subscriptions.create({
                data: {
                    ownerId: principal,
                    ...SubscriptionCreateSchema.parse(dto),
                },
                include: {
                    owner: true,
                    event: true,
                    category: true,
                }
            });
        } catch (err: unknown) {
            throw mapPrismaErrorToHttpError(err as PrismaClientKnownRequestError);
        }
    }

    async updateById(id: number, dto: SubscriptionUpdateDTO): Promise<Subscription | null> {
        try {
            return await this.subscriptions.update({
                where: {
                    id
                },
                data: {
                    ...SubscriptionUpdateSchema.parse(dto),
                },
                include: {
                    owner: true,
                    event: true,
                    category: true,
                }
            });
        } catch (err) {
            throw mapPrismaErrorToHttpError(err as PrismaClientKnownRequestError);
        }
    }

    async updateReadyForProjectionById(id: number, isReadyForProjection: boolean): Promise<Subscription | null> {
        try {
            return await this.subscriptions.update({
                where: {
                    id
                },
                data: {
                    isReadyForProjection
                },
                include: {
                    owner: true,
                    event: true,
                    category: true,
                }
            });
        } catch (err) {
            throw mapPrismaErrorToHttpError(err as PrismaClientKnownRequestError);
        }
    }

    async updateProjectionOrderById(id: number, projectionOrder: number): Promise<Subscription | null> {
        try {
            return await this.subscriptions.update({
                where: {
                    id
                },
                data: {
                    projectionOrder
                },
                include: {
                    owner: true,
                    event: true,
                    category: true,
                }
            });
        } catch (err) {
            throw mapPrismaErrorToHttpError(err as PrismaClientKnownRequestError);
        }
    }

    async updateProjectionDateById(id: number, projectAt: Date | null | undefined): Promise<Subscription | null> {
        try {
            return await this.subscriptions.update({
                where: {
                    id
                },
                data: {
                    projectAt,
                    isProjectionPlanned: !!projectAt,
                },
                include: {
                    owner: true,
                    event: true,
                    category: true,
                }
            });
        } catch (err) {
            throw mapPrismaErrorToHttpError(err as PrismaClientKnownRequestError);
        }
    }

    async findById(id: number, options?: FindOptions): Promise<Subscription | null> {
        try {
            return await this.subscriptions.findUniqueOrThrow({
                where: {
                    id
                },
            });
        } catch (err) {
            throw mapPrismaErrorToHttpError(err as PrismaClientKnownRequestError);
        }
    }

    async findOne(query: Prisma.SubscriptionWhereInput, options?: FindOptions): Promise<Subscription | null> {
        try {
            return await this.subscriptions.findFirst({
                where: query,
            });
        } catch (err) {
            throw mapPrismaErrorToHttpError(err as PrismaClientKnownRequestError);
        }
    }

    async findMany(query: Prisma.SubscriptionWhereInput, options?: FindOptions): Promise<Subscription[] | null> {
        try {
            return await this.subscriptions.findMany({
                where: evaluateQuery(query),
            });
        } catch (err) {
            throw mapPrismaErrorToHttpError(err as PrismaClientKnownRequestError);
        }
    }

    async paginate(query: Prisma.SubscriptionWhereInput, options: PaginateOptions): Promise<PaginateDatasource<Subscription> | null> {
        try {
            const docs = await this.subscriptions.findMany({
                where: {
                    ...query,
                },
                ...setPaginationAndPopulation({ ...options, populate: "event owner category" })
            });
            const totalDocs = await this.subscriptions.count({ where: evaluateQuery(query) });
            return {
                docs,
                ...getPaginationMetadata(options, totalDocs)
            } as PaginateDatasource<Subscription>;
        } catch (err) {
            throw mapPrismaErrorToHttpError(err as PrismaClientKnownRequestError);
        }
    }

    async deleteById(id: number): Promise<Subscription | null> {
        try {
            return await this.subscriptions.delete({
                where: {
                    id
                }
            });
        } catch (err) {
            throw mapPrismaErrorToHttpError(err as PrismaClientKnownRequestError);
        }
    }

}
