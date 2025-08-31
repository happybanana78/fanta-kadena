import moment from "moment";

export const useParseDate = ({date, toIso = false, standard = false}) => {
    if (standard) {
        return moment(date).locale('it').startOf('day').format();
    }

    if (toIso) {
        return new Date(date).toISOString().replace(".000", "");
    }

    return moment(date).locale('it').format('L');
}
