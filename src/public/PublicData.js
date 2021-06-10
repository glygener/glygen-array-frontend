import React from "react";
import Helmet from "react-helmet";
import { head, getMeta } from "../utils/head";
import { PublicListDataset } from "./PublicListDataset";
import { Card } from "react-bootstrap";

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
          margin: "2%"
          // marginTop: window.innerHeight / 8
        }}
      >
        <PublicListDataset />
      </Card>
    </>
  );
};

PublicData.propTypes = {};

export { PublicData };
