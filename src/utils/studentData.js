export const FAKE_STUDENTS = [
    { id: 'S001', name: 'Aarav Sharma', roll: '101' },
    { id: 'S002', name: 'Aditi Patel', roll: '102' },
    { id: 'S003', name: 'Arjun Singh', roll: '103' },
    { id: 'S004', name: 'Ananya Gupta', roll: '104' },
    { id: 'S005', name: 'Aryan Kumar', roll: '105' },
    { id: 'S006', name: 'Diya Verma', roll: '106' },
    { id: 'S007', name: 'Ishaan Reddy', roll: '107' },
    { id: 'S008', name: 'Kavya Joshi', roll: '108' },
    { id: 'S009', name: 'Krishna Iyer', roll: '109' },
    { id: 'S010', name: 'Mira Nair', roll: '110' },
    { id: 'S011', name: 'Neha Malhotra', roll: '111' },
    { id: 'S012', name: 'Pranav Shah', roll: '112' },
    { id: 'S013', name: 'Rohan Das', roll: '113' },
    { id: 'S014', name: 'Riya Jain', roll: '114' },
    { id: 'S015', name: 'Sarthak Mehta', roll: '115' },
    { id: 'S016', name: 'Shruti Kapoor', roll: '116' },
    { id: 'S017', name: 'Siddharth Rao', roll: '117' },
    { id: 'S018', name: 'Tanvi Saxena', roll: '118' },
    { id: 'S019', name: 'Varun Chopra', roll: '119' },
    { id: 'S020', name: 'Zara Khan', roll: '120' },
    { id: 'S021', name: 'Vihaan Bose', roll: '121' },
    { id: 'S022', name: 'Pari Agarwal', roll: '122' },
    { id: 'S023', name: 'Dev Mishra', roll: '123' },
    { id: 'S024', name: 'Anika Yadav', roll: '124' },
    { id: 'S025', name: 'Vivaan Thakur', roll: '125' },
    { id: 'S026', name: 'Myra Chaudhary', roll: '126' },
    { id: 'S027', name: 'Atharv Banerjee', roll: '127' },
    { id: 'S028', name: 'Siya Bhatt', roll: '128' },
    { id: 'S029', name: 'Reyansh Trivedi', roll: '129' },
    { id: 'S030', name: 'Anya Deshmukh', roll: '130' }
];

export const getStudentsForBatch = (batchId) => {
    // In a real app, this would filter by batch.
    // For now, we return the same list or a randomized subset/property to simulate valid data.
    return FAKE_STUDENTS;
};
