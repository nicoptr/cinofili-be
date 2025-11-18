import { FastifyReply, FastifyRequest } from "fastify";
import { Controller, DELETE, GET, PATCH, POST } from "fastify-decorators";
import {
    SubscriptionCreateDTO,
    SubscriptionDTO,
    SubscriptionPaginateBodyInputSchema,
    SubscriptionPaginateDTO, SubscriptionPlanDTO, SubscriptionPlanSchema,
    SubscriptionSchema,
    SubscriptionUpdateDTO,
    SubscriptionUpdateSchema,
} from "@models/Subscription";
import { SubscriptionService } from "@services/SubscriptionService";
import { Authenticate } from "@middleware/Authenticate";
import { exz, FindOptions } from "@utils/exz";
import httpErrors from "http-errors";
import { z } from "zod";
import { HasPermission } from "@middleware/HasPermission";
import { PermissionAction } from "../enums/PermissionAction";
import { PermissionScope } from "../enums/PermissionScope";

@Controller({
    route: "/subscriptions",
    tags: [{ name: "Subscriptions", description: "Subscription management" }],
})
export class SubscriptionController {
    constructor(private readonly subscriptionService: SubscriptionService) {}

    @POST("/create", {
        schema: {
            operationId: "createSubscription",
            summary: "Create Subscription",
            body: SubscriptionSchema,
            security: [
                {
                    apiKey: []
                }
            ],
        },
        onRequest: [
            Authenticate(),
            HasPermission(PermissionAction.USER, "USER", PermissionScope.USER),
        ],
    })
    async create(
        req: FastifyRequest<{ Body: SubscriptionCreateDTO }>,
        reply: FastifyReply
    ) {
        reply
            .status(200)
            .send(await this.subscriptionService.create(+req.user.id, req.body));
    }
    
    @GET("/:id", {
        schema: {
            operationId: "findSubscription",
            summary: "Get Subscription from id",
            params: exz.pathId,
            querystring: exz.findOptions,
            security: [
                {
                    apiKey: []
                }
            ],
        },
        onRequest: [
            Authenticate(),
            HasPermission(PermissionAction.USER, "USER", PermissionScope.USER),
        ],
    })
    async getById(
        req: FastifyRequest<{ Params: { id: string }, Querystring: FindOptions }>,
        reply: FastifyReply
    ) {
        const subscription = await this.subscriptionService.safeFindById(+req.user.id, +req.params.id, req.query);
        if(!subscription) {
            throw new httpErrors.NotFound();
        }
        reply
            .status(200)
            .send(subscription);
    }

    @POST("/", {
        schema: {
            operationId: "paginateSubscription",
            summary: "Paginate Subscription",
            body: SubscriptionPaginateBodyInputSchema,
            security: [
                {
                    apiKey: []
                }
            ],
        },
        onRequest: [
            Authenticate(),
            HasPermission(PermissionAction.READ, "SUBSCRIPTION", PermissionScope.ALL),
        ],
    })
    async paginate(
        req: FastifyRequest<{ Body: SubscriptionPaginateDTO }>,
        reply: FastifyReply
    ) {
        const { query, options } = req.body;
        reply
            .status(200)
            .send(await this.subscriptionService.paginate(query, options));
    }

    @POST("/my", {
        schema: {
            operationId: "paginateMySubscription",
            summary: "Paginate My Subscription",
            body: SubscriptionPaginateBodyInputSchema,
            security: [
                {
                    apiKey: []
                }
            ],
        },
        onRequest: [
            Authenticate(),
            HasPermission(PermissionAction.USER, "USER", PermissionScope.USER),
        ],
    })
    async paginateMy(
        req: FastifyRequest<{ Body: SubscriptionPaginateDTO }>,
        reply: FastifyReply
    ) {
        const { query, options } = req.body;
        reply
            .status(200)
            .send(await this.subscriptionService.findByOwner(+req.user.id, { ...query, ownerId: +req.user.id }, options));
    }
    
    @DELETE("/:id", {
        schema: {
            operationId: "deleteSubscription",
            summary: "Delete Subscription by id",
            params: exz.pathId,
            security: [
                {
                    apiKey: []
                }
            ],
        },
        onRequest: [
            Authenticate(),
            HasPermission(PermissionAction.USER, "USER", PermissionScope.USER),
        ],
    })
    async deleteById(
        req: FastifyRequest<{ Params: { id: string } }>,
        reply: FastifyReply
    ) {
        const subscription = await this.subscriptionService.deleteById(+req.user.id, +req.params.id);
        if(!subscription) {
            throw new httpErrors.NotFound();
        }
        reply
            .status(200)
            .send(subscription);
    }

    @PATCH("/:id", {
        schema: {
            operationId: "updateSubscription",
            summary: "Update Subscription from id",
            params: exz.pathId,
            body: SubscriptionUpdateSchema,
            security: [
                {
                    apiKey: []
                }
            ],
        },
        onRequest: [
            Authenticate(),
            HasPermission(PermissionAction.USER, "USER", PermissionScope.USER),
        ],
    })
    async updateById(
        req: FastifyRequest<{ Params: { id: string }, Body: SubscriptionUpdateDTO }>,
        reply: FastifyReply
    ) {
        const subscription = await this.subscriptionService.updateById(+req.user.id, +req.params.id, SubscriptionUpdateSchema.parse(req.body));
        if(!subscription) {
            throw new httpErrors.NotFound();
        }
        reply
            .status(200)
            .send(subscription);
    }

    @PATCH("/plan/:id", {
        schema: {
            operationId: "planSubscriptionProjection",
            summary: "Plan Subscription projection by id",
            params: exz.pathId,
            body: SubscriptionPlanSchema,
            security: [
                {
                    apiKey: []
                }
            ],
        },
        onRequest: [
            Authenticate(),
            HasPermission(PermissionAction.UPDATE, "SUBSCRIPTION", PermissionScope.GOD),
        ],
    })
    async updatePlanningById(
        req: FastifyRequest<{ Params: { id: string }, Body: SubscriptionPlanDTO }>,
        reply: FastifyReply
    ) {
        const subscription = await this.subscriptionService.updatePlanningById(+req.params.id, SubscriptionPlanSchema.parse(req.body));
        if(!subscription) {
            throw new httpErrors.NotFound();
        }
        reply
            .status(200)
            .send(subscription);
    }

    @PATCH("/invalidate/:id", {
        schema: {
            operationId: "invalidateSubscription",
            summary: "Invalidate Subscription from id",
            params: exz.pathId,
            security: [
                {
                    apiKey: []
                }
            ],
        },
        onRequest: [
            Authenticate(),
            HasPermission(PermissionAction.UPDATE, "SUBSCRIPTION", PermissionScope.SINGLE),
        ],
    })
    async invalidateById(
        req: FastifyRequest<{ Params: { id: string } }>,
        reply: FastifyReply
    ) {
        const subscription = await this.subscriptionService.invalidate(+req.user.id, +req.params.id);
        if(!subscription) {
            throw new httpErrors.NotFound();
        }
        reply
            .status(200)
            .send(subscription);
    }

    @GET("/next/:eventId", {
        schema: {
            operationId: "getNextSubscriptionToProject",
            summary: "Get next subscription to project",
            params: exz.pathEventId,
            security: [
                {
                    apiKey: []
                }
            ],
        },
        onRequest: [
            Authenticate(),
            HasPermission(PermissionAction.UPDATE, "SUBSCRIPTION", PermissionScope.SINGLE),
        ],
    })
    async nextProjection(
        req: FastifyRequest<{ Params: { eventId: string } }>,
        reply: FastifyReply
    ) {
        const result = await this.subscriptionService.unlockNextProjection(+req.params.eventId);
        if(!result) {
            throw new httpErrors.InternalServerError();
        }
        reply
            .status(200)
            .send(result);
    }
}
