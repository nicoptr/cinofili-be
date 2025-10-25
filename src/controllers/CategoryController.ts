import { FastifyReply, FastifyRequest } from "fastify";
import { Controller, DELETE, GET, PATCH, POST } from "fastify-decorators";
import {
    CategoryCreateDTO,
    CategoryDTO,
    CategoryPaginateBodyInputSchema,
    CategoryPaginateDTO,
    CategorySchema,
    CategoryUpdateDTO,
    CategoryUpdateSchema,
} from "@models/Category";
import { CategoryService } from "@services/CategoryService";
import { Authenticate } from "@middleware/Authenticate";
import { exz, FindOptions } from "@utils/exz";
import httpErrors from "http-errors";
import { z } from "zod";
import { HasPermission } from "@middleware/HasPermission";
import { PermissionAction } from "../enums/PermissionAction";
import { PermissionScope } from "../enums/PermissionScope";

@Controller({
    route: "/categories",
    tags: [{ name: "Categories", description: "Category management" }],
})
export class CategoryController {
    constructor(private readonly categoryService: CategoryService) {}

    private static readonly ENTITY_NAME = "CATEGORY";

    @POST("/create", {
        schema: {
            operationId: "createCategory",
            summary: "Create Category",
            body: CategorySchema,
            security: [
                {
                    apiKey: []
                }
            ],
        },
        onRequest: [
            Authenticate(),
            HasPermission(PermissionAction.CREATE, "CATEGORY", PermissionScope.SINGLE),
        ],
    })
    async create(
        req: FastifyRequest<{ Body: CategoryCreateDTO }>,
        reply: FastifyReply
    ) {
        reply
            .status(200)
            .send(await this.categoryService.save(req.body));
    }
    
    @GET("/:id", {
        schema: {
            operationId: "findCategory",
            summary: "Get Category from id",
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
        const category = await this.categoryService.findById(+req.params.id, req.query);
        if(!category) {
            throw new httpErrors.NotFound();
        }
        reply
            .status(200)
            .send(category);
    }

    @POST("/", {
        schema: {
            operationId: "paginateCategory",
            summary: "Paginate Category",
            body: CategoryPaginateBodyInputSchema,
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
        req: FastifyRequest<{ Body: CategoryPaginateDTO }>,
        reply: FastifyReply
    ) {
        const { query, options } = req.body;
        reply
            .status(200)
            .send(await this.categoryService.paginate(query, options));
    }
    
    @DELETE("/:id", {
        schema: {
            operationId: "deleteCategory",
            summary: "Delete Category by id",
            params: exz.pathId,
            security: [
                {
                    apiKey: []
                }
            ],
        },
        onRequest: [
            Authenticate(),
            HasPermission(PermissionAction.DELETE, "CATEGORY", PermissionScope.GOD),
        ],
    })
    async deleteById(
        req: FastifyRequest<{ Params: { id: string } }>,
        reply: FastifyReply
    ) {
        const category = await this.categoryService.deleteById(+req.params.id);
        if(!category) {
            throw new httpErrors.NotFound();
        }
        reply
            .status(200)
            .send(category);
    }

    @PATCH("/:id", {
        schema: {
            operationId: "updateCategory",
            summary: "Update Category from id",
            params: exz.pathId,
            body: CategoryUpdateSchema,
            security: [
                {
                    apiKey: []
                }
            ],
        },
        onRequest: [
            Authenticate(),
            HasPermission(PermissionAction.UPDATE, "CATEGORY", PermissionScope.GOD),
        ],
    })
    async updateById(
        req: FastifyRequest<{ Params: { id: string }, Body: CategoryUpdateDTO }>,
        reply: FastifyReply
    ) {
        const category = await this.categoryService.updateById(+req.params.id, CategoryUpdateSchema.parse(req.body) as CategoryDTO);
        if(!category) {
            throw new httpErrors.NotFound();
        }
        reply
            .status(200)
            .send(category);
    }
}
