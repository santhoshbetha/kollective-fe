import { RefreshCwIcon } from 'lucide-react';
import { defineMessages, useIntl } from 'react-intl';

import { Column } from './ui/column';
import IconButton from './ui/icon-button';
import Stack from './ui/stack';
import Text from './ui/text';
import { isNetworkError } from '../utils/errors';

const messages = defineMessages({
  title: { id: 'bundle_column_error.title', defaultMessage: 'Network error' },
  body: { id: 'bundle_column_error.body', defaultMessage: 'Something went wrong while loading this page.' },
  retry: { id: 'bundle_column_error.retry', defaultMessage: 'Try again' },
});

const ErrorColumn = ({ error, onRetry = () => location.reload() }) => {
  const intl = useIntl();

  const handleRetry = () => {
    onRetry?.();
  };

  if (!isNetworkError(error)) {
    throw error;
  }

  return (
    <Column label={intl.formatMessage(messages.title)}>
      <Stack space={4} alignItems='center' justifyContent='center' className='min-h-[160px] rounded-lg p-10'>
        <IconButton
          iconClassName='h-10 w-10'
          title={intl.formatMessage(messages.retry)}
          src={RefreshCwIcon}
          onClick={handleRetry}
        />

        <Text align='center' theme='muted'>{intl.formatMessage(messages.body)}</Text>
      </Stack>
    </Column>
  );
};

export default ErrorColumn;
