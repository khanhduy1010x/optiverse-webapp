import React from 'react';
import { useAppTranslate } from '../../hooks/useAppTranslate';
import Button from '../../components/common/Button.component';

const DownloadSection: React.FC = () => {
    const { t } = useAppTranslate('auth');

    return (
        <div className="bg-[#f6f7fb] py-16" id={"download-section"}>
            <div className="max-w-7xl mx-auto px-6">

                {/* First Section - App Download */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">

                    {/* Left Content */}
                    <div>
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight">
                            {t('download_section_title')}
                        </h2>
                        <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                            {t('download_section_desc')}
                        </p>

                        {/* Download Buttons */}
                        <div className="flex items-center justify-center flex-col sm:flex-row gap-4">
                            <Button
                                inverted
                                className="inline-flex items-center justify-center px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors duration-200 font-semibold"
                            >
                                <svg className="w-8 h-8 mr-3" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
                                </svg>
                                {t('download_google_play')}
                            </Button>
                        </div>
                    </div>

                    {/* Right - App Mockup */}
                    <div
                        className="rounded-3xl p-0 overflow-hidden"
                        style={{
                            backgroundImage: `url('/app_web.png')`,
                            backgroundSize: 'contain',
                            backgroundPosition: 'center',
                            backgroundRepeat: 'no-repeat',
                            width: '100%',
                            height: '100%',
                            minHeight: '305px',
                        }}
                    ></div>
                </div>

                {/* Second Section - Learning Methods */}
                <div className='w-full border-t border-gray-200 px-10'></div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    {/* Left - Interactive Learning Mockup */}
                    <div className="rounded-4xl overflow-hidden scale-[80%] ">
                        <img
                            src="/static.png"
                            alt="background"
                            className="w-full h-full  object-cover"
                        />
                    </div>

                    {/* Right Content */}
                    <div className="order-1 lg:order-2">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight">
                            {t('learning_method_title')}
                        </h2>
                        <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                            {t('learning_method_desc')}
                        </p>

                        <Button
                            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full font-semibold transition-colors duration-200"
                            onClick={() => console.log('Get started clicked')}
                        >
                            {t('learning_method_button')}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DownloadSection;
