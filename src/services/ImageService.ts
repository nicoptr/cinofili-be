import { Service } from "fastify-decorators";
import { MultipartFile } from "@fastify/multipart";
import httpErrors from "http-errors";
import { randomBytes } from "crypto";
import { uploadFile } from "@utils/upload";


const IMAGES_PATH = "images";
@Service()
export class ImageService {
    public async upload(data: MultipartFile): Promise<string> {
        const filenameSplit = data.filename.split(".");
        const fileExtension = filenameSplit[filenameSplit.length - 1] || "";
        if(!["png", "jpeg", "jpg", "bmp", "svg", "gif", "mp4"].includes(fileExtension)) {
            throw httpErrors.BadRequest("Il formato del file non è valido");
        }

        return await uploadFile(data, IMAGES_PATH, `${randomBytes(20).toString('hex')}.${fileExtension}`);
    }

}
