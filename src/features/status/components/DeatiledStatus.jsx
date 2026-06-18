import Stack from '@/components/ui/stack';
import HStack from '@/components/ui/hstack';
import { useRef, useState } from 'react';
import { getActualStatus } from '../../../utils/status';
import QuotedPost from '../../../components/QuotedPost';
import PostContent from '../../../components/PostContent';
import StatusMedia from '../../../components/StatusMedia';
import { FormattedDate, FormattedMessage, useIntl } from 'react-intl';
import { Link } from 'react-router-dom';
import SensitiveContentOverlay from '../../../components/SensitiveContentOverlay';
import { Lock, Mail, CirclePile } from 'lucide-react';

function DetailedStatus({
  status,
  onOpenCompareHistoryModal,
  onToggleMediaVisibility,
  showMedia,
  withMedia = true,
}) {
  const intl = useIntl();

  const node = useRef(null);
  const overlay = useRef(null);

  const [minHeight, setMinHeight] = useState(208);

  const actualStatus = getActualStatus(status);
  if (!actualStatus) return null;
  const { account } = actualStatus;
  if (!account || typeof account !== 'object') return null;

  const isUnderReview = actualStatus.visibility === 'self';
  const isSensitive = actualStatus.hidden;

  let statusTypeIcon = null;

  let quote;

  if (actualStatus.quote) {
    if (actualStatus.pleroma.get('quote_visible', true) === false) {
      quote = (
        <div>
          <p><FormattedMessage id='status.quote_tombstone' defaultMessage='Post is unavailable.' /></p>
        </div>
      );
    } else {
      quote = <QuotedPost statusId={actualStatus.quote.toString()} />;
    }
  }

  if (actualStatus.visibility === 'direct') {
    statusTypeIcon = <Icon className='size-4 text-gray-700 dark:text-gray-600' src={Mail} />;
  } else if (actualStatus.visibility === 'private') {
    statusTypeIcon = <Icon className='size-4 text-gray-700 dark:text-gray-600' src={Lock} />;
  }

  const handleOpenCompareHistoryModal = () => {
    onOpenCompareHistoryModal(status);
  };

  const renderStatusInfo = () => {
    if (status.group) {
      return (
        <div className='mb-4'>
          <StatusInfo
            avatarSize={42}
            icon={
              <Icon
                src={CirclePile}
                className='size-4 text-primary-600 dark:text-accent-blue'
              />
            }
            text={
              <FormattedMessage
                id='status.group'
                defaultMessage='Posted in {group}'
                values={{
                  group: (
                    <Link to={`/group/${(status.group).slug}`} className='hover:underline'>
                      <bdi className='truncate'>
                        <strong className='text-gray-800 dark:text-gray-200'>
                          <span>{status.group.display_name}</span>
                        </strong>
                      </bdi>
                    </Link>
                  ),
                }}
              />
            }
          />
        </div>
      );
    }
  };

  return (
    <div className='box-border'>
      <div ref={node} tabIndex={-1}>
        {renderStatusInfo()}

        <div className='mb-4'>
          <Account
            key={account.id}
            account={account}
            avatarSize={42}
            hideActions
            approvalStatus={actualStatus.approval_status}
          />
        </div>

        <StatusReplyMentions status={actualStatus} />

        <Stack
          className='relative z-0'
          style={{ minHeight: isUnderReview || isSensitive ? Math.max(minHeight, 208) + 12 : undefined }}
        >
          {(isUnderReview || isSensitive) && (
            <SensitiveContentOverlay
              status={status}
              visible={showMedia}
              onToggleVisibility={onToggleMediaVisibility}
              ref={overlay}
            />
          )}

          <Stack space={4}>
            <PostContent
              status={actualStatus}
              textSize='lg'
              translatable
            />

            <TranslateButton status={actualStatus} />

            {(withMedia && (quote || actualStatus.card || actualStatus.media_attachments.size > 0)) && (
              <Stack space={4}>
                <StatusMedia
                  status={actualStatus.toJS()}
                  showMedia={showMedia}
                  onToggleVisibility={onToggleMediaVisibility}
                />

                {quote}
              </Stack>
            )}
          </Stack>
        </Stack>

        <HStack justifyContent='between' alignItems='center' className='py-3' wrap>
          <StatusInteractionBar status={actualStatus} />

          <HStack space={1} alignItems='center'>
            {statusTypeIcon}

            <span>
              {actualStatus.application && (
                <>
                  {actualStatus.application.get('website') ? (
                    <a href={actualStatus.application.get('website')} target='_blank' rel='noopener' className='hover:underline'>
                      <Text tag='span' theme='muted' size='sm'>
                        {actualStatus.application.get('name')}
                      </Text>
                    </a>
                  ) : (
                    <Text tag='span' theme='muted' size='sm'>
                      {actualStatus.application.get('name')}
                    </Text>
                  )}
=                  <Text tag='span' theme='muted' size='sm'>{' · '}</Text>
                </>
              )}

              <a href={actualStatus.url} target='_blank' rel='noopener' className='hover:underline'>
                <Text tag='span' theme='muted' size='sm'>
                  <FormattedDate value={new Date(actualStatus.created_at)} hour12 year='numeric' month='short' day='2-digit' hour='numeric' minute='2-digit' />
                </Text>
              </a>

              {actualStatus.edited_at && (
                <>
                  <Text tag='span' theme='muted' size='sm'>{' · '}</Text>
                  <div
                    className='inline hover:underline'
                    onClick={handleOpenCompareHistoryModal}
                    role='button'
                    tabIndex={0}
                  >
                    <Text tag='span' theme='muted' size='sm'>
                      <FormattedMessage id='status.edited' defaultMessage='Edited {date}' values={{ date: intl.formatDate(new Date(actualStatus.edited_at), { hour12: true, month: 'short', day: '2-digit', hour: 'numeric', minute: '2-digit' }) }} />
                    </Text>
                  </div>
                </>
              )}
            </span>
          </HStack>
        </HStack>
      </div>
    </div>
  )
}

export default DetailedStatus