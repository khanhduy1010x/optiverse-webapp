import { useChangeLanguage } from '../../hooks/useAppTranslate';

export const DropdownChangeLanguage = () => {
  const { changeLanguage, i18n } = useChangeLanguage();

  return (
    <select
      className="w-32 p-1 border border-gray-300 rounded dark:bg-gray-800 dark:text-gray-200"
      onChange={changeLanguage}
      value={i18n.language}
    >
      <option value={'en'}>English</option>
      <option value={'vi'}>Tiếng Việt</option>
      <option value={'jp'}>日本語</option>
    </select>
  );
};
