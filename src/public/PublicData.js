import React from "react";
import Helmet from "react-helmet";
import { head, getMeta } from "../utils/head";
import { Card } from "react-bootstrap";
import { DatasetTable } from "../components/DatasetTable";
import FeedbackWidget from "../components/FeedbackWidget";
const PublicData = () => {
  return (
    <>
      <Helmet>
        <title>{head.publicdatalist.title}</title>
        {getMeta(head.publicdatalist)}
      </Helmet>
      <FeedbackWidget />
      <Card
        style={{
          // marginLeft: "5%",
          // marginRight: "5%",
          width: "95%",
          margin: "2%",
          // marginTop: window.innerHeight / 8
        }}
      >
        <DatasetTable wsName="listpublicdataset" showSearchBox="true"/>
        {/* <PublicListDataset /> */}
      </Card>
    </>
  );
};

PublicData.propTypes = {};

export { PublicData };
