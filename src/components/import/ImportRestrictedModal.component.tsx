import React from 'react';
import Modal from 'react-modal';
import { useNavigate } from 'react-router-dom';
import { useAppTranslate } from '../../hooks/useAppTranslate';
import { AlertTriangle, ArrowRight, X } from 'lucide-react';
import { GROUP_CLASSNAMES } from '../../styles';

interface ImportRestrictedModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ImportRestrictedModal: React.FC<ImportRestrictedModalProps> = ({ isOpen, onClose }) => {
  const { t } = useAppTranslate('task');
  const navigate = useNavigate();

  const handleUpgrade = () => {
    onClose();
    navigate('/membership');
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className={GROUP_CLASSNAMES.modalContainer}
      style={{
        overlay: {
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
        },
      }}
    >
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-lg shadow-2xl z-50">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors z-10"
          aria-label="Close modal"
        >
          <X size={20} className="text-gray-600" />
        </button>

        {/* Header with Icon */}
        <div className="pt-8 pb-4 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-amber-100 p-3 rounded-full">
              <AlertTriangle size={32} className="text-amber-500" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-gray-900">{t('import_restricted_title')}</h2>
          <p className="text-sm text-gray-600 mt-2">{t('import_restricted_desc')}</p>
        </div>

        {/* Divider */}
        <div className="my-4 h-px bg-gray-200" />

        {/* Content */}
        <div className="px-8 py-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-700 leading-relaxed">
              {t('import_restriction_info')}
            </p>
            <ul className="mt-3 space-y-2 text-sm text-gray-600">
              <li className="flex items-start">
                <span className="text-amber-500 mr-2">•</span>
                <span>{t('import_available_basic')}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="my-4 h-px bg-gray-200" />

        {/* Upgrade Suggestion Card */}
        <div className="px-8 py-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg mx-4 mb-4">
          <p className="text-sm font-semibold text-blue-900 mb-2">{t('upgrade_suggestion')}</p>
          <p className="text-xs text-blue-800">
            {t('upgrade_to_import')} <span className="font-bold">{t('basic_plan')}</span> {t('to_get')} {t('import_feature')}
          </p>
        </div>

        {/* Buttons */}
        <div className="px-8 pb-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
          >
            {t('close')}
          </button>
          <button
            onClick={handleUpgrade}
            className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
          >
            {t('upgrade_now')}
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ImportRestrictedModal;
