import React, { useState, useEffect, useReducer } from "react";
import { Loading } from "../components/Loading";
import { Helmet } from "react-helmet";
import { head, getMeta } from "../utils/head";
import { Title, Feedback, FormLabel } from "../components/FormControls";
import { ErrorSummary } from "../components/ErrorSummary";
import { Form, Row, Col } from "react-bootstrap";
import { useHistory, Link } from "react-router-dom";
import { ResumableUploader } from "../components/ResumableUploader";
import { getWsUrl, wsCall } from "../utils/wsUtils";
import "../containers/AddMultiSlideLayout.css";

const AddMultipleGlycans = props => {
  useEffect(() => {
    props.authCheckAgent();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [showLoading, setShowLoading] = useState(false);
  const [showErrorSummary, setShowErrorSummary] = useState(false);
  const [pageErrorsJson, setPageErrorsJson] = useState({});
  const [pageErrorMessage, setPageErrorMessage] = useState("");
  const [fileSubmitted, setFileSubmitted] = useState(false);
  const [uploadedGlycanFile, setUploadedGlycanFile] = useState();
  const history = useHistory();

  const defaultFileType = "*/*";

  const fileDetails = {
    fileType: defaultFileType
  };

  const [uploadDetails, setUploadDetails] = useReducer((state, newState) => ({ ...state, ...newState }), fileDetails);

  function handleChange(e) {
    const name = e.target.name;
    const value = e.target.value;

    setUploadDetails({ [name]: value });
  }

  const saveGALSlidelayout = fileId => {
    setShowLoading(true);
    wsCall(
      "addmultipleglycans",
      "POST",
      {
        noGlytoucanRegistration: true,
        fileType: encodeURIComponent(uploadDetails.fileType)
      },
      true,
      {
        file: uploadedGlycanFile
      },
      glycanUploadSucess,
      glycanUploadError,
      {
        Accept: "application/json, multipart/form-data",
        "Content-Type": "application/json"
      }
    );
    function glycanUploadSucess() {}
    function glycanUploadError() {}
  };

  return (
    <>
      <Helmet>
        <title>{head.addMultiSlideLayout.title}</title>
        {getMeta(head.addMultiSlideLayout)}
      </Helmet>

      <div className="page-container">
        <Title title="Add Multiple Glycans" />

        {/* {getGalErrorDisplay()} */}

        {showErrorSummary === true && (
          <div
            style={{
              textAlign: "initial"
            }}
          >
            <br />
            <h5>File upload failed for following reasons:</h5>

            <ErrorSummary
              show={showErrorSummary}
              form="importGlycans"
              errorJson={pageErrorsJson}
              errorMessage={pageErrorMessage}
            ></ErrorSummary>

            {fileSubmitted && (
              <Row className="line-break-1">
                <Col
                  md={{ span: 3 }}
                  style={{
                    marginLeft: "42%"
                  }}
                >
                  <Link to="/glycans" className="link-button">
                    Back to Glycans
                  </Link>
                </Col>
              </Row>
            )}
          </div>
        )}

        {// Object.keys(tabs).length === 0 &&
        !fileSubmitted && (
          <>
            <Form.Group as={Row} controlId="fileType">
              <FormLabel label="Choose File type for upload" className="required-asterik" />
              <Col md={4}>
                <Form.Control
                  as="select"
                  name="fileType"
                  placeholder="fileType"
                  onChange={handleChange}
                  required={true}
                  value={uploadDetails.fileType}
                >
                  <option value={defaultFileType}>Select file type</option>
                  <option value="Tab separated">Tab Separated</option>
                  <option value="Library XML">Library XML</option>
                  <option value="GlycoWorkbench">GlycoWorkbench</option>
                </Form.Control>
                <Feedback message="Please choose a file type for the file to be uploaded"></Feedback>
              </Col>
            </Form.Group>

            {uploadDetails.fileType !== defaultFileType && (
              <Form.Group as={Row} controlId="fileUploader">
                <Col md={{ offset: 2, span: 8 }}>
                  <ResumableUploader
                    history={history}
                    headerObject={{
                      Authorization: window.localStorage.getItem("token") || "",
                      Accept: "*/*"
                    }}
                    fileType={fileDetails.fileType}
                    uploadService={getWsUrl("upload")}
                    setUploadedFile={setUploadedGlycanFile}
                    maxFiles={1}
                    onProcessFile={saveGALSlidelayout}
                    enableSubmit
                  />
                </Col>
              </Form.Group>
            )}
          </>
        )}

        {/* {fileSubmitted && getSlidesFromLibrary(tableData)} */}

        <Loading show={showLoading}></Loading>
      </div>
    </>
  );
};

export { AddMultipleGlycans };
