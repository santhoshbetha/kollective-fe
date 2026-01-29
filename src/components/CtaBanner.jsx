import { forwardRef } from 'react';
import { FormattedMessage } from 'react-intl';

import Banner from '@/components/ui/banner.tsx';
import { Button } from '@/components/ui/button';
import HStack from '@/components/ui/hstack';
import Stack from '@/components/ui/stack';
import Text from '@/components/ui/text';
import useBoundStore from '../stores/boundStore';

const CtaBanner = forwardRef((props, ref) => {
  //const { isOpen } = useRegistrationStatus();
  //const { displayCta } = useSoapboxConfig();
  const me = useBoundStore((state) => state.me);

  if (me) return null;

  return (
    <div ref={ref} data-testid='cta-banner' className='hidden lg:block'>
      <Banner theme='frosted'>
        <HStack alignItems='center' justifyContent='between'>
          <Stack>
            <Text theme='white' size='xl' weight='bold'>
              <FormattedMessage id='signup_panel.title' defaultMessage='New to {site_title}?' values={{ site_title: 'Kollective' }} />
            </Text>

            <Text theme='white' weight='medium' className='opacity-90'>
              <FormattedMessage id='signup_panel.subtitle' defaultMessage="Sign up now to discuss what's happening." />
            </Text>
          </Stack>

          <HStack space={2} alignItems='center'>
            <Button theme='secondary' to='/login'>
              <FormattedMessage id='account.login' defaultMessage='Sign in' />
            </Button>

            <Button theme='accent' to='/signup'>
              <FormattedMessage id='account.register' defaultMessage='Join now' />
            </Button>
          </HStack>
        </HStack>
      </Banner>
    </div>
  );
});

CtaBanner.displayName = 'CtaBanner';

export default CtaBanner;
