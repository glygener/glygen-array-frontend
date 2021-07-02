/* eslint-disable react/prop-types */
import React, { useEffect } from "react";
import "../containers/Features.css";
import PropTypes from "prop-types";
import Helmet from "react-helmet";
import { head, getMeta } from "../utils/head";
import { Col } from "react-bootstrap";
import { Link } from "react-router-dom";
import { GlygenTable } from "../components/GlygenTable";
import displayNames from "../appData/displayNames";
import { Title } from "../components/FormControls";

const Features = props => {
  useEffect(props.authCheckAgent, []);
  return (
    <>
      <Helmet>
        <title>{head.features.title}</title>
        {getMeta(head.features)}
      </Helmet>

      <div className="page-container">
        <Title title="Features" />

        <Col className={"col-link-button"}>
          <Link to="/features/addfeature" className="link-button" style={{ width: "150px" }}>
            Add Feature
          </Link>
        </Col>

        <GlygenTable
          columns={[
            {
              Header: "Name",
              accessor: "name",
              // eslint-disable-next-line react/display-name
              Cell: ({ row }, index) => <div key={index}>{row.name ? row.name : row.id}</div>
            },
            {
              Header: "Feature Id",
              accessor: "internalId"
            },
            {
              Header: "Type",
              accessor: "type",
              Cell: row => displayNames.feature[row.value]
            },
            {
              Header: "Linker",
              accessor: "linker",
              // eslint-disable-next-line react/display-name
              Cell: ({ value, index }) =>
                value && value.name ? (
                  <Link key={index} to={"/linkers/editlinker/" + value.id} target="_blank">
                    {value.name}
                  </Link>
                ) : (
                  ""
                )
            },
            {
              Header: "Linker Type",
              accessor: "linker",
              // eslint-disable-next-line react/display-name
              Cell: ({ value, index }) => <div key={index}>{value && displayNames.linker[value.type]}</div>
            },
            {
              Header: "Glycans",
              accessor: "glycans",
              // eslint-disable-next-line react/display-name
              Cell: (row, index) => (
                <div key={index}>
                  {row.value
                    ? row.value.map((glycan, i) => (
                        <div key={i}>
                          <Link to={"/glycans/editglycan/" + glycan.id} target="_blank">
                            {glycan.name}
                          </Link>
                          <br />
                        </div>
                      ))
                    : ""}
                </div>
              )
            }
          ]}
          defaultPageSize={10}
          showDeleteButton
          showEditButton
          showSearchBox
          commentsRefColumn="name"
          fetchWS="featurelist"
          deleteWS="featuredelete"
          editUrl="features/editfeature"
          keyColumn="id"
          showRowsInfo
          infoRowsText="Features"
        />
      </div>
    </>
  );
};

Features.propTypes = {
  authCheckAgent: PropTypes.func
};

export { Features };
