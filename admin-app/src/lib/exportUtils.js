/**
 * Export Utilities for Venus Admin
 * Provides functions to export tabular data to Excel and PDF formats.
 * Utilizes dynamic imports to avoid SSR issues during Next.js page generation.
 */

/**
 * Exports data to a native Excel (.xlsx) file.
 * 
 * @param {Array<Object>} data - Raw list of objects to export
 * @param {Array<Object>} headers - Column configuration [{ label: 'Column Header', key: 'fieldKey' }]
 * @param {string} fileName - Destination filename (without extension)
 */
export const exportToExcel = async (data, headers = [], fileName = 'export') => {
  try {
    const XLSX = await import('xlsx');
    
    // Format data based on header mapping if provided
    let worksheetData;
    if (headers && headers.length > 0) {
      worksheetData = data.map(item => {
        const row = {};
        headers.forEach(h => {
          row[h.label] = item[h.key] !== undefined && item[h.key] !== null ? item[h.key] : '';
        });
        return row;
      });
    } else {
      worksheetData = data;
    }

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Sheet');
    
    // Save file
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
  } catch (error) {
    console.error('Excel Export Error:', error);
    throw new Error('Could not export Excel file. Please try again.');
  }
};

/**
 * Exports data to a formatted PDF (.pdf) file with custom branding.
 * 
 * @param {string} title - Document title displayed at the top of the page
 * @param {Array<Object>} headers - Column configuration [{ label: 'Column Header', key: 'fieldKey' }]
 * @param {Array<Object>} data - Raw list of objects to export
 * @param {string} fileName - Destination filename (without extension)
 */
export const exportToPDF = async (title, headers = [], data = [], fileName = 'export') => {
  try {
    const { default: jsPDF } = await import('jspdf');
    await import('jspdf-autotable');
    
    const doc = new jsPDF('p', 'mm', 'a4');
    
    // Design tokens (Forest Green & Charcoal matching globals.css)
    const forestGreen = [45, 71, 57]; // #2D4739
    const charcoal = [66, 72, 68];   // #424844
    const muted = [114, 121, 115];    // #727973
    
    // Formatted headers & body matching key maps
    const tableHeaders = headers.map(h => h.label);
    const tableRows = data.map((item, idx) => 
      headers.map(h => {
        if (h.key === '_index') return String(idx + 1);
        const val = item[h.key];
        return val !== undefined && val !== null ? String(val) : '';
      })
    );

    // Title Block
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(forestGreen[0], forestGreen[1], forestGreen[2]);
    doc.text(title, 14, 18);
    
    // Metadata block
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(charcoal[0], charcoal[1], charcoal[2]);
    doc.text(`Venus Essentials Admin Report`, 14, 24);
    
    doc.setFontSize(8);
    doc.setTextColor(muted[0], muted[1], muted[2]);
    doc.text(`Generated: ${new Date().toLocaleString('en-IN')}`, 14, 29);
    doc.text(`Total Records: ${data.length}`, 14, 33);
    
    // Horizontal divider
    doc.setDrawColor(229, 231, 235); // #E5E7EB
    doc.setLineWidth(0.5);
    doc.line(14, 36, 196, 36);

    // Render Table
    doc.autoTable({
      head: [tableHeaders],
      body: tableRows,
      startY: 40,
      styles: {
        fontSize: 8.5,
        cellPadding: 3,
        font: 'helvetica',
        valign: 'middle',
      },
      headStyles: {
        fillColor: forestGreen,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'left',
      },
      alternateRowStyles: {
        fillColor: [249, 250, 251], // Soft off-white
      },
      columnStyles: {
        // Left align by default, adjust index specifically if needed
        0: { cellWidth: 'wrap' }
      },
      margin: { top: 40, left: 14, right: 14 },
      didDrawPage: (data) => {
        // Footer: Page Numbering
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(muted[0], muted[1], muted[2]);
        const str = `Page ${doc.internal.getNumberOfPages()}`;
        doc.text(str, data.settings.margin.left, doc.internal.pageSize.height - 10);
      }
    });

    // Save output
    doc.save(`${fileName}.pdf`);
  } catch (error) {
    console.error('PDF Export Error:', error);
    throw new Error('Could not export PDF file. Please try again.');
  }
};
