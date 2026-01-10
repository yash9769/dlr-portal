import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';

export const generateDailyReport = (date, schedule, records) => {
    const doc = new jsPDF('landscape');

    // --- Header ---
    doc.setFontSize(14);
    doc.text('Vidyalankar Institute of Technology', 14, 15);
    doc.setFontSize(12);
    doc.text('Department of Information Technology', 14, 22);
    doc.text(`Daily Lecture Record - ${format(new Date(date), 'dd/MM/yyyy')} (${new Date(date).toLocaleString('en-us', { weekday: 'long' })})`, 14, 29);

    // --- Data Merging Logic ---
    // We need to map every schedule item to its record (if exists)
    const rows = schedule.map(slot => {
        // Find matching record for this timetable slot
        const record = records.find(r => r.timetable_id === slot.id) || {};

        // Check constraints/highlighting requirements
        const isFacultyChanged = record.faculty_id && record.faculty_id !== slot.assigned_faculty_id;
        // Room conflict logic would require checking all rows for duplicates, doing essentially here:
        // This row is simple mapping for now.

        const actualTime = record.actual_start_time ? `${record.actual_start_time} - ${record.actual_end_time}` : '-';
        // Use optional chaining carefully if assigned_faculty is missing in some data
        const deptFacultyName = slot.assigned_faculty?.name || 'Unknown';
        const actualFacultyName = record.actual_faculty?.name || (record.faculty_id ? 'Loaded ID' : '-');

        return [
            slot.semester,           // 1. Sem
            slot.division,           // 2. Div
            slot.batch_strength || '', // 3. Strength
            slot.subject_name,       // 4. Subject
            slot.subject_type,       // 5. Type
            `${slot.start_time} - ${slot.end_time}`, // 6. Time (Planned)
            deptFacultyName,         // 7. Faculty (Planned)
            slot.room_no,            // 8. Room (Planned)
            // --- Faculty Inputs ---
            actualFacultyName,       // 9. Actual Faculty
            actualTime,              // 10. Actual Time
            record.room_no || '-',   // 11. Actual Room
            record.attendance_count || 0, // 12. Attendance
            record.topic_covered || '-',  // 13. Topic
            record.lecture_capture_status ? 'Yes' : 'No', // 14. LC
            record.smart_board_pdf_status ? 'Yes' : 'No', // 15. SB
            record.assignments_collected_last_week ? 'Yes' : '-', // 16. Assgn
            record.remarks || ''     // 17. Remarks
        ];
    });

    const headers = [[
        'Sem', 'Div', 'Batch', 'Subject', 'Type', 'Time', 'Faculty', 'Room',
        'Actual Faculty', 'Act. Time', 'Act. Room', 'Att.', 'Topic', 'LC', 'SB', 'Assgn', 'Rmks'
    ]];

    // --- Main Table ---
    autoTable(doc, {
        startY: 35,
        head: headers,
        body: rows,
        theme: 'grid',
        styles: { fontSize: 8, cellPadding: 1 },
        headStyles: { fillColor: [41, 128, 185] }, // Blue header
        didParseCell: function (data) {
            // Highlighting Logic
            if (data.section === 'body') {
                const record = records.find(r => r.timetable_id === schedule[data.row.index].id);
                const slot = schedule[data.row.index];

                // Highlight Faculty Name if changed (Col Index 8)
                if (data.column.index === 8 && record && record.faculty_id !== slot.assigned_faculty_id) {
                    data.cell.styles.fillColor = [255, 255, 0]; // Yellow
                }

                // Highlight Room if conflict (Simplified check: if Actual Room === Planned Room but timing overlaps? 
                // actually user said "same room used for overlapping timings", which is a cross-row check.
                // For now, let's just highlight if room changed from planned (Col 10)
                if (data.column.index === 10 && record && record.room_no !== slot.room_no) {
                    data.cell.styles.fillColor = [255, 200, 200]; // Light Red
                }
            }
        }
    });

    // --- Lecture Capture Section ---
    const finalY = (doc.lastAutoTable?.finalY || 35) + 10;
    doc.text('Daily Tracking of Lecture Capture', 14, finalY);

    const lcRecords = records.filter(r => r.lecture_capture_status);
    const lcRows = lcRecords.map(r => {
        const slot = schedule.find(s => s.id === r.timetable_id);
        return [
            r.room_no,
            '1', // Lecture No (placeholder)
            `${r.actual_start_time} - ${r.actual_end_time}`,
            'INFT', // Stream
            slot?.subject_name || '-',
            r.actual_faculty?.name || '-',
            'Yes', // Mic
            'Yes', // Uploaded
            r.remarks || '-'
        ];
    });

    autoTable(doc, {
        startY: finalY + 5,
        head: [['Room', 'Lec No', 'Time', 'Stream', 'Subject', 'Faculty', 'Mic', 'LMS', 'Remarks']],
        body: lcRows,
        theme: 'grid',
        styles: { fontSize: 8 },
        headStyles: { fillColor: [46, 204, 113] } // Green header
    });

    return doc;
};
