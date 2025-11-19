import {Prisma, Event, Answer} from "@prisma/client";
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
import {EventCreateSchema, EventDTO, EventUpdateSchema} from "@models/Event";
import {AnswerFormDTO} from "../DTOs/action/AnswerFormDTO";

@Service()
export class AnswerRepository {

    answers = getPrismaClient().answer;

    async saveMany(dto: AnswerFormDTO, userId: number, subscriptionId: number): Promise<boolean> {
        try  {
            await this.answers.createMany({
                data: dto.answers.map(answer => (
                    {
                        userId,
                        subscriptionId,
                        questionId: answer.questionId,
                        value: answer.value
                }))
            });

            return true;
        } catch (err) {
            throw mapPrismaErrorToHttpError(err as PrismaClientKnownRequestError);
        }
    }

    async findAnswersByUserAndSubscription(userId: number, subscriptionId: number): Promise<Answer[]> {
        return this.answers.findMany({
            where: {
                userId: userId,
                subscriptionId: subscriptionId
            },
            include: {
                question: {
                    include: {
                        award: true,
                    }
                }
            }
        })
    }

}
