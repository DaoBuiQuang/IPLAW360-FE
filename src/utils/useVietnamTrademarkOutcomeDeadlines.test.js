import { renderHook } from "@testing-library/react";
import useDeadlines, { outcomeDeadline } from "./useVietnamTrademarkOutcomeDeadlines";

const propsFor = (overrides = {}) => ({
    filingDate: "2026-04-01",
    contentResultDate: "2026-08-31",
    grantNoticeDate: "2026-08-31",
    grantAccepted: true,
    opinionResultDate: null,
    opinionAccepted: null,
    setResponseDeadline: jest.fn(),
    setFeeDeadline: jest.fn(),
    setOpinionDeadline: jest.fn(),
    ...overrides,
});

test.each([
    ["2026-03-31", 3, "2026-11-30"],
    ["2026-04-01", 2, "2026-10-31"],
    ["2026-04-02", 2, "2026-10-31"],
])("filing on %s selects response and fee periods, including month end", (filingDate, months, expected) => {
    const props = propsFor({ filingDate });
    const { result } = renderHook(() => useDeadlines(props));
    expect(result.current).toBe(months);
    expect(props.setResponseDeadline).toHaveBeenLastCalledWith(expected);
    expect(props.setFeeDeadline).toHaveBeenLastCalledWith(expected);
    expect(props.setOpinionDeadline).toHaveBeenLastCalledWith(null);
});

test("loading an edit form and unrelated edits preserve saved deadlines", () => {
    const props = propsFor({ ready: false, preserveOnLoad: true });
    const { rerender } = renderHook(values => useDeadlines(values), { initialProps: props });
    rerender({ ...props, ready: true });
    rerender({ ...props, ready: true, notes: "changed" });
    expect(props.setResponseDeadline).not.toHaveBeenCalled();
    expect(props.setFeeDeadline).not.toHaveBeenCalled();
    expect(props.setOpinionDeadline).not.toHaveBeenCalled();
});

test("changing and clearing notification dates recalculates existing fees and responses", () => {
    const props = propsFor({ preserveOnLoad: true });
    const { rerender } = renderHook(values => useDeadlines(values), { initialProps: props });
    rerender({ ...props, grantNoticeDate: "2026-12-31", contentResultDate: "2026-12-31" });
    expect(props.setFeeDeadline).toHaveBeenLastCalledWith("2027-02-28");
    expect(props.setResponseDeadline).toHaveBeenLastCalledWith("2027-02-28");
    rerender({ ...props, grantNoticeDate: null, contentResultDate: null });
    expect(props.setFeeDeadline).toHaveBeenLastCalledWith(null);
    expect(props.setResponseDeadline).toHaveBeenLastCalledWith(null);
});

test("switching across the filing cutoff updates deadlines in both directions", () => {
    const props = propsFor({ preserveOnLoad: true });
    const { rerender } = renderHook(values => useDeadlines(values), { initialProps: props });
    rerender({ ...props, filingDate: "2026-03-31" });
    expect(props.setFeeDeadline).toHaveBeenLastCalledWith("2026-11-30");
    expect(props.setResponseDeadline).toHaveBeenLastCalledWith("2026-11-30");
    rerender(props);
    expect(props.setFeeDeadline).toHaveBeenLastCalledWith("2026-10-31");
    expect(props.setResponseDeadline).toHaveBeenLastCalledWith("2026-10-31");
});

test.each([["2026-03-31", "2026-11-30", "2027-01-15"], ["2026-04-01", "2026-10-31", "2026-12-15"]])(
    "opinion and subsequent fee deadlines for filing %s use their respective source dates",
    (filingDate, opinionDeadline, feeDeadline) => {
        const props = propsFor({ filingDate, grantAccepted: false });
        const { rerender } = renderHook(values => useDeadlines(values), { initialProps: props });
        expect(props.setOpinionDeadline).toHaveBeenLastCalledWith(opinionDeadline);
        expect(props.setFeeDeadline).toHaveBeenLastCalledWith(null);
        rerender({ ...props, opinionAccepted: true, opinionResultDate: "2026-10-15" });
        expect(props.setFeeDeadline).toHaveBeenLastCalledWith(feeDeadline);
        rerender({ ...props, opinionAccepted: false, opinionResultDate: "2026-10-15" });
        expect(props.setFeeDeadline).toHaveBeenLastCalledWith(null);
    }
);

test("missing and invalid source dates do not produce deadlines", () => {
    expect(outcomeDeadline(null, 2)).toBe(null);
    expect(outcomeDeadline("invalid", 2)).toBe(null);
});
