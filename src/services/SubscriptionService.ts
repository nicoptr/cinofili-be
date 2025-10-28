import {Service} from "fastify-decorators";
import {SubscriptionRepository} from "@repositories/SubscriptionRepository";
import {Prisma, Subscription} from "@prisma/client";
import {FindOptions, PaginateOptions} from "@utils/exz";
import {PaginateDatasource} from "@models/Paginate";
import {createObjectWithoutThrow} from "@utils/query";
import httpErrors from "http-errors";
import {CompleteEvent, CompleteSubscription} from "../../prisma/generated/zod";
import {PermissionAction} from "../enums/PermissionAction";
import {SubscriptionDTO, SubscriptionQueryDTO, SubscriptionUpdateDTO} from "@models/Subscription";
import {EventService} from "@services/EventService";
import {hasPermission} from "@utils/permission";
import {PermissionScope} from "../enums/PermissionScope";
import {EmailSenderService} from "@services/EmailSenderService";
import {UserService} from "@services/UserService";
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

    public async findById(principal: number, wantedSubscriptionId: number, options?: FindOptions): Promise<Subscription | null> {
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
}
