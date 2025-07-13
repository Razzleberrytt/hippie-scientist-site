import herbsDataRaw from './herbs.json';
export const herbsData = herbsDataRaw.map((h) => {
    var _a, _b;
    return ({
        id: (_a = h.id) !== null && _a !== void 0 ? _a : h.name.toLowerCase().replace(/\s+/g, '-'),
        name: h.name,
        scientificName: h.scientificName,
        category: h.category,
        effects: h.effects,
        description: (_b = h.description) !== null && _b !== void 0 ? _b : 'No description provided.',
        mechanismOfAction: h.mechanismOfAction,
        pharmacokinetics: h.pharmacokinetics,
        therapeuticUses: h.therapeuticUses,
        sideEffects: h.sideEffects,
        contraindications: h.contraindications,
        drugInteractions: h.drugInteractions,
        toxicityLD50: h.toxicityLD50,
        safetyRating: typeof h.safetyRating === 'number' ? h.safetyRating : 1,
        legalStatus: h.legalStatus,
        region: h.region,
        onset: h.onset,
        intensity: h.intensity,
        preparation: h.preparation,
        tags: h.tags,
    });
});
