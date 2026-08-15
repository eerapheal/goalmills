import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Data Deletion Instructions | GoalMills',
    description: 'Instructions on how to request the deletion of your personal data from GoalMills.',
};

export default function DataDeletion() {
    return (
        <div className="min-h-screen bg-slate-950 pt-24 pb-16 px-4">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl md:text-5xl font-bold mb-8 text-gradient">Data Deletion Instructions</h1>
                
                <div className="glass p-8 rounded-3xl border border-white/10 space-y-6 text-slate-300 leading-relaxed">
                    <section>
                        <h2 className="text-2xl font-semibold text-white mb-4">Your Data, Your Control</h2>
                        <p>
                            At GoalMills, we respect your privacy and your right to control your personal data. If you wish to delete your account and all associated data, you can do so easily through the following methods:
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-white mb-4">Method 1: In-App Deletion</h2>
                        <ul className="list-decimal ml-6 mt-2 space-y-2">
                            <li>Open the GoalMills app on your mobile device or log in to our website.</li>
                            <li>Go to your <span className="text-white font-medium">Profile</span> or <span className="text-white font-medium">Settings</span>.</li>
                            <li>Scroll down to the <span className="text-white font-medium">Account Management</span> section.</li>
                            <li>Click on <span className="text-red-400">"Delete Account"</span>.</li>
                            <li>Confirm your choice. Your account and all data will be permanently removed from our systems within 30 days.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-white mb-4">Method 2: Email Request</h2>
                        <p>
                            If you are unable to access your account or prefer to make a request via email, please contact our support team:
                        </p>
                        <div className="mt-4 p-4 bg-white/5 rounded-xl border border-white/10">
                            <p className="font-medium text-white">Send an email to: <span className="text-blue-400">support@goalmills.com</span></p>
                            <p className="mt-1">Subject: Data Deletion Request</p>
                            <p className="mt-1 text-sm text-slate-400 italic">Please include your registered email address or username to help us process your request faster.</p>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-white mb-4">What Data is Deleted?</h2>
                        <p>When you delete your account, we remove:</p>
                        <ul className="list-disc ml-6 mt-2 space-y-2">
                            <li>Your profile information (name, email, username).</li>
                            <li>Your saved preferences and favorite teams.</li>
                            <li>Your interaction history and betting insights tracking.</li>
                        </ul>
                        <p className="mt-4 text-sm text-slate-400">
                            *Note: Some transaction data may be retained for a period as required by law or for financial record-keeping if you have made purchases.
                        </p>
                    </section>

                    <div className="pt-8 border-t border-white/5 text-sm text-slate-500">
                        Last Updated: April 10, 2026
                    </div>
                </div>
            </div>
        </div>
    );
}
