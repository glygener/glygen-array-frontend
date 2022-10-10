/* eslint-disable react/display-name */
import React from "react";
import PropTypes from "prop-types";
import ReactTable from "react-table";
import { StructureImage } from "../components/StructureImage";
import { OverlayTrigger, Popover, Row, Col } from "react-bootstrap";
import { LineTooltip } from "../components/tooltip/LineTooltip";

const HistogramTable = props => {
  let { listIntensityTable } = props;

  const getIntensitiesTable = () => {
    return (
      <>
        <ReactTable
          style={{ minHeight: "355px" }}
          data={listIntensityTable}
          columns={[
            {
              Header: row => (
              <div className="table-header">
                <LineTooltip text="Glytoucan ID / Glycan ID">
                  <span><span>Glytoucan ID / </span><span style={{ fontStyle: "italic" }}>Glycan ID</span></span>
                </LineTooltip>
              </div>
              ),
              accessor: "id",
              Cell: (row, index) => {
                return (
                  <div key={index}>
                    {row.original.glytoucanId === true
                      ? <span>{row.original.id}</span>
                      : <span style={{ fontStyle: "italic" }}>{row.original.id}</span>}
                  </div>
                );
              },
              minWidth: 130,
              sortable: true
            },
            {
              // Header: () => <div className={"table-header"}>{"Linker Name"}</div>,
              Header: row => (
                <div className="table-header">
                  <LineTooltip text="Linker Name">
                    <span>Linker Name</span>
                  </LineTooltip>
                </div>
                ),
              accessor: "linkerName",
              Cell: (row, index) =>
                row.original.linkerName ? (
                  <>
                    <OverlayTrigger
                      key={index}
                      trigger="hover"
                      placement="right"
                      rootClose
                      overlay={
                        <Popover>
                          <Popover.Title as="h3">Linker </Popover.Title>
                          <Popover.Content>
                            <>
                              <Row>
                                <Col style={{ fontWeight: "bold" }}>Name</Col>
                                <Col>{row.original.linkerName}</Col>
                              </Row>
                              <Row>
                                <Col style={{ fontWeight: "bold" }}>ID</Col>
                                <Col>{row.original.linkerId}</Col>
                              </Row>
                              <Row>
                                <Col style={{ fontWeight: "bold" }}>Inchi Sequence</Col>
                                <Col style={{ textAlign: "justify" }}>{row.original.inChiSequence}</Col>
                              </Row>
                            </>
                          </Popover.Content>
                        </Popover>
                      }
                    >
                      <div>{row.original.linkerName}</div>
                    </OverlayTrigger>
                  </>
                ) : (
                  <div key={index}></div>
                ),
              sortable: true
              // minWidth: 80
            },
            {
              // Header: () => <div className={"table-header"}>{"Intensity RFU"}</div>,
              Header: row => (
                <div className="table-header">
                  <LineTooltip text="Intensity RFU">
                    <span>Intensity RFU</span>
                  </LineTooltip>
                </div>
                ),
              accessor: "rfu",
              sortable: true
            },
            {
              // Header: () => <div className={"table-header"}>{"Structure Image"}</div>,
              Header: row => (
                <div className="table-header">
                  <LineTooltip text="Structure Image">
                    <span>Structure Image</span>
                  </LineTooltip>
                </div>
                ),
              accessor: "cartoon",
              Cell: row => (
                <div style={{ height: "auto" }}>
                  <StructureImage base64={row.original.cartoon} />
                </div>
              ),
              minWidth: 300,
              sortable: false
            },
          ]}
          // className={"-striped -highlight"}
          defaultPageSize={5}
          minRows={0}
          className="MyReactTableClass"
          NoDataComponent={({ state, ...rest }) =>
            !state?.loading ? (
              <p className="pt-2 text-center">
                <strong>No data available</strong>
              </p>
            ) : null
          }
          loading={listIntensityTable.length <= 1 ? true : false}
          loadingText={"loading..."}
          showPaginationTop={true}
          showPaginationBottom={false}
          showPageSizeOptions={true}
        />
      </>
    );
  };

  return (
    <>
      {getIntensitiesTable()}
    </>
  );
};

HistogramTable.propTypes = {
  dataset: PropTypes.object,
  pageLoading: PropTypes.bool
};

export default HistogramTable;
