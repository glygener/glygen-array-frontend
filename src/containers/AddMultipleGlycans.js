import React, { useState, useEffect, useReducer } from "react";
import { Loading } from "../components/Loading";
import { Helmet } from "react-helmet";
import { head, getMeta } from "../utils/head";
import { Title, Feedback, FormLabel } from "../components/FormControls";
import { ErrorSummary } from "../components/ErrorSummary";
import { Form, Row, Col, Button } from "react-bootstrap";
import { useHistory, Link } from "react-router-dom";
import { ResumableUploader } from "../components/ResumableUploader";
import { getWsUrl, wsCall } from "../utils/wsUtils";
import "../containers/AddMultiSlideLayout.css";
import ReactTable from "react-table";
import { StructureImage } from "../components/StructureImage";
import "../containers/AddMultipleGlycans.css";

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
  const [title, setTitle] = useState("Add Multiple Glycans");

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
      setTitle("Summary for glycan file upload");
      setShowLoading(false);
    });
  }
  function glycanUploadError(response) {
    response.json().then(resp => {
      setTitle("Summary for glycan file upload");
      setPageErrorsJson(resp);
      setPageErrorMessage("");
      setShowErrorSummary(true);
      setShowLoading(false);
    });
  }

  const getSummary = () => {
    let summaryLinks = [
      {
        tableLink: `${(addedGlycans && addedGlycans.length) || 0} glycans successful uploaded`,
        scrollto: 100
      },
      {
        tableLink: `${(duplicateSequences && duplicateSequences.length) || 0} glycans already exist in library`,
        scrollto: 550
      },
      {
        tableLink: `${(invalidSequences && invalidSequences.length) || 0} glycans could not be uploaded`,
        scrollto: 2500
      }
    ];

    return (
      <>
        <ul>
          {summaryLinks.map((linkGlycans, index) => {
            return (
              <div className={"summar-links"} key={index}>
                <li style={{ textAlign: "left" }} onClick={() => window.scrollTo(0, linkGlycans.scrollto)}>
                  {linkGlycans.tableLink}
                </li>
              </div>
            );
          })}
        </ul>
      </>
    );
  };

  const getTableForGlycans = (data, columns, sectionTitle) => {
    return (
      <>
        <h4>{sectionTitle}</h4>
        <br />
        <ReactTable
          data={data}
          columns={
            columns
              ? columns
              : [
                  {
                    Header: "Internal Id",
                    accessor: "internalId"
                  },
                  {
                    Header: "GlyTouCan ID",
                    accessor: "glytoucanId"
                  },
                  {
                    Header: "Name",
                    accessor: "name"
                  },
                  {
                    Header: "Structure Image",
                    accessor: "cartoon",
                    sortable: false,
                    // eslint-disable-next-line react/prop-types
                    Cell: row => <StructureImage base64={row.value}></StructureImage>,
                    minWidth: 300
                  },
                  {
                    Header: "Mass",
                    accessor: "mass",
                    // eslint-disable-next-line react/prop-types
                    Cell: row => (row.value ? parseFloat(row.value).toFixed(4) : "")
                  }
                ]
          }
          pageSizeOptions={[5, 10, 25]}
          defaultPageSize={5}
          pageSize={5}
          // loading={loading}
          keyColumn="id"
          showPaginationTop
          sortable={true}
        />
      </>
    );
  };
  return (
    <>
      <Helmet>
        <title>{head.addMultiSlideLayout.title}</title>
        {getMeta(head.addMultiSlideLayout)}
      </Helmet>

      <div className="page-container">
        <Title title={title} />

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
                    <option value="Library XML">CarbArrayART library (*.xml)</option>
                    <option value="GlycoWorkbench">GlycoWorkbench (*.gws)</option>
                    <option value="wurcs">WURCS</option>
                    <option value="cfg">CFG</option>
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
                      required={true}
                    />
                  </Col>
                </Form.Group>
              )}
            </>
          )}
          {(duplicateSequences || addedGlycans || invalidSequences) && getSummary()}
          {addedGlycans && (
            <div style={{ marginTop: "5%" }}>
              {getTableForGlycans(addedGlycans ? addedGlycans : [], "", "Glycans successful uploaded")}
            </div>
          )}
          {duplicateSequences && (
            <div style={{ marginTop: "5%", marginBottom: "5%" }}>
              {getTableForGlycans(duplicateSequences ? duplicateSequences : [], "", "Glycans already exist")}
            </div>
          )}
          {invalidSequences &&
            getTableForGlycans(
              invalidSequences ? invalidSequences : [],
              [
                {
                  Header: "Id",
                  accessor: "id",
                  minWidth: 80,
                  Cell: row => {
                    return row.original.glycan && row.original.glycan.id;
                  }
                },
                {
                  Header: "Sequence",
                  accessor: "sequence",
                  minWidth: 130,
                  getProps: (state, rowInfo, column) => {
                    return {
                      style: {
                        whiteSpace: "initial"
                      }
                    };
                  },
                  Cell: row => {
                    return row.original.glycan && row.original.glycan.sequence;
                  }
                },
                {
                  Header: "Error message",
                  accessor: "errorMessage",
                  minWidth: 80,
                  Cell: row => {
                    return (
                      row.original.error &&
                      row.original.error.errors &&
                      row.original.error.errors.map(err => {
                        return (
                          <div style={{ textAlign: "center" }}>
                            {err.objectName === "sequence" ? "Invalid Sequence" : `${err.defaultMessage}`}
                          </div>
                        );
                      })
                    );
                  }
                }
              ],
              "Glycan could not be uploaded"
            )}
          &nbsp;
          <Row className="line-break-1">
            <Col style={{ textAlign: "right", marginLeft: "9%" }} md={{ offset: 1 }}>
              <Link
                to="/glycans"
                className="link-button"
                style={{
                  width: "25%",
                  marginBottom: "20%"
                }}
              >
                Back to Glycans
              </Link>
            </Col>
            <Col style={{ textAlign: "left" }}>
              {!duplicateSequences && !addedGlycans && !invalidSequences && (
                <Button type="submit" disabled={!uploadedGlycanFile}>
                  Submit
                </Button>
              )}
            </Col>
          </Row>
          <Loading show={showLoading}></Loading>
        </Form>
      </div>
    </>
  );
};

export { AddMultipleGlycans };
