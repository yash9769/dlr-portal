import * as XLSX from 'xlsx';
import { format } from 'date-fns';

/**
 * Generates the official VIT DLR Excel template for a specific date.
 * Exactly matched to image: uploaded_image_1768043717997.png
 */
export const generateDLRExcel = (date, timetableEntries, facultyMapping) => {
    const dayName = format(date, 'EEEE');
    const dateStr = format(date, 'dd/MM/yyyy').replace(/\//g, '/');

    const wb = XLSX.utils.book_new();

    // Helper to get initials
    const getProfInitials = (facultyId) => {
        const faculty = facultyMapping.find(f => f.id === facultyId);
        if (!faculty) return 'N/A';
        const cleanName = faculty.name.replace(/Dr\.|Prof\.|Mr\.|Ms\./g, '').trim();
        return cleanName.split(' ').map(n => n[0]).join('').toUpperCase();
    };

    // Helper to get Year from Semester
    const getYearFromSem = (sem) => {
        if (['I', 'II'].includes(sem)) return 'FE';
        if (['III', 'IV'].includes(sem)) return 'SE';
        if (['V', 'VI'].includes(sem)) return 'TE';
        if (['VII', 'VIII'].includes(sem)) return 'BE';
        return sem;
    };

    // --- SHEET 1: Daily Lecture Record ---
    // Matching the exact structure of the image provided.
    const dlrHeader = [
        ['VIT [Vidyalankar Institute of Technology]', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Department of Information Technology'],
        [],
        ['[Schedule of Daily Lecture Record]'],
        [`Date: -${dateStr}`, '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', `Day: ${dayName}`],
        ['Note: (/) Indicates Practical Schedule, Yellow color indicates LCS classroom'],
        [],
        // Row 7: Main Header Groups (Positioned exactly as PDF)
        ['', '', '', '', 'As Per Timetable', '', '', '', 'Actual'],
        // Row 8: Sub-Headers (Matching image text exactly)
        [
            'SEM',
            'DIV',
            'Total Batch Strength',
            'Sub. Owned / Offered by IT', // This is where the Subject Name goes in the official format
            'Timing', '', 'Prof', 'Highlight Room No. with Lecture Capture/ Smart Board',
            'Timing', '', 'Prof', 'Attendance',
            'Lecture Capture done Successfully: (Video and Audio) : Y/N',
            'Smart Board PDF uploaded on VREFER (Y/N)',
            'Assignments No. (of Last Week) Collected',
            'Assignments No. (for Coming week) Given',
            'Assignment No. of Previous week which is Graded and distributed',
            'Remarks'
        ],
        // Row 9: Labels
        ['', '', '', '', 'From', 'To', '', '', 'From', 'To', '', '', '', '', '', '', '', '']
    ];

    const dlrRows = timetableEntries.map(entry => {
        const profInitials = getProfInitials(entry.assigned_faculty_id);
        const isLCS = entry.room_no.startsWith('E') || entry.room_no.startsWith('F');

        return [
            entry.semester,
            entry.division,
            entry.batch_strength || '60',
            entry.subject_name + (entry.subject_type === 'Practical' ? ' (/)' : ''),
            entry.start_time.slice(0, 5).replace(':', '.'),
            entry.end_time.slice(0, 5).replace(':', '.'),
            profInitials,
            entry.room_no,
            entry.start_time.slice(0, 5).replace(':', '.'), // Default Actual
            entry.end_time.slice(0, 5).replace(':', '.'),   // Default Actual
            profInitials,                                  // Default Actual
            '', // Attendance (Blank)
            isLCS ? 'Y' : '', // LC Default
            '-', // SB PDF
            '-', // Collected
            '-', // Given
            '-', // Graded
            ''  // Remarks
        ];
    });

    const ws1 = XLSX.utils.aoa_to_sheet([...dlrHeader, ...dlrRows]);

    // Dynamic Merging for SEM and DIV (Vertical Grouping)
    const dynamicMerges = [];
    const firstDataRow = 9; // Rows are 0-indexed, headers end at index 8

    let currentSem = null;
    let currentDiv = null;
    let semStartRow = firstDataRow;
    let divStartRow = firstDataRow;

    timetableEntries.forEach((entry, idx) => {
        const rowIdx = firstDataRow + idx;

        // Semester Merging
        if (entry.semester !== currentSem) {
            if (currentSem !== null && rowIdx - 1 > semStartRow) {
                dynamicMerges.push({ s: { r: semStartRow, c: 0 }, e: { r: rowIdx - 1, c: 0 } });
            }
            currentSem = entry.semester;
            semStartRow = rowIdx;
        }

        // Division Merging (Grouped within Semester)
        if (entry.division !== currentDiv || entry.semester !== currentSem) {
            if (currentDiv !== null && rowIdx - 1 > divStartRow) {
                dynamicMerges.push({ s: { r: divStartRow, c: 1 }, e: { r: rowIdx - 1, c: 1 } });
            }
            currentDiv = entry.division;
            divStartRow = rowIdx;
        }

        // Final row handle
        if (idx === timetableEntries.length - 1) {
            if (rowIdx > semStartRow) dynamicMerges.push({ s: { r: semStartRow, c: 0 }, e: { r: rowIdx, c: 0 } });
            if (rowIdx > divStartRow) dynamicMerges.push({ s: { r: divStartRow, c: 1 }, e: { r: rowIdx, c: 1 } });
        }
    });

    // Precise Merging for VIT Official Design
    ws1['!merges'] = [
        ...dynamicMerges,
        { s: { r: 0, c: 0 }, e: { r: 0, c: 5 } },   // VIT Name
        { s: { r: 0, c: 14 }, e: { r: 0, c: 17 } }, // Dept Name
        { s: { r: 2, c: 0 }, e: { r: 2, c: 17 } },  // Title
        { s: { r: 3, c: 0 }, e: { r: 3, c: 3 } },   // Date
        { s: { r: 3, c: 17 }, e: { r: 3, c: 17 } }, // Day
        { s: { r: 4, c: 0 }, e: { r: 4, c: 17 } },  // Note

        // Main Table Merges (Matching Image)
        { s: { r: 6, c: 4 }, e: { r: 6, c: 7 } },   // As Per Timetable
        { s: { r: 6, c: 8 }, e: { r: 6, c: 17 } },  // Actual

        { s: { r: 7, c: 4 }, e: { r: 7, c: 5 } },   // Timing Group (As Per)
        { s: { r: 7, c: 8 }, e: { r: 7, c: 9 } },   // Timing Group (Actual)

        // Triple Row Vertical Merges (Only for labels that shouldn't dynamic merge)
        { s: { r: 7, c: 0 }, e: { r: 8, c: 0 } },   // SEM Label
        { s: { r: 7, c: 1 }, e: { r: 8, c: 1 } },   // DIV Label
        { s: { r: 7, c: 2 }, e: { r: 8, c: 2 } },   // Total Batch Strength
        { s: { r: 7, c: 3 }, e: { r: 8, c: 3 } },   // Sub Owned...
        { s: { r: 7, c: 6 }, e: { r: 8, c: 6 } },   // Prof (As Per)
        { s: { r: 7, c: 7 }, e: { r: 8, c: 7 } },   // Room (Highlight)
        { s: { r: 7, c: 10 }, e: { r: 8, c: 10 } }, // Prof (Actual)
        { s: { r: 7, c: 11 }, e: { r: 8, c: 11 } }, // Attendance
        { s: { r: 7, c: 12 }, e: { r: 8, c: 12 } }, // LC Successful
        { s: { r: 7, c: 13 }, e: { r: 8, c: 13 } }, // SB PDF
        { s: { r: 7, c: 14 }, e: { r: 8, c: 14 } }, // Assignment Col 1
        { s: { r: 7, c: 15 }, e: { r: 8, c: 15 } }, // Assignment Col 2
        { s: { r: 7, c: 16 }, e: { r: 8, c: 16 } }, // Assignment Col 3
        { s: { r: 7, c: 17 }, e: { r: 8, c: 17 } }, // Remarks
    ];

    ws1['!cols'] = [
        { wch: 6 }, { wch: 6 }, { wch: 10 }, { wch: 25 },
        { wch: 8 }, { wch: 8 }, { wch: 10 }, { wch: 20 },
        { wch: 8 }, { wch: 8 }, { wch: 10 }, { wch: 12 },
        { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 20 }
    ];

    XLSX.utils.book_append_sheet(wb, ws1, 'Daily Lecture Record');

    // --- SHEET 2: Daily Tracking of Lecture Capture ---
    // (Keeping this consistent with official tracking requirements)
    const lcHeader = [
        ['VIT'], ['', ''], ['Department of Information Technology'],
        [],
        ['Daily Tracking of Lecture Capture for VIT'],
        [],
        ['College', 'Day', 'Date', 'Process Owner'],
        ['VIT', dayName, dateStr, 'Prof. Rasika Ransing'],
        [],
        ['Room No.', 'Lecture', 'Lecture Time', '', 'Course/', 'Year', 'Sub.', 'Prof', 'Mic used', '', 'Date on LMS', 'Remarks'],
        ['with LC', 'No.', 'From', 'To', 'Stream', '', '', '', 'Yes', 'No', '', '']
    ];

    const lcEntries = timetableEntries.filter(e => e.room_no.startsWith('E') || e.room_no.startsWith('F'));
    const lcRows = lcEntries.map((entry, idx) => {
        const profInitials = getProfInitials(entry.assigned_faculty_id);
        const yearCode = getYearFromSem(entry.semester);

        return [
            entry.room_no,
            idx + 1,
            entry.start_time.slice(0, 5),
            entry.end_time.slice(0, 5),
            `${yearCode} DIV ${entry.division}`,
            '2025-26',
            entry.subject_name,
            profInitials,
            'Yes',
            '',
            'Pending',
            ''
        ];
    });

    const ws2 = XLSX.utils.aoa_to_sheet([...lcHeader, ...lcRows]);

    ws2['!merges'] = [
        { s: { r: 4, c: 0 }, e: { r: 4, c: 11 } },
        { s: { r: 9, c: 0 }, e: { r: 10, c: 0 } },
        { s: { r: 9, c: 1 }, e: { r: 10, c: 1 } },
        { s: { r: 9, c: 2 }, e: { r: 9, c: 3 } },
        { s: { r: 9, c: 4 }, e: { r: 10, c: 4 } },
        { s: { r: 9, c: 5 }, e: { r: 10, c: 5 } },
        { s: { r: 9, c: 6 }, e: { r: 10, c: 6 } },
        { s: { r: 9, c: 7 }, e: { r: 10, c: 7 } },
        { s: { r: 9, c: 8 }, e: { r: 9, c: 9 } },
        { s: { r: 9, c: 10 }, e: { r: 10, c: 10 } },
        { s: { r: 9, c: 11 }, e: { r: 10, c: 11 } },
    ];

    ws2['!cols'] = [
        { wch: 12 }, { wch: 8 }, { wch: 10 }, { wch: 10 }, { wch: 15 },
        { wch: 10 }, { wch: 20 }, { wch: 10 }, { wch: 8 }, { wch: 8 }, { wch: 15 }, { wch: 20 }
    ];

    XLSX.utils.book_append_sheet(wb, ws2, 'Tracking of LC');

    // --- DOWNLOAD ---
    XLSX.writeFile(wb, `DLR_IT_${format(date, 'dd-MM-yyyy')}.xlsx`);
};
