import { Service } from "fastify-decorators";
import { LoginDTO } from "@models/Auth";
import { UserService } from "@services/UserService";
import { comparePasswords } from "@utils/crypto";
import { User } from "@prisma/client";
import httpErrors from "http-errors";

@Service()
export class AuthService {
    constructor(private readonly userService: UserService) {}

    async login(loginDTO: LoginDTO): Promise<User> {
        const user = await this.userService.findOne({
            OR: [
                { username: loginDTO.usernameOrEmail },
                { email: loginDTO.usernameOrEmail }
            ]
        }, { populate: "roles" });
        if(!user) {
            throw new httpErrors.Unauthorized("Username o password non validi!");
        }

        if(!await this.comparePasswords(user.password, loginDTO.password)) {
            throw new httpErrors.Unauthorized("Username o password non validi!");
        }
        return user;
    }

    private async comparePasswords(password: string, candidate: string) {
        return await comparePasswords(password, candidate);
    }
}
