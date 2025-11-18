import {z} from "zod";

export const AnswerSchema = z.object({
    value: z.number().int().max(100).min(0),
    questionId: z.number().int(),
});

export const AnswerFormSchema = z.object({
    answers: AnswerSchema.array(),
});

export type AnswerFormDTO = z.infer<typeof AnswerFormSchema>;

export type AnswerDTO = z.infer<typeof AnswerSchema>;