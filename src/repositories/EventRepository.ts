import { Prisma, Event } from "@prisma/client";
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
import {EventCreateSchema, EventDTO, EventUpdateSchema} from "@models/Event";

@Service()
export class EventRepository {

    events = getPrismaClient().event;

    async save(dto: EventDTO): Promise<Event | null> {
        try {
            return await this.events.create({
                data: {
                    ...EventCreateSchema.parse(dto),
                }
            });
        } catch (err: unknown) {
            throw mapPrismaErrorToHttpError(err as PrismaClientKnownRequestError);
        }
    }

    async updateById(id: number, dto: EventDTO): Promise<Event | null> {
        try {
            return await this.events.update({
                where: {
                    id
                },
                data: {
                    ...EventUpdateSchema.parse(dto),
                },
            });
        } catch (err) {
            throw mapPrismaErrorToHttpError(err as PrismaClientKnownRequestError);
        }
    }

    async findById(id: number, options?: FindOptions): Promise<Event | null> {
        try {
            return await this.events.findUniqueOrThrow({
                where: {
                    id
                },
                include: { subscriptions: true }
            });
        } catch (err) {
            throw mapPrismaErrorToHttpError(err as PrismaClientKnownRequestError);
        }
    }

    async findOne(query: Prisma.EventWhereInput, options?: FindOptions): Promise<Event | null> {
        try {
            return await this.events.findFirst({
                where: query,
                include: { subscriptions: true }
            });
        } catch (err) {
            throw mapPrismaErrorToHttpError(err as PrismaClientKnownRequestError);
        }
    }

    async findMany(query: Prisma.EventWhereInput, options?: FindOptions): Promise<Event[] | null> {
        try {
            return await this.events.findMany({
                where: evaluateQuery(query),
                include: { subscriptions: true }
            });
        } catch (err) {
            throw mapPrismaErrorToHttpError(err as PrismaClientKnownRequestError);
        }
    }

    async paginate(query: Prisma.EventWhereInput, options: PaginateOptions): Promise<PaginateDatasource<Event> | null> {
        try {
            const docs = await this.events.findMany({
                where: {
                    ...query,
                },
                ...setPaginationAndPopulation(options)
            });
            const totalDocs = await this.events.count({ where: evaluateQuery(query) });
            return {
                docs,
                ...getPaginationMetadata(options, totalDocs)
            } as PaginateDatasource<Event>;
        } catch (err) {
            throw mapPrismaErrorToHttpError(err as PrismaClientKnownRequestError);
        }
    }

    async deleteById(id: number): Promise<Event | null> {
        try {
            return await this.events.delete({
                where: {
                    id
                }
            });
        } catch (err) {
            throw mapPrismaErrorToHttpError(err as PrismaClientKnownRequestError);
        }
    }

}
