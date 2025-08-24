import { z } from "zod";

export const createGameSchema = z.object({
    name: z.string().min(1, "Field is required"),
    description: z.string().min(1, "Field is required"),
    expiration: z.string().min(1, "Field is required"),
    options: z.array(
        z.object({ id: z.uuid(), name: z.string(), isRight: z.boolean() }),
        "Field is required"
    ).min(1),
});
