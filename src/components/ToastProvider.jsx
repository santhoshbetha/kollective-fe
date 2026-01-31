import { useSnackbar } from 'notistack';
import { useEffect } from 'react';
import { snackbarRef } from '../utils/toast';

const ToastProvider = () => {
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    snackbarRef.current = enqueueSnackbar;
  }, [enqueueSnackbar]);

  return null;
};

export default ToastProvider;