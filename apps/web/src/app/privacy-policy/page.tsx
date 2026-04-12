import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Privacy Policy | GoalMills',
    description: 'Privacy Policy for GoalMills sports platform.',
};

export default function PrivacyPolicy() {
    return (
        <div className="min-h-screen bg-slate-950 pt-24 pb-16 px-4">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl md:text-5xl font-bold mb-8 text-gradient">Privacy Policy</h1>
                
                <div className="glass p-8 rounded-3xl border border-white/10 space-y-6 text-slate-300 leading-relaxed">
                    <section>
                        <h2 className="text-2xl font-semibold text-white mb-4">1. Introduction</h2>
                        <p>
                            Welcome to GoalMills ("we," "our," or "us"). We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, and share your personal information when you use our website and mobile application.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-white mb-4">2. Information We Collect</h2>
                        <p>We collect information that you provide directly to us, such as when you create an account, subscribe to our newsletter, or contact us for support. This may include:</p>
                        <ul className="list-disc ml-6 mt-2 space-y-2">
                            <li>Contact information (name, email address)</li>
                            <li>Profile information (username, profile picture)</li>
                            <li>Preferences and settings</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-white mb-4">3. How We Use Your Information</h2>
                        <p>We use the information we collect to:</p>
                        <ul className="list-disc ml-6 mt-2 space-y-2">
                            <li>Provide, maintain, and improve our services</li>
                            <li>Personalize your experience (e.g., showing scores for your favorite teams)</li>
                            <li>Send you technical notices, updates, and security alerts</li>
                            <li>Respond to your comments and questions</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-white mb-4">4. Data Sharing</h2>
                        <p>
                            We do not sell your personal data. We may share information with third-party service providers who perform services on our behalf, such as analytics or hosting providers, subject to strict confidentiality agreements.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-white mb-4">5. Your Rights</h2>
                        <p>
                            Depending on your location, you may have the right to access, correct, or delete your personal data. You can manage your profile settings within the app or contact us directly for data requests.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-white mb-4">6. Security</h2>
                        <p>
                            We implement appropriate technical and organizational measures to protect the security of your personal information. However, please note that no method of transmission over the Internet is 100% secure.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-white mb-4">7. Contact Us</h2>
                        <p>
                            If you have any questions about this Privacy Policy, please contact us at:
                            <br />
                            <span className="text-blue-400">privacy@goalmills.com</span>
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
