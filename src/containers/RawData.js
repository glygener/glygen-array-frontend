import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { GlygenTable } from "../components/GlygenTable";
import { Col, ButtonToolbar } from "react-bootstrap";

const RawData = props => {
  return (
    <>
      {/* <Helmet>
        <title>{head.rawdata.title}</title>
        {getMeta(head.rawdata)}
      </Helmet> 

      <div className="page-container">
        <h1>Raw Data</h1> */}
      <ButtonToolbar>
        <Col md={{ span: 2 }}>
          <Link to={`/rawdata/addRawdata/${props.experimentId}`} className="link-button">
            Add Raw Data
          </Link>
        </Col>
      </ButtonToolbar>
      &nbsp;
      <GlygenTable
        columns={[
          {
            Header: "Id",
            accessor: "id"
          },
          {
            Header: "Status",
            accessor: "status"
          },

          {
            Header: "File Name",
            accessor: "file.originalName",
            // eslint-disable-next-line react/display-name
            Cell: (row, index) =>
              row.original.file && row.original.file.originalName ? (
                <div key={index} title={row.original.file.originalName}>
                  {row.original.file.originalName}
                </div>
              ) : (
                ""
              ),
            minWidth: 120
          }
        ]}
        defaultPageSize={10}
        defaultSortColumn="id"
        showDeleteButton
        commentsRefColumn="description"
        data={props.data}
        deleteWS="deleterawdata"
        queryParamDelete={`${props.experimentId}`}
        enableRefreshOnAction={props.enableRefreshOnAction}
        editUrl="rawdata/editRawdata"
        keyColumn="id"
        infoRowsText="Raw Data"
      />
      {/* </div> */}
    </>
  );
};

RawData.propTypes = {
  experimentId: PropTypes.string,
  data: PropTypes.array,
  enableRefreshOnAction: PropTypes.func
};

export { RawData };
