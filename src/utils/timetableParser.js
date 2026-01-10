import { read, utils, writeFile } from 'xlsx';
import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker for Vite
const workerUrl = new URL(
    'pdfjs-dist/build/pdf.worker.mjs',
    import.meta.url
).toString();
pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

console.log('PDF.js Worker Source set to:', workerUrl);

export const parseExcelTimetable = async (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = read(data, { type: 'array' });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];

                // Get headers (first row)
                const jsonData = utils.sheet_to_json(worksheet, { header: 1 });
                const headers = jsonData[0] || [];

                const requiredHeaders = [
                    'Day', 'Start Time', 'End Time', 'Subject',
                    'Subject Type', 'Faculty', 'Room',
                    'Semester', 'Division', 'Batch Strength'
                ];

                const missing = requiredHeaders.filter(h => !headers.includes(h));

                if (missing.length > 0) {
                    throw new Error(`Invalid Excel Structure. Column "${missing[0]}" missing.`);
                }

                // Return data as objects (re-parsing with headers)
                resolve(utils.sheet_to_json(worksheet));
            } catch (error) {
                reject(error);
            }
        };
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
    });
};

export const parsePDFTimetable = async (file, facultyList) => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(' ');
        fullText += pageText + '\n';
    }

    // Basic Regex to find patterns like "Monday 10:00-11:00 Math Room 301"
    // This is highly specific and might need adjustment based on their actual PDF format.
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const dayRegex = new RegExp(`(${days.join('|')})`, 'i');
    const timeRegex = /(\d{1,2}[:.]\d{2})\s?[-–to]\s?(\d{1,2}[:.]\d{2})/g;

    const entries = [];
    const lines = fullText.split('\n');

    let currentDay = 'Monday';

    for (const line of lines) {
        const dayMatch = line.match(dayRegex);
        if (dayMatch) currentDay = dayMatch[0];

        let match;
        while ((match = timeRegex.exec(line)) !== null) {
            const startTime = match[1].replace('.', ':');
            const endTime = match[2].replace('.', ':');

            // Try to find subject name after or before time
            // This is very heuristic
            const textAround = line.replace(match[0], ' ### ');
            const parts = textAround.split('###');
            const subjectCandidate = parts[1]?.trim().split(' ')[0] || parts[0]?.trim().split(' ').pop();

            entries.push({
                day_of_week: currentDay,
                start_time: formatTime(startTime),
                end_time: formatTime(endTime),
                subject_name: subjectCandidate || 'Unknown',
                semester: 'VI',
                division: 'A',
                room_no: 'TBD'
            });
        }
    }

    return entries;
};

export const mapToTimetableSchema = (rawData, facultyList) => {
    // If rawData is already mapped (from PDF), just fix faculty
    if (rawData.length > 0 && 'day_of_week' in rawData[0]) {
        return rawData.map(item => {
            const faculty = facultyList.find(f =>
                item.subject_name.toLowerCase().includes(f.name.toLowerCase()) ||
                (item.faculty_name && f.name.toLowerCase().includes(item.faculty_name.toLowerCase()))
            );
            return { ...item, assigned_faculty_id: faculty?.id || null };
        });
    }

    return rawData.map(row => {
        const facultyName = row['Faculty'];
        const faculty = facultyList.find(f => f.name.toLowerCase().includes(facultyName?.toLowerCase() || ''));

        return {
            semester: row['Semester'] || 'VI',
            division: row['Division'] || 'A',
            subject_name: row['Subject'] || '',
            subject_type: row['Subject Type'] || 'IT',
            day_of_week: row['Day'] || 'Monday',
            start_time: formatTime(row['Start Time']),
            end_time: formatTime(row['End Time']),
            room_no: String(row['Room'] || ''),
            assigned_faculty_id: faculty ? faculty.id : null,
            batch_strength: parseInt(row['Batch Strength']) || 60
        };
    }).filter(item => item.subject_name && item.day_of_week);
};

const formatTime = (timeStr) => {
    if (!timeStr) return '00:00:00';
    if (typeof timeStr !== 'string' && typeof timeStr !== 'number') return '00:00:00';

    try {
        let s = String(timeStr).trim();

        // Convert 10:00 to 10:00:00
        if (/^\d{1,2}:\d{2}$/.test(s)) return `${s.padStart(5, '0')}:00`;

        // Handle 10 to 10:00:00
        if (/^\d{1,2}$/.test(s)) return `${s.padStart(2, '0')}:00:00`;

        // Handle Excel serial time
        if (typeof timeStr === 'number') {
            const totalSeconds = Math.floor(timeStr * 24 * 3600);
            const hours = Math.floor(totalSeconds / 3600);
            const minutes = Math.floor((totalSeconds % 3600) / 60);
            const seconds = totalSeconds % 60;
            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }

        return s.includes(':') ? s : '00:00:00';
    } catch (e) {
        return '00:00:00';
    }
};

export const exportToExcel = (entries) => {
    // Format data for Excel
    const data = entries.map(e => ({
        'Day': e.day_of_week,
        'Start Time': e.start_time,
        'End Time': e.end_time,
        'Subject': e.subject_name,
        'Subject Type': e.subject_type,
        'Faculty': e.assigned_faculty?.name || 'Unassigned',
        'Room': e.room_no,
        'Semester': e.semester,
        'Division': e.division,
        'Batch Strength': e.batch_strength || 60
    }));

    // Create workbook and worksheet
    const worksheet = utils.json_to_sheet(data);
    const workbook = utils.book_new();
    utils.book_append_sheet(workbook, worksheet, "Timetable");

    // Fix column widths
    const maxWidths = Object.keys(data[0] || {}).map(key => ({
        wch: Math.max(key.length, ...data.map(row => String(row[key]).length)) + 2
    }));
    worksheet['!cols'] = maxWidths;

    // Generate and download file
    writeFile(workbook, `Timetable_Export_${new Date().toISOString().split('T')[0]}.xlsx`);
};
