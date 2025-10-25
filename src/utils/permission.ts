import { PermissionRequestDTO } from "../DTOs/PermissionRequestDTO";
import { getPrismaClient, mapPrismaErrorToHttpError } from "@utils/prisma";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { RoleName } from "@prisma/client";
import { LOGGER } from "@utils/winston";
import httpErrors from "http-errors";

export async function hasPermissionOrThrow(userId: number, requestedPermission: PermissionRequestDTO) {

    const REQUESTED_PERMISSION = `${requestedPermission.action}#${requestedPermission.entity}#${requestedPermission.scope}`;
    const result = await hasPermission(userId, requestedPermission);
    if (!result) {
        const message = `User ${userId} lacks ${REQUESTED_PERMISSION} permission`;
        LOGGER.warn(message);
        throw new httpErrors.Forbidden(message);
    }

}

export async function hasPermission(userId: number, requestedPermission: PermissionRequestDTO): Promise<boolean> {
    const userRoles = await extractRolesFromUser(userId);

    if (userRoles.includes(RoleName.GOD)) return true;

    const REQUESTED_PERMISSION = `${requestedPermission.action}#${requestedPermission.entity}#${requestedPermission.scope}`;

    const permissionConfiguration = await extractPermissionConfig(userRoles);

    return permissionConfiguration.includes(REQUESTED_PERMISSION);
}

async function extractRolesFromUser(userId: number) {

    let roles;
    try {
        roles = await getPrismaClient().roleToUser.findMany( { where: { AND: [{ userId: userId }, { isActive: true }, ] } });
    } catch (err) {
        throw mapPrismaErrorToHttpError(err as PrismaClientKnownRequestError);
    }

    return roles.map(role => role.roleName);
}

async function extractPermissionConfig(userRoles: Array<String>): Promise<String[]> {

    let permissions = [];
    try {
        permissions = await getPrismaClient().permissionConfig.findMany({
            where: {
                roleName: {
                    in: userRoles as unknown as RoleName[]
                }
            },
            distinct: ['action', 'entity', 'scope'],
        })
    } catch (err) {
        throw mapPrismaErrorToHttpError(err as PrismaClientKnownRequestError);
    }
    return permissions.map(c => `${c.action}#${c.entity}#${c.scope}`);
}
