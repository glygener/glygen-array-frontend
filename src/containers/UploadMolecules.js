import React, { useState, useEffect, useReducer } from "react";
import { Loading } from "../components/Loading";
import { FormLabel, Feedback, PageHeading } from "../components/FormControls";
import { ErrorSummary } from "../components/ErrorSummary";
import { Form, Row, Col, Button, Card } from "react-bootstrap";
import { useHistory } from "react-router-dom";
import { ResumableUploader } from "../components/ResumableUploader";
import { getWsUrl, wsCall } from "../utils/wsUtils";
import "../containers/AddMultiSlideLayout.css";
import "../containers/AddMultipleGlycans.css";
import { getPath } from "../utils/commonUtils";
import Container from "@material-ui/core/Container";
import { HelpToolTip } from "../components/tooltip/HelpToolTip";
import { Typography } from "@material-ui/core";
import wikiHelpTooltip from "../appData/wikiHelpTooltip";

const UploadMolecules = props => {
  useEffect(() => {
    props.authCheckAgent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const history = useHistory();
  const [showLoading, setShowLoading] = useState(false);
  const [showErrorSummary, setShowErrorSummary] = useState(false);
  const [pageErrorsJson, setPageErrorsJson] = useState({});
  const [pageErrorMessage, setPageErrorMessage] = useState("");
  const [uploadedFile, setUploadedFile] = useState();

  const [title, setTitle] = useState(props.moleculeUploadType === "FEATURE" ? "Upload Features" : "Upload Molecules");
  const defaultFileType = "Repository Export (.json)";

  const fileDetails = {
    fileType: defaultFileType,
    glytoucanRegistration: false,
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
      props.moleculeUploadType === "FEATURE" ? "uploadfeature" : "uploadmolecules",
      "POST",
      {
        filetype: encodeURIComponent(defaultFileType),
        type: encodeURIComponent(props.moleculeUploadType),
        // uploadDetails.fileType
      },
      true,
      {
        identifier: uploadedFile.identifier,
        originalName: uploadedFile.originalName,
        fileFolder: uploadedFile.fileFolder,
        fileFormat: uploadedFile.fileFormat,
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
        pathname: `/${getPath(props.moleculeUploadType)}/uploadMoleculeDetails`,
        state: {
          uploadResponse: resp,
          type: props.moleculeUploadType,
        },
      });
    });
  }

  function moleculeUploadError(response) {
    response.json().then(resp => {
      setTitle("Molecule File Upload Details");
      !resp.errors
        ? setPageErrorMessage("The file is invalid. Please verify the file and format selection before re-uploading.")
        : setPageErrorsJson(resp);
      setShowErrorSummary(true);
      setShowLoading(false);
    });
  }

  return (
    <>
      <Container maxWidth="xl">
        <div className="page-container">
          <PageHeading
            title={title}
            subTitle="Add molecules to your repository by uploading a file using one of the specified file formats."
          />
          <Typography className="text-right" gutterBottom>
            <HelpToolTip title={title} text={wikiHelpTooltip.tooltip_text} url={props.wikiUrl} />
            {wikiHelpTooltip.help_text}
          </Typography>
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
                      <option value="Repository Export (.json)">Repository Export (*.json)</option>
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
                        Accept: "*/*",
                      }}
                      fileType={fileDetails.fileType}
                      uploadService={getWsUrl("upload")}
                      maxFiles={1}
                      setUploadedFile={setUploadedFile}
                      required={true}
                    />
                  </Col>
                </Form.Group>

                <div className="text-center">
                  <Button className="gg-btn-blue5 gg-btn-outline mt-2 gg-mr-20" onClick={() => history.goBack()}>
                    Back
                  </Button>

                  <Button type="submit" disabled={!uploadedFile} className="gg-btn-blue mt-2 gg-ml-20">
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
