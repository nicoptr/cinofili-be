import { PermissionAction } from "../enums/PermissionAction";
import { PermissionScope } from "../enums/PermissionScope";

export interface PermissionRequestDTO {
    action: PermissionAction,
    entity: string,
    scope: PermissionScope,
}
