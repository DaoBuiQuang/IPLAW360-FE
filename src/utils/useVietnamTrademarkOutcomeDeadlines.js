import { useEffect, useRef } from "react";
import dayjs from "dayjs";
import { usesNewVietnamTrademarkProcess } from "./useVietnamTrademarkDeadlines";

export const vietnamTrademarkResponseMonths = (filingDate) =>
    usesNewVietnamTrademarkProcess(filingDate) ? 2 : 3;

export const outcomeDeadline = (date, months) =>
    date && dayjs(date).isValid() ? dayjs(date).add(months, "month").format("YYYY-MM-DD") : null;

export default function useVietnamTrademarkOutcomeDeadlines({
    filingDate, contentResultDate, grantNoticeDate, grantAccepted, opinionResultDate, opinionAccepted,
    setResponseDeadline, setFeeDeadline, setOpinionDeadline, ready = true, preserveOnLoad = false,
}) {
    const previous = useRef(null);
    const months = vietnamTrademarkResponseMonths(filingDate);
    const feeBase = grantAccepted === true ? grantNoticeDate
        : grantAccepted === false && opinionAccepted === true ? opinionResultDate : null;
    const opinionBase = grantAccepted === false ? grantNoticeDate : null;

    useEffect(() => {
        if (!ready) {
            previous.current = null;
            return;
        }
        const last = previous.current;
        previous.current = { months, contentResultDate, feeBase, opinionBase };
        if (!last && preserveOnLoad) return;
        if (!last || last.months !== months || last.contentResultDate !== contentResultDate) {
            setResponseDeadline(outcomeDeadline(contentResultDate, months));
        }
        if (!last || last.months !== months || last.feeBase !== feeBase) {
            setFeeDeadline(outcomeDeadline(feeBase, months));
        }
        if (!last || last.months !== months || last.opinionBase !== opinionBase) {
            setOpinionDeadline(outcomeDeadline(opinionBase, months));
        }
    }, [ready, preserveOnLoad, months, contentResultDate, feeBase, opinionBase,
        setResponseDeadline, setFeeDeadline, setOpinionDeadline]);

    return months;
}
