import { Service } from "fastify-decorators";
import { hasPermission } from "@utils/permission";
import { PermissionAction } from "../enums/PermissionAction";
import { PermissionScope } from "../enums/PermissionScope";
import { Prisma, RoleName } from "@prisma/client";
import { createObjectWithoutThrow } from "@utils/query";
import { RoleRepository } from "@repositories/RoleRepository";

@Service()
export class RoleService {

    constructor(private readonly roleRepository: RoleRepository) {}

    public async getRolesNames(principalId: number) {
        const isGodExcluded: boolean = !await hasPermission(principalId, { action: PermissionAction.READ, entity: "ROLE", scope: PermissionScope.GOD});

        return await this.findAll(isGodExcluded);

    }

    public async findAll(isGodExcluded: boolean = true) {
        const queryGOD: Prisma.RoleWhereInput[] = [
            createObjectWithoutThrow(isGodExcluded, { name: { notIn: [ RoleName.GOD ] } } ),
        ];

        const query =  {
            AND: queryGOD.length > 0 ? queryGOD : undefined,
        };

        return this.roleRepository.findMany(query);
    }

}
