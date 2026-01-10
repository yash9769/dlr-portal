import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Mail, User } from 'lucide-react';

export default function FacultyList() {
    const [faculty, setFaculty] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadFaculty() {
            const { data } = await api.faculty.list();
            setFaculty(data || []);
            setLoading(false);
        }
        loadFaculty();
    }, []);

    if (loading) return <div className="p-6">Loading faculty list...</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Faculty List</h1>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {faculty.map((person) => (
                    <div key={person.id} className="bg-white overflow-hidden shadow rounded-lg flex">
                        <div className="flex-1 p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0 bg-blue-500 rounded-full h-10 w-10 flex items-center justify-center text-white font-bold">
                                    {person.name.charAt(0)}
                                </div>
                                <div className="ml-4">
                                    <h3 className="text-lg font-medium text-gray-900">{person.name}</h3>
                                    <p className="text-sm text-gray-500">{person.designation}</p>
                                </div>
                            </div>
                            <div className="mt-4">
                                <p className="text-sm text-gray-500 flex items-center">
                                    <User className="mr-2 h-4 w-4" /> {person.department}
                                </p>
                                <p className="text-sm text-gray-500 flex items-center mt-1">
                                    <Mail className="mr-2 h-4 w-4" /> {person.email || 'N/A'}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
