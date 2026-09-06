import React, { useState } from "react";
import { User, X, Check, Activity, Heart, Info } from "lucide-react";

export default function UserProfileModal({ isOpen, onClose, profile, setProfile }) {
    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (type === 'checkbox') {
            const currentList = profile[name] || [];
            if (checked) {
                setProfile({ ...profile, [name]: [...currentList, value] });
            } else {
                setProfile({ ...profile, [name]: currentList.filter(item => item !== value) });
            }
        } else {
            setProfile({ ...profile, [name]: value });
        }
    };

    const handleSimpleChange = (name, value) => {
        setProfile({ ...profile, [name]: value });
    };

    const handleCheckboxListChange = (name, value, isChecked) => {
        const currentList = profile[name] || [];
        if (isChecked) {
            setProfile({ ...profile, [name]: [...currentList, value] });
        } else {
            setProfile({ ...profile, [name]: currentList.filter(item => item !== value) });
        }
    };

    // Constant lists for options
    const healthPriorities = [
        "🥗 Healthy diet", "⚖️ Weight management", "❤️ Low-sugar / heart-friendly choices",
        "🧂 Low-sodium choices", "💪 High-protein foods", "🌾 Gluten-free",
        "🥛 Lactose-free", "🌱 Vegetarian/Vegan", "👶 Child-friendly products", "👴 Senior-friendly products"
    ];

    const labelChecks = [
        "Added sugar", "Sodium/salt", "Calories", "Fat", "Protein",
        "Artificial additives", "Preservatives", "Allergens", "Expiry/Best Before", "All of the above"
    ];

    const foodRestrictions = [
        "Vegetarian", "Vegan", "Gluten-free", "Lactose-free", "Nut-free", "No preference", "Other"
    ];

    const healthConsciousLevels = ["Basic", "Moderate", "Strict"];

    // Mock list of allergies
    const allergiesList = ["Peanuts", "Dairy", "Gluten", "Soy", "Tree Nuts"];

    return (
        <div className="fixed inset-0 bg-ink/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-panel-raised border border-panel-line w-full max-w-md rounded-2xl shadow-glass overflow-auto max-h-[90vh] text-text-1">
                <div className="p-5 border-b border-panel-line flex justify-between items-center sticky top-0 bg-panel-raised/90 backdrop-blur-md z-10">
                    <h2 className="font-semibold text-lg flex items-center gap-2">
                        <User className="text-citizen-primary" /> Health & Preferences Profile
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

                    <hr className="border-panel-line" />

                    <div className="space-y-6">
                        <h3 className="text-sm font-semibold text-text-2 uppercase tracking-wider flex items-center gap-1.5"><Heart size={14} /> Health & Preferences</h3>

                        {/* Question 1 */}
                        <div>
                            <label className="block text-xs font-medium text-text-1 mb-2">1. What is your main health priority?</label>
                            <select name="mainPriority" value={profile.mainPriority || ''} onChange={handleChange} className="w-full bg-panel text-text-1 border border-panel-line rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brass/60">
                                <option value="">Select your priority...</option>
                                {healthPriorities.map(priority => (
                                    <option key={priority} value={priority}>{priority}</option>
                                ))}
                            </select>
                        </div>

                        {/* Question 2 */}
                        <div>
                            <label className="block text-xs font-medium text-text-1 mb-2">2. What do you want us to check on food labels?</label>
                            <div className="flex flex-wrap gap-2 text-text-2">
                                {labelChecks.map(check => (
                                    <label key={check} className="flex items-center gap-2 cursor-pointer bg-panel border border-panel-line hover:border-brass/40 px-3 py-1.5 rounded-lg text-xs transition-colors">
                                        <input type="checkbox" name="labelChecks" value={check} checked={profile.labelChecks?.includes(check) || false} onChange={handleChange} className="w-3.5 h-3.5 rounded-sm bg-panel border-panel-line text-brass focus:ring-brass" />
                                        {check}
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Question 3 */}
                        <div>
                            <label className="block text-xs font-medium text-text-1 mb-2">3. Do you have any food preferences or restrictions?</label>
                            <div className="flex flex-wrap gap-2 text-text-2">
                                {foodRestrictions.map(restriction => (
                                    <label key={restriction} className={`px-3 py-1.5 rounded-full text-xs font-medium border cursor-pointer transition-colors ${profile.foodRestrictions?.includes(restriction) ? 'bg-citizen-primary/20 border-citizen-primary text-citizen-primary' : 'bg-panel border-panel-line hover:bg-panel-raised'}`}>
                                        <input type="checkbox" name="foodRestrictions" value={restriction} checked={profile.foodRestrictions?.includes(restriction) || false} onChange={handleChange} className="hidden" />
                                        {restriction}
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Question 4 */}
                        <div>
                            <label className="block text-xs font-medium text-text-1 mb-2">4. How health-conscious do you want your recommendations to be?</label>
                            <div className="flex gap-3 text-text-2">
                                {healthConsciousLevels.map(level => (
                                    <label key={level} className={`flex-1 flex items-center justify-center gap-2 cursor-pointer border px-3 py-2 rounded-lg text-sm transition-colors ${profile.healthConscious === level ? 'bg-brass/20 border-brass text-brass' : 'bg-panel border-panel-line hover:border-brass/40'}`}>
                                        <input type="radio" name="healthConscious" value={level} checked={profile.healthConscious === level} onChange={handleChange} className="hidden" />
                                        {level}
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    <hr className="border-panel-line" />

                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-status-fail uppercase tracking-wider flex items-center gap-1.5"><Activity size={14} /> Medical Records & Alerts</h3>
                        <p className="text-xs text-text-2">This info is used to alert you when scanning food with ingredients you should avoid.</p>

                        <div className="bg-panel p-4 rounded-xl border border-panel-line mb-4">
                            <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                                <input type="checkbox" checked={profile.hasDiabetes || false} onChange={(e) => handleSimpleChange('hasDiabetes', e.target.checked)} className="w-4 h-4 rounded appearance-none border border-panel-line checked:bg-status-fail checked:border-status-fail transition-colors relative" />
                                <span>I have Diabetes (Alert for high sugar/carbs)</span>
                            </label>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-text-1 mb-2">Known Allergies (Select all that apply)</label>
                            <div className="flex flex-wrap gap-2 text-text-2">
                                {allergiesList.map(allergy => (
                                    <label key={allergy} className={`px-3 py-1.5 rounded-full text-xs font-medium border cursor-pointer transition-colors ${profile.allergies?.includes(allergy) ? 'bg-status-fail/20 border-status-fail text-status-fail' : 'bg-panel border-panel-line hover:bg-panel-raised'}`}>
                                        <input type="checkbox" name="allergies" value={allergy} checked={profile.allergies?.includes(allergy) || false} onChange={handleChange} className="hidden" />
                                        {allergy}
                                    </label>
                                ))}
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
