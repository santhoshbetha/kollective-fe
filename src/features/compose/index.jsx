import React from 'react';
import { Stack, Button, Textarea } from 'soapbox-ui'; // Replace with actual UI lib

import { useCompose } from './hooks/useCompose';
import { useMediaUpload } from './hooks/useMediaUpload';
import { ComposeOptionPicker } from './components/ComposeOptionPicker';
import { AttachmentThumbnail } from './components/AttachmentThumbnail';
import { LANG_OPTIONS, PRIVACY_OPTIONS } from './constants';

const ComposeFeature = () => {
  const { text, setText, privacy, setPrivacy, lang, setLang, handleSubmit } = useCompose();
  const { attachments, onUpload, isUploading } = useMediaUpload();

  return (
    <Stack spacing={4} className="compose-form">
      {/* 1. Text Input */}
      <Textarea 
        value={text} 
        onChange={(e) => setText(e.target.value)} 
        placeholder="What's on your mind?"
      />

      {/* 2. Media Preview Grid */}
      <Stack direction="row" spacing={2} wrap>
        {attachments.map(att => (
          <AttachmentThumbnail key={att.id} attachment={att} />
        ))}
      </Stack>

      {/* 3. Consolidated Selectors */}
      <Stack direction="row" spacing={4}>
        <ComposeOptionPicker 
          label="Privacy"
          options={PRIVACY_OPTIONS} 
          value={privacy} 
          onChange={setPrivacy} 
        />
        <ComposeOptionPicker 
          label="Language"
          options={LANG_OPTIONS} 
          value={lang} 
          onChange={setLang} 
        />
      </Stack>

      {/* 4. Actions */}
      <Stack direction="row" justify="space-between" align="center">
        <input type="file" multiple onChange={(e) => onUpload(e.target.files)} />
        <Button 
          variant="primary" 
          disabled={isUploading || !text.trim()} 
          onClick={handleSubmit}
        >
          Post
        </Button>
      </Stack>
    </Stack>
  );
};

export default ComposeFeature;


/*
Why this works best:

    1.Decoupling: The ComposeOptionPicker doesn't need to know what a "Language" is; it just 
      knows how to render a list of choices.
    2.Consistency: You can pass PRIVACY_OPTIONS to a second instance of the same component 
      right next to it, drastically reducing the total lines of code in the Soapbox features directory.
*/

/*
<ComposeOptionPicker 
  label="Post Privacy"
  options={PRIVACY_OPTIONS} 
  value={privacyState} 
  onChange={setPrivacy} 
/>
*/

