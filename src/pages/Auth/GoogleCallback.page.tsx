import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const GoogleCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const processCallback = () => {
      // Get code from URL
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      console.log("This code ",code)
      if (code) {
        // Send the code to the parent window
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
        // Handle error
        const error = urlParams.get('error');
        console.error('Google OAuth error:', error);
        navigate('/');
      }
    };

    processCallback();
  }, [navigate]);

  return (
    <div className="flex items-center justify-center h-screen">
      <p>Processing login, please wait...</p>
    </div>
  );
};

export default GoogleCallback; 