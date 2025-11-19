import { Service } from "fastify-decorators";
import { EventRepository } from "@repositories/EventRepository";
import { Prisma, RoleName, Event } from "@prisma/client";
import { encryptPasswordSync } from "@utils/crypto";
import { FindOptions, PaginateOptions } from "@utils/exz";
import { PaginateDatasource } from "@models/Paginate";
import { createObjectWithoutThrow } from "@utils/query";
import httpErrors from "http-errors";
import {CompleteEvent, CompleteUser} from "../../prisma/generated/zod";
import { PermissionAction } from "../enums/PermissionAction";
import { PermissionScope } from "../enums/PermissionScope";
import {EventDTO, EventQueryDTO} from "@models/Event";
import {UserService} from "@services/UserService";
import {EventSpecificationDTO, EventSpecificationSchema} from "@models/User";
import {EmailSenderService} from "@services/EmailSenderService";
import {formatItaliaDate} from "@utils/date";

@Service()
export class EventService {
    constructor(
        private readonly eventRepository: EventRepository,
        private readonly userService: UserService,
        private readonly emailService: EmailSenderService,
    ) {}

    public async save(dto: EventDTO) {

        return await this.eventRepository.save(dto);
    }

    public async findById(wantedEventId: number, options?: FindOptions): Promise<Event | null> {
        return await this.eventRepository.findById(wantedEventId, options);
    }

    public async safeFindById(principalId: number, wantedEventId: number, options?: FindOptions): Promise<Event | null> {
        const result = await this.eventRepository.findById(wantedEventId, options) as CompleteEvent;

        const loggedUser = await this.userService.findById(principalId, { populate: "roles"}) as CompleteUser;

        if (loggedUser.roles[0]?.roleName === "GOD") {
            return result as Event;
        }

        return { ...result, subscriptions: result.subscriptions.filter(sub => sub.isReadyForRating)} as Event;
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

    public async invite(eventId: number): Promise<boolean> {
        const event = await this.eventRepository.findById(eventId) as CompleteEvent;
        if (!event) {
            throw new httpErrors.NotFound(`Event with id ${eventId} not found`);
        }
        if (event.categories.length <= 0) {
            throw new httpErrors.BadRequest(`L'evento ${event.name} non ha alcuna categoria associata`);
        }
        if (event.participants.length <= 0) {
            throw new httpErrors.BadRequest(`L'evento ${event.name} non ha alcun partecipante associato`);
        }
        if (event.participants.length < event.categories.length) {
            throw new httpErrors.BadRequest(`L'evento ${event.name} non può avere più categorie che partecipanti`);
        }

        const categoryAssignments = await this.splitCategories(eventId);


        for (const a of categoryAssignments) {
            const savedUser = await this.userService.updateEventSpecification(a.userId, [{
                eventId: eventId,
                categoryId: a.categoryId,
            }]);
            if (!savedUser) {
                throw new httpErrors.InternalServerError(`Impossibile notificare tutti gli utenti`);
            }
            this.emailService.sendInvitationEmail(savedUser.username,
                event.name,
                formatItaliaDate(event.subscriptionExpiresAt),
                formatItaliaDate(event.expiresAt),
                event.categories.find(c => c.id === a.categoryId)?.name || "undefined",
                savedUser.email)
        }

        return true;
    }

    public async reinvite(eventId: number): Promise<boolean> {
        const event = await this.eventRepository.findById(eventId) as CompleteEvent;
        if (!event) {
            throw new httpErrors.NotFound(`Event with id ${eventId} not found`);
        }
        if (event.categories.length <= 0) {
            throw new httpErrors.BadRequest(`L'evento ${event.name} non ha alcuna categoria associata`);
        }
        if (event.participants.length <= 0) {
            throw new httpErrors.BadRequest(`L'evento ${event.name} non ha alcun partecipante associato`);
        }
        if (event.participants.length < event.categories.length) {
            throw new httpErrors.BadRequest(`L'evento ${event.name} non può avere più categorie che partecipanti`);
        }

        for (const participant of event.participants) {
            for (const assignment of participant.eventSpecification as EventSpecificationDTO[]) {
                if (assignment.eventId === eventId) {
                    this.emailService.sendInvitationEmail(participant.username,
                        event.name,
                        formatItaliaDate(event.subscriptionExpiresAt),
                        formatItaliaDate(event.expiresAt),
                        event.categories.find(c => c.id === assignment.categoryId)?.name || "undefined",
                        participant.email)
                }
            }
        }


        return true;
    }

    private async splitCategories(eventId: number): Promise<{userId: number, eventId: number, categoryId: number}[]> {
        const result = [];

        const event = await this.eventRepository.findById(eventId) as CompleteEvent;

        const shuffledUsers = event.participants.map(v => ({ v, sort: Math.random() }))
            .sort((a, b) => a.sort - b.sort)
            .map(({ v }) => v);

        let index = 0;

        while (shuffledUsers.length > 0) {
            const user = shuffledUsers.shift()!;
            const category = event.categories[index % event.categories.length];

            result.push({
                userId: user.id,
                categoryId: category!.id,
                eventId: event.id,
            });
            index++;
        }

        return result;

    }

    public async getEventWithFormById(eventId: number): Promise<CompleteEvent | null> {
        return await this.eventRepository.getEventWithFormById(eventId);
    }
}
