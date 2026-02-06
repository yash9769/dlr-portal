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
            <h1 className="text-2xl font-bold text-gray-900 mb-6 uppercase tracking-tight">Faculty Master</h1>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {faculty.map((person) => (
                    <div key={person.id} className="bg-white border border-gray-100 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all duration-300 rounded-2xl overflow-hidden group">
                        <div className="p-5">
                            <div className="flex items-center mb-4">
                                <div className="flex-shrink-0 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl h-12 w-12 flex items-center justify-center text-white font-bold text-lg shadow-blue-200 shadow-lg">
                                    {person.name.charAt(0)}
                                </div>
                                <div className="ml-4 truncate">
                                    <h3 className="text-base font-bold text-gray-900 group-hover:text-blue-600 transition-colors truncate">{person.name}</h3>
                                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{person.designation || 'Faculty'}</p>
                                </div>
                            </div>
                            <div className="space-y-2 pt-2 border-t border-gray-50">
                                <p className="text-xs font-medium text-gray-500 flex items-center">
                                    <User className="mr-2 h-3.5 w-3.5 text-blue-400" /> {person.department || 'IT'}
                                </p>
                                <p className="text-xs font-medium text-gray-500 flex items-center truncate">
                                    <Mail className="mr-2 h-3.5 w-3.5 text-blue-400" /> <span className="truncate">{person.email || 'N/A'}</span>
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
