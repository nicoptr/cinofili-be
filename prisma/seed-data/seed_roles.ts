import { RoleName } from "@prisma/client";

export const seed_roles = [
    {
        name: RoleName.GOD,
        rank: 0,
        isActive: true,
    },
    {
        name: RoleName.USER,
        rank: 20,
        isActive: true,
    }
]
