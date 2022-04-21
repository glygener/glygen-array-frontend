/* eslint-disable react/display-name */
import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { wsCall } from "../utils/wsUtils";
import ReactTable from "react-table";
import { StructureImage } from "../components/StructureImage";
import { OverlayTrigger, Popover, Row, Col } from "react-bootstrap";
import CardLoader from "../components/CardLoader";
import { ErrorSummary } from "../components/ErrorSummary";
import { Title } from "../components/FormControls";

const HistogramTable = props => {
  let { dataset } = props;
  const [listIntensity, setListIntensity] = useState([]);
  const [pageErrorsJson, setPageErrorsJson] = useState({});
  const [pageErrorMessage, setPageErrorMessage] = useState("");
  const [showErrorSummary, setShowErrorSummary] = useState(false);
  const [showloading, setShowloading] = useState(true);

  useEffect(() => {
    let rdList = dataset && dataset.rawDataList && dataset.rawDataList.length > 0 ? dataset.rawDataList[0] : undefined;
    let pdList =
      rdList && rdList.processedDataList && rdList.processedDataList.length > 0
        ? rdList.processedDataList[0]
        : undefined;

    wsCall(
      "getlistintensities",
      "GET",
      {
        offset: "0",
        processedDataId: pdList && pdList.id,
        datasetId: dataset.id
      },
      false,
      null,
      response =>
        response.json().then(responseJson => {
          setListIntensity(responseJson);
          setShowloading(false);
        }),
      errorWscall
    );
  }, []);

  function errorWscall(response) {
    response.json().then(responseJson => {
      setPageErrorsJson(responseJson);
      setPageErrorMessage("");
      setShowErrorSummary(false);
    });
  }

  const getIntensitiesTable = () => {
    return (
      <>
        <Title title={"Data"} />
        <ReactTable
          style={{ minHeight: "355px" }}
          data={listIntensity.rows}
          columns={[
            {
              Header: () => <div className={"table-header"}>{"GlycanId / GlytoucanId"}</div>,
              accessor: "feature.glycans[0].glycan.id",
              Cell: (row, index) => {
                return (
                  <div key={index}>
                    {row.original.feature.glycans[0].glycan.glytoucanId
                      ? row.original.feature.glycans[0].glycan.glytoucanId
                      : row.original.feature.glycans[0].glycan.id}
                  </div>
                );
              }
            },
            {
              Header: () => <div className={"table-header"}>{"Linker Name"}</div>,
              // accessor: "feature.linker.name",
              Cell: (row, index) =>
                row.original.feature.linker ? (
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
                                <Col>{row.original.feature.linker.name}</Col>
                              </Row>
                              <Row>
                                <Col style={{ fontWeight: "bold" }}>ID</Col>
                                <Col>{row.original.feature.linker.id}</Col>
                              </Row>
                              <Row>
                                <Col style={{ fontWeight: "bold" }}>Inchi Sequence</Col>
                                <Col style={{ textAlign: "justify" }}>{row.original.feature.linker.inChiSequence}</Col>
                              </Row>
                            </>
                          </Popover.Content>
                        </Popover>
                      }
                    >
                      <div>{row.original.feature.linker.name}</div>
                    </OverlayTrigger>
                  </>
                ) : (
                  <div key={index}></div>
                )
              // minWidth: 80
            },
            {
              Header: () => <div className={"table-header"}>{"Intensity RFU"}</div>,
              accessor: "intensity.rfu"
            },
            {
              Header: () => <div className={"table-header"}>{"Structure Image"}</div>,
              accessor: "cartoon",
              Cell: row => (
                <div style={{ height: "100px" }}>
                  <StructureImage base64={row.original.feature.glycans[0].glycan.cartoon} />
                </div>
              ),
              minWidth: 300
            }
          ]}
          // className={"-striped -highlight"}
          defaultPageSize={5}
          loading={listIntensity.length <= 1 ? true : false}
          loadingText={"loading..."}
          showPaginationTop={true}
          showPaginationBottom={false}
          showPageSizeOptions={true}
        />
      </>
    );
  };
  if (showErrorSummary) {
    return (
      <ErrorSummary
        show={showErrorSummary}
        form="histogramtable"
        errorJson={pageErrorsJson}
        errorMessage={pageErrorMessage}
      />
    );
  }

  return (
    <>
      <CardLoader pageLoading={showloading} />
      {getIntensitiesTable()}
    </>
  );
};

HistogramTable.propTypes = {
  dataset: PropTypes.object,
  pageLoading: PropTypes.bool
};

export default HistogramTable;
