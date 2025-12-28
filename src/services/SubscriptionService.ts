import {Service} from "fastify-decorators";
import {SubscriptionRepository} from "@repositories/SubscriptionRepository";
import {Prisma, Subscription} from "@prisma/client";
import {FindOptions, PaginateOptions} from "@utils/exz";
import {PaginateDatasource} from "@models/Paginate";
import {createObjectWithoutThrow} from "@utils/query";
import httpErrors from "http-errors";
import {CompleteEvent, CompleteSubscription} from "../../prisma/generated/zod";
import {PermissionAction} from "../enums/PermissionAction";
import {SubscriptionDTO, SubscriptionPlanDTO, SubscriptionQueryDTO, SubscriptionUpdateDTO} from "@models/Subscription";
import {EventService} from "@services/EventService";
import {hasPermission} from "@utils/permission";
import {PermissionScope} from "../enums/PermissionScope";
import {EmailSenderService} from "@services/EmailSenderService";
import { DateTime } from 'luxon';
import process from "process";

@Service()
export class SubscriptionService {
    constructor(
        private readonly subscriptionRepository: SubscriptionRepository,
        private readonly eventService: EventService,
        private readonly emailSender: EmailSenderService,
    ) {}

    public async create(principal: number, dto: SubscriptionDTO) {
        const event = await this.eventService.findById(dto.eventId) as CompleteEvent;

        if (DateTime.fromJSDate(event.subscriptionExpiresAt) < DateTime.local()) {
            throw new httpErrors.BadRequest("Le candidature sono chiuse per questo evento, chiedi alla Presidentessa di estendere la data se ne hai bisogno");
        }

        if (!event.isActive) {
            throw new httpErrors.BadRequest("Questo evento non è più disponibile. Contattare la Presidentessa");
        }

        if (event.subscriptions.find(s => s.ownerId === principal)) {
            throw new httpErrors.BadRequest("Hai già candidato un film per questo evento");
        }

        const sub = await this.save(principal, dto) as CompleteSubscription;

        if (sub) {
            const recipient = process.env.GOD_EMAIL!;
            this.emailSender.sendSubscriptionEmail(event.name, sub.movieName, sub.category!.name!, recipient);
        }

        return sub;

    }

    public async save(principal: number, dto: SubscriptionDTO) {

        return await this.subscriptionRepository.save(principal, dto);
    }

    public async safeFindById(principal: number, wantedSubscriptionId: number, options?: FindOptions): Promise<Subscription | null> {
        if (await hasPermission(principal, {action: PermissionAction.UPDATE, entity: "SUBSCRIPTION", scope: PermissionScope.GOD })) {
            return await this.subscriptionRepository.findById(wantedSubscriptionId, options);
        }
        const subscription = await this.subscriptionRepository.findById(wantedSubscriptionId);
        if (!subscription) {
            throw new httpErrors.NotFound();
        }
        if (subscription.ownerId !== principal) {
            throw new httpErrors.BadRequest("Non puoi vedere le candidature di altri utenti");
        }
        return await this.subscriptionRepository.findById(wantedSubscriptionId, options);

    }

    public async unsafeFindById(wantedSubscriptionId: number): Promise<Subscription | null> {
        return await this.subscriptionRepository.findFullById(wantedSubscriptionId);

    }

    public async findByOwner(principal: number, query: SubscriptionQueryDTO, options: PaginateOptions): Promise<PaginateDatasource<Subscription> | null> {
        const prismaQuery = this.createQueryFromPayload(query);

        if (await hasPermission(principal, {action: PermissionAction.READ, entity: "SUBSCRIPTION", scope: PermissionScope.ALL })) {
            return await this.subscriptionRepository.paginate(prismaQuery, options);
        }
        if (principal !== query.ownerId) {
            throw new httpErrors.Forbidden("Non puoi vedere le candidature di altri utenti");
        }

        return await this.subscriptionRepository.paginate(prismaQuery, options);
    }

    public async paginate(query: SubscriptionQueryDTO, options: PaginateOptions): Promise<PaginateDatasource<Subscription> | null> {

        const prismaQuery = this.createQueryFromPayload(query);

        return await this.subscriptionRepository.paginate(prismaQuery, options);
    }

    public async updateById(principal: number, subscriptionToUpdateId: number, dto: SubscriptionUpdateDTO): Promise<Subscription | null> {
        if (await hasPermission(principal, {action: PermissionAction.UPDATE, entity: "SUBSCRIPTION", scope: PermissionScope.GOD })) {
            const sub = await this.subscriptionRepository.updateById(subscriptionToUpdateId, { ...dto, isValid: true }) as CompleteSubscription;
            if (sub) {
                this.emailSender.sendSubscriptionUpdateEmail(sub.event.name, sub.movieName, sub.category!.name!, process.env.GOD_EMAIL!);
            }
            return sub as Subscription;
        }
        const subscription = await this.subscriptionRepository.findById(subscriptionToUpdateId);
        if (!subscription) {
            throw new httpErrors.NotFound();
        }
        if (subscription.ownerId !== principal) {
            throw new httpErrors.BadRequest("Non puoi modificare candidature di altri utenti");
        }
        const sub = await this.subscriptionRepository.updateById(subscriptionToUpdateId, { ...dto, isValid: true }) as CompleteSubscription;
        if (sub) {
            this.emailSender.sendSubscriptionUpdateEmail(sub.event.name, sub.movieName, sub.category!.name!, process.env.GOD_EMAIL!);
        }
        return sub as Subscription;
    }

    public async updatePlanningById(subscriptionToUpdateId: number, dto: SubscriptionPlanDTO): Promise<Subscription | null> {

        if (dto.projectAt && DateTime.fromJSDate(dto.projectAt) < DateTime.local()) {
            throw new httpErrors.BadRequest("Non puoi proiettare un film nel passato? ti sembra Ritorno al futuro?")
        }

        const plannedSubscription = await this.subscriptionRepository.updateProjectionPlanningById(subscriptionToUpdateId, dto.projectAt, dto.location) as CompleteSubscription;

        // send email to all participant
        this.emailSender.sendPlannedProjectionEmail(plannedSubscription.event.name,
            dto,
            plannedSubscription.category?.name || "CATEGORIA",
            plannedSubscription.event.participants.map(p => p.email));

        return plannedSubscription as Subscription;

    }

    public async invalidate(principal: number, subscriptionToInvalidateId: number): Promise<Subscription | null> {
        const sub = await this.subscriptionRepository.updateById(subscriptionToInvalidateId, { isValid: false }) as CompleteSubscription
        if (sub) {
            const recipient = sub.owner.email;
            this.emailSender.sendInvalidationEmail(sub.owner.username, sub.event.name, sub.movieName, recipient);
        }
        return sub as Subscription | null;
    }

    public async deleteById(principal: number, id: number): Promise<Subscription | null> {
        if (await hasPermission(principal, {action: PermissionAction.UPDATE, entity: "SUBSCRIPTION", scope: PermissionScope.GOD })) {
            return await this.subscriptionRepository.deleteById(id);
        }
        const subscription = await this.subscriptionRepository.findById(id);
        if (!subscription) {
            throw new httpErrors.NotFound();
        }
        if (subscription.ownerId !== principal) {
            throw new httpErrors.BadRequest("Non puoi eliminare le candidature di altri utenti");
        }
        return await this.subscriptionRepository.deleteById(id);

    }

    private createQueryFromPayload(payload: SubscriptionQueryDTO): Prisma.SubscriptionWhereInput {
        const valueQuery: Prisma.SubscriptionWhereInput[] = [
            createObjectWithoutThrow(payload.value, { name: { contains: payload.value, mode: "insensitive" } }),
            createObjectWithoutThrow(payload.value, { description: { contains: payload.value, mode: "insensitive" } }),
        ].filter(o => Object.values(o).length > 0);

        const ownerQuery: Prisma.SubscriptionWhereInput[] = [
            createObjectWithoutThrow(payload.ownerId, { ownerId: payload.ownerId }),
        ].filter(o => Object.values(o).length > 0);


        const query: Prisma.SubscriptionWhereInput[] = [
            createObjectWithoutThrow(valueQuery.length, { OR: valueQuery }),
            createObjectWithoutThrow(ownerQuery.length, { OR: ownerQuery }),
        ].filter(o => Object.values(o).length > 0);

        return {
            AND: query.length > 0 ? query : undefined,
        };
    };

    public async unlockNextProjection(eventId: number): Promise<boolean | null> {
        const event = await this.eventService.findById(eventId) as CompleteEvent;

        if (DateTime.fromJSDate(event.subscriptionExpiresAt) > DateTime.local()) {
            throw new httpErrors.BadRequest("Non puoi sbloccare le proiezioni prima che le candidature siano chiuse");
        }

        if (event.numberOfParticipants > event.subscriptions.length) {
            throw new httpErrors.BadRequest("Non puoi sbloccare le proiezioni prima che tutte le candidature siano presentate");
        }

        if (!event) {
            throw new httpErrors.NotFound("Nessun evento trovato con l'id fornito");
        }

        if (!event.subscriptions.filter(s => !s.isReadyForProjection).length) {
            throw httpErrors.BadRequest("Hai già svelato tutti gli eventi");
        }

        // if it's the first time I need to generate the sequence first
        if (!event.subscriptions.filter(s => s.projectionOrder).length) {
            const projectionTemplate = await this.splitSubsByCategories(eventId);

            for (const template of projectionTemplate) {
                await this.subscriptionRepository.updateProjectionOrderById(template.subscriptionId, template.projectionOrder);
                template.projectionOrder === 1 && await this.subscriptionRepository.updateReadyForProjectionById(template.subscriptionId, true);
            }

            return true;
        }

        // check if user can go ahead
        event.subscriptions.filter(s => s.isReadyForProjection).forEach((projection) => {
            if (!projection.projectAt || DateTime.fromJSDate(projection.projectAt) > DateTime.local()) {
                throw new httpErrors.BadRequest("Non puoi svelare il prossimo film senza aver proiettato quello attualmente in programmazione")
            }
        })

        // sort subscription by asc projection order
        // get last not ready for projection
        const nextProjection = event.subscriptions.filter(s => !s.isReadyForProjection)
            .sort((a, b) => a.projectionOrder! - b.projectionOrder!)[0];

        if (!nextProjection) {
            throw httpErrors.InternalServerError("Impossibile svelare la prossima proiezione")
        }

        // set ready for projection
        await this.subscriptionRepository.updateReadyForProjectionById(nextProjection.id, true);


        return true;

    }

    private async splitSubsByCategories(eventId: number) {

        const result = [];

        const event = await this.eventService.findById(eventId) as CompleteEvent;

        const shuffledSubs = event.subscriptions!.map(s => ({ s, sort: Math.random() }))
            .sort((a, b) => a.sort - b.sort)
            .map(({s}) => s);

        let index = 0;

        while (shuffledSubs.length > 0) {
            const sub = shuffledSubs.shift();

            result.push({
                subscriptionId: sub!.id,
                projectionOrder: index + 1,
            });

            index ++;
        }

        return result;
    }

    public async inviteToFulfillForm(subId: number): Promise<boolean> {
        const sub = await this.subscriptionRepository.findFullById(subId) as CompleteSubscription;

        this.emailSender.sendInvitationToFulfill(sub.event.name, sub.movieName, sub.event.participants.filter(p => p.id !== sub.ownerId).map(p => p.email));

        await this.subscriptionRepository.updateById(subId, {isReadyForRating: true});

        return true;

    }
}
