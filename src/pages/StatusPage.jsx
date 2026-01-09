import useBoundStore from "../stores/boundStore";
import Layout from "../components/Layout.jsx";
import CtaBanner from "../components/CtaBanner.jsx";

const StatusPage = ({ children }) => {
  const me = useBoundStore(state => state.me);

  return (
    <>
      <Layout.Main>
        {children} 

        {true && (
          <CtaBanner />
        )}
      </Layout.Main>
    </>
  );
};

export default StatusPage;
