import React from 'react';

const Settings: React.FC = () => {
  return (
    <div className="text-center">
      <h1 className="text-3xl font-bold mb-4">Settings</h1>
      <p className="text-xl mb-4">Configure your application settings here.</p>
      <div className="max-w-md mx-auto">
        <label className="block mb-2">
          <span className="text-gray-700">Theme</span>
          <select className="block w-full mt-1 p-2 border rounded">
            <option>Light</option>
            <option>Dark</option>
          </select>
        </label>
        <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          Save Settings
        </button>
      </div>
    </div>
  );
};

export default Settings;