// utils/excelUtils.js
import * as XLSX from "xlsx";

export const processExcelData = async (file) => {
  try {
    const data = new Uint8Array(file);
    const workbook = XLSX.read(data, { type: "array" });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    // Skip the first row (title) and use second row as headers
    const books = [];

    // Process each row starting from index 2 (skipping title and header rows)
    for (let i = 2; i < jsonData.length; i++) {
      const row = jsonData[i];
      if (row.length === 0 || !row[0]) continue; // Skip empty rows

      const book = {
        serialNumber: row[0],
        class: row[1],
        subject: row[2] || "",
        title: row[3] || "",
        publisher: row[4] || "",
        section: row[5] || "",
        remarks: row[6] || "",
        academicYear: "2024-2025",
      };

      // Basic validation
      if (book.title && book.class) {
        books.push(book);
      }
    }

    return { success: true, data: books };
  } catch (error) {
    console.error("Error processing Excel file:", error);
    return { success: false, error: "Failed to process Excel file" };
  }
};

export const exportToExcel = (books, format = "xlsx") => {
  try {
    // Format data for export
    const exportData = books.map((book) => ({
      "Serial Number": book.serialNumber,
      Class: book.class,
      Subject: book.subject,
      Title: book.title,
      Publisher: book.publisher,
      Section: book.section,
      Remarks: book.remarks,
    }));

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(exportData);

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, "DH Syllabus Books");

    // Generate filename with current date
    const filename = `dh-syllabus-books-${new Date().toISOString().split("T")[0]}.${format}`;

    // Write file
    XLSX.writeFile(wb, filename);

    return { success: true };
  } catch (error) {
    console.error("Error exporting data:", error);
    return { success: false, error: "Failed to export data" };
  }
};
