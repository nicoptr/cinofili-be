import { FastifyReply, FastifyRequest } from "fastify";
import { Controller, DELETE, GET, PATCH, POST } from "fastify-decorators";
import {
    UserCreateDTO,
    UserDTO,
    UserPaginateBodyInputSchema,
    UserPaginateDTO, UserRegistrationSchema,
    UserSchema,
    UserUpdateDTO,
    UserUpdateSchema,
} from "@models/User";
import { UserService } from "@services/UserService";
import { Authenticate } from "@middleware/Authenticate";
import { exz, FindOptions } from "@utils/exz";
import httpErrors from "http-errors";
import { z } from "zod";
import { HasPermission } from "@middleware/HasPermission";
import { PermissionAction } from "../enums/PermissionAction";
import { PermissionScope } from "../enums/PermissionScope";

@Controller({
    route: "/users",
    tags: [{ name: "Users", description: "User management" }],
})
export class UserController {
    constructor(private readonly userService: UserService) {}

    private static readonly ENTITY_NAME = "USER";

    @POST("/create", {
        schema: {
            operationId: "createUser",
            summary: "Create User",
            body: UserSchema,
            security: [
                {
                    apiKey: []
                }
            ],
        },
        onRequest: [
            Authenticate(),
            HasPermission(PermissionAction.CREATE, UserController.ENTITY_NAME, PermissionScope.ALL),
        ],
    })
    async create(
        req: FastifyRequest<{ Body: UserCreateDTO }>,
        reply: FastifyReply
    ) {
        reply
            .status(200)
            .send(await this.userService.save(+req.user.id, req.body));
    }

    @POST("/register", {
        schema: {
            operationId: "registerUser",
            summary: "Register new User",
            body: UserRegistrationSchema,
            security: [
                {
                    apiKey: []
                }
            ],
        }
    })
    async register(
        req: FastifyRequest<{ Body: UserCreateDTO }>,
        reply: FastifyReply
    ) {
        reply
            .status(200)
            .send(await this.userService.register(req.body));
    }

    @GET("/:id", {
        schema: {
            operationId: "findUser",
            summary: "Get User from id",
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
            HasPermission(PermissionAction.READ, UserController.ENTITY_NAME, PermissionScope.SINGLE),
        ],
    })
    async getById(
        req: FastifyRequest<{ Params: { id: string }, Querystring: FindOptions }>,
        reply: FastifyReply
    ) {
        const user = await this.userService.findByIdWithPermission(+req.user.id, +req.params.id, req.query);
        if(!user) {
            throw new httpErrors.NotFound();
        }
        reply
            .status(200)
            .send(user);
    }

    @POST("/", {
        schema: {
            operationId: "paginateUser",
            summary: "Paginate User",
            body: UserPaginateBodyInputSchema,
            security: [
                {
                    apiKey: []
                }
            ],
        },
        onRequest: [
            Authenticate(),
            HasPermission(PermissionAction.READ, UserController.ENTITY_NAME, PermissionScope.ALL),
        ],
    })
    async paginate(
        req: FastifyRequest<{ Body: UserPaginateDTO }>,
        reply: FastifyReply
    ) {
        const { query, options } = req.body;
        reply
            .status(200)
            .send(await this.userService.paginate(+req.user.id, query, options));
    }

    @POST("/trash", {
        schema: {
            operationId: "paginateUserTrashCan",
            summary: "Paginate Users' trash can",
            body: UserPaginateBodyInputSchema,
            security: [
                {
                    apiKey: []
                }
            ],
        },
        onRequest: [
            Authenticate(),
            HasPermission(PermissionAction.READ, UserController.ENTITY_NAME, PermissionScope.TRASH),
        ],
    })
    async paginateTrashCan(
        req: FastifyRequest<{ Body: UserPaginateDTO }>,
        reply: FastifyReply
    ) {
        const { query, options } = req.body;
        reply
            .status(200)
            .send(await this.userService.paginateTrashCan(+req.user.id, query, options));
    }

    @DELETE("/:id", {
        schema: {
            operationId: "deleteUser",
            summary: "Delete User by id",
            params: exz.pathId,
            security: [
                {
                    apiKey: []
                }
            ],
        },
        onRequest: [
            Authenticate(),
            HasPermission(PermissionAction.DELETE, UserController.ENTITY_NAME, PermissionScope.SINGLE),
        ],
    })
    async deleteById(
        req: FastifyRequest<{ Params: { id: string } }>,
        reply: FastifyReply
    ) {
        const user = await this.userService.safeDeleteById(+req.user.id, +req.params.id);
        if(!user) {
            throw new httpErrors.NotFound();
        }
        reply
            .status(200)
            .send(user);
    }

    @PATCH("/:id", {
        schema: {
            operationId: "updateUser",
            summary: "Update User from id",
            params: exz.pathId,
            body: UserUpdateSchema,
            security: [
                {
                    apiKey: []
                }
            ],
        },
        onRequest: [
            Authenticate(),
            HasPermission(PermissionAction.UPDATE, UserController.ENTITY_NAME, PermissionScope.SINGLE),
        ],
    })
    async updateById(
        req: FastifyRequest<{ Params: { id: string }, Body: UserUpdateDTO }>,
        reply: FastifyReply
    ) {
        const user = await this.userService.updateById(+req.user.id, +req.params.id, UserUpdateSchema.parse(req.body) as UserDTO);
        if(!user) {
            throw new httpErrors.NotFound();
        }
        reply
            .status(200)
            .send(user);
    }

    @PATCH("/me", {
        schema: {
            operationId: "updateMe",
            summary: "Update User from id",
            params: exz.pathId,
            body: UserUpdateSchema.omit({roles: true}),
            security: [
                {
                    apiKey: []
                }
            ],
        },
        onRequest: [
            Authenticate(),
            HasPermission(PermissionAction.UPDATE, UserController.ENTITY_NAME, PermissionScope.OWN),
        ],
    })
    async updateMe(
        req: FastifyRequest<{ Params: { id: string }, Body: UserUpdateDTO }>,
        reply: FastifyReply
    ) {
        const user = await this.userService.updateById(+req.user.id, +req.user.id, UserUpdateSchema.omit({roles: true}).parse(req.body) as UserDTO);
        if(!user) {
            throw new httpErrors.NotFound();
        }
        reply
            .status(200)
            .send(user);
    }

    @PATCH("/changePassword/:id", {
        schema: {
            operationId: "updateUserPassword",
            summary: "Update current User's password",
            params: exz.pathId,
            body: z.object({
                newPassword: z.string()
            }),
            security: [
                {
                    apiKey: []
                }
            ],
        },
        onRequest: [
            Authenticate(),
            HasPermission(PermissionAction.UPDATE, "PASSWORD", PermissionScope.SINGLE),
        ],
    })
    async updateUserPassword(
        req: FastifyRequest<{ Params: { id: string }, Body: { newPassword: string } }>,
        reply: FastifyReply
    ) {
        const user = await this.userService.changeUserPassword(+req.user.id, +req.params.id, req.body.newPassword);

        if(!user) {
            throw new httpErrors.NotFound();
        }

        reply.status(200)
    }
}
