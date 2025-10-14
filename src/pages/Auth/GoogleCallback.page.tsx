import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppTranslate } from '../../hooks/useAppTranslate';

const GoogleCallback = () => {
  const navigate = useNavigate();
  const { t } = useAppTranslate('auth');
  useEffect(() => {
    const processCallback = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      console.log("This code ", code)
      if (code) {
        if (window.opener && !window.opener.closed) {
          window.opener.postMessage(
            { type: 'googleCallback', code },
            window.location.origin
          );
        } else {
          console.error('Opener window not available');
          navigate('/');
        }
      } else {
        const error = urlParams.get('error');
        console.error('Google OAuth error:', error);
        navigate('/');
      }
    };

    processCallback();
  }, [navigate]);

  return (
    <div className="flex items-center justify-center h-screen">
      <p>{t('google_processing')}</p>
    </div>
  );
};

export default GoogleCallback;
