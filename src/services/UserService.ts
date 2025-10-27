import { Service } from "fastify-decorators";
import { UserRepository } from "@repositories/UserRepository";
import {EventSpecificationDTO, UserDTO, UserQueryDTO, UserRegistrationTO} from "@models/User";
import { Prisma, RoleName, User } from "@prisma/client";
import { encryptPasswordSync } from "@utils/crypto";
import { FindOptions, PaginateOptions } from "@utils/exz";
import { PaginateDatasource } from "@models/Paginate";
import { createObjectWithoutThrow } from "@utils/query";
import httpErrors from "http-errors";
import { CompleteUser } from "../../prisma/generated/zod";
import { hasPermission, hasPermissionOrThrow } from "@utils/permission";
import { PermissionAction } from "../enums/PermissionAction";
import { PermissionScope } from "../enums/PermissionScope";

@Service()
export class UserService {
    constructor(private readonly userRepository: UserRepository) {}

    public async save(principalId: number, dto: UserDTO) {
        const payload = { ...dto, password: encryptPasswordSync(dto.password) } as UserDTO;
        if (dto.roles?.length) {
            await hasPermissionOrThrow(principalId, { action: PermissionAction.CREATE, entity: "ROLE_TO_USER", scope: PermissionScope.ALL})
            if (dto.roles.find(role => role.roleName === "GOD")) {
                await hasPermissionOrThrow(principalId, { action: PermissionAction.CREATE, entity: "ROLE_TO_USER", scope: PermissionScope.GOD})
            }
        }
        return await this.userRepository.save(payload);
    }

    public async register(dto: UserRegistrationTO) {
        const payload = { ...dto, password: encryptPasswordSync(dto.password) } as UserRegistrationTO;

        return await this.userRepository.save( { ...payload, roles: [ {roleName: RoleName.USER} ] });
    }

    public async findByIdWithPermission(principalId: number, wantedUserId: number, options?: FindOptions): Promise<User | null> {

        if (principalId !== wantedUserId) {
            await hasPermissionOrThrow(principalId, { action: PermissionAction.READ, entity: "USER", scope: PermissionScope.OTHERS});
        }
        const wantedUser = await this.userRepository.findById(wantedUserId, { ...options, populate: options?.populate ? options.populate + " roles" : "roles" });

        if ((wantedUser as CompleteUser).roles.find(r => r.roleName === "GOD")) {
            await hasPermissionOrThrow(principalId, { action: PermissionAction.READ, entity: "USER", scope: PermissionScope.GOD});
        }

        return wantedUser;
    }

    public async findById( wantedUserId: number, options?: FindOptions): Promise<User | null> {
        return await this.userRepository.findById(wantedUserId, options);
    }

    public async findOne(query: Prisma.UserWhereInput, options?: FindOptions): Promise<User | null> {
        return await this.userRepository.findOne(query, options);
    }

    public async paginate(principalId: number, query: UserQueryDTO, options: PaginateOptions): Promise<PaginateDatasource<User> | null> {

        const excludeGod = !await hasPermission(principalId, { action: PermissionAction.READ, entity: "USER", scope: PermissionScope.GOD});

        const prismaQuery = this.createQueryFromPayload(query, excludeGod);

        return await this.userRepository.paginate(prismaQuery, options);
    }

    public async paginateTrashCan(principalId: number, query: UserQueryDTO, options: PaginateOptions): Promise<PaginateDatasource<User> | null> {

        const excludeGod = !await hasPermission(principalId, { action: PermissionAction.READ, entity: "USER", scope: PermissionScope.GOD});

        const prismaQuery = this.createQueryFromPayload(query, excludeGod);

        return await this.userRepository.paginateDeleted(prismaQuery, options);
    }

    public async updateById(principalId: number, userToUpdateId: number, dto: UserDTO): Promise<User | null> {

        const userToUpdate = await this.userRepository.findById(userToUpdateId, { populate: "roles.role" }) as CompleteUser;

        if (principalId === userToUpdateId) {
            await hasPermissionOrThrow(principalId, { action: PermissionAction.UPDATE, entity: "USER", scope: PermissionScope.OWN})
        }
        if (dto.roles?.length) {
            await hasPermissionOrThrow(principalId, { action: PermissionAction.UPDATE, entity: "ROLE_TO_USER", scope: PermissionScope.ALL})
        }
        if (dto.roles?.find(r => r.roleName === "GOD") || userToUpdate.roles?.find(r => r.roleName === "GOD")) {
            await hasPermissionOrThrow(principalId, { action: PermissionAction.UPDATE, entity: "ROLE_TO_USER", scope: PermissionScope.GOD})
        }

        return await this.userRepository.updateById(userToUpdateId, dto);
    }

    public async updateEventSpecification(userId: number, newSpecs: EventSpecificationDTO[]): Promise<User | null> {

        const userToUpdate = await this.userRepository.findById(userId, { populate: "roles.role" }) as CompleteUser;

        const existingSpecs = userToUpdate.eventSpecification as EventSpecificationDTO[];

        const mergedSpecs = this.mergeEventSpecs(existingSpecs, newSpecs);

        return await this.userRepository.updateEventSpecificationById(userId, newSpecs);
    }

    private mergeEventSpecs(oldSpecs: EventSpecificationDTO[], newSpecs: EventSpecificationDTO[]): EventSpecificationDTO[] {
        return [
            ...oldSpecs?.filter(o => !newSpecs.some(n => n.eventId === o.eventId)) || [],
            ...newSpecs
        ];
    }

    public async safeDeleteById(principalId: number, targetUserId: number): Promise<User | null> {

        if (principalId === targetUserId) {
            throw new httpErrors.BadRequest("Attenzione! Non è possibile autoeliminarsi, non ti arrendere!")
        }

        const userToDelete = await this.userRepository.findById(targetUserId, { populate: "roles.role" }) as CompleteUser;

        if (userToDelete.roles.find(r => r.roleName === RoleName.GOD)) {
            await hasPermissionOrThrow(principalId, { action: PermissionAction.DELETE, entity: "USER", scope: PermissionScope.GOD });
        }

        return await this.userRepository.safeDeleteById(targetUserId);
    }

    public async deleteById(id: number): Promise<User | null> {
        return await this.userRepository.deleteById(id);
    }

    public async changeUserPassword(principalId: number, userId: number, newPassword: string): Promise<User | null> {
        const user = await this.findByIdWithPermission(principalId, userId);

        if (!user) {
            return null;
        }

        if (!newPassword) {
            throw new httpErrors.BadRequest("La password non può essere vuota");
        }

        return await this.userRepository.updatePasswordById(userId, newPassword);
    }

    private createQueryFromPayload(payload: UserQueryDTO, excludeGod: boolean): Prisma.UserWhereInput {
        const valueQuery: Prisma.UserWhereInput[] = [
            createObjectWithoutThrow(payload.value, { username: { contains: payload.value, mode: "insensitive" } }),
            createObjectWithoutThrow(payload.value, { email: { contains: payload.value, mode: "insensitive" } }),
        ].filter(o => Object.values(o).length > 0);

        const rolesQuery: Prisma.UserWhereInput[] = [
            createObjectWithoutThrow(!!payload.roles?.length, { roles: { some: { roleName: { in: payload.roles } } } }),
        ]

        const queryGOD: Prisma.UserWhereInput[] = [
            createObjectWithoutThrow(excludeGod, { roles: { every: { roleName: { notIn: [ RoleName.GOD ] } } } }),
        ];


        const query: Prisma.UserWhereInput[] = [
            createObjectWithoutThrow(queryGOD.length, { OR: queryGOD }),
            createObjectWithoutThrow(valueQuery.length, { OR: valueQuery }),
            createObjectWithoutThrow(rolesQuery.length, { OR: rolesQuery }),
        ].filter(o => Object.values(o).length > 0);

        return {
            AND: query.length > 0 ? query : undefined,
        };
    };
}
