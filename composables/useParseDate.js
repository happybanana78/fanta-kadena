import moment from "moment";

export const useParseDate = (date, toIso) => {
    if (toIso) {
        return moment(date).locale('it').startOf('day').format();
    }

    return moment(date).locale('it').format('L');
}
