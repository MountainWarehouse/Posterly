import DefaultPreference from 'react-native-default-preference';
import IPreferences from '../_shared/IPreferences';

const getAll = async (): Promise<IPreferences> => {
    const data = await DefaultPreference.getAll();
    const preferences = {} as IPreferences;

    preferences.useShelf = data.useShelf === 'true';

    return preferences;
};
const setAll = (preferences: IPreferences): Promise<void> => {
    const data = { ...preferences } as any;
    for (const key in data) {
        if (preferences.hasOwnProperty(key)) {
            data[key] = String(data[key]);
        }
    }
    return DefaultPreference.setMultiple(data);
};

export default {
    getAll,
    setAll
};
