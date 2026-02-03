import { useAccountLookup } from "../api/useAccountLookup";

const AccountByHandle = ({ handle }) => {
  const { data: account, isLoading, isError } = useAccountLookup(handle);

  if (isLoading) return <LoadingSpinner />;
  if (isError || !account) return <NotFound />;

  // Redirect or render the profile
  return <AccountProfile id={account.id} />;
};

export default AccountByHandle;