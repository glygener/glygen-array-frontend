import React, { useState, useEffect, useReducer } from "react";
import { Loading } from "../components/Loading";
import { Helmet } from "react-helmet";
import { head, getMeta } from "../utils/head";
import { Feedback, FormLabel, PageHeading } from "../components/FormControls";
import { ErrorSummary } from "../components/ErrorSummary";
import { Form, Row, Col, Button, Card } from "react-bootstrap";
import { useHistory, Link } from "react-router-dom";
import { ResumableUploader } from "../components/ResumableUploader";
import { getWsUrl, wsCall } from "../utils/wsUtils";
import "../containers/AddMultiSlideLayout.css";
import "../containers/AddMultipleGlycans.css";
import Container from "@material-ui/core/Container";

const AddMultipleGlycans = props => {
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
      "addmultipleglycans",
      "POST",
      {
        noGlytoucanRegistration: !uploadDetails.glytoucanRegistration,
        filetype: encodeURIComponent(uploadDetails.fileType)
      },
      true,
      {
        identifier: uploadedGlycanFile.identifier,
        originalName: uploadedGlycanFile.originalName,
        fileFolder: uploadedGlycanFile.fileFolder,
        fileFormat: uploadedGlycanFile.fileFormat
      },
      glycanUploadSucess,
      glycanUploadError
    );

    e.preventDefault();
  }

  function glycanUploadSucess(response) {
    response.json().then(resp => {
      setShowErrorSummary(false);
      setShowLoading(false);

      history.push({
        pathname: "/glycans/addMultipleGlycanDetails",
        state: { uploadResponse: resp }
      });
    });
  }
  function glycanUploadError(response) {
    response.json().then(resp => {
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
      <Container maxWidth="lg">
        <div className="page-container">
          <PageHeading title={title} subTitle="You can add multiple glycans to your repository by uploading them." />
          <Card>
            <Card.Body>
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
                    form="glycans"
                    errorJson={pageErrorsJson}
                    errorMessage={pageErrorMessage}
                  ></ErrorSummary>
                </div>
              )}

              <Form noValidate onSubmit={e => handleSubmit(e)}>
                <Form.Group as={Col} controlId="fileType" className="gg-align-center">
                  <Form.Label className="required-asterik">
                    <strong>File Type</strong>
                  </Form.Label>

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
                    <option value="Library XML">CarbArrayART library (*.xml)</option>
                    <option value="GlycoWorkbench">GlycoWorkbench (*.gws)</option>
                    <option value="wurcs">WURCS</option>
                    <option value="cfg">CFG IUPAC Condensed</option>
                  </Form.Control>
                  <Feedback message="Please choose a file type for the file to be uploaded" />
                </Form.Group>
                <Form.Group as={Row} controlId="fileUploader">
                  <FormLabel label={"Upload Glycan File"} className="required-asterik" />
                  <Col md={{ span: 8 }}>
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
                <Col md={{ span: 6 }}>
                  <Form.Group className="mb-3" controlId="formBasicCheckbox">
                    <Form.Check
                      type="checkbox"
                      label={"register in GlyTouCan"}
                      onChange={e => setUploadDetails({ glytoucanRegistration: e.target.checked })}
                      name={"glytoucanRegistration"}
                      checked={uploadDetails.glytoucanRegistration}
                    />
                  </Form.Group>
                </Col>
                &nbsp;&nbsp;
                <div className="text-center mb-4">
                  <Link to="/glycans">
                    <Button className="gg-btn-blue mt-2 gg-mr-20"> Back to Glycans</Button>
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
