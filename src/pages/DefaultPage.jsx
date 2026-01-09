import Layout from "../components/Layout";
import CtaBanner from "../components/CtaBanner";

const DefaultPage = ({ children }) => { 
    
  return (
    <>
      <Layout.Main>
        {children}
      </Layout.Main>

    </>
  );
}

export default DefaultPage;