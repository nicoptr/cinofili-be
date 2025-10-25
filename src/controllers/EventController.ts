import { FastifyReply, FastifyRequest } from "fastify";
import { Controller, DELETE, GET, PATCH, POST } from "fastify-decorators";
import {
    EventCreateDTO,
    EventDTO,
    EventPaginateBodyInputSchema,
    EventPaginateDTO,
    EventSchema,
    EventUpdateDTO,
    EventUpdateSchema,
} from "@models/Event";
import { EventService } from "@services/EventService";
import { Authenticate } from "@middleware/Authenticate";
import { exz, FindOptions } from "@utils/exz";
import httpErrors from "http-errors";
import { z } from "zod";
import { HasPermission } from "@middleware/HasPermission";
import { PermissionAction } from "../enums/PermissionAction";
import { PermissionScope } from "../enums/PermissionScope";

@Controller({
    route: "/events",
    tags: [{ name: "Events", description: "Event management" }],
})
export class EventController {
    constructor(private readonly eventService: EventService) {}

    private static readonly ENTITY_NAME = "EVENT";

    @POST("/create", {
        schema: {
            operationId: "createEvent",
            summary: "Create Event",
            body: EventSchema,
            security: [
                {
                    apiKey: []
                }
            ],
        },
        onRequest: [
            Authenticate(),
            HasPermission(PermissionAction.CREATE, "EVENT", PermissionScope.SINGLE),
        ],
    })
    async create(
        req: FastifyRequest<{ Body: EventCreateDTO }>,
        reply: FastifyReply
    ) {
        reply
            .status(200)
            .send(await this.eventService.save(req.body));
    }
    
    @GET("/:id", {
        schema: {
            operationId: "findEvent",
            summary: "Get Event from id",
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
        const event = await this.eventService.findById(+req.params.id, req.query);
        if(!event) {
            throw new httpErrors.NotFound();
        }
        reply
            .status(200)
            .send(event);
    }

    @POST("/", {
        schema: {
            operationId: "paginateEvent",
            summary: "Paginate Event",
            body: EventPaginateBodyInputSchema,
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
    async paginate(
        req: FastifyRequest<{ Body: EventPaginateDTO }>,
        reply: FastifyReply
    ) {
        const { query, options } = req.body;
        reply
            .status(200)
            .send(await this.eventService.paginate(query, options));
    }
    
    @DELETE("/:id", {
        schema: {
            operationId: "deleteEvent",
            summary: "Delete Event by id",
            params: exz.pathId,
            security: [
                {
                    apiKey: []
                }
            ],
        },
        onRequest: [
            Authenticate(),
            HasPermission(PermissionAction.DELETE, "EVENT", PermissionScope.GOD),
        ],
    })
    async deleteById(
        req: FastifyRequest<{ Params: { id: string } }>,
        reply: FastifyReply
    ) {
        const event = await this.eventService.deleteById(+req.params.id);
        if(!event) {
            throw new httpErrors.NotFound();
        }
        reply
            .status(200)
            .send(event);
    }

    @PATCH("/:id", {
        schema: {
            operationId: "updateEvent",
            summary: "Update Event from id",
            params: exz.pathId,
            body: EventUpdateSchema,
            security: [
                {
                    apiKey: []
                }
            ],
        },
        onRequest: [
            Authenticate(),
            HasPermission(PermissionAction.UPDATE, "EVENT", PermissionScope.GOD),
        ],
    })
    async updateById(
        req: FastifyRequest<{ Params: { id: string }, Body: EventUpdateDTO }>,
        reply: FastifyReply
    ) {
        const event = await this.eventService.updateById(+req.params.id, EventUpdateSchema.parse(req.body) as EventDTO);
        if(!event) {
            throw new httpErrors.NotFound();
        }
        reply
            .status(200)
            .send(event);
    }
}
