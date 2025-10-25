import { z } from "zod";

export interface LoginDTO {
    usernameOrEmail: string
    password: string
}

export interface LoginResponse {
    token: string
}

export const LoginInputSchema: z.ZodType<LoginDTO> = z.object({
    usernameOrEmail: z.string(),
    password: z.string(),
}).strict();

export const LoginResponseSchema: z.ZodType<LoginResponse> = z.object({
    token: z.string()
}).strict();
