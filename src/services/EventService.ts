import { Service } from "fastify-decorators";
import { EventRepository } from "@repositories/EventRepository";
import { Prisma, RoleName, Event } from "@prisma/client";
import { encryptPasswordSync } from "@utils/crypto";
import { FindOptions, PaginateOptions } from "@utils/exz";
import { PaginateDatasource } from "@models/Paginate";
import { createObjectWithoutThrow } from "@utils/query";
import httpErrors from "http-errors";
import { CompleteEvent } from "../../prisma/generated/zod";
import { PermissionAction } from "../enums/PermissionAction";
import { PermissionScope } from "../enums/PermissionScope";
import {EventDTO, EventQueryDTO} from "@models/Event";

@Service()
export class EventService {
    constructor(private readonly eventRepository: EventRepository) {}

    public async save(dto: EventDTO) {

        return await this.eventRepository.save(dto);
    }

    public async findById(wantedEventId: number, options?: FindOptions): Promise<Event | null> {
        return await this.eventRepository.findById(wantedEventId, options);
    }

    public async findOne(query: Prisma.EventWhereInput, options?: FindOptions): Promise<Event | null> {
        return await this.eventRepository.findOne(query, options);
    }

    public async paginate(query: EventQueryDTO, options: PaginateOptions): Promise<PaginateDatasource<Event> | null> {

        const prismaQuery = this.createQueryFromPayload(query);

        return await this.eventRepository.paginate(prismaQuery, options);
    }

    public async updateById(eventToUpdateId: number, dto: EventDTO): Promise<Event | null> {
        return await this.eventRepository.updateById(eventToUpdateId, dto);
    }

    public async deleteById(id: number): Promise<Event | null> {
        return await this.eventRepository.deleteById(id);
    }

    private createQueryFromPayload(payload: EventQueryDTO): Prisma.EventWhereInput {
        const valueQuery: Prisma.EventWhereInput[] = [
            createObjectWithoutThrow(payload.value, { name: { contains: payload.value, mode: "insensitive" } }),
            createObjectWithoutThrow(payload.value, { description: { contains: payload.value, mode: "insensitive" } }),
        ].filter(o => Object.values(o).length > 0);


        const query: Prisma.EventWhereInput[] = [
            createObjectWithoutThrow(valueQuery.length, { OR: valueQuery }),
        ].filter(o => Object.values(o).length > 0);

        return {
            AND: query.length > 0 ? query : undefined,
        };
    };
}
