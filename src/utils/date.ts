import { DateTime } from "luxon";
import {undefined} from "zod";

export const formatItaliaDate = (date: Date | undefined | null): string => {
    return date ? DateTime.fromJSDate(date).toFormat("dd-MM-yyyy") : "data mancante"
}