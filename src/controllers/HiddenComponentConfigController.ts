import { FastifyReply, FastifyRequest } from "fastify";
import { Controller, GET, PATCH, POST } from "fastify-decorators";
import { Authenticate } from "@middleware/Authenticate";
import httpErrors from "http-errors";
import { PermissionAction } from "../enums/PermissionAction";
import { PermissionScope } from "../enums/PermissionScope";
import { HasPermission } from "@middleware/HasPermission";
import { HiddenComponentConfigService } from "@services/HiddenComponentConfigService";
import { exz } from "@utils/exz";
import {
    HiddenComponentConfigCreateDTO,
    HiddenComponentConfigCreateSchema,
    HiddenComponentConfigDTO,
    HiddenComponentConfigPaginateBodyInputSchema,
    HiddenComponentConfigPaginateDTO,
    HiddenComponentConfigSchema
} from "@models/HiddenComponentConfig";

@Controller({
    route: "/config/hidden",
    tags: [{ name: "HiddenComponentConfig", description: "HiddenComponentConfig management" }],
})
export class HiddenComponentConfigController {
    constructor(private readonly hiddenComponentConfigService: HiddenComponentConfigService) {}

    private static readonly ENTITY_NAME = "HIDDEN_COMPONENT_CONFIG";

    @POST("/create", {
        schema: {
            operationId: "createHiddenComponentConfig",
            summary: "Create HiddenComponentConfig",
            body: HiddenComponentConfigCreateSchema,
            security: [
                {
                    apiKey: []
                }
            ],
        },
        onRequest: [
            Authenticate(),
            HasPermission(PermissionAction.CREATE, HiddenComponentConfigController.ENTITY_NAME, PermissionScope.ALL),
        ],
    })
    async create(
        req: FastifyRequest<{ Body: HiddenComponentConfigCreateDTO }>,
        reply: FastifyReply
    ) {
        reply
            .status(200)
            .send(await this.hiddenComponentConfigService.save(req.body));
    }

    @GET("/own", {
        schema: {
            operationId: "extractHiddenComponents",
            summary: "Get Hidden Components from user",
            security: [
                {
                    apiKey: []
                }
            ],
        },
        onRequest: [
            Authenticate(),
            HasPermission(PermissionAction.READ, HiddenComponentConfigController.ENTITY_NAME, PermissionScope.OWN),
        ],
    })
    async getOwn(
        req: FastifyRequest,
        reply: FastifyReply
    ) {
        const hiddenComponents = await this.hiddenComponentConfigService.getHiddenComponents(+req.user.id);
        if(!hiddenComponents) {
            throw new httpErrors.NotFound();
        }
        reply
            .status(200)
            .send(hiddenComponents);
    }
    
    @GET("/:id", {
        schema: {
            operationId: "findHiddenComponentConfig",
            summary: "Get HiddenComponentConfig by id",
            params: exz.pathId,
            security: [
                {
                    apiKey: []
                }
            ],
        },
        onRequest: [
            Authenticate(),
            HasPermission(PermissionAction.READ, HiddenComponentConfigController.ENTITY_NAME, PermissionScope.SINGLE),
        ],
    })
    async getById(
        req: FastifyRequest<{ Params: { id: string } }>,
        reply: FastifyReply
    ) {
        const config = await this.hiddenComponentConfigService.findById(+req.params.id);
        reply
            .status(200)
            .send(config);
    }
    
    @POST("/", {
        schema: {
            operationId: "paginateHiddenComponentConfig",
            summary: "Paginate HiddenComponentConfig",
            body: HiddenComponentConfigPaginateBodyInputSchema,
            security: [
                {
                    apiKey: []
                }
            ],
        },
        onRequest: [
            Authenticate(),
            HasPermission(PermissionAction.READ, HiddenComponentConfigController.ENTITY_NAME, PermissionScope.ALL),
        ],
    })
    async paginate(
        req: FastifyRequest<{ Body: HiddenComponentConfigPaginateDTO }>,
        reply: FastifyReply
    ) {
        const { query, options } = req.body;
        reply
            .status(200)
            .send(await this.hiddenComponentConfigService.paginate(query, options));
    }

    @PATCH("/:id", {
        schema: {
            operationId: "updateHiddenComponentConfig",
            summary: "Update HiddenComponentConfig from id",
            params: exz.pathId,
            body: HiddenComponentConfigSchema.omit({ id: true }).partial(),
            security: [
                {
                    apiKey: []
                }
            ],
        },
        onRequest: [
            Authenticate(),
            HasPermission(PermissionAction.UPDATE, HiddenComponentConfigController.ENTITY_NAME, PermissionScope.SINGLE),
        ],
    })
    async updateById(
        req: FastifyRequest<{ Params: { id: string }, Body: HiddenComponentConfigCreateDTO }>,
        reply: FastifyReply
    ) {
        const config = await this.hiddenComponentConfigService.updateById(+req.params.id, HiddenComponentConfigSchema.partial().parse(req.body) as HiddenComponentConfigDTO);
        reply
            .status(200)
            .send(config);
    }

}
