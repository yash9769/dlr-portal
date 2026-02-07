import { useState } from 'react';
import { X, AlertTriangle, Send } from 'lucide-react';
import { api } from '../services/api';
import toast from 'react-hot-toast';

export default function BugReportModal({ isOpen, onClose, user }) {
    if (!isOpen) return null;

    const [description, setDescription] = useState('');
    const [steps, setSteps] = useState('');
    const [severity, setSeverity] = useState('medium');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Ensure we have a valid user ID, either from prop or fresh fetch
            const submitterId = user?.id || (await api.auth.getUser())?.id;

            if (!submitterId) {
                toast.error('You must be logged in to report a bug.');
                setLoading(false);
                return;
            }

            await api.bugs.submit({
                user_id: submitterId,
                description,
                steps_to_reproduce: steps,
                severity
            });
            toast.success('Bug report submitted. Thank you!');
            setDescription('');
            setSteps('');
            onClose();
        } catch (error) {
            console.error(error);
            toast.error('Failed to submit report. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100]" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                onClick={onClose}
                aria-hidden="true"
            ></div>

            {/* Modal Container - Centered Flexbox */}
            <div className="fixed inset-0 z-[101] overflow-y-auto">
                <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
                    <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg w-full">

                        {/* Close Button Mobile */}
                        <div className="absolute top-0 right-0 pt-4 pr-4">
                            <button
                                type="button"
                                className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                onClick={onClose}
                            >
                                <span className="sr-only">Close</span>
                                <X className="h-6 w-6" aria-hidden="true" />
                            </button>
                        </div>

                        <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                            <div className="sm:flex sm:items-start">
                                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                                    <AlertTriangle className="h-6 w-6 text-red-600" aria-hidden="true" />
                                </div>
                                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                                        Report a Bug
                                    </h3>
                                    <div className="mt-2">
                                        <p className="text-sm text-gray-500">
                                            Found something wrong? Let us know so we can fix it.
                                        </p>
                                        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                                            <div>
                                                <label htmlFor="description" className="block text-sm font-medium text-gray-700 text-left">Description</label>
                                                <textarea
                                                    id="description"
                                                    rows={3}
                                                    required
                                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                                    value={description}
                                                    onChange={(e) => setDescription(e.target.value)}
                                                    placeholder="What happened?"
                                                />
                                            </div>
                                            <div>
                                                <label htmlFor="steps" className="block text-sm font-medium text-gray-700 text-left">Steps to Reproduce (Optional)</label>
                                                <textarea
                                                    id="steps"
                                                    rows={2}
                                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                                    value={steps}
                                                    onChange={(e) => setSteps(e.target.value)}
                                                    placeholder="1. Go to page... 2. Click button..."
                                                />
                                            </div>
                                            <div>
                                                <label htmlFor="severity" className="block text-sm font-medium text-gray-700 text-left">Severity</label>
                                                <select
                                                    id="severity"
                                                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                                                    value={severity}
                                                    onChange={(e) => setSeverity(e.target.value)}
                                                >
                                                    <option value="low">Low - Minor annoyance</option>
                                                    <option value="medium">Medium - Detailed feature broken</option>
                                                    <option value="high">High - Cannot use feature</option>
                                                    <option value="critical">Critical - App crashed</option>
                                                </select>
                                            </div>
                                            <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse gap-2">
                                                <button
                                                    type="submit"
                                                    disabled={loading}
                                                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:w-auto sm:text-sm disabled:opacity-50"
                                                >
                                                    {loading ? 'Submitting...' : 'Submit Report'}
                                                </button>
                                                <button
                                                    type="button"
                                                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm"
                                                    onClick={onClose}
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
