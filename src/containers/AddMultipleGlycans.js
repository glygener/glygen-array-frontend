import React, { useState, useEffect, useReducer } from "react";
import { Loading } from "../components/Loading";
import { Helmet } from "react-helmet";
import { head, getMeta } from "../utils/head";
import { Title, Feedback, FormLabel } from "../components/FormControls";
import { ErrorSummary } from "../components/ErrorSummary";
import { Form, Row, Col, Table, Button } from "react-bootstrap";
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
  const [uploadedGlycanFile, setUploadedGlycanFile] = useState();

  const [addedGlycans, setAddedGlycans] = useState();
  const [invalidSequences, setInvalidSequences] = useState();
  const [duplicateSequences, setDuplicateSequences] = useState();

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

  function handleSubmit(e) {
    setShowLoading(true);

    wsCall(
      "addmultipleglycans",
      "POST",
      {
        noGlytoucanRegistration: true,
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
      setAddedGlycans(resp.addedGlycans);
      setInvalidSequences(resp.wrongSequences);
      setDuplicateSequences(resp.duplicateSequences);
      setShowLoading(false);
    });
  }
  function glycanUploadError(response) {
    response.json().then(resp => {
      setPageErrorsJson(resp);
      setPageErrorMessage("");
      setShowErrorSummary(true);
      setShowLoading(false);
    });
  }

  const getReviewMessages = (glycans, tablename, key) => {
    return (
      <>
        <div
          style={{
            fontWeight: "bold",
            backgroundColor:
              key === "addedGlycans" ? "darkseagreen" : key === "duplicateGlycans" ? "orange" : "indianred"
          }}
        >
          {tablename}
        </div>
        <Table style={{ alignContent: "center" }}>
          <thead>
            <tr>
              <th>
                <div>Glycan Name</div>
              </th>
              <th>
                <div>Glycan Type</div>
              </th>
            </tr>
          </thead>
          <tbody>{tbody(glycans)}</tbody>
        </Table>
      </>
    );
  };

  const tbody = glycans => {
    var trow = [];
    trow = glycans.map((glycan, index) => {
      return (
        <tr key={index}>
          <td>{glycan.name}</td>
          <td>{glycan.type}</td>
        </tr>
      );
    });

    return trow;
  };

  return (
    <>
      <Helmet>
        <title>{head.addMultiSlideLayout.title}</title>
        {getMeta(head.addMultiSlideLayout)}
      </Helmet>

      <div className="page-container">
        <Title title="Add Multiple Glycans" />

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
          {!duplicateSequences && !addedGlycans && !invalidSequences && (
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
                  <FormLabel label={"Upload Glycan File"} className="required-asterik" />
                  <Col md={{ offset: 2, span: 8 }}>
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
                      // onProcessFile={saveGALSlidelayout}
                      required={true}
                    />
                  </Col>
                </Form.Group>
              )}
            </>
          )}

          {addedGlycans && addedGlycans.length > 0 && getReviewMessages(addedGlycans, "Glycans Added", "addedGlycans")}

          {duplicateSequences &&
            duplicateSequences.length > 0 &&
            getReviewMessages(duplicateSequences, "Duplicate Glycans", "duplicateGlycans")}

          {invalidSequences &&
            invalidSequences.length > 0 &&
            getReviewMessages(invalidSequences, "Glycans with Invalid Sequences", "")}

          <Row className="line-break-1">
            <Col style={{ textAlign: "right" }}>
              {!duplicateSequences && !addedGlycans && !invalidSequences && (
                <Button type="submit" disabled={!uploadedGlycanFile}>
                  Submit
                </Button>
              )}
            </Col>
            <Col style={{ textAlign: "left" }}>
              <Link
                to="/glycans"
                className="link-button"
                style={{
                  width: "20%"
                }}
              >
                Back to Glycans
              </Link>
            </Col>
          </Row>
          <Loading show={showLoading}></Loading>
        </Form>
      </div>
    </>
  );
};

export { AddMultipleGlycans };
