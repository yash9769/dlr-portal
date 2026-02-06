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
                if (jsonData.length === 0) throw new Error("File is empty");

                const headers = jsonData[0] || [];
                const normalize = (h) => String(h).toLowerCase().replace(/[^a-z0-9]/g, '');

                // Map standard keys to actual headers found
                const columnMap = {};
                const standardKeys = {
                    'day': ['day', 'days', 'dayofweek'],
                    'start_time': ['starttime', 'start', 'begin', 'from', 'start time'],
                    'end_time': ['endtime', 'end', 'finish', 'to', 'end time'],
                    'subject': ['subject', 'subjectname', 'course', 'coursename', 'title'],
                    'subject_type': ['subjecttype', 'type', 'category'],
                    'faculty': ['faculty', 'facultyname', 'professor', 'teacher', 'instructor'],
                    'room': ['room', 'roomno', 'classroom', 'venue', 'room no'],
                    'semester': ['semester', 'sem'],
                    'division': ['division', 'div', 'section'],
                    'batch_strength': ['batchstrength', 'strength', 'capacity']
                };

                // Find matching columns
                Object.entries(standardKeys).forEach(([key, aliases]) => {
                    const matchIndex = headers.findIndex(h => aliases.includes(normalize(h)));
                    if (matchIndex !== -1) {
                        columnMap[key] = headers[matchIndex]; // Store actual header name
                    }
                });

                // Check required columns
                const required = ['day', 'start_time', 'end_time', 'subject'];
                const missing = required.filter(k => !columnMap[k]);

                if (missing.length > 0) {
                    throw new Error(`Missing required columns: ${missing.map(k => standardKeys[k][0]).join(', ')}. Found headers: ${headers.join(', ')}`);
                }

                // Parse data using the mapped headers
                const rawObjects = utils.sheet_to_json(worksheet);

                // normalize the objects to use standard keys
                const normalizedData = rawObjects.map(row => {
                    const newRow = {};
                    Object.entries(columnMap).forEach(([standardKey, actualHeader]) => {
                        newRow[standardKey] = row[actualHeader];
                    });
                    return newRow;
                });

                resolve(normalizedData);
            } catch (error) {
                reject(error);
            }
        };
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
    });
};

export const parsePDFTimetable = async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    const entries = [];
    const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();

        // 1. Extract items with coordinates and dimensions
        const items = textContent.items.map(item => ({
            str: item.str,
            x: item.transform[4],
            y: item.transform[5],
            w: item.width || (item.str.length * 5), // Fallback width approximation
            hasEOL: item.hasEOL
        })).filter(item => item.str.trim() !== '');

        if (items.length === 0) continue;

        // 2. Identify Day Headers (Columns)
        // Group items by Y coordinate to find the header row
        // We look for a row containing multiple day names
        let dayHeaders = [];

        // Heuristic: Find items that match day names
        const dayItems = items.filter(item => DAYS.some(d => item.str.trim().toLowerCase() === d.toLowerCase()));

        if (dayItems.length < 3) {
            // If we can't find enough days, this page might not be the main timetable
            continue;
        }

        // Sort by X to map columns left-to-right
        dayItems.sort((a, b) => a.x - b.x);

        // Map each day to its X-coordinate range
        // We assume the column width is roughly the distance to the next day
        dayHeaders = dayItems.map((item, index) => {
            const nextItem = dayItems[index + 1];
            // Est. width: distance to next day or a default width (e.g., 100 units)
            const width = nextItem ? (nextItem.x - item.x) : 100;
            return {
                day: item.str.trim(),
                x: item.x,
                width: width,
                centerX: item.x + (width / 2)
            };
        });

        // 3. Identify Time Slots (Rows)
        // Look for time patterns like "08:00-09:00" or "08:00"
        const timeRegex = /(\d{1,2}[:.]\d{2})\s?[-–to]\s?(\d{1,2}[:.]\d{2})/i;
        const timeRows = items.filter(item => timeRegex.test(item.str))
            .map(item => {
                const match = item.str.match(timeRegex);
                return {
                    y: item.y, // Higher Y is higher on page (Top)
                    start: match[1].replace('.', ':'),
                    end: match[2].replace('.', ':'),
                    raw: item.str
                };
            })
            .sort((a, b) => b.y - a.y); // Sort Top to Bottom

        if (timeRows.length === 0) continue;

        // 4. Map content to cells with special "DO" handling
        // For each text item that isn't a header or time label
        const contentItems = items.filter(item =>
            !dayHeaders.some(d => Math.abs(d.x - item.x) < 5 && Math.abs(d.y - item.y) < 5) &&
            !timeRows.some(t => Math.abs(t.y - item.y) < 5)
        );

        contentItems.forEach(item => {
            // Find appropriate Day Column
            const matchedDay = dayHeaders.find(d => item.x >= (d.x - 20) && item.x < (d.x + d.width));
            if (!matchedDay) return;

            // Find appropriate Time Row
            // Standard approach: item matches a time row directly
            let matchedTimeIndex = timeRows.findIndex((t, idx) => {
                const nextTime = timeRows[idx + 1];
                const isBelowThis = item.y < (t.y + 10);
                const isAboveNext = nextTime ? item.y > (nextTime.y + 10) : true;
                return isBelowThis && isAboveNext;
            });

            // Special handling for "DO"
            // If text is "DO", it means the content from the PREVIOUS time slot continues here
            if (item.str.trim().toUpperCase() === 'DO' && matchedTimeIndex > 0) {
                // For "DO", we don't add "DO" text. instead, time slot logic below handles extension.
                return;
            }

            if (matchedTimeIndex !== -1) {
                const matchedTime = timeRows[matchedTimeIndex];
                const key = `${matchedDay.day}|${matchedTime.start}`;

                if (!entries._temp) entries._temp = {};
                if (!entries._temp[key]) {
                    entries._temp[key] = {
                        day: matchedDay.day,
                        start: matchedTime.start,
                        end: matchedTime.end,
                        content: [], // We now store full objects!
                        isTwoHour: false
                    };
                }

                // Check if there is a 'DO' marker in the NEXT time slot at this same X position
                // If yes, this is a 2-hour lecture
                const nextTimeSlot = timeRows[matchedTimeIndex + 1];
                if (nextTimeSlot) {
                    const hasDO = contentItems.some(ci =>
                        ci.str.trim().toUpperCase() === 'DO' &&
                        Math.abs(ci.x - item.x) < 10 && // same column roughly
                        ci.y < (matchedTime.y + 10) && // below start
                        ci.y > (nextTimeSlot.y - 40) // around next slot
                    );

                    if (hasDO) {
                        entries._temp[key].end = nextTimeSlot.end; // Extend duration
                        entries._temp[key].isTwoHour = true;
                    }
                }

                entries._temp[key].content.push(item); // Pushing object with x,w
            }
        });
    }

    // 5. Post-process the grid to extract Subject, Faculty, Room
    const cleanEntries = [];
    if (entries._temp) {
        Object.values(entries._temp).forEach(slot => {
            // "Horizontal Clustering" Strategy
            // Sort items by X position
            // We use a smaller threshold to detect "columns" within the same time slot (Batch A vs Batch B)
            const sortedItems = slot.content.sort((a, b) => a.x - b.x);
            const groups = [];
            let currentGroup = [];

            // Subject Start Codes (Things that definitely start a new block)
            const startCodes = [
                'AI', 'ML', 'DS', 'CC', 'BI', 'SB', 'MC', 'IOT', 'CS', 'IT', 'PGM', 'JAVA',
                'SC', 'DFE', 'SSEH', 'DF', 'SCD', 'STQA', 'FBET', 'MVPR', 'ADSBI', 'SPD', 'DEVOPS',
                'PROJECT-1', 'PROJECT-2', 'MINI-PROJECT' // specific project codes
            ];
            // Things that continue a block
            const suffixes = ['LAB', 'PR', 'TUT', 'TH', 'PROJECT', 'TEST', 'SEM', 'DIV', 'BATCH', 'SESSION', 'A', 'B', 'C'];

            const looksLikeStart = (str) => {
                const s = str.trim().toUpperCase().replace(/[^A-Z0-9\-]/g, ''); // normalize
                // Exact match or starts with specific codes (e.g. "PROJECT-1" matches "PROJECT")
                // Be careful not to match "PROJECT" if it's just a suffix
                if (suffixes.includes(s) && s !== 'PROJECT') return false;

                // Specific handling for PROJECT: treat as start if it looks like "PROJECT-1"
                if (s.startsWith('PROJECT') && s.length > 7) return true;

                return startCodes.some(code => s === code || s.startsWith(code + ' '));
            };

            const hasStartToken = (group) => {
                return group.some(i => looksLikeStart(i.str));
            };

            sortedItems.forEach((item, idx) => {
                const s = item.str.trim();
                // Skip noise
                if (s === "DO" || s.length === 0 || s === "-") return;

                if (currentGroup.length === 0) {
                    currentGroup.push(item);
                } else {
                    const prev = currentGroup[currentGroup.length - 1];
                    const visualGap = item.x - (prev.x + prev.w);

                    // Logic 1: Visual Gap (Reduced to 6)
                    const isGapSplit = visualGap > 6;

                    // Logic 2: Semantic Split
                    // If current item looks like a "Start Code" (e.g. "SC") 
                    // AND current group already has a "Start Code" (e.g. "PGM")
                    // AND the visual gap is not negative (meaning they aren't overlapping weirdly)
                    let isSemanticSplit = false;
                    if (visualGap > -5) { // Allow slight overlap but generally must be separate
                        if (looksLikeStart(s) && hasStartToken(currentGroup)) {
                            isSemanticSplit = true;
                        }
                    }

                    if (isGapSplit || isSemanticSplit) {
                        groups.push(currentGroup);
                        currentGroup = [item];
                    } else {
                        currentGroup.push(item);
                    }
                }
            });
            if (currentGroup.length > 0) groups.push(currentGroup);

            // Now parse each group as a separate entry
            const roomRegex = /^(E\d{3}|M\d{3}|L\d{2}[A-Z]?|CC\d{2})$/;
            // Stricter Faculty Regex: 2-4 uppercase letters, but exclude common subject abbreviations
            const subjectCodes = ['LAB', 'PR', 'TUT', 'TH', 'PROJECT', 'TEST', 'SEM', 'DIV', 'BATCH',
                'AI', 'ML', 'DS', 'CC', 'BI', 'SB', 'MC', 'IOT', 'CS', 'IT', 'PGM', 'JAVA'];

            const facultyRegex = /^[A-Z]{2,4}$/;

            groups.forEach(group => {
                const tokens = group.map(g => g.str);
                const parsed = parseSingleEntry(tokens, roomRegex, facultyRegex, subjectCodes);

                // Only add if we have some valid content
                if (parsed.subject || parsed.faculty || parsed.room) {
                    cleanEntries.push({
                        day_of_week: slot.day,
                        start_time: formatTime(slot.start),
                        end_time: formatTime(slot.end),
                        subject_name: parsed.subject || 'Unknown',
                        subject_type: 'IT', // Revert to valid enum 'IT' or 'Offered'. Defaulting to IT for now.
                        semester: 'VI',
                        division: 'A',
                        room_no: parsed.room || 'TBD',
                        faculty_name: parsed.faculty,
                        ...(slot.isTwoHour ? {} : {})
                    });
                }
            });
        });
    }

    return cleanEntries;
};

// Helper to parse a list of tokens into { subject, faculty, room }
const parseSingleEntry = (tokens, roomRegex, facultyRegex, subjectCodes) => {
    let room = '';
    let faculty = '';
    let subjectParts = [];

    // Pre-processing: sort tokens by Y (top to bottom) to read logically? 
    // Actually, headers/subjects are usually top, faculty/room bottom.
    // But text extract order varies. Let's assume input order (left-right from group sort) is okay, 
    // but sometimes "PGM LAB" is split. 

    tokens.forEach(str => {
        const s = str.trim();
        if (!s) return;

        // check Room
        if (roomRegex.test(s)) {
            room = s;
            return;
        }

        // check Faculty
        const isFacultyFormat = facultyRegex.test(s);
        const isExcluded = subjectCodes.includes(s.toUpperCase()) || s.includes('PROJECT');

        if (isFacultyFormat && !isExcluded) {
            if (!faculty) {
                faculty = s;
            } else {
                // If we already have a faculty, and find another short code:
                // One might be a Subject Code (e.g. "CC" matched faculty but "DS" also matches)
                // Or "DST" (faculty) and "ABC" (subject shorthand?).
                // Usually Faculty is distinct. We'll prefer the one that matches our known faculty list if possible? 
                // For now, treat existing faculty as part of subject if we find a new one, OR push this new one.
                // Better heuristic: The one at the BOTTOM is usually faculty.
                // For now, simple append:
                subjectParts.push(faculty);
                faculty = s;
            }
        } else {
            subjectParts.push(s);
        }
    });

    // Post-check: If we have a 'faculty' that looks very much like a part of the subject (e.g. at the start), 
    // and no subject parts, maybe we swapped them? 
    // Actually, 'subjectParts' collects eveything else.

    // Reconstruct Subject
    let subject = subjectParts.join(' ').replace(/\s+/g, ' ').trim();

    // Fallback: If subject is empty but faculty is set, and faculty looks like 'LAB' (caught by exclusion, but safety check)
    if (!subject && faculty && subjectCodes.includes(faculty)) {
        subject = faculty;
        faculty = '';
    }

    // Infer Subject Type
    let type = 'Lecture';
    const sUpper = subject.toUpperCase();
    if (sUpper.includes('LAB') || sUpper.includes('PR') || sUpper.includes('PRACTICAL')) {
        type = 'Lab';
    } else if (sUpper.includes('PROJECT')) {
        type = 'Project';
    } else if (sUpper.includes('TUT')) {
        type = 'Tutorial';
    }

    return { subject, faculty, room, type };
};

export const mapToTimetableSchema = (rawData, facultyList) => {
    // If rawData came from Excel (normalized objects) or PDF (already standard keys)
    // We just need to ensure faculty mapping and types

    return rawData.map(row => {
        // If from simple PDF parser, it might not have 'faculty' field
        const facultyName = row['faculty'] || row['Faculty'];

        let facultyId = null;
        if (facultyName) {
            const normalizedSearch = facultyName.toLowerCase().replace(/[^a-z]/g, '');

            // 0. Explicit Mapping from User provided list
            const FACULTY_CODE_MAP = {
                'ark': 'ajitkumar khachane',
                'avl': 'akshay loke',
                'ak': 'aniket kundu',
                'bgt': 'bhanu tekwani',
                'dg': 'debarati ghosal',
                'dm': 'dilip motwani',
                'dsj': 'deepali shrikhande',
                'dst': 'dhanashree tamhane',
                'kgd': 'kanchan dhuri',
                'nkr': 'neha kudu',
                'pck': 'pallavi kharat',
                'rsr': 'rasika ransing',
                'sm': 'shashikant mahajan',
                'st': 'santosh tamboli',
                'sdg': 'sushopti gawade',
                'usk': 'uday kashid',
                'vb': 'varsha bhosale',
                'vdc': 'vidya chitre',
                'vvb': 'vinita bhandiwad',
                'sam': 'sampada pawar'
            };

            let mappedName = FACULTY_CODE_MAP[normalizedSearch];
            let faculty = null;

            // Try 1: Map Lookup
            if (mappedName) {
                faculty = facultyList.find(f => f.name.toLowerCase().includes(mappedName));
            }

            // Try 2: Exact Name Includes
            if (!faculty) {
                faculty = facultyList.find(f => f.name.toLowerCase().replace(/[^a-z]/g, '').includes(normalizedSearch));
            }

            // 2. Email Includes
            if (!faculty) {
                faculty = facultyList.find(f => f.email && f.email.toLowerCase().includes(normalizedSearch));
            }

            // 3. Smart Initials Matching (The key fix)
            // Logic: Convert "Deepak S Jain" -> "DSJ". Convert "N K Rana" -> "NKR"
            if (!faculty) {
                faculty = facultyList.find(f => {
                    // Generate initials for this faculty member
                    const parts = f.name.trim().split(/[\s.]+/); // Split by space or dot
                    const initials = parts.map(p => p[0]).join('').toLowerCase();

                    // Check if our search (e.g. "dsj") matches these initials
                    return initials === normalizedSearch;
                });
            }

            // 4. Loose Initials (allowing first name partial)
            // e.g. "D Jain" -> "DJ"
            if (!faculty) {
                faculty = facultyList.find(f => {
                    const parts = f.name.trim().split(/[\s.]+/);
                    if (parts.length < 2) return false;
                    // First letter of first name + First letter of last name
                    const simpleInitials = (parts[0][0] + parts[parts.length - 1][0]).toLowerCase();
                    return simpleInitials === normalizedSearch;
                });
            }

            if (faculty) facultyId = faculty.id;
        }

        return {
            semester: row['semester'] || 'VI',
            division: row['division'] || 'A',
            subject_name: row['subject'] || row['subject_name'] || '',
            subject_type: row['subject_type'] || 'IT',
            day_of_week: capitalize(row['day'] || row['day_of_week'] || 'Monday'),
            start_time: formatTime(row['start_time']),
            end_time: formatTime(row['end_time']),
            room_no: String(row['room'] || row['room_no'] || ''),
            assigned_faculty_id: facultyId,
            batch_strength: parseInt(row['batch_strength']) || 60
        };
    }).filter(item => item.subject_name && item.day_of_week);
};

const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();

const formatTime = (timeStr) => {
    if (timeStr === undefined || timeStr === null) return '00:00:00';

    try {
        // Handle Excel Date Numbers (fractions of day)
        if (typeof timeStr === 'number') {
            const totalSeconds = Math.round(timeStr * 24 * 3600);
            const hours = Math.floor(totalSeconds / 3600);
            const minutes = Math.floor((totalSeconds % 3600) / 60);
            const seconds = totalSeconds % 60;
            return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        }

        let s = String(timeStr).trim();

        // Handle "10:00 AM" / "2:30 PM"
        const amPmMatch = s.match(/(\d{1,2})[:.](\d{2})\s*(AM|PM)/i);
        if (amPmMatch) {
            let [_, h, m, period] = amPmMatch;
            let hours = parseInt(h);
            if (period.toUpperCase() === 'PM' && hours < 12) hours += 12;
            if (period.toUpperCase() === 'AM' && hours === 12) hours = 0;
            return `${String(hours).padStart(2, '0')}:${m}:00`;
        }

        // Handle simple "10:00" or "10.00"
        s = s.replace('.', ':');
        if (/^\d{1,2}:\d{2}$/.test(s)) return `${s.padStart(5, '0')}:00`;
        if (/^\d{1,2}:\d{2}:\d{2}$/.test(s)) return s.padStart(8, '0');

        return '00:00:00';
    } catch (e) {
        console.warn('Time parse error:', e);
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
