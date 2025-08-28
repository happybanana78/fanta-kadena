export const useParseStatus = (session) => {
    if (session.result_voted === 0) {
        return 'Active';
    } else if (session.invalidated === 1) {
        return 'Invalidated';
    } else if (new Date(session.result_released_at) > new Date("1992-09-01") && session.invalidated === 0 && session.result_voted === 0) {
        return 'Voting Result';
    } else {
        return 'Closed';
    }
}
