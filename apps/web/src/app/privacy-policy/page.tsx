import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Privacy Policy | GoalMills',
    description: 'Official Privacy Policy for GoalMills Web and Mobile Application in compliance with Google Play Developer Policies and global privacy regulations.',
};

export default function PrivacyPolicy() {
    return (
        <div className="min-h-screen bg-slate-950 pt-24 pb-16 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-4">
                        Data Safety &amp; Transparency
                    </div>
                    <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4">
                        Privacy Policy
                    </h1>
                    <p className="text-slate-400 text-base md:text-lg leading-relaxed">
                        GoalMills ("we," "our," or "us") is dedicated to safeguarding your personal data and ensuring complete transparency regarding the collection, processing, and security of information across our website and mobile application.
                    </p>
                    <div className="flex flex-wrap gap-4 mt-4 text-xs text-slate-500">
                        <span><strong>Effective Date:</strong> January 1, 2026</span>
                        <span>•</span>
                        <span><strong>Last Updated:</strong> April 10, 2026</span>
                        <span>•</span>
                        <span><strong>Version:</strong> 2.0 (Google Play &amp; Global Compliance Standard)</span>
                    </div>
                </div>

                {/* Main Content Box */}
                <div className="glass p-8 md:p-10 rounded-3xl border border-white/10 space-y-8 text-slate-300 leading-relaxed text-sm md:text-base">

                    {/* Section 1 */}
                    <section>
                        <h2 className="text-xl md:text-2xl font-bold text-white mb-3">1. Scope &amp; Application</h2>
                        <p>
                            This Privacy Policy applies to the <strong>GoalMills</strong> mobile application (available on Google Play and Apple App Store) and the GoalMills web application (collectively, the "Services"). By installing, accessing, or using GoalMills, you acknowledge and agree to the practices described in this policy.
                        </p>
                    </section>

                    {/* Section 2 */}
                    <section>
                        <h2 className="text-xl md:text-2xl font-bold text-white mb-3">2. Information We Collect</h2>
                        <p>
                            We adhere to data minimization principles. We only collect information strictly necessary to provide live sports fixtures, statistics, news, and match highlights.
                        </p>

                        <div className="mt-4 space-y-4">
                            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                                <h3 className="font-semibold text-white text-base mb-1">A. Personal Information (User-Provided)</h3>
                                <p className="text-slate-400 text-sm mb-2">
                                    When you create an account, log in, or contact customer support, we may collect:
                                </p>
                                <ul className="list-disc ml-5 space-y-1 text-slate-300 text-sm">
                                    <li><strong>Account Credentials:</strong> Username, email address, and encrypted password.</li>
                                    <li><strong>Profile Details:</strong> Optional avatar image and display name.</li>
                                    <li><strong>Support Communications:</strong> Content of feedback, bug reports, and messages sent to our team.</li>
                                </ul>
                                <p className="mt-2 text-xs text-slate-400">
                                    <em>Note: Basic features (live match scores, statistics, league standings, and video highlights) can be browsed without registering an account.</em>
                                </p>
                            </div>

                            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                                <h3 className="font-semibold text-white text-base mb-1">B. In-App Activity &amp; Preferences</h3>
                                <ul className="list-disc ml-5 space-y-1 text-slate-300 text-sm">
                                    <li><strong>Favorites:</strong> Followed football, cricket, basketball, and tennis teams, leagues, or tournaments saved for personalized scoreboards.</li>
                                    <li><strong>In-App Interactions:</strong> Sports tab navigation and feature usage metrics.</li>
                                </ul>
                            </div>

                            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                                <h3 className="font-semibold text-white text-base mb-1">C. Technical &amp; Device Information</h3>
                                <ul className="list-disc ml-5 space-y-1 text-slate-300 text-sm">
                                    <li><strong>Device &amp; App Diagnostics:</strong> Operating system version, app version, device model, crash logs, and performance diagnostics to resolve errors.</li>
                                    <li><strong>Device Identifiers &amp; Push Tokens:</strong> Non-personally identifiable push notification tokens (only if you opt-in to match alerts).</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* Section 3 */}
                    <section>
                        <h2 className="text-xl md:text-2xl font-bold text-white mb-3">3. Data We Do NOT Collect</h2>
                        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-slate-300">
                            <p className="font-medium text-red-300 mb-2">We respect your privacy and do NOT collect:</p>
                            <ul className="list-disc ml-5 space-y-1 text-sm text-slate-300">
                                <li><strong>No GPS / Precise Location Tracking:</strong> We never access or store precise or background GPS data.</li>
                                <li><strong>No Financial or Payment Data:</strong> GoalMills does not process credit cards or financial transactions.</li>
                                <li><strong>No Contacts, SMS, or Call Logs:</strong> We never access your address book or messages.</li>
                                <li><strong>No Biometric or Health Data.</strong></li>
                                <li><strong>No Microphone or Background Audio Recording.</strong></li>
                            </ul>
                        </div>
                    </section>

                    {/* Section 4 */}
                    <section>
                        <h2 className="text-xl md:text-2xl font-bold text-white mb-3">4. How We Use Your Information</h2>
                        <p>We utilize the collected information strictly for:</p>
                        <ul className="list-disc ml-5 mt-2 space-y-2 text-slate-300">
                            <li><strong>Core App Functionality:</strong> Providing real-time live scores, match schedules, league standings, statistics, and video highlights.</li>
                            <li><strong>Account Management:</strong> Authenticating users and maintaining customized user preferences and favorite teams.</li>
                            <li><strong>App Performance &amp; Stability:</strong> Diagnosing crashes, monitoring server responsiveness, and fixing bugs.</li>
                            <li><strong>Communications:</strong> Responding to user support inquiries and security notices.</li>
                        </ul>
                    </section>

                    {/* Section 5 */}
                    <section>
                        <h2 className="text-xl md:text-2xl font-bold text-white mb-3">5. Third-Party Services &amp; Disclosures</h2>
                        <p>
                            To deliver real-time sports intelligence and match media, GoalMills integrates with verified third-party partners and service providers:
                        </p>

                        <div className="mt-4 space-y-3">
                            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                                <h3 className="font-semibold text-white text-base">YouTube API Services &amp; Video Embeds</h3>
                                <p className="text-sm text-slate-400 mt-1">
                                    Our video highlights feature uses YouTube API Services and embedded players to provide sports highlights. By using this feature, you agree to be bound by the{' '}
                                    <a
                                        href="https://www.youtube.com/t/terms"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-400 hover:underline"
                                    >
                                        YouTube Terms of Service
                                    </a>.
                                    For details on how Google manages information, please visit the{' '}
                                    <a
                                        href="https://policies.google.com/privacy"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-400 hover:underline"
                                    >
                                        Google Privacy Policy
                                    </a>.
                                </p>
                            </div>

                            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                                <h3 className="font-semibold text-white text-base">Sports Data Providers (API-Football / API-Sports)</h3>
                                <p className="text-sm text-slate-400 mt-1">
                                    Live sports scores, fixtures, lineups, odds, and statistics are supplied via enterprise sports data partners. No personal user data is transferred to sports data providers.
                                </p>
                            </div>

                            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                                <h3 className="font-semibold text-white text-base">Cloud Infrastructure &amp; Database Providers</h3>
                                <p className="text-sm text-slate-400 mt-1">
                                    Our web platform and APIs are hosted securely on <strong>Vercel</strong> and backed by encrypted <strong>MongoDB Atlas</strong> cloud databases.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Section 6 */}
                    <section>
                        <h2 className="text-xl md:text-2xl font-bold text-white mb-3">6. Data Security &amp; Encryption</h2>
                        <p>
                            We employ strict security practices to safeguard all collected data:
                        </p>
                        <ul className="list-disc ml-5 mt-2 space-y-2 text-slate-300">
                            <li><strong>Encryption in Transit:</strong> All data transmissions between our mobile app, website, and backend servers use HTTPS/TLS 1.2 or TLS 1.3 encryption protocols.</li>
                            <li><strong>Encrypted Storage:</strong> User passwords are encrypted using one-way cryptographic hashing (bcrypt) before database storage.</li>
                            <li><strong>Access Controls:</strong> Administrative access to backend infrastructure is restricted, audited, and protected by multi-factor authentication.</li>
                        </ul>
                    </section>

                    {/* Section 7 */}
                    <section>
                        <h2 className="text-xl md:text-2xl font-bold text-white mb-3">7. Data Retention &amp; Deletion Policy</h2>
                        <p>
                            We retain personal data only for as long as necessary to maintain your account or provide requested services.
                        </p>
                        <p className="mt-2">
                            You have the right to request permanent deletion of your account and all associated personal data at any time. Detailed step-by-step instructions and request submission are available at our dedicated{' '}
                            <Link href="/data-deletion" className="text-blue-400 hover:underline font-semibold">
                                Data Deletion Request Page
                            </Link>.
                        </p>
                    </section>

                    {/* Section 8 */}
                    <section>
                        <h2 className="text-xl md:text-2xl font-bold text-white mb-3">8. Children's Privacy (COPPA &amp; GDPR-K)</h2>
                        <p>
                            GoalMills is not intended for or directed to children under the age of 13 (or under 16 in the EEA/UK). We do not knowingly collect or solicit personal information from children. If we discover that personal data from a child under 13 has been collected without parental consent, we will delete that data immediately.
                        </p>
                    </section>

                    {/* Section 9 */}
                    <section>
                        <h2 className="text-xl md:text-2xl font-bold text-white mb-3">9. Your Privacy Rights (GDPR / CCPA / Global)</h2>
                        <p>Depending on your jurisdiction, you possess the following rights regarding your data:</p>
                        <ul className="list-disc ml-5 mt-2 space-y-1 text-slate-300">
                            <li><strong>Right of Access:</strong> Request a copy of the personal data we hold about you.</li>
                            <li><strong>Right to Rectification:</strong> Request correction of inaccurate or incomplete personal information.</li>
                            <li><strong>Right to Erasure (Deletion):</strong> Request permanent erasure of your account and data.</li>
                            <li><strong>Right to Restrict or Object:</strong> Object to specific data processing activities.</li>
                            <li><strong>Right to Non-Discrimination:</strong> We do not discriminate against users for exercising privacy rights.</li>
                        </ul>
                    </section>

                    {/* Section 10 */}
                    <section>
                        <h2 className="text-xl md:text-2xl font-bold text-white mb-3">10. Policy Changes &amp; Updates</h2>
                        <p>
                            We may update this Privacy Policy periodically to reflect enhancements in our services or regulatory updates. Any changes will be posted on this page with an updated revision date.
                        </p>
                    </section>

                    {/* Section 11 */}
                    <section>
                        <h2 className="text-xl md:text-2xl font-bold text-white mb-3">11. Contact Us</h2>
                        <p>
                            For inquiries, feedback, or data privacy requests regarding this policy, please contact our Data Protection team at:
                        </p>
                        <div className="mt-4 p-4 rounded-xl bg-white/5 border border-white/10 space-y-1">
                            <p className="font-semibold text-white">GoalMills Privacy &amp; Data Protection</p>
                            <p className="text-sm text-slate-300">Email: <a href="mailto:privacy@goalmills.com" className="text-blue-400 hover:underline">privacy@goalmills.com</a></p>
                            <p className="text-sm text-slate-300">Support: <a href="mailto:support@goalmills.com" className="text-blue-400 hover:underline">support@goalmills.com</a></p>
                            <p className="text-sm text-slate-300">Data Deletion Portal: <Link href="/data-deletion" className="text-blue-400 hover:underline">https://goalmills-web.vercel.app/data-deletion</Link></p>
                        </div>
                    </section>

                    {/* Footer note */}
                    <div className="pt-6 border-t border-white/10 flex flex-wrap justify-between items-center text-xs text-slate-500 gap-4">
                        <span>GoalMills © {new Date().getFullYear()} • All Rights Reserved</span>
                        <div className="flex gap-4">
                            <Link href="/terms" className="hover:text-blue-400">Terms of Service</Link>
                            <Link href="/data-deletion" className="hover:text-blue-400">Data Deletion</Link>
                            <Link href="/contact" className="hover:text-blue-400">Contact</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
