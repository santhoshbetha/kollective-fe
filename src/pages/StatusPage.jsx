import Layout from "../components/Layout.jsx";
import CtaBanner from "../components/CtaBanner.jsx";

const StatusPage = ({ children }) => {
  // const me = useBoundStore(state => state.me);

  return (
    <>
      <Layout.Main>
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Status</h1>
          <p className="text-muted-foreground">Check your account status and platform updates</p>
        </div>
        {children}

        <CtaBanner />
      </Layout.Main>
    </>
  );
};

export default StatusPage;
