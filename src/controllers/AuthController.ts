import { FastifyReply, FastifyRequest } from "fastify";
import { Controller, GET, POST } from "fastify-decorators";
import { AuthService } from "@services/AuthService";
import { LoginDTO, LoginInputSchema, LoginResponseSchema } from "@models/Auth";
import { Authenticate } from "@middleware/Authenticate";
import {UserService} from "@services/UserService";

@Controller({
    route: "/auth",
    tags: [{ name: "Auth", description: "Authorization" }],
})
export class AuthController {

    constructor(
        private readonly authService: AuthService,
        private readonly userService: UserService
    ){}

    @POST("/login", {
        schema: {
            operationId: "Login",
            summary: "Login with username and password",
            body: LoginInputSchema,
            response: {
                200: LoginResponseSchema.describe("Login success"),
            },
        }
    })
    async login(
        req: FastifyRequest<{ Body: LoginDTO }>,
        reply: FastifyReply
    ) {
        const user = await this.authService.login(req.body);
        reply
            .status(200)
            .send({ token: await reply.jwtSign({ ...user }) });
    }

    @GET("/profile", {
        schema: {
            operationId: "getProfile",
            summary: "Get ME",
            security: [
                {
                    apiKey: []
                }
            ]
        },
        onRequest: [
            Authenticate(),
        ],
    })
    async getProfile(req: FastifyRequest, reply: FastifyReply) {
        reply.status(200).send(await this.userService.findProfileById(req.user.id));
    }
}
