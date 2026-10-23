import { useEffect, useRef } from "react";
import dayjs from "dayjs";

const NEW_PROCESS_START = "2026-04-01";

const normalizeDate = (value) => {
    if (!value || !dayjs(value).isValid()) return null;
    return dayjs(value).format("YYYY-MM-DD");
};

export const usesNewVietnamTrademarkProcess = (filingDate) => {
    const date = normalizeDate(filingDate);
    return date !== null && date >= NEW_PROCESS_START;
};

// Only the VN trademark add/edit forms use this hook. Existing saved deadlines
// are kept on hydration; changing their source dates recalculates them.
export default function useVietnamTrademarkDeadlines({
    filingDate,
    formalAcceptanceDate,
    publicationDate,
    setPublicationDeadline,
    setContentReviewDeadline,
    ready = true,
    preserveOnLoad = false,
}) {
    const previous = useRef(null);
    const isNewProcess = usesNewVietnamTrademarkProcess(filingDate);
    const publicationBase = normalizeDate(isNewProcess ? filingDate : formalAcceptanceDate);
    const contentBase = normalizeDate(publicationDate);
    const contentMonths = isNewProcess ? 5 : 9;

    useEffect(() => {
        if (!ready) {
            previous.current = null;
            return;
        }

        const current = { publicationBase, contentBase, contentMonths };
        const last = previous.current;
        previous.current = current;

        if (!last && preserveOnLoad) return;

        if (!last || last.publicationBase !== publicationBase) {
            setPublicationDeadline(publicationBase
                ? dayjs(publicationBase).add(2, "month").format("YYYY-MM-DD")
                : null);
        }
        if (!last || last.contentBase !== contentBase || last.contentMonths !== contentMonths) {
            setContentReviewDeadline(contentBase
                ? dayjs(contentBase).add(contentMonths, "month").format("YYYY-MM-DD")
                : null);
        }
    }, [ready, preserveOnLoad, publicationBase, contentBase, contentMonths,
        setPublicationDeadline, setContentReviewDeadline]);

    return isNewProcess;
}
