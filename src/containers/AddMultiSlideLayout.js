import React, { useState, useEffect, useReducer } from "react";
import "../containers/AddMultiSlideLayout.css";
import PropTypes from "prop-types";
import { Loading } from "../components/Loading";
import { Helmet } from "react-helmet";
import { head, getMeta } from "../utils/head";
import { Title, Feedback, FormLabel } from "../components/FormControls";
import { ErrorSummary } from "../components/ErrorSummary";
import { Form, Row, Col, Button, Table, Alert } from "react-bootstrap";
import { useHistory, Link } from "react-router-dom";
import { ResumableUploader } from "../components/ResumableUploader";
import { getWsUrl, wsCall } from "../utils/wsUtils";
import ReactTable from "react-table";
import "../containers/AddMultiSlideLayout.css";

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
  const [galFileErrorMessage, setGalFileErrorMessage] = useState([]);
  const [readMore, setReadMore] = useState(false);

  const defaultFileType = "*/*";

  const fileDetails = {
    fileType: defaultFileType,
    name: "",
    description: "",
    height: 0,
    width: 0
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
            <td style={{ width: "50px", marginRight: "100px", whiteSpace: "pre-wrap" }}>{description}</td>
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
              <th>
                <div style={{ width: "50px", marginLeft: "150px" }}>SlideName</div>
              </th>
              <th>
                <div style={{ width: "50px", marginRight: "100px" }}>Description</div>
              </th>
            </tr>
          </thead>
          <tbody>{tbody()}</tbody>
        </Table>

        {/* {key === "errors" && (
          <Col md={{ span: 3, offset: 4 }}>
            <Link to="/slidelayouts" className="link-button">
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
        <input
          key={row.index}
          type="radio"
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
                keyColumn="name"
                showPaginationTop
                sortable={true}
              />
              <Row className="line-break-1">
                <Col md={{ span: 2, offset: 4 }}>
                  <Button type="submit" disabled={rowSelected.length < 1}>
                    Add Slidelayouts
                  </Button>
                </Col>
                <Col md={{ span: 2 }}>
                  <Link to="/slidelayouts" className="link-button">
                    Back to Slidelayouts
                  </Link>
                </Col>
              </Row>
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
                      backgroundColor:
                        key === "addedLayouts" ? "darkseagreen" : key === "duplicates" ? "orange" : "indianred"
                    }}
                  >
                    {key === "addedLayouts"
                      ? " Slides Added to library"
                      : key === "duplicates"
                      ? " Slides with Duplicate name"
                      : "Errors"}
                  </div>
                  {getMessages(key, value)}

                  <div>
                    <Row className="line-break-1">
                      <Col md={{ span: 3, offset: 4 }}>
                        <Button onClick={() => resetSelection()}>Back to Select Slides</Button>
                      </Col>
                      <Col md={{ span: 2 }}>
                        <Link to="/slidelayouts" className="link-button">
                          Back to Slidelayouts
                        </Link>
                      </Col>
                    </Row>
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
      { file: encodeURIComponent(fileName) },
      true,
      rowSelected,
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
          file: encodeURIComponent(fileId),
          name: uploadDetails.name,
          height: uploadDetails.height,
          width: uploadDetails.width
        },
        true,
        null,
        importSlideLayoutsFromLibrarySuccess,
        importSlideLayoutsFromLibraryError
      );
    }
  };

  function importSlideLayoutsFromLibrarySuccess(response) {
    response.json().then(responseJson => {
      setTabs(responseJson);
      setShowLoading(false);
      console.log(tabs);
    });
  }

  function importSlideLayoutsFromLibraryError(response) {
    response.json().then(responseJson => {
      if (responseJson.errors && uploadDetails.fileType === ".gal") {
        const nameError = responseJson.errors.filter(i => i.objectName === "name");
        const dimensionError = responseJson.errors.filter(i => i.objectName === "width" || i.objectName === "height");

        if (nameError.length > 0) {
          setInvalidName(true);
          setFileSubmitted(false);
          setErrorName("Name Already Exists. please");
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
    let linkName = "Please Click Here see the errors!";
    let aggregatedSummary = [];

    if (galFileErrors.errors && galFileErrors.errors.length > 0) {
      if (galFileErrorMessage.length > 0) linkName = readMore ? "Read More >> " : "  << Read Less";
      const getReadMore = () => {
        if (!readMore) {
          const errorObj = galFileErrors.errors[0];
          aggregatedSummary.push(
            <li key={errorObj.objectName}>
              {errorObj.objectName.toUpperCase()} - {errorObj.defaultMessage}
            </li>
          );
        } else {
          galFileErrors.errors.forEach(errorObj => {
            aggregatedSummary.push(
              <li key={errorObj.objectName}>
                {errorObj.objectName.toUpperCase()} - {errorObj.defaultMessage}
              </li>
            );
            aggregatedSummary.push(<>&nbsp;</>);
          });
        }
        console.log(aggregatedSummary);
        setGalFileErrorMessage(aggregatedSummary);
      };

      return (
        <>
          <h5 style={{ textAlign: "left" }}>File upload failed for following reasons:</h5>
          <Alert variant="danger" className="alert-message line-break-1">
            {galFileErrorMessage.length > 0 && <div className="list-error-message">{galFileErrorMessage}</div>}
            <h6
              className="read-more-link"
              onClick={() => {
                getReadMore();
                setReadMore(!readMore);
              }}
            >
              {linkName}
            </h6>
          </Alert>
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

      <div className="page-container">
        <Title title="Add Multiple Slide Layouts" />

        {getGalErrorDisplay()}

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
              form="importSlidelayouts"
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
                  <Link to="/slidelayouts" className="link-button">
                    Back to Slidelayouts
                  </Link>
                </Col>
              </Row>
            )}
          </div>
        )}

        {Object.keys(tabs).length === 0 && !fileSubmitted && (
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
                  <option value=".gal">GAL</option>
                  <option value=".xml">XML</option>
                </Form.Control>
                <Feedback message="Please choose a file type for the file to be uploaded"></Feedback>
              </Col>
            </Form.Group>

            {uploadDetails.fileType && uploadDetails.fileType === ".gal" && (
              <>
                <Form.Group as={Row} controlId="name">
                  <FormLabel label="Name" className="required-asterik" />
                  <Col md={4}>
                    <Form.Control
                      type="text"
                      name="name"
                      placeholder="name"
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
                <Form.Group as={Row} controlId="description">
                  <FormLabel label="Description" />
                  <Col md={4}>
                    <Form.Control
                      as="textarea"
                      rows="4"
                      name="description"
                      placeholder="description"
                      value={uploadDetails.description}
                      onChange={handleChange}
                      maxLength={2000}
                    />
                    <span
                      style={{
                        marginLeft: "80%",
                        position: "inherit"
                      }}
                    >
                      {uploadDetails.description !== "" ? uploadDetails.description.length : ""}
                      /2000
                    </span>
                  </Col>
                </Form.Group>
                <Form.Group as={Row} controlId="height">
                  <FormLabel label="Height" />
                  <Col md={4}>
                    <Form.Control
                      type="number"
                      name="height"
                      placeholder="height"
                      value={uploadDetails.height}
                      onChange={handleChange}
                      isInvalid={invalidWidth}
                    />
                    <Feedback message="Width is not valid. Please update" />
                  </Col>
                </Form.Group>
                <Form.Group as={Row} controlId="width">
                  <FormLabel label="Width" />
                  <Col md={4}>
                    <Form.Control
                      type="number"
                      name="width"
                      placeholder="width"
                      value={uploadDetails.width}
                      onChange={handleChange}
                      isInvalid={invalidHeight}
                    />
                    <Feedback message="Height is not valid. Please update" />
                  </Col>
                </Form.Group>
              </>
            )}

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
                    maxFiles={1}
                    onProcessFile={uploadDetails.fileType === ".gal" ? saveGALSlidelayout : processFile}
                    enableSubmit
                    filetypes={uploadDetails.fileType === ".gal" ? ["gal"] : ["xml"]}
                  />
                </Col>
              </Form.Group>
            )}
          </>
        )}

        {fileSubmitted && getSlidesFromLibrary(tableData)}

        <Loading show={showLoading}></Loading>
      </div>
    </>
  );
};

AddMultiSlideLayout.propTypes = {
  authCheckAgent: PropTypes.func
};

export { AddMultiSlideLayout };
