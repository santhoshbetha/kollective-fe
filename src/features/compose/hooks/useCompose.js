import { useState } from 'react';

// features/compose/hooks/useCompose.ts
export const useCompose = () => {
  const [text, setText] = useState('');
  const [media, setMedia] = useState([]);
  
  const handleUpload = async (files) => { /* logic */ };
  const handleSubmit = async () => { /* API call + success reset */ };

  return {
    text,
    setText,
    media,
    handleUpload,
    handleSubmit,
    isSubmitting: false, // track loading state
    isValid: text.length > 0 && text.length <= 500
  };
};
