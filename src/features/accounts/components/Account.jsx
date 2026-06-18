import { useRef } from "react";
import { defineMessages, useIntl, FormattedMessage } from 'react-intl';
import { Link } from 'react-router-dom';
import { emojifyText } from "../utils/emojify";
import Avatar from '@/components/ui/avatar';
import Stack from '@/components/ui/stack';
import HStack from '@/components/ui/hstack';
import Text from '@/components/ui/text';
import IconButton from '@/components/ui/icon-button';
import { Badge } from "@/components/ui/badge";
import { useBoundStore } from '@/stores/boundStore';
import { Pencil } from "lucide-react";

const messages = defineMessages({
  bot: { id: 'account.badges.bot', defaultMessage: 'Bot' },
});

const ProfilePopper = ({ condition, wrapper, children }) => {
  return (
    <>
      {condition ? wrapper(children) : children}
    </>
  );
};

// Move AccountLink outside of the Account component
const AccountLink = ({ children, isAvatar = false, showProfileHoverCard, account, LinkEl: _LinkEl, linkProps }) => (
  <ProfilePopper
    condition={showProfileHoverCard}
    wrapper={(c) => <HoverRefWrapper className={isAvatar ? 'relative' : ''} accountId={account.id} inline>{c}</HoverRefWrapper>}
  >
    <_LinkEl className={isAvatar ? 'rounded-full' : ''} {...linkProps}>
      {children}
    </_LinkEl>
  </ProfilePopper>
);

// Helper for the repeating separator dot
const Dot = () => <Text tag='span' theme='muted' size='sm'>&middot;</Text>;

const Account = ({
  acct,
  account,
  actionType,
  action,
  actionIcon,
  actionTitle,
  actionAlignment = 'center',
  avatarSize = 42,
  hidden = false,
  hideActions = false,
  onActionClick,
  showProfileHoverCard = true,
  timestamp,
  timestampUrl,
  futureTimestamp = false,
  withAccountNote = false,
  withDate = false,
  withLinkToProfile = true,
  withRelationship = true,
  showEdit = false,
  approvalStatus,
  emoji,
  emojiUrl,
  note,
}) => {
  const overflowRef = useRef(null);
  const actionRef = useRef(null);
  const intl = useIntl();
  const me = useBoundStore((state) => state.me);

  if (!account) {
    return null;
  }

  if (hidden) {
    return (
      <>
        {account.display_name}
        {account.username}
      </>
    );
  }

  if (withDate) timestamp = account.created_at;

  const _LinkEl = withLinkToProfile ? Link : 'div';
  const linkProps = withLinkToProfile ? {
    to: `/@${account.acct}`,
    title: account.acct,
    onClick: (event) => event.stopPropagation(),
  } : {};

  const handleAction = () => {
    onActionClick(account);
  };

  const renderAction = () => {
    if (action) {
      return action;
    }

    if (hideActions) {
      return null;
    }

    if (onActionClick && actionIcon) {
      return (
        <IconButton
          src={actionIcon}
          title={actionTitle}
          onClick={handleAction}
          className='bg-transparent text-gray-600 hover:text-gray-700 dark:text-gray-600 dark:hover:text-gray-500'
          iconClassName='h-4 w-4'
        />
      );
    }

    if (account.id !== me) {
      return <ActionButton account={account} actionType={actionType} />;
    }

    return null;
  };

  return (
    <div data-testid='account' className='group block w-full shrink-0' ref={overflowRef}>
      <HStack alignItems={actionAlignment} space={3} justifyContent='between'>
        <HStack alignItems={withAccountNote || note ? 'top' : 'center'} space={3} className='overflow-hidden'>
          
          {/* Avatar Section */}
          <AccountLink 
            isAvatar 
            showProfileHoverCard={showProfileHoverCard} 
            account={account} 
            LinkEl={_LinkEl} 
            linkProps={linkProps}
          >
            <Avatar src={account.avatar} size={avatarSize} />
            {emoji && (
              <div className='absolute -right-1.5 bottom-0'>
                {emojiUrl ? <img className='size-5' src={emojiUrl} alt={emoji} /> : <span style={{fontSize: '20px'}}>{emoji}</span>}
              </div>
            )}
          </AccountLink>

          <div className='grow overflow-hidden'>
            {/* Name Section */}
            <AccountLink 
              showProfileHoverCard={showProfileHoverCard} 
              account={account} 
              LinkEl={_LinkEl} 
              linkProps={linkProps}
            >
              <HStack space={1} alignItems='center' grow>
                <Text size='sm' weight='semibold' truncate>
                  {emojifyText(account.display_name, account.emojis)}
                </Text>
                {account.verified && <VerificationBadge />}
                {account.bot && <Badge slug='bot' title={intl.formatMessage(messages.bot)} />}
              </HStack>
            </AccountLink>

            <Stack space={withAccountNote || note ? 1 : 0}>
              <HStack alignItems='center' space={1}>
                <Text theme='muted' size='sm' direction='ltr' truncate>@{acct ?? account.username}</Text>

                {account.pleroma?.favicon && <InstanceFavicon account={account} disabled={!withLinkToProfile} />}

                {/* Timestamp */}
                {timestamp && (
                  <>
                    <Dot />
                    {timestampUrl ? (
                      <Link to={timestampUrl} className='hover:underline' onClick={e => e.stopPropagation()}>
                        <RelativeTimestamp timestamp={timestamp} theme='muted' size='sm' className='whitespace-nowrap' futureDate={futureTimestamp} />
                      </Link>
                    ) : (
                      <RelativeTimestamp timestamp={timestamp} theme='muted' size='sm' className='whitespace-nowrap' futureDate={futureTimestamp} />
                    )}
                  </>
                )}

                {/* Status Badges */}
                {approvalStatus && ['pending', 'rejected'].includes(approvalStatus) && (
                  <>
                    <Dot />
                    <Text tag='span' theme='muted' size='sm'>
                      <FormattedMessage id={`status.approval.${approvalStatus}`} />
                    </Text>
                  </>
                )}

                {showEdit && <><Dot /><Pencil className='size-5 text-gray-700 dark:text-gray-600' /></>}

                {actionType === 'muting' && account.mute_expires_at && (
                  <>
                    <Dot />
                    <Text theme='muted' size='sm'><RelativeTimestamp timestamp={account.mute_expires_at} futureDate /></Text>
                  </>
                )}
              </HStack>

              {/* Note / Bio Section */}
              {note ? (
                <Text size='sm' className='mr-2'>{note}</Text>
              ) : withAccountNote && (
                <Markup
                  truncate
                  size='sm'
                  html={{ __html: account.note }}
                  emojis={account.emojis}
                  className='mr-2 rtl:ml-2 rtl:mr-0 [&_br]:hidden [&_p:first-child]:inline [&_p:first-child]:truncate [&_p]:hidden'
                />
              )}
            </Stack>
          </div>
        </HStack>

        <div ref={actionRef}>{withRelationship && renderAction()}</div>
      </HStack>
    </div>
  );
};

export default Account;
