export const useParseStatus = (session) => {
    if (!session.result_voted) {
        return 'Active';
    } else if (session.invalidated) {
        return 'Invalidated';
    } else if (new Date(session.result_released_at) > new Date("1992-09-01") && !session.invalidated && !session.result_voted) {
        return 'Voting Result';
    } else {
        return 'Closed';
    }
}
