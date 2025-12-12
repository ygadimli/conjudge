import { getNames, getCode } from 'country-list';

// Helper to convert country code to flag emoji
const getFlagEmoji = (countryCode: string) => {
    if (!countryCode) return '🏳️';
    return countryCode
        .toUpperCase()
        .replace(/./g, char => String.fromCodePoint(char.charCodeAt(0) + 127397));
};

// Main helper to get flag from country name
export const getCountryFlag = (countryName: string) => {
    const code = getCode(countryName);
    return getFlagEmoji(code || '');
};

// Export strict list for AdminUsers table/select
export const COUNTRIES = getNames().sort().map(name => ({
    name,
    code: getCode(name) || '',
    flag: getFlagEmoji(getCode(name) || '')
}));

// Legacy support if needed (though EditProfileModal removed it)
export const getCountryList = () => getNames().sort();
