import React from "react";
import Helmet from "react-helmet";
import { head, getMeta } from "../utils/head";
import { Card } from "react-bootstrap";
import { DatasetTable } from "../components/DatasetTable";
const PublicData = () => {
  return (
    <>
      <Helmet>
        <title>{head.publicdatalist.title}</title>
        {getMeta(head.publicdatalist)}
      </Helmet>
      <Card
        style={{
          // marginLeft: "5%",
          // marginRight: "5%",
          width: "95%",
          margin: "2%",
          // marginTop: window.innerHeight / 8
        }}
      >
        <DatasetTable wsName="listpublicdataset" />
        {/* <PublicListDataset /> */}
      </Card>
    </>
  );
};

PublicData.propTypes = {};

export { PublicData };
