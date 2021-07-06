/* eslint-disable react/prop-types */
import React, { useState, Suspense } from "react";
import "./PublicMetadata.css";
import PropTypes from "prop-types";
import { Link } from "react-scroll";
import ReactTable from "react-table";
import MetadataKeyPairs from "./MetadataKeyPairs";
import { AddBlockLayout } from "../containers/AddBlockLayout";
import { Row, Col, Button, Spinner, Accordion, Card } from "react-bootstrap";
import { ContextAwareToggle } from "../utils/commonUtils";
import { scrollToTop } from "../utils/commonUtils";

const PublicMetadata = props => {
  // const [openSlide, setOpenSlide] = useState("");
  const [viewBlockLayout, setViewBlockLayout] = useState("");

  const metadataPages = [
    {
      title: "Scanner",
      wscall: "getpublicscanner",
      metadataId: props.dataset.images[0] && props.dataset.images[0].scanner && props.dataset.images[0].scanner.id
    },
    {
      title: "Image Analysis",
      wscall: "getpublicimageanalysis",
      metadataId:
        props.dataset.rawDataList[0] &&
        props.dataset.rawDataList[0].metadata &&
        props.dataset.rawDataList[0].metadata.id
    },
    {
      title: "Data Processing",
      wscall: "getpublicdataprocessing",
      metadataId:
        props.dataset.rawDataList[0] &&
        props.dataset.rawDataList[0].processedDataList[0] &&
        props.dataset.rawDataList[0].processedDataList[0].metadata &&
        props.dataset.rawDataList[0].processedDataList[0].metadata.id
    }
  ];

  const getSlides = () => {
    return props.dataset.slides.map(slide => {
      return (
        <>
          <div id={slide.id} key={slide.id + "slide"}>
            <div className={"summary-border"}>
              <h4 className={"slideHeader"}>Slide - {slide.id}</h4>
            </div>

            <div style={{ margin: "15px" }}>
              {slide.printedSlide.layout
                ? getMetadataAccord("layout", getBlocks(slide.printedSlide.layout.blocks), "Layout")
                : ""}

              {slide.printedSlide.metadata && slide.printedSlide.metadata.id
                ? getMetadataAccord(slide.printedSlide.metadata.id, "getslidemetadata", "Slide")
                : ""}

              {slide.printedSlide.printer && slide.printedSlide.printer.id
                ? getMetadataAccord(slide.printedSlide.printer.id, "getpublicprinter", "Printer")
                : ""}

              {slide.metadata && slide.metadata.id
                ? getMetadataAccord(slide.metadata.id, "getpublicassay", "Assay")
                : ""}

              {metadataPages.map(element => {
                return <>{getMetadataAccord(element.metadataId, element.wscall, element.title)}</>;
              })}
            </div>
          </div>
        </>
      );
    });
  };

  const getMetadataAccord = (metadataId, wscall, title) => {
    return (
      <>
        <Accordion key={metadataId} defaultActiveKey={metadataId} style={{ marginBottom: "10px" }}>
          <Card style={{ padding: "0px" }}>
            <Card.Header
            // style={{ backgroundColor: "rgb(184 199 210)" }}
            >
              <Row>
                <Col
                  style={{
                    textAlign: "left"
                  }}
                  className="dataset-subheadings"
                  md={6}
                >
                  {title}
                </Col>
                <Col
                  style={{
                    textAlign: "right"
                  }}
                  className="dataset-subheadings"
                  md={6}
                >
                  <ContextAwareToggle eventKey={metadataId} />
                </Col>
              </Row>
            </Card.Header>

            <Accordion.Collapse eventKey={metadataId}>
              <Card.Body>
                {title.includes("Layout") ? (
                  wscall
                ) : (
                  <Suspense fallback={<Spinner animation="border" variant="info" />}>
                    <MetadataKeyPairs metadataId={metadataId} wsCall={wscall} />
                  </Suspense>
                )}
              </Card.Body>
            </Accordion.Collapse>
          </Card>
        </Accordion>
      </>
    );
  };

  const getTableofContents = () => {
    return (
      <>
        <div
          style={{
            textAlign: "left"
          }}
        >
          <span className={"dataset-headings"}>List of Slides</span>
          &nbsp;
          <Row style={{ marginLeft: "10px" }}>
            Number of Slides on this page: {props.dataset.slides && props.dataset.slides.length}
          </Row>
          &nbsp;
          {props.dataset.slides &&
            props.dataset.slides.map(slide => {
              return (
                <>
                  <Row className={"slideTableofContents"} style={{ marginLeft: "15px" }}>
                    <Link key={slide.id + slide.name} activeClass="active" spy={true} smooth={true} to={slide.id}>
                      {slide.id}
                    </Link>
                  </Row>
                </>
              );
            })}
        </div>
      </>
    );
  };

  const handleChangeBlockLayout = id => {
    setViewBlockLayout(id);
  };

  const getBlocks = blocks => {
    return (
      <div
        style={{
          marginRight: "15px"
        }}
      >
        <ReactTable
          style={{ textAlign: "center" }}
          columns={[
            {
              Header: "Block Id",
              accessor: "id"
            },
            {
              Header: "Row",
              accessor: "row"
            },
            {
              Header: "Column",
              accessor: "column"
            },
            {
              Header: "Spots",
              accessor: "blockLayout.spots.length"
            },
            {
              Header: "Blocklayout",
              // accessor: "blockLayout.id"
              // eslint-disable-next-line react/display-name
              Cell: (row, index) => (
                <div
                  key={row.original.blockLayout.id + "blocklayout" + index}
                  onClick={handleChangeBlockLayout.bind(this, row.original.blockLayout.id)}
                  className={"blocklayout-display"}
                >
                  {row.original.blockLayout.id}
                </div>
              )
            }
          ]}
          data={blocks}
          pageSizeOptions={[5, 10, 25]}
          defaultPageSize={5}
          showPaginationTop
          sortable={true}
        />
        <div id={viewBlockLayout}>
          {viewBlockLayout && (
            <>
              <span className="dataset-subheadings">Block Layout - {viewBlockLayout}</span>
              <AddBlockLayout key={viewBlockLayout} publicView={viewBlockLayout} />
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <div
        style={{
          border: "1px solid rgba(0,0,0,.125)",
          borderRadius: "8px"
        }}
      >
        <Row md={11}>
          <Col>
            {getTableofContents()}
            <br />
            <Row>
              <Col>{getSlides()}</Col>
            </Row>
          </Col>

          <Col md={1}>
            <>{scrollToTop()}</>
          </Col>
        </Row>

        <Row>
          <Col md={{ span: 2, offset: 5 }}>
            <Button style={{ width: "60%", marginBottom: "10px" }} onClick={() => props.setEnableMetadata(false)}>
              Back
            </Button>
          </Col>
        </Row>
      </div>
    </>
  );
};

PublicMetadata.propTypes = {
  setEnableMetadata: PropTypes.func
};

export default PublicMetadata;

/* <FontAwesomeIcon
              key={slide.id}
              icon={["fas", openSlide !== "" && openSlide === slide.id ? "caret-right" : "caret-down"]}
              size="xs"
              title="Collapse and Expand"
              className="table-btn"
              onClick={setOpenSlide.bind(this, openSlide === "" ? slide.id : "")}
            />
            <Collapse in={openSlide !== "" || openSlide === slide.id ? true : false}></Collapse> 
             </Collapse> */
