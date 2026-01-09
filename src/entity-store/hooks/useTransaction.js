import useBoundStore from "../../stores/boundStore";

function useTransaction() {

  function transaction(changes) {
    useBoundStore.getState().entities.entitiesTransaction(changes);
  }

  return { transaction };
}

export { useTransaction };