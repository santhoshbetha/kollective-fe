import React from 'react';
import { useForm } from '../../hooks/useForm';

const ProfileSettings = ({ user }) => {
  const { values, handleChange, handleSubmit } = useForm({
    display_name: user.display_name,
    note: user.note,
    avatar: null,
    header: null,
  }, (formData) => {
    console.log('Dispatching update to Soapbox API...', formData);
  });

  return (
    <div className="settings-container">
      <header className="settings-header">
        <h1>Edit Profile</h1>
      </header>

      <form onSubmit={handleSubmit} className="settings-form">
        {/* Profile Header Image Section */}
        <div className="field-group">
          <label htmlFor="header">Header Image</label>
          <div className="header-preview" style={{ backgroundImage: `url(${user.header})` }}>
            <input type="file" name="header" onChange={handleChange} accept="image/*" />
          </div>
        </div>

        {/* Avatar Section */}
        <div className="field-group">
          <label htmlFor="avatar">Avatar</label>
          <input type="file" name="avatar" onChange={handleChange} accept="image/*" />
        </div>

        {/* Text Fields */}
        <div className="field-group">
          <label>Display Name</label>
          <input 
            type="text" 
            name="display_name" 
            value={values.display_name} 
            onChange={handleChange} 
            placeholder="Your name"
          />
        </div>

        <div className="field-group">
          <label>Bio (Note)</label>
          <textarea 
            name="note" 
            value={values.note} 
            onChange={handleChange} 
            rows="4"
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="button-primary">Save Changes</button>
        </div>
      </form>
    </div>
  );
};

export default ProfileSettings;

//========================= auto-save the settings so you can even delete the "Save Changes" button 
// for a smoother Soapbox UI experience==========================================================
import React from 'react';
import { useAutoSaveForm } from '../../hooks/useAutoSaveForm';

// visual "Saved" indicator

const ProfileSettings = ({ user }) => {
  const { values, handleChange, status } = useAutoSaveForm(
    { display_name: user.display_name, note: user.note },
    async (data) => {
      // Logic for PATCH /api/v1/accounts/update_credentials
      return new Promise(res => setTimeout(res, 500)); 
    }
  );

  return (
    <div className="relative space-y-6 p-4">
      {/* 1. Floating Feedback Indicator */}
      <div className="absolute top-0 right-0 p-4 text-xs font-medium transition-opacity">
        {status === 'saving' && <span className="text-blue-500 animate-pulse">Saving...</span>}
        {status === 'saved' && <span className="text-green-500">✓ Saved</span>}
      </div>

      <div className="flex flex-col">
        <label className="text-sm font-bold text-gray-700">Display Name</label>
        <input 
          name="display_name"
          className="border-b focus:border-blue-500 outline-none py-2"
          value={values.display_name} 
          onChange={handleChange} 
        />
      </div>

      <div className="flex flex-col">
        <label className="text-sm font-bold text-gray-700">Bio</label>
        <textarea 
          name="note"
          className="border rounded p-2 mt-2 h-32 focus:ring-1 focus:ring-blue-500"
          value={values.note} 
          onChange={handleChange} 
        />
      </div>
    </div>
  );
};



