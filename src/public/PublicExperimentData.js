import React, { useState, useEffect }  from "react";
import { useParams } from "react-router-dom";
import Helmet from "react-helmet";
import { head, getMeta } from "../utils/head";
import { Card } from "react-bootstrap";
import Container from "@material-ui/core/Container";
import { PageHeading } from "../components/FormControls";
import { CardDescriptor } from "../components/CardDescriptor";
import { ErrorSummary } from "../components/ErrorSummary";
import CardLoader from "../components/CardLoader";
import { wsCall } from "../utils/wsUtils";
import { Link } from "react-router-dom";

const PublicExperimentData = () => {
  let { datasetId }  = useParams();

  const [pageErrorsJson, setPageErrorsJson] = useState({});
  const [duplicateName, setDuplicateName] = useState(false);
  const [pageErrorMessage, setPageErrorMessage] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showErrorSummary, setShowErrorSummary] = useState(false);
  const [dataset, setDataset] = useState();
  const [showLoading, setShowLoading] = useState(false);

  useEffect(() => {
    setShowLoading(true);
    wsCall(
      "getpublicdataset",
      "GET",
      { qsParams: { offset: "0", loadAll: false }, urlParams: [datasetId] },
      false,
      null,
      response =>
        response.json().then(responseJson => {
          setDataset(responseJson);
          setShowLoading(false);
        }),
      errorWscall
    );
  }, []);

  function errorWscall(response) {
    response.json().then(responseJson => {
      setPageErrorsJson(responseJson);
      setPageErrorMessage("");
      setShowErrorSummary(true);
      setShowLoading(false);
    });
  }


  return (
    <>
      <Helmet>
        <title>{head.publicdatalist.title}</title>
        {getMeta(head.publicdatalist)}
      </Helmet>
      <CardLoader pageLoading={showLoading} />
        <div className="page-container">
          <Container maxWidth="xl">
            <PageHeading
              title={`Metadata for Dataset ${dataset && dataset.name ? dataset.name : ""}`}
              subTitle={<Link to={`/data/dataset/${datasetId}`}>{"Back to dataset"}</Link>}
            />


        <Card>
          <Card.Body>
            {showErrorSummary === true && (
              <ErrorSummary
                show={showErrorSummary}
                form="experiments"
                errorJson={pageErrorsJson}
                errorMessage={pageErrorMessage}
              />
            )}
          <div class="mb-4">
            <Card>
              <Card.Header>
                  <Card.Title id="contained-modal-title-vcenter">
                    {"Table of Content"}
                  </Card.Title>
              </Card.Header>
              <Card.Body>
                {dataset && <>
                  <ul style={{listStyleType: "disc"}} key={"ol" + 1} className="pl-3 mb-0">
                    <li key={"li" + 1}>
                      <span className="nowrap">
                        <a href={'#' + dataset.id}>{"Dataset"}: {dataset ? dataset.name : ""}</a>{" "}
                      </span>
                    </li>
                    <ul style={{listStyleType: "disc"}} key={"ol" + 2} className="pl-3">
                    {dataset.slides && dataset.slides.map((slide, index) => (<>
                      <li key={"li" + index}>
                        <span className="nowrap">
                          <a href={'#' + slide.id}>{"Slide"}: {slide.printedSlide && slide.printedSlide.metadata ? slide.printedSlide.metadata.name : ""}</a>{" "}
                        </span>
                      </li>
                      <ul style={{listStyleType: "disc"}} key={"ol" + index} className="pl-3">
                        {slide.images && slide.images.map((img, indImg) => 
                          <>
                            <li key={"li" + indImg}>
                              <span className="nowrap">
                                <a href={'#' + img.id}>{"Image"}: {img && img.file ? img.file.originalName : "No Image Provided"}</a>{" "}
                              </span>
                            </li>
                            <ul style={{listStyleType: "disc"}} key={"ol" + indImg} className="pl-3">
                              {img.rawDataList && img.rawDataList.map((rawData, indRaw) => 
                              <>
                                <li key={"li" + indRaw}>
                                  <span className="nowrap">
                                    <a href={'#' + rawData.id}>{"Raw Data"}: {rawData && rawData.file ? rawData.file.originalName : "No Raw Data Provided"}</a>{" "}
                                  </span>
                                </li>
                                <ul style={{listStyleType: "disc"}} key={"ol" + indRaw} className="pl-3">
                                {rawData.processedDataList && rawData.processedDataList.map((pd, indPd) => 
                                <>
                                  <li key={"li" + indPd}>
                                    <span className="nowrap">
                                      <a href={'#' + pd.id}>{"Process Data"}: {pd && pd.file ? pd.file.originalName : ""}</a>{" "}
                                    </span>
                                  </li>
                                </>
                              )}
                              </ul>
                              </>
                              )}
                            </ul>
                        </>
                        )}
                        </ul>
                        </>
                      ))}
                    </ul>
                  </ul>
                </>}
              </Card.Body>
          </Card>
          </div>
          {dataset && <div class="mb-4" id={dataset.id}>
            <Card>
              <Card.Header closeButton>
                  <Card.Title id="contained-modal-title-vcenter">
                    {"Dataset"}: {dataset ? dataset.name : ""}
                  </Card.Title>
              </Card.Header>
              <Card.Body>
                <CardDescriptor metadataId={dataset.sample ? dataset.sample.id : undefined} wsCall={"getpublicsample"} useToken={ false } name={"Sample"}  isSample={true}/>
              </Card.Body>
            </Card>
          </div>}
          {dataset && dataset.slides &&
          dataset.slides.map((slide, index) => {
            return (
                <>
                {dataset && <div class="mb-4" id={slide.id}>
                  <Card>
                    <Card.Header closeButton>
                        <Card.Title id="contained-modal-title-vcenter">
                          {"Slide"}: {slide.printedSlide && slide.printedSlide.metadata ? slide.printedSlide.metadata.name : ""}
                        </Card.Title>
                    </Card.Header>
                    <Card.Body>
                    <div>
                      <CardDescriptor metadataId={slide.metadata ? slide.metadata.id : undefined} wsCall={"getpublicassay"} useToken={ false } name={"Assay Metadata"}/>
                    </div>
                    <div className="pt-3">
                      <CardDescriptor metadataId={slide.printedSlide && slide.printedSlide.metadata ? slide.printedSlide.metadata.id : undefined} wsCall={"getslidemetadata"} useToken={ false } name={"Printed Slide Metadata"}/>
                    </div>
                    <div className="pt-3">
                      <CardDescriptor metadataId={slide.printedSlide && slide.printedSlide.printRun ? slide.printedSlide.printRun.id : undefined} wsCall={"getpublicprintrun"} useToken={ false } name={"Print Run"}/>
                    </div>
                    <div className="pt-3">
                      <CardDescriptor metadataId={slide.printedSlide && slide.printedSlide.printer ? slide.printedSlide.printer.id : undefined} wsCall={"getpublicprinter"} useToken={ false } name={"Printer"}/>
                    </div>
                    </Card.Body>
                  </Card>
                </div>}
                  {slide.images &&
                    slide.images.map(img => {
                      return (
                        <>
                        {dataset && <div class="mb-4" id={img.id}>
                        <Card>
                          <Card.Header>
                              <Card.Title id="contained-modal-title-vcenter">
                                {"Image"}: {img && img.file ? img.file.originalName : "No Image Provided"}
                              </Card.Title>
                          </Card.Header>
                          <Card.Body>
                            <CardDescriptor metadataId={img.scanner ? img.scanner.id : undefined} wsCall={"getpublicscanner"} useToken={ false } name={"Scanner Metadata"}/>
                          </Card.Body>
                        </Card>
                        </div>}
                        {img.rawDataList &&
                          img.rawDataList.map(rawData => {
                            return (
                              <>
                               {dataset && <div class="mb-4" id={rawData.id}>
                               <Card>
                                <Card.Header>
                                    <Card.Title id="contained-modal-title-vcenter">
                                      {"Raw Data"}: {rawData && rawData.file ? rawData.file.originalName : "No Raw Data Provided"}
                                    </Card.Title>
                                </Card.Header>
                                <Card.Body>
                                  <CardDescriptor metadataId={rawData.metadata ? rawData.metadata.id : undefined} wsCall={"getpublicimageanalysis"} useToken={ false } name={"Image Analysis"}/>
                                </Card.Body>
                                </Card>
                                </div>}
                                {rawData.processedDataList &&
                                  rawData.processedDataList.map(pd => {
                                    return (
                                      <>
                                      {dataset && <div class="mb-4" id={pd.id}>
                                      <Card>
                                        <Card.Header>
                                            <Card.Title id="contained-modal-title-vcenter">
                                              {"Process Data"}: {pd && pd.file ? pd.file.originalName : ""}
                                            </Card.Title>
                                        </Card.Header>
                                        <Card.Body>
                                          <CardDescriptor metadataId={pd.metadata ? pd.metadata.id : undefined} wsCall={"getpublicdataprocessing"} useToken={ false } name={"Data Processing"}/>
                                        </Card.Body>
                                      </Card>
                                      </div>}
                                      </>
                                    );
                                  })}
                              </>
                            );
                          })}
                        </>
                      );
                    })}
                </>
            );
          })}

                {/* {dataset && <div class="mb-4">
                <CardDescriptor metadataId={"SA5563051"} wsCall={"getpublicsample"} useToken={ false } name={"Sample"}  isSample={true}/>
                </div>}
                {dataset && <div class="mb-4">
                <CardDescriptor metadataId={"A3254914"} wsCall={"getpublicassay"} useToken={ false } name={"Assay Metadata"}  isSample={false}/>
                </div>}
                {dataset && <div class="mb-4">
                <CardDescriptor metadataId={"SA5563051"} wsCall={"getslidemetadata"} useToken={ false } name={"Printed Slide Metadata"}  isSample={true}/>
                </div>}
                {dataset && <div class="mb-4">
                <CardDescriptor metadataId={"SA5563051"} wsCall={"getpublicprintrun"} useToken={ false } name={"Print Run"}  isSample={true}/>
                </div>}
                {dataset && <div class="mb-4">
                <CardDescriptor metadataId={"SA5563051"} wsCall={"getpublicprinter"} useToken={ false } name={"Printer"}  isSample={true}/>
                </div>}
                {dataset && <div class="mb-4">
                <CardDescriptor metadataId={"Sc5227357"} wsCall={"getpublicscanner"} useToken={ false } name={"Scanner Metadata"}  isSample={true}/>
                </div>}
                {dataset && <div class="mb-4">
                <CardDescriptor metadataId={"Im6761994"} wsCall={"getpublicimageanalysis"} useToken={ false } name={"Image Analysis"}  isSample={true}/>
                </div>}
                {dataset && <div class="mb-4">
                <CardDescriptor metadataId={"DPM6390096"} wsCall={"getpublicdataprocessing"} useToken={ false } name={"Data Processing"}  isSample={true}/>
                </div>} */}
              </Card.Body>
        </Card>
      </Container>
    </div>
    </>
  );
};

PublicExperimentData.propTypes = {};

export { PublicExperimentData };
