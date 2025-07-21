
// src/pages/HerbDetailPage.tsx
import React from 'react';
import { useParams } from 'react-router-dom';
import { herbs } from '../data/herbs'; // Adjust path if needed
import HerbCardAccordion from '../components/HerbCardAccordion';
import { ErrorBoundary } from '../components/ErrorBoundary';

export default function HerbDetailPage() {
  const { herbId } = useParams();

  const herb = herbs.find(h =>
    h.slug === herbId || h.name?.toLowerCase().replace(/\s+/g, '-') === herbId
  );

  const isValid = herb && typeof herb === 'object' && herb.name;

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <ErrorBoundary>
        {isValid ? (
          <HerbCardAccordion herb={herb} />
        ) : (
          <div className="text-center text-red-600 border border-red-400 bg-red-100 p-4 rounded shadow">
            <h2 className="text-xl font-bold">404 – Herb Not Found</h2>
            <p className="mt-2 text-sm">This herb entry is missing or malformed.</p>
          </div>
        )}
      </ErrorBoundary>
    </div>
  );
}
