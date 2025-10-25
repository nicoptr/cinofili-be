import { Service } from "fastify-decorators";
import { CategoryRepository } from "@repositories/CategoryRepository";
import { Prisma, RoleName, Category } from "@prisma/client";
import { encryptPasswordSync } from "@utils/crypto";
import { FindOptions, PaginateOptions } from "@utils/exz";
import { PaginateDatasource } from "@models/Paginate";
import { createObjectWithoutThrow } from "@utils/query";
import httpErrors from "http-errors";
import { CompleteCategory } from "../../prisma/generated/zod";
import { PermissionAction } from "../enums/PermissionAction";
import { PermissionScope } from "../enums/PermissionScope";
import {CategoryDTO, CategoryQueryDTO} from "@models/Category";

@Service()
export class CategoryService {
    constructor(private readonly eventRepository: CategoryRepository) {}

    public async save(dto: CategoryDTO) {

        return await this.eventRepository.save(dto);
    }

    public async findById(wantedCategoryId: number, options?: FindOptions): Promise<Category | null> {
        return await this.eventRepository.findById(wantedCategoryId, options);
    }

    public async findOne(query: Prisma.CategoryWhereInput, options?: FindOptions): Promise<Category | null> {
        return await this.eventRepository.findOne(query, options);
    }

    public async paginate(query: CategoryQueryDTO, options: PaginateOptions): Promise<PaginateDatasource<Category> | null> {

        const prismaQuery = this.createQueryFromPayload(query);

        return await this.eventRepository.paginate(prismaQuery, options);
    }

    public async updateById(eventToUpdateId: number, dto: CategoryDTO): Promise<Category | null> {
        return await this.eventRepository.updateById(eventToUpdateId, dto);
    }

    public async deleteById(id: number): Promise<Category | null> {
        return await this.eventRepository.deleteById(id);
    }

    private createQueryFromPayload(payload: CategoryQueryDTO): Prisma.CategoryWhereInput {
        const valueQuery: Prisma.CategoryWhereInput[] = [
            createObjectWithoutThrow(payload.value, { name: { contains: payload.value, mode: "insensitive" } }),
            createObjectWithoutThrow(payload.value, { description: { contains: payload.value, mode: "insensitive" } }),
        ].filter(o => Object.values(o).length > 0);


        const query: Prisma.CategoryWhereInput[] = [
            createObjectWithoutThrow(valueQuery.length, { OR: valueQuery }),
        ].filter(o => Object.values(o).length > 0);

        return {
            AND: query.length > 0 ? query : undefined,
        };
    };
}
