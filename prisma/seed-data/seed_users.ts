import { encryptPasswordSync } from "@utils/crypto";
import process from "process";
import { UserDTO } from "@models/User";
import { RoleName } from "@prisma/client";

export const seed_users: { id: number, isToBeSeeded: boolean, dto: UserDTO }[] = [
  {
    id: 1,
    isToBeSeeded: true,

    dto: {
      username: process.env.GOD_USERNAME!,
      email: process.env.GOD_EMAIL!,
      password: encryptPasswordSync(process.env.GOD_PASSWORD!),
      avatarUrl: `https://ui-avatars.com/api/?name=${ process.env.GOD_USERNAME! }`,
      roles: [
        {
          roleName: RoleName.GOD,
        }
      ]
    },
  }
]
