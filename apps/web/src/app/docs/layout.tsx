import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'GoalMills Public API Documentation & Developer Portal | OpenAPI Spec',
  description:
    'Comprehensive REST API documentation for GoalMills live scores, football fixtures, odds comparison, transfer telemetry, and newsletter webhooks.',
  alternates: {
    canonical: 'https://goalmills.com/docs',
  },
};

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
