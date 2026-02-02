// /Safety Confirmation Modal
const MoveSettings = () => {
  const myUsername = useAuthStore(s => s.me.username);
  const openConfirm = useConfirmStore(s => s.openConfirm);
  const { mutate: startMove } = useMoveAccount();

  return (
    <>
      <button onClick={() => openConfirm('move-action', myUsername)}>
        Move Account
      </button>

      <SafetyModal onConfirm={() => startMove(targetIdFromStore)} />
    </>
  );
};
