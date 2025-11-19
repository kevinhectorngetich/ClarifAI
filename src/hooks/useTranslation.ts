import { useEffect, useState } from 'react';
import { Language } from '../types/settings';
import { Translations, getTranslation } from '../locales/translations';
import { getSettings } from '../utils/storage';

export const useTranslation = () => {
    const [t, setT] = useState<Translations>(getTranslation('en'));
    const [currentLanguage, setCurrentLanguage] = useState<Language>('en');

    useEffect(() => {
        const loadTranslations = async () => {
            const settings = await getSettings();
            setCurrentLanguage(settings.language);
            setT(getTranslation(settings.language));
        };

        loadTranslations();

        // Listen for language changes in storage
        const handleStorageChange = (changes: { [key: string]: chrome.storage.StorageChange }) => {
            if (changes.clarifai_settings) {
                const newSettings = changes.clarifai_settings.newValue;
                if (newSettings?.language) {
                    setCurrentLanguage(newSettings.language);
                    setT(getTranslation(newSettings.language));
                }
            }
        };

        chrome.storage.onChanged.addListener(handleStorageChange);

        return () => {
            chrome.storage.onChanged.removeListener(handleStorageChange);
        };
    }, []);

    return { t, currentLanguage };
};
