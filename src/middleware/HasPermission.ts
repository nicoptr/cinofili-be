import { FastifyReply, FastifyRequest } from "fastify";
import { PermissionAction } from "../enums/PermissionAction";
import { PermissionScope } from "../enums/PermissionScope";
import { hasPermissionOrThrow } from "@utils/permission";
import { PermissionRequestDTO } from "../DTOs/PermissionRequestDTO";

export function HasPermission(action: PermissionAction, entity: string, scope: PermissionScope) {
    return async function (req: FastifyRequest, reply: FastifyReply) {

        const permissionRequestDto: PermissionRequestDTO = { action, entity, scope };

        await hasPermissionOrThrow(req.user.id, permissionRequestDto);

    };
}
