import { Service } from "fastify-decorators";
import {AnswerRepository} from "@repositories/AnswerRepository";
import {EventService} from "@services/EventService";
import {AnswerFormDTO} from "../DTOs/action/AnswerFormDTO";
import {SubscriptionService} from "@services/SubscriptionService";
import {CompleteSubscription} from "../../prisma/generated/zod";
import httpErrors from "http-errors";
import {EmailSenderService} from "@services/EmailSenderService";
import {has} from "lodash";
import {UserService} from "@services/UserService";

@Service()
export class AnswerService {
    constructor(
        private readonly answerRepository: AnswerRepository,
        private readonly emailService: EmailSenderService,
        private readonly subscriptionService: SubscriptionService,
        private readonly userService: UserService,
    ) {}

    public async rateSubscription(principalId: number, subscriptionId: number, dto: AnswerFormDTO): Promise<{ result: boolean }> {
        {
            const subscription = await this.subscriptionService.unsafeFindById(subscriptionId) as CompleteSubscription;

            if (!subscription.isReadyForRating) {
                throw new httpErrors.BadRequest("Le votazioni non sono ancora aperte per questo film");
            }

            if (subscription.ownerId === principalId) {
                throw new httpErrors.BadRequest("Non puoi votare il tuo stesso film");
            }

            if (this.hasDuplicateQuestionIds(dto)) {
                throw new httpErrors.BadRequest("Puoi rispondere una sola volta per domanda");
            }

            if (subscription.scorecard?.some(ans => ans.userId === principalId)) {
                throw new httpErrors.BadRequest("Hai già votato per questo film");
            }

            if (subscription.event.awards.length !== dto.answers.length) {
                throw new httpErrors.BadRequest("Rispondi a tutte le domande");
            }

            await this.answerRepository.saveMany(dto, principalId, subscriptionId);

            const user = await this.userService.findById(principalId);
            this.emailService.sendFormFulfilledEmails(subscription, user!);

            return { result: true };
        }
    }

    private hasDuplicateQuestionIds(dto: AnswerFormDTO): boolean {
        const ids = dto.answers.map(a => a.questionId);
        return ids.length !== new Set(ids).size;
    }

    public async getPersonalAnswersBySubId(principalId: number, subId: number) {
        return this.answerRepository.findAnswersByUserAndSubscription(principalId, subId);
    }

}
