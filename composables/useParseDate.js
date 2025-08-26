export const useParseDate = (date, toIso = false) => {
    if (toIso) {
        return new Date(date).toISOString().replace(".000", "");
    }

    return new Date(date);
}
