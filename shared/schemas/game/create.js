import { z } from "zod";

export const createGameSchema = z.object({
    name: z.string().min(1, "Field is required"),
    description: z.string().min(1, "Field is required"),
    expiration: z.iso.date("Field is required").refine(data =>
        new Date(data) > new Date(), {message: 'Expiration date must be in the future'}
    ),
    participation_fee: z.coerce.number({
        required_error: "Participation fee is required",
        invalid_type_error: "Participation fee must be a number",
    }).gt(0.09, "Must be grater or equal then 0.1"),
    options: z.array(
        z.object({ id: z.uuid(), name: z.string(), isRight: z.boolean() }),
        "Field is required"
    ).min(2),
});
