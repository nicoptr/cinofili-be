import { z } from "zod";
import { RoleName } from "@prisma/client";

export const RoleToUserSchema = z.object({
    id: z.number().optional(),
    roleName: z.nativeEnum(RoleName),
    isActive: z.boolean().optional(),
    toBeDisconnected: z.boolean().optional(),
})
export type RoleToUserDTO = z.infer<typeof RoleToUserSchema>;
