import { FastifyReply, FastifyRequest } from "fastify";
import { Controller, DELETE, GET, PATCH, POST } from "fastify-decorators";
import { Authenticate } from "@middleware/Authenticate";
import { exz, FindOptions } from "@utils/exz";
import { HasPermission } from "@middleware/HasPermission";
import { PermissionAction } from "../enums/PermissionAction";
import { PermissionScope } from "../enums/PermissionScope";
import {AnswerFormDTO, AnswerFormSchema} from "../DTOs/action/AnswerFormDTO";
import {AnswerService} from "@services/AnswerService";
import httpErrors from "http-errors";

@Controller({
    route: "/answers",
    tags: [{ name: "Answers", description: "Answer management" }],
})
export class AnswerController {
    constructor(private readonly answerService: AnswerService) {}

    @POST("/rate/:id", {
        schema: {
            operationId: "answerManyQuestions",
            summary: "Answer questions",
            params: exz.pathId,
            body: AnswerFormSchema,
            security: [
                {
                    apiKey: []
                }
            ],
        },
        onRequest: [
            Authenticate(),
            HasPermission(PermissionAction.USER, "USER", PermissionScope.USER),
        ],
    })
    async rate(
        req: FastifyRequest<{ Body: AnswerFormDTO, Params: { id: string } }>,
        reply: FastifyReply
    ) {
        reply
            .status(200)
            .send(await this.answerService.rateSubscription(+req.user.id, +req.params.id, req.body));
    }

    @GET("/rate/:id", {
        schema: {
            operationId: "getAnswersBySub",
            summary: "Get Answers from subscription id",
            params: exz.pathId,
            security: [
                {
                    apiKey: []
                }
            ],
        },
        onRequest: [
            Authenticate(),
            HasPermission(PermissionAction.USER, "USER", PermissionScope.USER),
        ],
    })
    async getAnswersBySub(
        req: FastifyRequest<{ Params: { id: string } }>,
        reply: FastifyReply
    ) {
        const answers = await this.answerService.getPersonalAnswersBySubId(+req.user.id, +req.params.id);
        reply
            .status(200)
            .send(answers);
    }
}
