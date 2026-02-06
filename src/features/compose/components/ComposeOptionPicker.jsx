import React from 'react';
import { Button, Stack, Text } from 'soapbox-ui'; // Replace with actual internal UI lib paths

/*interface Option<T> {
  value: T;
  label: string;
  icon?: string;
}

interface ComposeOptionPickerProps<T> {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
  label: string;
}*/

export const ComposeOptionPicker = ({
  options,
  value,
  onChange,
  label
}) => (
  <Stack spacing={2}>
    <Text size="sm" weight="bold">{label}</Text>
    <Stack direction="row" spacing={1}>
      {options.map((opt) => (
        <Button
          key={opt.value}
          variant={value === opt.value ? 'primary' : 'outline'}
          onClick={() => onChange(opt.value)}
        >
          {opt.icon && <i className={opt.icon} />} {opt.label}
        </Button>
      ))}
    </Stack>
  </Stack>
);

/*
Call the Picker in your main ComposeForm:

<ComposeOptionPicker 
  label="Post Privacy"
  options={PRIVACY_OPTIONS} 
  value={privacyState} 
  onChange={setPrivacy} 
/>

*/

/*
Delete specialized selector files (e.g., PrivacySelector.tsx).
Define Options in a central compose/constants.ts file:

    PRIVACY_OPTIONS = [{ value: 'public', label: 'Public', icon: 'fa-globe' }, ...]
    LANG_OPTIONS = [{ value: 'en', label: 'English' }, ...]

Call the Picker in your main ComposeForm:
*/

/*
This single component can replace multiple files by passing in the specific options and state handlers:
*/

/*
Once you move the code to this path, you can delete the following files (or their equivalents) to complete the reduction:

    src/features/compose/components/PrivacySelector.tsx
    src/features/compose/components/LanguageSelector.tsx
    src/features/compose/components/PollOptionPicker.tsx (if applicable)
*/