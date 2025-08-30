import {useParseDate} from "~~/composables/useParseDate.js";
import {useAddToDate} from "~~/composables/useAddToDate.js";

export const useParseStatus = (session) => {
    const today = useParseDate(new Date(), true);
    const expiration = useParseDate(session.expiration, true);
    const resultReleasedAt = useParseDate(session.result_released_at, true);

    if (
        today < expiration &&
        resultReleasedAt <= useParseDate("1992-09-01", true) &&
        session.correct < 0
    ) {
        return {
            id: 'active',
            name: 'Active',
        };
    }

    else if (
        today >= expiration &&
        today < useAddToDate(expiration, 'days', 1) && // +1 day
        session.correct < 0
    ) {
        return {
            id: 'pending_result',
            name: 'Pending Result',
        };
    }

    else if (
        resultReleasedAt > useParseDate("1992-09-01", true) &&
        session.correct >= 0
    ) {
        return {
            id: 'voting_result',
            name: 'Voting Result',
        };
    }

    else if (
        today >= expiration &&
        session.votes.length === 0
    ) {
        return {
            id: 'refunded_no_players',
            name: 'Refunded (no players)',
        };
    }

    else if (
        today >= expiration &&
        today >= useAddToDate(expiration, 'days', 1) &&
        session.correct < 0
    ) {
        return {
            id: 'refunded_creator_no_publish',
            name: 'Refunded (creator missed result publish)',
        };
    }

    else if (
        today >= expiration &&
        today >= useAddToDate(expiration, 'days', 1) &&
        session.correct >= 0 &&
        session.votes.length > 0 &&
        (session.result_votes.length / session.votes.length) < 0.8
    ) {
        return {
            id: 'refunded_no_quorum',
            name: 'Refunded (quorum not reached)',
        };
    }

    else {
        return {
            id: 'ended',
            name: 'Ended',
        };
    }
}
