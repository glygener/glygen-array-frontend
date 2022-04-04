import React, { useState, useEffect, useReducer } from "react";
import { Loading } from "../components/Loading";
import { Helmet } from "react-helmet";
import { head, getMeta } from "../utils/head";
import { FormLabel, Feedback, PageHeading } from "../components/FormControls";
import { ErrorSummary } from "../components/ErrorSummary";
import { Form, Row, Col, Button, Card } from "react-bootstrap";
import { useHistory, Link } from "react-router-dom";
import { ResumableUploader } from "../components/ResumableUploader";
import { getWsUrl, wsCall } from "../utils/wsUtils";
import "../containers/AddMultiSlideLayout.css";
import "../containers/AddMultipleGlycans.css";
import Container from "@material-ui/core/Container";

const UploadMolecules = props => {
  debugger;
  useEffect(() => {
    props.authCheckAgent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [showLoading, setShowLoading] = useState(false);
  const [showErrorSummary, setShowErrorSummary] = useState(false);
  const [pageErrorsJson, setPageErrorsJson] = useState({});
  const [pageErrorMessage, setPageErrorMessage] = useState("");
  const [uploadedGlycanFile, setUploadedGlycanFile] = useState();

  const [title, setTitle] = useState("Upload Molecules");

  const history = useHistory();

  const defaultFileType = "json";

  const fileDetails = {
    fileType: defaultFileType,
    glytoucanRegistration: false
  };

  const [uploadDetails, setUploadDetails] = useReducer((state, newState) => ({ ...state, ...newState }), fileDetails);

  function handleChange(e) {
    setShowErrorSummary(false);
    const name = e.target.name;
    const value = e.target.value;
    setUploadDetails({ [name]: value });
  }

  function handleSubmit(e) {
    setShowLoading(true);
    setShowErrorSummary(false);

    wsCall(
      "uploadmolecules",
      "POST",
      {
        filetype: encodeURIComponent("Exported From Repository")
        // uploadDetails.fileType
      },
      true,
      {
        identifier: uploadedGlycanFile.identifier,
        originalName: uploadedGlycanFile.originalName,
        fileFolder: uploadedGlycanFile.fileFolder,
        fileFormat: uploadedGlycanFile.fileFormat
      },
      moleculeUploadSucess,
      moleculeUploadError
    );

    e.preventDefault();
  }

  function moleculeUploadSucess(response) {
    response.json().then(resp => {
      setShowErrorSummary(false);
      setShowLoading(false);

      history.push({
        pathname: "/molecules/uploadMoleculesDetails",
        state: { uploadResponse: resp }
      });
    });
  }

  function moleculeUploadError(response) {
    response.json().then(resp => {
      setTitle("Molecule File Upload Details");
      resp.error
        ? setPageErrorMessage("The file is invalid. Please verify the file and format selection before re-uploading.")
        : setPageErrorsJson(resp);
      setShowErrorSummary(true);
      setShowLoading(false);
    });
  }

  return (
    <>
      <Helmet>{/* <title>{head.uploadMolecules.title}</title>
        {getMeta(head.uploadMolecules)} */}</Helmet>
      <Container maxWidth="xl">
        <div className="page-container">
          <PageHeading
            title={title}
            subTitle="Add molecules to your repository by uploading a file using one of the specified file formats."
          />
          <Card>
            <Card.Body>
              {showErrorSummary === true && (
                <ErrorSummary
                  show={showErrorSummary}
                  form="molecules"
                  errorJson={pageErrorsJson}
                  errorMessage={pageErrorMessage}
                ></ErrorSummary>
              )}

              <Form noValidate onSubmit={e => handleSubmit(e)} className="mt-4 mb-4">
                {/* File type */}
                <Form.Group as={Row} controlId="fileType" className="gg-align-center mb-3">
                  <Col xs={12} lg={9}>
                    <FormLabel label="File Type" className="required-asterik" />
                    <Form.Control
                      as="select"
                      name="fileType"
                      placeholder="fileType"
                      onChange={handleChange}
                      required={true}
                      value={uploadDetails.fileType}
                    >
                      <option value="json">JSON</option>
                    </Form.Control>
                    <Feedback message="Please choose a file type for the file to be uploaded" />
                  </Col>
                </Form.Group>

                {/* File Upload */}
                <Form.Group as={Row} controlId="fileUploader" className="gg-align-center mb-35">
                  <Col xs={12} lg={9}>
                    <FormLabel label="Upload File" className="required-asterik" />
                    <ResumableUploader
                      history={history}
                      headerObject={{
                        Authorization: window.localStorage.getItem("token") || "",
                        Accept: "*/*"
                      }}
                      fileType={fileDetails.fileType}
                      uploadService={getWsUrl("upload")}
                      maxFiles={1}
                      setUploadedFile={setUploadedGlycanFile}
                      required={true}
                    />
                  </Col>
                </Form.Group>

                <div className="text-center">
                  <Button className="gg-btn-blue5 gg-btn-outline mt-2 gg-mr-20" onClick={() => history.goBack()}>
                    Back
                  </Button>

                  <Button type="submit" disabled={!uploadedGlycanFile} className="gg-btn-blue mt-2 gg-ml-20">
                    Submit
                  </Button>
                </div>
                <Loading show={showLoading}></Loading>
              </Form>
            </Card.Body>
          </Card>
        </div>
      </Container>
    </>
  );
};

export { UploadMolecules };
