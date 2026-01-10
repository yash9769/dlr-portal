import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';

export const generateDailyReport = (date, schedule, records, approval = null) => {
    const doc = new jsPDF('landscape');
    const timestamp = format(new Date(), 'dd-MM-yyyy HH:mm');

    // --- Header ---
    doc.setFontSize(14);
    doc.text('Vidyalankar Institute of Technology', 14, 15);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on: ${timestamp}`, 280, 15, { align: 'right' });

    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text('Department of Information Technology', 14, 22);
    doc.text(`Daily Lecture Record - ${format(new Date(date), 'dd/MM/yyyy')} (${new Date(date).toLocaleString('en-us', { weekday: 'long' })})`, 14, 29);

    // --- Approval Stamp (Top Right) ---
    if (approval) {
        doc.setDrawColor(34, 197, 94); // Side Green
        doc.setLineWidth(0.5);
        doc.rect(230, 20, 50, 12);
        doc.setFontSize(10);
        doc.setTextColor(34, 197, 94);
        doc.text('APPROVED', 255, 25, { align: 'center' });
        doc.setFontSize(7);
        doc.text(`By Dept: ${approval.approved_by}`, 255, 30, { align: 'center' });
    }

    doc.setTextColor(0); // Reset color
    const rows = [];
    const processedRecordIds = new Set();

    // Helper to format rows
    const createReportRow = (slot, record) => {
        const sem = slot.semester || record?.schedule?.semester || 'N/A';
        const div = slot.division || record?.schedule?.division || 'N/A';
        const str = slot.batch_strength || record?.schedule?.batch_strength || '60';
        const sub = slot.subject_name || record?.schedule?.subject_name || 'Extra Lecture';
        const type = slot.subject_type || record?.schedule?.subject_type || (slot.id ? 'Theory' : 'Practical');

        return [
            sem,
            div,
            str,
            sub,
            type,
            slot.assigned_faculty?.name || 'N/A', // Faculty (S)
            record?.actual_faculty?.name || 'N/A', // Faculty (A)
            slot.start_time ? slot.start_time.slice(0, 5) : 'N/A', // Time (S)
            record?.actual_start_time ? record.actual_start_time.slice(0, 5) : 'N/A', // Time (A)
            slot.room_no || 'N/A', // Room (S)
            record?.room_no || 'N/A', // Room (A)
            record?.attendance_count ?? '0',
            record?.topic_covered || 'N/A',
            record?.lecture_capture_status ? 'Yes' : (record ? 'No' : 'N/A'),
            (record?.lecture_capture_status && record?.smart_board_pdf_status) ? 'Yes' : (record ? 'No' : 'N/A'),
            record?.remarks || '-'
        ];
    };

    // 1. Process all scheduled slots
    schedule.forEach(slot => {
        const record = records.find(r => r.timetable_id === slot.id);
        if (record) processedRecordIds.add(record.id);
        rows.push(createReportRow(slot, record));
    });

    // 2. Add records that weren't in the schedule (Extra)
    records.forEach(record => {
        if (!processedRecordIds.has(record.id)) {
            const dummySlot = { semester: record.schedule?.semester, division: record.schedule?.division, subject_name: record.schedule?.subject_name };
            rows.push(createReportRow(dummySlot, record));
        }
    });

    const headers = [[
        'Sem', 'Div', 'Str.', 'Subject', 'Type', 'Faculty (S)', 'Faculty (A)', 'Time (S)',
        'Time (A)', 'Room (S)', 'Room (A)', 'Attd.', 'Topic Covered', 'L.C.', 'LMS', 'Remarks'
    ]];

    autoTable(doc, {
        startY: 35,
        head: headers,
        body: rows,
        theme: 'grid',
        styles: { fontSize: 7, cellPadding: 1 },
        headStyles: { fillColor: [41, 128, 185] },
        didParseCell: function (data) {
            if (data.section === 'body') {
                // Faculty Substitution (Yellow)
                if (data.column.index === 6) {
                    const actual = data.row.cells[6].text[0];
                    const planned = data.row.cells[5].text[0];
                    if (actual !== 'N/A' && planned !== 'N/A' && actual !== planned) {
                        data.cell.styles.fillColor = [255, 255, 0];
                    }
                }
                // Room Conflict/Change (Red)
                if (data.column.index === 10) {
                    const actual = data.row.cells[10].text[0];
                    const planned = data.row.cells[9].text[0];
                    if (actual !== 'N/A' && planned !== 'N/A' && actual !== planned) {
                        data.cell.styles.fillColor = [255, 200, 200];
                    }
                }
                // LC Missing (Red)
                if (data.column.index === 13 && data.cell.text[0] === 'No') {
                    data.cell.styles.fillColor = [255, 200, 200];
                    data.cell.styles.textColor = [150, 0, 0];
                }
                // LC Done (Green)
                if (data.column.index === 13 && data.cell.text[0] === 'Yes') {
                    data.cell.styles.fillColor = [200, 255, 200];
                }
            }
        }
    });

    let finalY = doc.lastAutoTable.finalY + 8;

    // Legend
    doc.setFontSize(8);
    doc.setFillColor(245, 245, 245);
    doc.rect(230, finalY, 50, 20, 'F');
    doc.setTextColor(0);
    doc.text('LEGEND:', 232, finalY + 4);
    doc.setFontSize(6);
    doc.setFillColor(255, 255, 0); doc.rect(232, finalY + 6, 3, 2, 'F');
    doc.text('Faculty Substitution', 237, finalY + 8);
    doc.setFillColor(255, 200, 200); doc.rect(232, finalY + 10, 3, 2, 'F');
    doc.text('Room Change / LC Missing', 237, finalY + 12);
    doc.setFillColor(200, 255, 200); doc.rect(232, finalY + 14, 3, 2, 'F');
    doc.text('Lecture Capture Completed', 237, finalY + 16);

    // Tracking Table
    doc.setFontSize(10);
    doc.setTextColor(0);
    doc.text('Daily Tracking of Lecture Capture', 14, finalY + 5);

    const lcRows = records.map((r, index) => {
        const lcStatus = r.lecture_capture_status ? 'Yes' : 'No';
        const lmsStatus = (r.lecture_capture_status && r.smart_board_pdf_status) ? 'Yes' : 'No';
        return [
            r.room_no || 'N/A',
            (index + 1).toString(),
            `${r.actual_start_time?.slice(0, 5)} - ${r.actual_end_time?.slice(0, 5)}`,
            'INFT',
            r.schedule?.subject_name || 'Extra',
            r.actual_faculty?.name || 'N/A',
            'Yes',
            lcStatus,
            lmsStatus,
            r.remarks || '-'
        ];
    });

    autoTable(doc, {
        startY: finalY + 8,
        head: [['Room', 'Lec #', 'Time', 'Dept', 'Subject', 'Faculty', 'Mic Used', 'Lecture Capture', 'LMS Upload', 'Remarks']],
        body: lcRows,
        theme: 'grid',
        styles: { fontSize: 7, cellPadding: 1 },
        headStyles: { fillColor: [46, 204, 113] },
        didParseCell: function (data) {
            if (data.section === 'body') {
                if (data.column.index === 7 && data.cell.text[0] === 'No') data.cell.styles.fillColor = [255, 200, 200];
                if (data.column.index === 8 && data.cell.text[0] === 'No') data.cell.styles.fillColor = [255, 255, 200];
            }
        }
    });

    return doc;
};
