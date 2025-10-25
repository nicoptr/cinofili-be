import { Controller, GET } from "fastify-decorators";
import { Authenticate } from "@middleware/Authenticate";
import { HasPermission } from "@middleware/HasPermission";
import { PermissionAction } from "../enums/PermissionAction";
import { PermissionScope } from "../enums/PermissionScope";
import { FastifyReply, FastifyRequest } from "fastify";
import { RoleService } from "@services/RoleService";

@Controller({
    route: "/roles",
    tags: [{ name: "Roles", description: "Roles management" }]
})
export class RoleController {

    constructor(private readonly roleService: RoleService) {}


    private static readonly ENTITY_NAME = "ROLE";

    @GET("/names", {
        schema: {
            operationId: "findRolesList",
            summary: "Get the list of roles' names",
            security: [
                {
                    apiKey: []
                }
            ],
        },
        onRequest: [
            Authenticate(),
            HasPermission(PermissionAction.READ, RoleController.ENTITY_NAME, PermissionScope.ALL),
        ],
    })
    public async getAll(
        req: FastifyRequest,
        reply: FastifyReply
    ) {
        const namesList = await this.roleService.getRolesNames(+req.user.id);
        reply
            .status(200)
            .send(namesList);
    }

}
