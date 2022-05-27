import React, { useState, useEffect, useReducer } from "react";
import "../containers/AddMultiSlideLayout.css";
import PropTypes from "prop-types";
import { Loading } from "../components/Loading";
import { Helmet } from "react-helmet";
import { head, getMeta } from "../utils/head";
import { Feedback, FormLabel } from "../components/FormControls";
import { ErrorSummary } from "../components/ErrorSummary";
import { Form, Row, Col, Button, Table, Alert } from "react-bootstrap";
import { useHistory, Link } from "react-router-dom";
import { ResumableUploader } from "../components/ResumableUploader";
import { getWsUrl, wsCall } from "../utils/wsUtils";
import ReactTable from "react-table";
import "../containers/AddMultiSlideLayout.css";
import { isValidNumber } from "../utils/commonUtils";
import Container from "@material-ui/core/Container";
import { Card } from "react-bootstrap";
import { PageHeading } from "../components/FormControls";
import { BlueRadio } from "../components/FormControls";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import { HelpToolTip } from "../components/tooltip/HelpToolTip";
import { Typography } from "@material-ui/core";
import wikiHelpTooltip from "../appData/wikiHelpTooltip";

const MAX_ERROR_LIMIT = 10;

const AddMultiSlideLayout = props => {
  const fileMap = new Map();

  useEffect(() => {
    props.authCheckAgent();

    if (fileMap.size === 0) {
      fileMap.set(".gal", "importlayoutsfromgal");
      fileMap.set(".xml", "importlayoutsfromxml");
    }

    setFileTypeApiValues(fileMap);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [showLoading, setShowLoading] = useState(false);
  const [showErrorSummary, setShowErrorSummary] = useState(false);
  const [pageErrorsJson, setPageErrorsJson] = useState({});
  const [pageErrorMessage, setPageErrorMessage] = useState("");
  const [tableData, setTableData] = useState([]);
  const [rowSelected, setRowSelected] = useState([]);
  const [fileName, setFileName] = useState("");
  const [tabs, setTabs] = useState({});
  const history = useHistory();
  var columnsToRender = Object.assign({});

  const [fileSubmitted, setFileSubmitted] = useState(false);
  const [fileTypeApiValues, setFileTypeApiValues] = useState(new Map());

  const [invalidName, setInvalidName] = useState(false);
  const [errorName, setErrorName] = useState("");
  const [invalidWidth, setInvalidWidth] = useState(false);
  const [invalidHeight, setInvalidHeight] = useState(false);
  const [galFileErrors, setGalFileErrors] = useState([]);
  const [readMore, setReadMore] = useState(false);
  const [uploadedFile, setUploadedFile] = useState();

  const defaultFileType = "*/*";

  const fileDetails = {
    fileType: defaultFileType,
    name: "",
    description: "",
    height: "",
    width: ""
  };

  const [uploadDetails, setUploadDetails] = useReducer((state, newState) => ({ ...state, ...newState }), fileDetails);

  function handleChange(e) {
    const name = e.target.name;
    const value = e.target.value;

    if (name === "name") {
      setInvalidName(false);
      setErrorName("");
    }

    setUploadDetails({ [name]: value });
    // setFileType(e.target.options[e.target.selectedIndex].value);
  }

  const checkSelection = row => {
    return rowSelected.find(e => e.id === row.id);
  };

  const handleChecboxChange = row => {
    var selectedrow = [];
    selectedrow.push({
      id: row.id,
      name: row.name
    });

    setRowSelected(selectedrow);
  };

  const handleSlideNameChange = (row, e) => {
    const value = e.target.value;
    const updateSelectedRows = [...rowSelected];

    if (updateSelectedRows && updateSelectedRows.length > 0 && updateSelectedRows.find(e => e.id === row.id)) {
      updateSelectedRows.forEach(element => {
        if (element.id === row.id) {
          element.name = value;
        }
      });
    } else {
      updateSelectedRows.push({
        id: row.id,
        name: value
      });
    }

    setRowSelected(updateSelectedRows);
  };

  const getUpdateSlideName = row => {
    if (rowSelected) {
      const selectedRow = rowSelected.find(e => e.id === row.id);
      return selectedRow && selectedRow.name !== "" ? selectedRow.name : row.name;
    }
  };

  const getMessages = (key, value) => {
    const trows = row => {
      var trow = [];
      trow = row.map((element, index) => {
        return (
          <tr key={index}>
            <td style={{ width: "50px", marginLeft: "100px" }}>{element.name}</td>
            <td style={{ width: "50px", marginRight: "100px" }}>{element.description}</td>
          </tr>
        );
      });
      return trow;
    };

    const trowsForErrors = errors => {
      const trow = [];

      errors.forEach((element, index) => {
        var description = "";

        element.error.errors.forEach(error => {
          description += error.objectName + " - " + error.defaultMessage + "\n";
        });

        trow.push(
          <tr key={index}>
            <td style={{ width: "50px", marginLeft: "100px" }}>{element.layout.name}</td>
            <td
              style={{
                width: "50px",
                marginRight: "100px",
                whiteSpace: "pre-wrap"
              }}
            >
              {description}
            </td>
          </tr>
        );
      });
      return trow;
    };

    const tbody = () => {
      const tbody = [];
      if (key !== "errors") {
        tbody.push(value && trows(value));
      } else {
        tbody.push(value && trowsForErrors(value));
      }
      return tbody;
    };

    return (
      <>
        <Table>
          <thead>
            <tr>
              <th>Slide Name</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>{tbody()}</tbody>
        </Table>

        {/* {key === "errors" && (
          <Col md={{ span: 3, offset: 4 }}>
            <Link to="/slideLayouts" className="link-button">
              Back to Slidelayouts
            </Link>
          </Col>
        )} */}
      </>
    );
  };

  const getSlidesFromLibrary = tableData => {
    const editSlideName = row => (
      <input
        key={row.index}
        type="text"
        name={row.original.name}
        onChange={e => handleSlideNameChange(row.original, e)}
        value={getUpdateSlideName(row.original)}
        style={{
          border: "none"
        }}
      />
    );

    columnsToRender["nameColumn"] = {
      Header: "Name",
      // eslint-disable-next-line react/display-name
      Cell: row => editSlideName(row)
    };

    columnsToRender["selectionColumn"] = {
      Header: "Select",
      // eslint-disable-next-line react/display-name
      Cell: row => (
        <FormControlLabel
          control={<BlueRadio />}
          name="selectionColumn"
          key={row.index}
          onChange={() => handleChecboxChange(row.original)}
          checked={checkSelection(row.original)}
        />
      )
    };

    return (
      <>
        {Object.keys(tabs).length === 0 &&
          ((!showErrorSummary && uploadDetails.fileType === ".xml") ||
            (uploadDetails.fileType === ".gal" && galFileErrors.length > 0)) && (
            <Form onSubmit={e => saveSelectedXMlSlidelayouts(e)}>
              <ReactTable
                columns={Object.values(columnsToRender)}
                data={tableData}
                pageSizeOptions={[5, 10, 25]}
                defaultPageSize={10}
                minRows={0}
                className="MyReactTableClass"
                NoDataComponent={({ state, ...rest }) =>
                  !state?.loading ? (
                    <p className="pt-2 text-center">
                      <strong>No data available</strong>
                    </p>
                  ) : null
                }
                keyColumn="name"
                showPaginationTop
                sortable={true}
              />
              <div className="text-center mb-2 mt-4">
                <Link to="/slideLayouts">
                  <Button className="gg-btn-outline mt-2 gg-mr-20">Back to Slide Layouts</Button>
                </Link>
                <Button type="submit" disabled={rowSelected.length < 1} className="gg-btn-blue mt-2 gg-ml-20">
                  Add Slide Layout
                </Button>
              </div>
            </Form>
          )}

        {Object.keys(tabs).length > 0 &&
          Object.entries(tabs).map(element => {
            var key = element[0];
            var value = element[1];

            if (value && value.length > 0) {
              return (
                <>
                  <div
                    style={{
                      fontWeight: "bold",
                      padding: "15px",
                      marginBottom: "20px",
                      backgroundColor:
                        key === "addedLayouts" ? "darkseagreen" : key === "duplicates" ? "orange" : "indianred"
                    }}
                  >
                    {key === "addedLayouts"
                      ? " Slides Added to the Library"
                      : key === "duplicates"
                      ? " Slides with Duplicate Name"
                      : "Errors"}
                  </div>
                  {getMessages(key, value)}

                  <div>
                    <div className="text-center mb-2">
                      <Link to="/slideLayouts">
                        <Button className="gg-btn-outline mt-2 gg-mr-20">Back to Slide Layouts</Button>
                      </Link>
                      <Button onClick={() => resetSelection()} className="gg-btn-blue mt-2 gg-ml-20">
                        Back to Select Slides
                      </Button>
                    </div>
                  </div>
                </>
              );
            }
            return <></>;
          })}
      </>
    );
  };

  const resetSelection = () => {
    setTabs({});
    setRowSelected([]);
  };

  const saveSelectedXMlSlidelayouts = e => {
    setShowLoading(true);

    wsCall(
      fileTypeApiValues.get(uploadDetails.fileType),
      "POST",
      null,
      true,
      {
        file: {
          identifier: uploadedFile.identifier,
          originalName: uploadedFile.originalName,
          fileFolder: uploadedFile.fileFolder,
          fileFormat: uploadedFile.fileFormat
        },
        slideLayout: rowSelected[0]
      },
      importSlideLayoutsFromLibrarySuccess,
      importSlideLayoutsFromLibraryError
    );

    e.preventDefault();
  };

  const saveGALSlidelayout = fileId => {
    if (uploadDetails.name === "") {
      setInvalidName(true);
    } else {
      setShowLoading(true);
      wsCall(
        fileTypeApiValues.get(uploadDetails.fileType),
        "POST",
        {
          name: uploadDetails.name,
          height: uploadDetails.height,
          width: uploadDetails.width
        },
        true,
        {
          identifier: uploadedFile.identifier,
          originalName: uploadedFile.originalName,
          fileFolder: uploadedFile.fileFolder,
          fileFormat: uploadedFile.fileFormat
        },

        importSlideLayoutsFromLibrarySuccess,
        importSlideLayoutsFromLibraryError
      );
    }
  };

  function importSlideLayoutsFromLibrarySuccess(response) {
    if (uploadDetails.fileType === ".gal") {
      response.text().then(responseJson => {
        setShowLoading(false);
        history.push("/slideLayouts");
      });
    } else {
      response.json().then(responseJson => {
        setTabs(responseJson);
        setShowLoading(false);
      });
    }
  }

  function importSlideLayoutsFromLibraryError(response) {
    response.json().then(responseJson => {
      if (responseJson.errors && uploadDetails.fileType === ".gal") {
        const nameError = responseJson.errors.filter(i => i.objectName === "name");
        const dimensionError = responseJson.errors.filter(i => i.objectName === "width" || i.objectName === "height");

        if (nameError.length > 0) {
          setInvalidName(true);
          setFileSubmitted(false);
          setErrorName("Name Already Exists. Please provide a different name.");
        } else if (dimensionError.length > 0) {
          setInvalidWidth(true);
          setInvalidHeight(true);
        } else {
          setFileSubmitted(true);
          setGalFileErrors(responseJson);
          // setShowErrorSummary(true);
        }
      } else if (uploadDetails.fileType === ".xml") {
        setPageErrorsJson(responseJson);
        setTabs(responseJson);
        setShowErrorSummary(true);
      } else {
        setPageErrorsJson(responseJson);
        setTabs(responseJson);
        setShowErrorSummary(true);
      }
      setShowLoading(false);
    });
  }

  const getGalErrorDisplay = () => {
    if (galFileErrors.errors && galFileErrors.errors.length > 0) {
      let errors = [];

      if (galFileErrors && galFileErrors.errors.length > 0) {
        if (readMore) {
          errors = galFileErrors.errors;
        } else {
          errors = galFileErrors.errors.filter((item, index) => index < MAX_ERROR_LIMIT);
        }
      }

      return (
        <>
          <Alert variant="danger">
            <Alert.Heading>File upload failed for following reasons:</Alert.Heading>

            {errors.length > 0 && (
              <ul>
                {errors.map(errorObj => (
                  <li key={errorObj.objectName}>
                    {errorObj.objectName.toUpperCase()} - {errorObj.defaultMessage}
                  </li>
                ))}
              </ul>
            )}

            {galFileErrors && galFileErrors.errors.length > MAX_ERROR_LIMIT && (
              <h6 className="read-more-link" onClick={() => setReadMore(rmore => !rmore)}>
                {!readMore ? "Read More >>" : "<< Read Less"}
              </h6>
            )}
          </Alert>

          <div className="text-center mb-2 mt-4">
            <Link to="/slideLayouts">
              <Button className="gg-btn-outline mt-2">Back to Slide Layouts</Button>
            </Link>
          </div>
        </>
      );
    }
  };

  const processFile = fileId => {
    setFileName(fileId);

    // call getSlideLayoutFromLibrary with fileId to get slidelayout
    wsCall(
      "getlayoutsfromlibrary",
      "GET",
      { file: encodeURIComponent(fileId) },
      true,
      null,
      getSlideLayoutsFromLibrarySuccess,
      getSlideLayoutsFromLibraryError
    );

    function getSlideLayoutsFromLibrarySuccess(response) {
      response.json().then(responseJson => {
        console.log(responseJson);
        setShowErrorSummary(false);
        setTableData(responseJson);
        setFileSubmitted(true);
      });
    }

    function getSlideLayoutsFromLibraryError(response) {
      response.json().then(responseJson => {
        console.log(responseJson);
        setFileSubmitted(false);
        setPageErrorsJson(responseJson);
        setPageErrorMessage("");
        setShowErrorSummary(true);
      });
    }
  };

  return (
    <>
      <Helmet>
        <title>{head.addMultiSlideLayout.title}</title>
        {getMeta(head.addMultiSlideLayout)}
      </Helmet>
      <Container maxWidth="xl">
        <div className="page-container">
          <PageHeading
            title="Add Slide Layouts From File to Repository"
            subTitle="Please provide the information for the new slide layout and upload a GAL/XML file wih Slide Layouts."
          />
          <Typography className="text-right" gutterBottom>
            <HelpToolTip
              title={wikiHelpTooltip.slide_layout.add_multiple_slide_layouts.title}
              text={wikiHelpTooltip.tooltip_text}
              url={wikiHelpTooltip.slide_layout.add_multiple_slide_layouts.url}
            />
            {wikiHelpTooltip.help_text}
          </Typography>

          <Card>
            <Card.Body>
              {getGalErrorDisplay()}

              {showErrorSummary === true && (
                <div>
                  <h5>File upload failed for following reasons:</h5>

                  <ErrorSummary
                    show={showErrorSummary}
                    form="importSlidelayouts"
                    errorJson={pageErrorsJson}
                    errorMessage={pageErrorMessage}
                  ></ErrorSummary>

                  {fileSubmitted && (
                    <div className="text-center mb-2">
                      <Link to="/slideLayouts" className="link-button">
                        <Button className="gg-btn-outline mt-2">Back to Slide Layouts</Button>
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {Object.keys(tabs).length === 0 && !fileSubmitted && (
                <>
                  <Form.Group as={Row} controlId="fileType" className="gg-align-center mb-3">
                    <Col xs={12} lg={9}>
                      <FormLabel label="Choose File Type for Upload" className="required-asterik" />
                      <Form.Control
                        as="select"
                        name="fileType"
                        placeholder="fileType"
                        onChange={handleChange}
                        required={true}
                        value={uploadDetails.fileType}
                      >
                        <option value={defaultFileType}>Select File Type</option>
                        <option value=".gal">GAL</option>
                        <option value=".xml">XML</option>
                      </Form.Control>
                      <Feedback message="Please choose a file type for the file to be uploaded"></Feedback>
                    </Col>
                  </Form.Group>

                  {uploadDetails.fileType === defaultFileType && (
                    <div className="text-center mb-2 mt-4">
                      <Link to="/slideLayouts">
                        <Button className="gg-btn-outline mt-2">Back to Slide Layouts</Button>
                      </Link>
                    </div>
                  )}

                  {uploadDetails.fileType && uploadDetails.fileType === ".gal" && (
                    <>
                      <Form.Group as={Row} controlId="name" className="gg-align-center mb-3">
                        <Col xs={12} lg={9}>
                          <FormLabel label="Name" className="required-asterik" />
                          <Form.Control
                            type="text"
                            name="name"
                            placeholder="Enter Name"
                            value={uploadDetails.name}
                            onChange={handleChange}
                            required
                            isInvalid={invalidName}
                          />
                          <Feedback
                            message={
                              invalidName && errorName.length > 0
                                ? "Another slide layout has the same Name. Please use a different Name."
                                : "Name is required"
                            }
                          />
                        </Col>
                      </Form.Group>
                      <Form.Group as={Row} controlId="description" className="gg-align-center mb-3">
                        <Col xs={12} lg={9}>
                          <FormLabel label="Description" />
                          <Form.Control
                            as="textarea"
                            rows="4"
                            name="description"
                            placeholder="Enter Description"
                            value={uploadDetails.description}
                            onChange={handleChange}
                            maxLength={2000}
                          />
                          <div className="text-right text-muted">
                            {uploadDetails.description !== "" ? uploadDetails.description.length : "0"}
                            /2000
                          </div>
                        </Col>
                      </Form.Group>
                      <Row className="gg-align-center mb-3">
                        <Col xs={12} lg={9}>
                          <Row>
                            <Form.Group as={Col} xs={12} lg={6} controlId="height">
                              <FormLabel label="Height" />
                              <Form.Control
                                type="number"
                                name="height"
                                placeholder="height"
                                value={uploadDetails.height}
                                onChange={handleChange}
                                isInvalid={invalidWidth}
                                onKeyDown={e => {
                                  isValidNumber(e);
                                }}
                              />
                              <Feedback message="Width is not valid. Please update" />
                            </Form.Group>
                            <Form.Group as={Col} xs={12} lg={6} controlId="width">
                              <FormLabel label="Width" />
                              <Form.Control
                                type="number"
                                name="width"
                                placeholder="width"
                                value={uploadDetails.width}
                                onChange={handleChange}
                                isInvalid={invalidHeight}
                                onKeyDown={e => {
                                  isValidNumber(e);
                                }}
                              />
                              <Feedback message="Height is not valid. Please update" />
                            </Form.Group>
                          </Row>
                        </Col>
                      </Row>
                    </>
                  )}

                  {uploadDetails.fileType !== defaultFileType && (
                    <Form.Group as={Row} controlId="fileUploader" className="gg-align-center">
                      <Col xs={12} lg={9}>
                        <ResumableUploader
                          history={history}
                          headerObject={{
                            Authorization: window.localStorage.getItem("token") || "",
                            Accept: "*/*",
                          }}
                          fileType={fileDetails.fileType}
                          uploadService={getWsUrl("upload")}
                          maxFiles={1}
                          onProcessFile={uploadDetails.fileType === ".gal" ? saveGALSlidelayout : processFile}
                          enableSubmit
                          filetypes={uploadDetails.fileType === ".gal" ? ["gal"] : ["xml"]}
                          onCancel={() => history.push("/slideLayouts")}
                          setUploadedFile={setUploadedFile}
                        />
                      </Col>
                    </Form.Group>
                  )}
                </>
              )}

              {fileSubmitted && getSlidesFromLibrary(tableData)}

              <Loading show={showLoading}></Loading>
            </Card.Body>
          </Card>
        </div>
      </Container>
    </>
  );
};

AddMultiSlideLayout.propTypes = {
  authCheckAgent: PropTypes.func
};

export { AddMultiSlideLayout };
