import { MultipartFile } from "@fastify/multipart";
import httpErrors from "http-errors";
import fs from "node:fs";

export async function uploadFile(data: MultipartFile, path: string, filename: string): Promise<string> {

    const buffer = await data.toBuffer();

    fs.writeFile(`public/${path}/${filename}`, buffer, err => {
        if(err) {
            throw new httpErrors.BadRequest(err.message);
        }
    });
    return `${process.env.DOMAIN_URL}/${path}/${filename}`;
}