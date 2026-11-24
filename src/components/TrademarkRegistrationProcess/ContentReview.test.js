import React, { useState } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import dayjs from "dayjs";
import ContentReview from "./ContentReview";

jest.mock("antd", () => ({
    DatePicker: ({ value, onChange, placeholder, disabled }) => (
        <input placeholder={placeholder} disabled={disabled} value={value ? value.format("YYYY-MM-DD") : ""}
            onChange={event => onChange(event.target.value ? require("dayjs")(event.target.value) : null)} />
    ),
}));

const noop = () => {};
function Form({ responseMonths, initialRows = [] }) {
    const [rows, setRows] = useState(initialRows);
    return <>
        <ContentReview responseMonths={responseMonths} lichSuThamDinhND={rows} setLichSuThamDinhND={setRows}
            setBuocXuLy={noop} setNgayKQThamDinhND={noop} />
        <output data-testid="rows">{JSON.stringify(rows)}</output>
    </>;
}
const rows = () => JSON.parse(screen.getByTestId("rows").textContent);

test.each([2, 3])("creating and editing a refusal consistently uses %s months", responseMonths => {
    render(<Form responseMonths={responseMonths} />);
    fireEvent.click(screen.getByRole("button", { name: "Không đạt" }));
    expect(rows()[0].hanTraLoi).toBe(dayjs().add(responseMonths, "month").format("YYYY-MM-DD"));
    fireEvent.change(screen.getByPlaceholderText("Chọn ngày thông báo từ chối"), { target: { value: "2026-12-31" } });
    expect(rows()[0].hanTraLoi).toBe(responseMonths === 2 ? "2027-02-28" : "2027-03-31");
});

test("loading preserves saved refusal dates; changing process updates all refusal rounds", () => {
    const initialRows = [1, 2].map(lanThamDinh => ({
        lanThamDinh, ngayNhanThongBaoTuChoiTD: "2026-08-15", hanTraLoi: "2026-11-15", giaHan: false,
    }));
    const { rerender } = render(<Form responseMonths={2} initialRows={initialRows} />);
    expect(rows().map(row => row.hanTraLoi)).toEqual(["2026-11-15", "2026-11-15"]);
    rerender(<Form responseMonths={3} />);
    rerender(<Form responseMonths={2} />);
    expect(rows().map(row => row.hanTraLoi)).toEqual(["2026-10-15", "2026-10-15"]);
});
