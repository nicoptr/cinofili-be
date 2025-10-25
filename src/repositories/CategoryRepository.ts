import { Prisma, Category } from "@prisma/client";
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
import {CategoryCreateSchema, CategoryDTO, CategoryUpdateSchema} from "@models/Category";

@Service()
export class CategoryRepository {

    categories = getPrismaClient().category;

    async save(dto: CategoryDTO): Promise<Category | null> {
        try {
            return await this.categories.create({
                data: {
                    ...CategoryCreateSchema.parse(dto),
                }
            });
        } catch (err: unknown) {
            throw mapPrismaErrorToHttpError(err as PrismaClientKnownRequestError);
        }
    }

    async updateById(id: number, dto: CategoryDTO): Promise<Category | null> {
        try {
            return await this.categories.update({
                where: {
                    id
                },
                data: {
                    ...CategoryUpdateSchema.parse(dto),
                },
            });
        } catch (err) {
            throw mapPrismaErrorToHttpError(err as PrismaClientKnownRequestError);
        }
    }

    async findById(id: number, options?: FindOptions): Promise<Category | null> {
        try {
            return await this.categories.findUniqueOrThrow({
                where: {
                    id
                },
            });
        } catch (err) {
            throw mapPrismaErrorToHttpError(err as PrismaClientKnownRequestError);
        }
    }

    async findOne(query: Prisma.CategoryWhereInput, options?: FindOptions): Promise<Category | null> {
        try {
            return await this.categories.findFirst({
                where: query,
            });
        } catch (err) {
            throw mapPrismaErrorToHttpError(err as PrismaClientKnownRequestError);
        }
    }

    async findMany(query: Prisma.CategoryWhereInput, options?: FindOptions): Promise<Category[] | null> {
        try {
            return await this.categories.findMany({
                where: evaluateQuery(query),
            });
        } catch (err) {
            throw mapPrismaErrorToHttpError(err as PrismaClientKnownRequestError);
        }
    }

    async paginate(query: Prisma.CategoryWhereInput, options: PaginateOptions): Promise<PaginateDatasource<Category> | null> {
        try {
            const docs = await this.categories.findMany({
                where: {
                    ...query,
                },
                ...setPaginationAndPopulation(options)
            });
            const totalDocs = await this.categories.count({ where: evaluateQuery(query) });
            return {
                docs,
                ...getPaginationMetadata(options, totalDocs)
            } as PaginateDatasource<Category>;
        } catch (err) {
            throw mapPrismaErrorToHttpError(err as PrismaClientKnownRequestError);
        }
    }

    async deleteById(id: number): Promise<Category | null> {
        try {
            return await this.categories.delete({
                where: {
                    id
                }
            });
        } catch (err) {
            throw mapPrismaErrorToHttpError(err as PrismaClientKnownRequestError);
        }
    }

}
