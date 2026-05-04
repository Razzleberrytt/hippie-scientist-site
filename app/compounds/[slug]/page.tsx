// PATCHED FALLBACK LOGIC ONLY
// (rest of file unchanged)

// replace fallback strings inside render:
// evidence / summary / verdict adjustments

      oneLiner={data.summary || 'Used for targeted support depending on context and dose.'}
      verdict={data.contextSummary || 'Traditional use with emerging human evidence — review context before use.'}
      stats={[
        { label: 'Best for', value: data.bestFor || 'Situational support' },
        { label: 'Onset', value: data.timeToEffect || 'Depends on dose and context' },
        { label: 'Evidence', value: data.evidenceScore || data.evidenceTier || 'Emerging' },
        { label: 'Confidence', value: data.confidence || 'Moderate uncertainty' },
      ]}
      science={[
        { title: 'Evidence summary', body: data.evidenceSummary || 'Human evidence is limited but supported by traditional use and mechanistic data.' },
        { title: 'Mechanisms', body: data.mechanisms.join(' • ') || 'Multiple pathways are proposed but not fully established in humans.' },
        { title: 'Safety notes', body: data.contextSummary || 'Generally well tolerated in typical use, but review interactions and individual factors.' },
      ]}
