import { createRef } from 'react';

export const snackbarRef = createRef();

export const showToast = (message, options = {}) => {
  if (snackbarRef.current) {
    snackbarRef.current(message, options);
  }
};