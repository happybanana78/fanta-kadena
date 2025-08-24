export const useValidate = (schema, data) => {
    const parsed = schema.safeParse(data);

    if (!parsed.success) {
        const fieldErrors = parsed.error.flatten().fieldErrors;

        throw createError({
            statusCode: 400,
            statusMessage: "Validation failed",
            data: fieldErrors,
        });
    }

    return parsed.data;
}
