import React from "react";
import { User, X, Check, Info } from "lucide-react";

export default function UserProfileModal({ isOpen, onClose, profile, setProfile }) {
    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProfile({ ...profile, [name]: value });
    };

    return (
        <div className="fixed inset-0 bg-ink/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-panel-raised border border-panel-line w-full max-w-md rounded-2xl shadow-glass overflow-auto max-h-[90vh] text-text-1">
                <div className="p-5 border-b border-panel-line flex justify-between items-center sticky top-0 bg-panel-raised/90 backdrop-blur-md z-10">
                    <h2 className="font-semibold text-lg flex items-center gap-2">
                        <User className="text-citizen-primary" /> Profile
                    </h2>
                    <button onClick={onClose} className="p-1 rounded-md text-text-2 hover:bg-panel hover:text-text-1 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-text-2 uppercase tracking-wider flex items-center gap-1.5"><Info size={14} /> Basic Info</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <label className="block text-xs font-medium text-text-1 mb-1">Full Name</label>
                                <input type="text" name="name" value={profile.name || ''} onChange={handleChange} className="w-full bg-panel text-text-1 border border-panel-line rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brass/60" placeholder="John Doe" />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-xs font-medium text-text-1 mb-1">Email</label>
                                <input type="email" name="email" value={profile.email || ''} onChange={handleChange} className="w-full bg-panel text-text-1 border border-panel-line rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brass/60" placeholder="john@example.com" />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-xs font-medium text-text-1 mb-1">Gender</label>
                                <select name="gender" value={profile.gender || ''} onChange={handleChange} className="w-full bg-panel text-text-1 border border-panel-line rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brass/60">
                                    <option value="">Select...</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                        </div>
                    </div>

                </div>

                <div className="p-5 border-t border-panel-line bg-panel-darker rounded-b-2xl flex justify-end">
                    <button onClick={onClose} className="px-5 py-2.5 bg-citizen-primary text-white font-semibold rounded-lg shadow-md hover:shadow-lg hover:bg-citizen-secondary transition-all flex items-center gap-2 text-sm">
                        <Check size={16} /> Save Profile
                    </button>
                </div>
            </div>
        </div>
    );
}
