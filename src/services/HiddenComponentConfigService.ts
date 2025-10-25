import { Service } from "fastify-decorators";
import { HiddenComponentConfigRepository } from "@repositories/HiddenComponentConfigRepository";
import { HiddenComponentConfig, Prisma, RoleName } from "@prisma/client";
import { HiddenComponentDTO, HiddenComponentFinalDTO } from "../DTOs/HiddenComponentDTO";
import {
    HiddenComponentConfigCreateDTO,
    HiddenComponentConfigDTO,
    HiddenComponentConfigQueryDTO
} from "@models/HiddenComponentConfig";
import { PaginateDatasource } from "@models/Paginate";
import { PaginateOptions } from "@utils/exz";
import { createObjectWithoutThrow } from "@utils/query";
import { isBoolean } from "lodash";
import httpErrors from "http-errors";


@Service()
export class HiddenComponentConfigService {
    constructor(
        private readonly hiddenComponentConfigRepository: HiddenComponentConfigRepository,
    ) {}

    public async save(dto: HiddenComponentConfigCreateDTO) {
        if (dto.roles.includes(RoleName.GOD)) {
            throw httpErrors.BadRequest("Attenzione! Non è possibile nascondere componenti agli utenti GOD")
        }
        return await this.hiddenComponentConfigRepository.save(dto);
    }

    public async getHiddenComponents(userId: number): Promise<HiddenComponentFinalDTO> {

        return this.toFinalDTO(await this.hiddenComponentConfigRepository.findHiddenComponentsForRolesCombination(userId));

    }

    private toFinalDTO(dtos: HiddenComponentDTO[]): HiddenComponentFinalDTO {

        return dtos.reduce((result, curr) => {

            const { context, section, component } = curr;

            if (!result[context]) {
                result[context] = {};
            }
            if (!result[context]![section]) {
                result[context]![section] = [];
            }

            result[context]![section]!.push(component);
            return result
        }, {} as HiddenComponentFinalDTO);

    }

    public findById(id: number) {
        return this.hiddenComponentConfigRepository.findById(id);
    }
    
    public async paginate(query: HiddenComponentConfigQueryDTO, options: PaginateOptions): Promise<PaginateDatasource<HiddenComponentConfig> | null> {
        const prismaQuery = this.createQueryFromPayload(query);

        return await this.hiddenComponentConfigRepository.paginate(prismaQuery, options);
    }
    
    private createQueryFromPayload(payload: HiddenComponentConfigQueryDTO): Prisma.HiddenComponentConfigWhereInput {
        const valueQuery: Prisma.HiddenComponentConfigWhereInput[] = [
            createObjectWithoutThrow(payload.value, { context: { contains: payload.value, mode: "insensitive" } }),
            createObjectWithoutThrow(payload.value, { section: { contains: payload.value, mode: "insensitive" } }),
            createObjectWithoutThrow(payload.value, { component: { contains: payload.value, mode: "insensitive" } }),
        ].filter(o => Object.values(o).length > 0);

        const query: Prisma.HiddenComponentConfigWhereInput[] = [
            createObjectWithoutThrow(valueQuery.length, { OR: valueQuery }),

            createObjectWithoutThrow(isBoolean(payload.isActive), {isActive: payload.isActive}),
            createObjectWithoutThrow(payload.roles?.length, { roleName: { in: payload.roles } }),
        ].filter(o => Object.values(o).length > 0);

        return {
            AND: query.length > 0 ? query : undefined,
        };
    }
    
     public async updateById(id: number, dto: HiddenComponentConfigDTO): Promise<HiddenComponentConfig | null> {
        return await this.hiddenComponentConfigRepository.updateById(id, dto);
    }

}
