import moment from "moment";

export const useAddToDate = (date, unit, amount) => {
    if (unit === 'days') {
        return moment(date).add(amount, 'days').format();
    }
}
