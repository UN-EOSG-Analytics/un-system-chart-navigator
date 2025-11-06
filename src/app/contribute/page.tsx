'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function ContributeForm() {
    const searchParams = useSearchParams();
    
    // Build Airtable URL with prefill parameters
    const buildAirtableUrl = () => {
        const baseUrl = 'https://airtable.com/appJtP9H7xvsl3yAN/pagDuSV8RUxFhfO1k/form';
        const params = new URLSearchParams();
        
        // Transfer all prefill_ parameters from URL to Airtable URL
        searchParams.forEach((value, key) => {
            if (key.startsWith('prefill_')) {
                params.set(key, value);
            }
        });
        
        const queryString = params.toString();
        return queryString ? `${baseUrl}?${queryString}` : baseUrl;
    };
    
    return (
        <div className="fixed inset-0 w-full h-full">
            <iframe 
                className="airtable-embed" 
                src={buildAirtableUrl()}
                frameBorder="0" 
                width="100%" 
                height="100%"
                style={{ background: 'transparent', border: 'none' }}
            />
        </div>
    );
}

export default function ContributePage() {
    return (
        <Suspense fallback={
            <div className="fixed inset-0 w-full h-full flex items-center justify-center">
                <div className="text-gray-500">Loading form...</div>
            </div>
        }>
            <ContributeForm />
        </Suspense>
    );
}
