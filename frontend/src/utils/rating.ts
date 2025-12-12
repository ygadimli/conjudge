export const RATING_TIERS = [
    { name: 'Newbie', min: 0, max: 1199, color: '#CCCCCC' },
    { name: 'Pupil', min: 1200, max: 1399, color: '#77FF77' },
    { name: 'Specialist', min: 1400, max: 1599, color: '#77AADD' },
    { name: 'Expert', min: 1600, max: 1899, color: '#AAAAFF' },
    { name: 'Candidate Master', min: 1900, max: 2099, color: '#FF88FF' },
    { name: 'Master', min: 2100, max: 2299, color: '#FFCC88' },
    { name: 'International Master', min: 2300, max: 2399, color: '#FFBB55' },
    { name: 'Grandmaster', min: 2400, max: 2599, color: '#FF7777' },
    { name: 'International Grandmaster', min: 2600, max: 2999, color: '#FF3333' },
    { name: 'Legendary Grandmaster', min: 3000, max: 5000, color: '#AA0000' }
];

export const getTier = (rating: number) => {
    if (rating < 1200) return { name: 'Newbie', color: '#CCCCCC', bg: 'bg-[#CCCCCC]' }; // Gray
    if (rating < 1400) return { name: 'Pupil', color: '#77FF77', bg: 'bg-[#77FF77]' }; // Green
    if (rating < 1600) return { name: 'Specialist', color: '#77AADD', bg: 'bg-[#77AADD]' }; // Cyan
    if (rating < 1900) return { name: 'Expert', color: '#AAAAFF', bg: 'bg-[#AAAAFF]' }; // Blue
    if (rating < 2100) return { name: 'Candidate Master', color: '#FF88FF', bg: 'bg-[#FF88FF]' }; // Violet
    if (rating < 2300) return { name: 'Master', color: '#FFCC88', bg: 'bg-[#FFCC88]' }; // Orange
    if (rating < 2400) return { name: 'International Master', color: '#FFBB55', bg: 'bg-[#FFBB55]' }; // Orange
    if (rating < 2600) return { name: 'Grandmaster', color: '#FF7777', bg: 'bg-[#FF7777]' }; // Red
    if (rating < 3000) return { name: 'International Grandmaster', color: '#FF3333', bg: 'bg-[#FF3333]' }; // Red
    return { name: 'Legendary Grandmaster', color: '#AA0000', bg: 'bg-[#AA0000]' }; // Black/Red
};

export const getTierColor = (rating: number) => getTier(rating).color;
