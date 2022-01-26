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
import FormControlLabel from "@material-ui/core/FormControlLabel";
import { BlueCheckbox } from "../components/FormControls";

const AddMultipleGlycans = (props) => {
  useEffect(() => {
    props.authCheckAgent();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [showLoading, setShowLoading] = useState(false);
  const [showErrorSummary, setShowErrorSummary] = useState(false);
  const [pageErrorsJson, setPageErrorsJson] = useState({});
  const [pageErrorMessage, setPageErrorMessage] = useState("");
  const [uploadedGlycanFile, setUploadedGlycanFile] = useState();

  const [title, setTitle] = useState("Add Multiple Glycans");
  // const [title, setTitle] = useState("Glycan File Upload");

  const history = useHistory();

  const defaultFileType = "*/*";

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
      "addmultipleglycans",
      "POST",
      {
        noGlytoucanRegistration: !uploadDetails.glytoucanRegistration,
        filetype: encodeURIComponent(uploadDetails.fileType),
      },
      true,
      {
        identifier: uploadedGlycanFile.identifier,
        originalName: uploadedGlycanFile.originalName,
        fileFolder: uploadedGlycanFile.fileFolder,
        fileFormat: uploadedGlycanFile.fileFormat,
      },
      glycanUploadSucess,
      glycanUploadError
    );

    e.preventDefault();
  }

  function glycanUploadSucess(response) {
    response.json().then((resp) => {
      setShowErrorSummary(false);
      setShowLoading(false);

      history.push({
        pathname: "/glycans/addMultipleGlycanDetails",
        state: { uploadResponse: resp },
      });
    });
  }
  function glycanUploadError(response) {
    response.json().then((resp) => {
      setTitle("Glycan File Upload Details");
      resp.error
        ? setPageErrorMessage("The file is invalid. Please verify the file and format selection before re-uploading.")
        : setPageErrorsJson(resp);
      setShowErrorSummary(true);
      setShowLoading(false);
    });
  }

  return (
    <>
      <Helmet>
        <title>{head.addMultiSlideLayout.title}</title>
        {getMeta(head.addMultiSlideLayout)}
      </Helmet>
      <Container maxWidth="xl">
        <div className="page-container">
          <PageHeading
            title={title}
            subTitle="Add glycans to your repository by uploading a file using one of the specified file formats."
          />
          <Card>
            <Card.Body>
              {showErrorSummary === true && (
                <ErrorSummary
                  show={showErrorSummary}
                  form="glycans"
                  errorJson={pageErrorsJson}
                  errorMessage={pageErrorMessage}
                ></ErrorSummary>
              )}

              <Form noValidate onSubmit={(e) => handleSubmit(e)} className="mt-4 mb-4">
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
                      <option value={defaultFileType}>Select file type for upload</option>
                      <option value="Tab separated">Tab Separated</option>
                      <option value="Library XML">CarbArrayART Library (*.xml)</option>
                      <option value="GlycoWorkbench">GlycoWorkbench (*.gws)</option>
                      <option value="wurcs">WURCS</option>
                      <option value="cfg">CFG IUPAC Condensed</option>
                    </Form.Control>
                    <Feedback message="Please choose a file type for the file to be uploaded" />
                  </Col>
                </Form.Group>

                {/* File Upload */}
                <Form.Group as={Row} controlId="fileUploader" className="gg-align-center mb-35">
                  <Col xs={12} lg={9}>
                    <FormLabel label="Upload Glycan File" className="required-asterik" />
                    <ResumableUploader
                      history={history}
                      headerObject={{
                        Authorization: window.localStorage.getItem("token") || "",
                        Accept: "*/*",
                      }}
                      fileType={fileDetails.fileType}
                      uploadService={getWsUrl("upload")}
                      maxFiles={1}
                      setUploadedFile={setUploadedGlycanFile}
                      required={true}
                    />
                    <Form.Group className="mt-0 pt-0 mb-0" controlId="formBasicCheckbox">
                      <FormControlLabel
                        control={
                          <BlueCheckbox
                            name="glytoucanRegistration"
                            checked={uploadDetails.glytoucanRegistration}
                            onChange={(e) => setUploadDetails({ glytoucanRegistration: e.target.checked })}
                            size="large"
                          />
                        }
                        label="Register for GlyTouCan"
                      />
                    </Form.Group>
                  </Col>
                </Form.Group>

                <div className="text-center">
                  <Link to="/glycans">
                    <Button className="gg-btn-blue5 gg-btn-outline mt-2 gg-mr-20"> Back to Glycans</Button>
                  </Link>

                  <Button
                    type="submit"
                    disabled={!uploadedGlycanFile || uploadDetails.fileType === defaultFileType}
                    className="gg-btn-blue mt-2 gg-ml-20"
                  >
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

export { AddMultipleGlycans };
