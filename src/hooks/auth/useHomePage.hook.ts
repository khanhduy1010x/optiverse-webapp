import { useAppTranslate, useChangeLanguage } from '../useAppTranslate';

export default function useHomePage() {
  const { i18n } = useChangeLanguage();

  const { t } = useAppTranslate('auth');

  const languageItems = [
    { label: t('language_option_en'), value: 'en' },
    { label: t('language_option_vi'), value: 'vi' },
    { label: t('language_option_jp'), value: 'jp' },
  ];

  const currentLabel =
    languageItems.find(item => item.value === i18n.language)?.label ||
    t('language_option_en');

  const translations = t('keywords', {
    returnObjects: true,
  }) as unknown as Record<string, string>;

  const highlightsDes = {
    notes:
      'text-sky-500 border border-sky-300/50 bg-sky-100/40 rounded-full px-3 py-1 font-semibold shadow-sm backdrop-blur-sm leading-[2]',
    tasks:
      'text-lime-600 border border-lime-300/50 bg-lime-100/40 rounded-full px-3 py-1 font-semibold shadow-sm backdrop-blur-sm leading-[2]',
    flashcards:
      'text-pink-500 border border-pink-300/50 bg-pink-100/40 rounded-full px-3 py-1 font-semibold shadow-sm backdrop-blur-sm leading-[2]',
    collaborations:
      'text-cyan-500 border border-cyan-300/50 bg-cyan-100/40 rounded-full px-3 py-1 font-semibold shadow-sm backdrop-blur-sm leading-[2]',
  };

  const highlightsTitle = {
    op: 'font-bold text-4xl',
  };

  // Carousel data with translations
  const carouselItems = [
    {
      id: 1,
      title: t('carousel_notes_title'),
      description: t('carousel_notes_desc'),
      image: '/note.png',
      bgColor: '#667eea',
    },
    {
      id: 2,
      title: t('carousel_tasks_title'),
      description: t('carousel_tasks_desc'),
      image: '/task.png',
      bgColor: '#f093fb',
    },
    {
      id: 3,
      title: t('carousel_flashcards_title'),
      description: t('carousel_flashcards_desc'),
      image: '/flashcards.png',
      bgColor: '#4facfe',
    },
    {
      id: 4,
      title: t('carousel_collaboration_title'),
      description: t('carousel_collaboration_desc'),
      image: '/chat.png',
      bgColor: '#43e97b',
    },
  ];

  return {
    languageItems,
    currentLabel,
    translations,
    highlightsDes,
    highlightsTitle,
    carouselItems,
  };
}
