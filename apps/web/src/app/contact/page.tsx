import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Contact Us | GoalMills Support',
    description: 'Get in touch with the GoalMills team for support, feedback, or business inquiries.',
};

export default function ContactUs() {
    return (
        <div className="min-h-screen bg-slate-950 pt-24 pb-16 px-4">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl md:text-5xl font-bold mb-8 text-gradient">Contact Us</h1>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-1 space-y-6">
                        <div className="glass p-6 rounded-2xl border border-white/10">
                            <h3 className="text-white font-semibold mb-2">Support Email</h3>
                            <p className="text-blue-400 text-sm">support@goalmills.com</p>
                        </div>
                        <div className="glass p-6 rounded-2xl border border-white/10">
                            <h3 className="text-white font-semibold mb-2">Business Inquiries</h3>
                            <p className="text-blue-400 text-sm">biz@goalmills.com</p>
                        </div>
                        <div className="glass p-6 rounded-2xl border border-white/10">
                            <h3 className="text-white font-semibold mb-2">Office</h3>
                            <p className="text-slate-400 text-sm leading-relaxed">
                                Data Center Drive,<br />
                                Tech Innovation Hub,<br />
                                Digital City, DC 20001
                            </p>
                        </div>
                    </div>

                    <div className="md:col-span-2">
                        <form className="glass p-8 rounded-3xl border border-white/10 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-400 ml-1">Full Name</label>
                                    <input 
                                        type="text" 
                                        className="w-full bg-slate-900 border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 transition-colors" 
                                        placeholder="John Doe"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-400 ml-1">Email Address</label>
                                    <input 
                                        type="email" 
                                        className="w-full bg-slate-900 border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 transition-colors" 
                                        placeholder="john@example.com"
                                    />
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-400 ml-1">Subject</label>
                                <input 
                                    type="text" 
                                    className="w-full bg-slate-900 border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 transition-colors" 
                                    placeholder="How can we help?"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-400 ml-1">Message</label>
                                <textarea 
                                    rows={5}
                                    className="w-full bg-slate-900 border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 transition-colors resize-none" 
                                    placeholder="Write your message here..."
                                />
                            </div>

                            <button 
                                type="button"
                                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-600/20 transition-all duration-300"
                            >
                                Send Message
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
