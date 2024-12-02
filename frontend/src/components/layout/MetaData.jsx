import { Helmet } from "react-helmet";

const MetaData = ({ title }) => {
  return (
    <Helmet>
      <title>{`${title} - Shopico`}</title>
    </Helmet>
  );
};

export default MetaData;
