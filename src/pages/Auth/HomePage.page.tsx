import { useNavigate } from "react-router-dom";
import Button from "../../components/common/Button.component";
import Dropdown from "../../components/common/CustomDropDown.component";
import { useAppTranslate, useChangeLanguage } from "../../hooks/useAppTranslate";
import { HighlightKeyword } from "../../components/common/HighlightKeyword";
import useHomePage from "../../hooks/auth/useHomePage.hook";
import { Carousel3D } from "../../components/common/Carousel.component";
import DownloadSection from "./DownloadSection.screen";
import Footer from "./Footer.screen";
import "../../styles/carousel.css";

const HomePage: React.FC = () => {
  const { t } = useAppTranslate("auth");
  const { changeLanguage } = useChangeLanguage();
  const navigate = useNavigate()
  const { languageItems,
    currentLabel,
    translations,
    highlightsDes,
    highlightsTitle,
    carouselItems } = useHomePage()

  return (
    <div
      className="bg-cover bg-center min-h-screen flex flex-col !overflow-auto"
    >

      <div className="h-full w-full !overflow-auto "
        style={{ backgroundImage: "url('/Background.png')" }}
      >
        <div className="mx-auto min-h-screen flex h-full flex-col px-6 py-2 !overflow-auto ">
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

          {/* Main Content */}
          <div className="flex-1 px-6 pb-12 pt-8 overflow-auto">
            <div className="h-full">
              {/* 3D Carousel Section */}
              <div className="w-full h-full flex items-center backdrop-blur-md bg-black/10 rounded-3xl shadow-lg p-6 mb-16">
                <Carousel3D
                  items={carouselItems}
                  autoPlay={true}
                  interval={4000}
                  onSlideChange={(index) => console.log('Slide changed to:', index)}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Download Section */}
        <DownloadSection />

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
};

export default HomePage;
