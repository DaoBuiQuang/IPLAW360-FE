import { renderHook } from "@testing-library/react";
import useVietnamTrademarkDeadlines from "./useVietnamTrademarkDeadlines";

const createProps = (overrides = {}) => ({
    filingDate: "2026-04-01",
    formalAcceptanceDate: "2026-05-10",
    publicationDate: "2026-06-15",
    setPublicationDeadline: jest.fn(),
    setContentReviewDeadline: jest.fn(),
    ...overrides,
});

test.each([
    ["2026-03-31", false, "2026-07-10", "2027-03-15"],
    ["2026-04-01", true, "2026-06-01", "2026-11-15"],
    ["2026-04-02", true, "2026-06-02", "2026-11-15"],
])("filing on %s selects the appropriate deadlines", (filingDate, isNew, publication, content) => {
    const props = createProps({ filingDate });
    const { result } = renderHook(() => useVietnamTrademarkDeadlines(props));
    expect(result.current).toBe(isNew);
    expect(props.setPublicationDeadline).toHaveBeenLastCalledWith(publication);
    expect(props.setContentReviewDeadline).toHaveBeenLastCalledWith(content);
});

test("new process calculates publication before formal acceptance, but waits for actual publication to calculate content review", () => {
    const props = createProps({ formalAcceptanceDate: null, publicationDate: null });
    renderHook(() => useVietnamTrademarkDeadlines(props));
    expect(props.setPublicationDeadline).toHaveBeenLastCalledWith("2026-06-01");
    expect(props.setContentReviewDeadline).toHaveBeenLastCalledWith(null);
});

test("legacy process waits for formal acceptance", () => {
    const props = createProps({ filingDate: "2026-03-31", formalAcceptanceDate: null });
    renderHook(() => useVietnamTrademarkDeadlines(props));
    expect(props.setPublicationDeadline).toHaveBeenLastCalledWith(null);
});

test.each(["2026-03-31", "2026-04-01"])("editing a saved application from %s preserves deadlines during loading and unrelated edits", (filingDate) => {
    const props = createProps({ filingDate, ready: false, preserveOnLoad: true });
    const { rerender } = renderHook((values) => useVietnamTrademarkDeadlines(values), { initialProps: props });
    const loaded = { ...props, ready: true };
    rerender(loaded);
    rerender({ ...loaded, notes: "Updated notes" });
    expect(props.setPublicationDeadline).not.toHaveBeenCalled();
    expect(props.setContentReviewDeadline).not.toHaveBeenCalled();
});

test("changing filing date across the cutoff recalculates both deadlines in either direction", () => {
    const props = createProps({ filingDate: "2026-03-31", preserveOnLoad: true });
    const { rerender } = renderHook((values) => useVietnamTrademarkDeadlines(values), { initialProps: props });
    rerender({ ...props, filingDate: "2026-04-01" });
    expect(props.setPublicationDeadline).toHaveBeenLastCalledWith("2026-06-01");
    expect(props.setContentReviewDeadline).toHaveBeenLastCalledWith("2026-11-15");
    rerender(props);
    expect(props.setPublicationDeadline).toHaveBeenLastCalledWith("2026-07-10");
    expect(props.setContentReviewDeadline).toHaveBeenLastCalledWith("2027-03-15");
});

test("changing formal acceptance only recalculates legacy publication deadlines", () => {
    const props = createProps({ filingDate: "2026-03-31", preserveOnLoad: true });
    const { rerender } = renderHook((values) => useVietnamTrademarkDeadlines(values), { initialProps: props });
    rerender({ ...props, formalAcceptanceDate: "2026-05-20" });
    expect(props.setPublicationDeadline).toHaveBeenLastCalledWith("2026-07-20");
    expect(props.setContentReviewDeadline).not.toHaveBeenCalled();
    rerender({ ...props, filingDate: "2026-04-01" });
    props.setPublicationDeadline.mockClear();
    rerender({ ...props, filingDate: "2026-04-01", formalAcceptanceDate: "2026-05-25" });
    expect(props.setPublicationDeadline).not.toHaveBeenCalled();
});

test("editing or clearing the actual publication date updates only the content deadline", () => {
    const props = createProps({ preserveOnLoad: true });
    const { rerender } = renderHook((values) => useVietnamTrademarkDeadlines(values), { initialProps: props });
    rerender({ ...props, publicationDate: "2026-08-31" });
    expect(props.setContentReviewDeadline).toHaveBeenLastCalledWith("2027-01-31");
    rerender({ ...props, publicationDate: null });
    expect(props.setContentReviewDeadline).toHaveBeenLastCalledWith(null);
    expect(props.setPublicationDeadline).not.toHaveBeenCalled();
});

test("month-end filing uses calendar months and clearing it removes its publication deadline", () => {
    const props = createProps({ filingDate: "2026-12-31", formalAcceptanceDate: null, publicationDate: null });
    const { rerender } = renderHook((values) => useVietnamTrademarkDeadlines(values), { initialProps: props });
    expect(props.setPublicationDeadline).toHaveBeenLastCalledWith("2027-02-28");
    rerender({ ...props, filingDate: null });
    expect(props.setPublicationDeadline).toHaveBeenLastCalledWith(null);
});
