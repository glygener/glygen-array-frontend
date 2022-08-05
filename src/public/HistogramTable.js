/* eslint-disable react/display-name */
import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { wsCall } from "../utils/wsUtils";
import ReactTable from "react-table";
import { StructureImage } from "../components/StructureImage";
import { OverlayTrigger, Popover, Row, Col, Form } from "react-bootstrap";
import CardLoader from "../components/CardLoader";
import { ErrorSummary } from "../components/ErrorSummary";
import { Title, FormLabel } from "../components/FormControls";
import { LineTooltip } from "../components/tooltip/LineTooltip";

const HistogramTable = props => {
  let { dataset } = props;
  const [listIntensity, setListIntensity] = useState([]);
  const [pageErrorsJson, setPageErrorsJson] = useState({});
  const [pageErrorMessage, setPageErrorMessage] = useState("");
  const [showErrorSummary, setShowErrorSummary] = useState(false);
  const [selectProcessData, setSelectProcessData] = useState("");
  const [showloading, setShowloading] = useState(true);
  const [listPDs, setListPDS] = useState();

  useEffect(() => {
    let rdList;
    let pdList = [];
    let images;

    dataset.slides.forEach(slide => {
      images = slide.images.filter(i => i.rawDataList);
      images.forEach(img => {
        img.rawDataList.forEach(rd => {
          rdList = rd.processedDataList.filter(e => e.id);
          rdList.forEach(e => {
            pdList.push(e);
          });
        });
      });
    });

    if (pdList) {
      setListPDS(pdList);
      setSelectProcessData(pdList[0].id);
    }

    wsCall(
      "getlistintensities",
      "GET",
      {
        offset: "0",
        processedDataId: pdList && pdList[0].id,
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
      setShowloading(false);
      setShowErrorSummary(false);
    });
  }

  const getIntensitiesTable = () => {
    return (
      <>
        <Title title={"Data"} />
        <Form.Group>
          <Col xs={12} lg={9}>
            <FormLabel label={"Process Data"} />
            <Form.Control
              as="select"
              name="processData"
              value={selectProcessData}
              onChange={e => setSelectProcessData(e.target.options[e.target.value])}
            >
              {listPDs && listPDs.processedDataList && listPDs.processedDataList.length > 0 ? (
                listPDs.processedDataList.map(pd => {
                  return <option>{pd.id}</option>;
                })
              ) : (
                <option>{selectProcessData}</option>
              )}
            </Form.Control>
          </Col>
        </Form.Group>

        <ReactTable
          style={{ minHeight: "355px" }}
          data={listIntensity.rows}
          columns={[
            {
              Header: row => (
              <div className="table-header">
                <LineTooltip text="Glycan ID/Glytoucan ID">
                  <span>Glycan ID/Glytoucan ID</span>
                </LineTooltip>
              </div>
              ),
              accessor: "feature.glycans[0].glycan.id",
              Cell: (row, index) => {
                return (
                  <div key={index}>
                    {row.original.feature.glycans[0].glycan.glytoucanId
                      ? row.original.feature.glycans[0].glycan.glytoucanId
                      : row.original.feature.glycans[0].glycan.id}
                  </div>
                );
              },
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
                ),
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
              accessor: "intensity.rfu",
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
                  <StructureImage base64={row.original.feature.glycans[0].glycan.cartoon} />
                </div>
              ),
              minWidth: 300,
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
