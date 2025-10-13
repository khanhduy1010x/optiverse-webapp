import { useNavigate } from "react-router-dom";
import Button from "../../components/common/Button.component";
import Dropdown from "../../components/common/CustomDropDown.component";
import { useAppTranslate, useChangeLanguage } from "../../hooks/useAppTranslate";
import { HighlightKeyword } from "../../components/common/HighlightKeyword";

const HomePage: React.FC = () => {
  const { t } = useAppTranslate("auth");
  const { changeLanguage, i18n } = useChangeLanguage();
  const navigate = useNavigate()
  const languageItems = [
    { label: t("language_option_en"), value: "en" },
    { label: t("language_option_vi"), value: "vi" },
    { label: t("language_option_jp"), value: "jp" },
  ];

  const currentLabel =
    languageItems.find((item) => item.value === i18n.language)?.label ||
    t("language_option_en");

  const translations = t("keywords", {
    returnObjects: true,
  }) as unknown as Record<string, string>;

  const highlightsDes = {
    notes: "text-sky-500 border border-sky-300/50 bg-sky-100/40 rounded-full px-3 py-1 font-semibold shadow-sm backdrop-blur-sm leading-[2]",
    tasks: "text-lime-600 border border-lime-300/50 bg-lime-100/40 rounded-full px-3 py-1 font-semibold shadow-sm backdrop-blur-sm leading-[2]",
    flashcards: "text-pink-500 border border-pink-300/50 bg-pink-100/40 rounded-full px-3 py-1 font-semibold shadow-sm backdrop-blur-sm leading-[2]",
    collaborations: "text-cyan-500 border border-cyan-300/50 bg-cyan-100/40 rounded-full px-3 py-1 font-semibold shadow-sm backdrop-blur-sm leading-[2]",
  };

  const highlightsTitle = {
    op: "font-bold text-4xl",
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center"
      style={{ backgroundImage: "url('/Background.png')" }}
    >
      <div className="min-h-screen">
        <div className="mx-auto flex h-full flex-col px-6 py-2">
          {/* Header */}
          <header className="mb-10 flex items-center justify-between rounded-full bg-white/50 px-6 py-3 backdrop-blur relative z-50">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-black text-white text-lg font-semibold">
                O
              </span>
              <span className="text-lg font-semibold text-gray-900">
                Optiverse
              </span>
            </div>

            <div className="flex items-center gap-4">
              <Dropdown
                label={currentLabel}
                items={languageItems}
                onSelect={(lang) =>
                  changeLanguage({ target: { value: lang } })
                }
                className="w-56 "
              />

              <div className="flex items-center gap-2">
                <Button className="rounded-full border border-black/10 px-4 py-2 text-sm font-semibold text-gray-900 cursor-pointer transition hover:bg-black/5"
                  onClick={() => navigate('/login')}
                >
                  {t("login")}
                </Button>
                <Button inverted={true} className="rounded-full px-4 py-2 text-sm font-semibold transition hover:bg-black/80"
                  onClick={() => navigate('/register')}
                >
                  {t("signUp")}
                </Button>
              </div>
            </div>
          </header>

          {/* Main */}
          <main className="flex flex-1 items-start justify-end pb-12 pl-12 pt-16 relative z-[0]">
            <div className="max-w-2xl rounded-[40px] bg-white/40 p-10 shadow-2xl backdrop-blur-xs">
              <h1 className="text-3xl">
                <HighlightKeyword
                  text={t("comming_title")}
                  highlights={highlightsTitle}
                  translations={translations}
                />
              </h1>
              <p className="mt-6 text-base leading-7 text-gray-600 sm:text-lg">
                <HighlightKeyword
                  text={t("comming_description")}
                  highlights={highlightsDes}
                  translations={translations}
                />
              </p>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <Button className="w-full rounded-full bg-black px-12 py-3 text-sm font-semibold text-white transition hover:bg-black/80">
                  {t("sg_now")}
                </Button>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
