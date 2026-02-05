import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

/**
 * Xuất file Excel tổng quát
 * @param {Array} data - Mảng dữ liệu cần export (mảng object)
 * @param {Array} columns - Mảng các cột cần xuất dạng [{ label: "Tên cột", key: "tênTrườngTrongData" }]
 * @param {String} fileName - Tên file muốn lưu (không cần đuôi .xlsx)
 */
export const exportToExcel = (data, columns, fileName = "ExportedData") => {
    const mappedData = data.map((item, index) => {
        const row = { STT: index + 1 };
        columns.forEach(col => {
            row[col.label] = item[col.key];
        });
        return row;
    });

    const worksheet = XLSX.utils.json_to_sheet(mappedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

    const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
    });

    const blob = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(blob, `${fileName}.xlsx`);
};
