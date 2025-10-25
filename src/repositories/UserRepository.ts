import { UserCreateSchema, UserDTO, UserUpdateSchema } from "@models/User";
import { Prisma, User } from "@prisma/client";
import {
    evaluateQuery,
    getPaginationMetadata,
    getPopulateOptions,
    getPrismaClient,
    mapPrismaErrorToHttpError,
    setPaginationAndPopulation
} from "@utils/prisma";
import { Service } from "fastify-decorators";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { FindOptions, PaginateOptions } from "@utils/exz";
import { PaginateDatasource } from "@models/Paginate";
import { encryptPasswordSync } from "@utils/crypto";
import { RoleToUserSchema } from "@models/RoleToUser";

@Service()
export class UserRepository {

    users = getPrismaClient().user;

    async save(dto: UserDTO): Promise<User | null> {
        try {
            return await this.users.create({
                data: {
                    ...UserCreateSchema.parse(dto),
                    ...(dto.roles?.length ? {
                        roles: {
                            createMany: {
                                data: RoleToUserSchema.array().parse(dto.roles) ?? []
                            }
                        }
                    } : {})
                }
            });
        } catch (err: unknown) {
            throw mapPrismaErrorToHttpError(err as PrismaClientKnownRequestError);
        }
    }

    async updateById(id: number, dto: UserDTO): Promise<User | null> {
        try {
            return await this.users.update({
                where: {
                    id
                },
                data: {
                    ...UserUpdateSchema.parse(dto),
                    roles: {
                        delete: dto.roles?.filter(role => role.toBeDisconnected).map(relation => ({ id: relation.id })),
                        upsert: dto.roles?.filter(role => !role.toBeDisconnected).map(relation => ({
                            where: { id: relation.id },
                            update: {
                                ...RoleToUserSchema.omit({id:true, roleName: true, toBeDisconnected: true}).parse(relation)
                            },
                            create: {
                                ...RoleToUserSchema.omit({id:true, toBeDisconnected: true}).parse(relation)
                            }
                        }))
                    }
                },
                include: { roles: true, }
            });
        } catch (err) {
            throw mapPrismaErrorToHttpError(err as PrismaClientKnownRequestError);
        }
    }

    async findById(id: number, options?: FindOptions): Promise<User | null> {
        try {
            return await this.users.findUniqueOrThrow({
                where: {
                    id
                },
                include: options?.populate ? getPopulateOptions(options.populate) : undefined
            });
        } catch (err) {
            throw mapPrismaErrorToHttpError(err as PrismaClientKnownRequestError);
        }
    }

    async findOne(query: Prisma.UserWhereInput, options?: FindOptions): Promise<User | null> {
        try {
            return await this.users.findFirst({
                where: query,
                include: options?.populate ? getPopulateOptions(options.populate) : undefined
            });
        } catch (err) {
            throw mapPrismaErrorToHttpError(err as PrismaClientKnownRequestError);
        }
    }

    async findMany(query: Prisma.UserWhereInput, options?: FindOptions): Promise<User[] | null> {
        try {
            return await this.users.findMany({
                where: evaluateQuery(query),
                include: options?.populate ? getPopulateOptions(options.populate) : undefined
            });
        } catch (err) {
            throw mapPrismaErrorToHttpError(err as PrismaClientKnownRequestError);
        }
    }

    async paginate(query: Prisma.UserWhereInput, options: PaginateOptions): Promise<PaginateDatasource<User> | null> {
        try {
            const docs = await this.users.findMany({
                where: {
                    ...query,
                    deleted: false
                },
                ...setPaginationAndPopulation(options)
            });
            const totalDocs = await this.users.count({ where: evaluateQuery(query) });
            return {
                docs,
                ...getPaginationMetadata(options, totalDocs)
            } as PaginateDatasource<User>;
        } catch (err) {
            throw mapPrismaErrorToHttpError(err as PrismaClientKnownRequestError);
        }
    }

    async paginateDeleted(query: Prisma.UserWhereInput, options: PaginateOptions): Promise<PaginateDatasource<User> | null> {
        try {
            const docs = await this.users.findMany({
                where: {
                    ...query,
                    deleted: true
                },
                ...setPaginationAndPopulation(options)
            });
            const totalDocs = await this.users.count({ where: evaluateQuery(query) });
            return {
                docs,
                ...getPaginationMetadata(options, totalDocs)
            } as PaginateDatasource<User>;
        } catch (err) {
            throw mapPrismaErrorToHttpError(err as PrismaClientKnownRequestError);
        }
    }

    async updatePasswordById(id: number, rawPassword: string): Promise<User | null> {
        try {
            return await this.users.update({
                where: {
                    id
                },
                data: {
                    password: encryptPasswordSync(rawPassword)
                }
            });
        } catch (err) {
            throw mapPrismaErrorToHttpError(err as PrismaClientKnownRequestError);
        }
    }

    async safeDeleteById(id: number): Promise<User | null> {
        try {
            return await this.users.update({
                where: {
                    id
                },
                data: {
                    deleted: true
                }
            });
        } catch (err) {
            throw mapPrismaErrorToHttpError(err as PrismaClientKnownRequestError);
        }
    }

    async deleteById(id: number): Promise<User | null> {
        try {
            return await this.users.delete({
                where: {
                    id
                }
            });
        } catch (err) {
            throw mapPrismaErrorToHttpError(err as PrismaClientKnownRequestError);
        }
    }

    async deleteOne(query: Prisma.UserWhereUniqueInput): Promise<User | null> {
        try {
            return await this.users.delete({
                where: query
            });
        } catch (err) {
            throw mapPrismaErrorToHttpError(err as PrismaClientKnownRequestError);
        }
    }


}
