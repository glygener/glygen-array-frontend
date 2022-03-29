import React, { useState, useReducer, useEffect } from "react";
import { Form, Row, Col, Modal, Button } from "react-bootstrap";
import { useParams, Prompt, useHistory } from "react-router-dom";
import { FormLabel, Feedback } from "../components/FormControls";
import { getWsUrl, wsCall } from "../utils/wsUtils";
import Container from "@material-ui/core/Container";
import { Loading } from "../components/Loading";
import { ResumableUploader } from "../components/ResumableUploader";
import { ErrorSummary } from "../components/ErrorSummary";

const ImageOnSlideExp = props => {
  let { experimentId } = useParams();
  let { slideId, enableImageOnSlide, setEnableImageOnSlide, imageView, setImageView } = props;

  const [validated, setValidated] = useState(false);
  const [showLoading, setShowLoading] = useState(false);
  const [pageErrorMessage, setPageErrorMessage] = useState("");
  const [showErrorSummary, setShowErrorSummary] = useState(false);
  const [pageErrorsJson, setPageErrorsJson] = useState({});
  const [enablePrompt, setEnablePrompt] = useState(false);
  const history = useHistory();

  const [listScannerMetas, setListScannerMetas] = useState([]);
  const [imageUploaded, setImageUploaded] = useState();

  const image = {
    id: "",
    file: {},
    scanner: ""
  };

  const [imageOnSlide, setImageOnSlide] = useReducer((state, newState) => ({ ...state, ...newState }), image);

  const handleSelect = e => {
    const name = e.target.name;
    const selectedValue = e.target.options[e.target.selectedIndex].value;

    if (name === "slide" && selectedValue !== "") {
      let slideLayoutId;

      const SlideSelected = imageOnSlide.rows.filter(i => i.name === selectedValue);

      if (SlideSelected && SlideSelected[0].layout) {
        slideLayoutId = SlideSelected[0].layout.id;
        fetchList("getslidelayout", slideLayoutId);
      }
    }

    setImageOnSlide({ [name]: selectedValue });
  };

  const FormData = [
    {
      label: "Scanner Meta",
      name: "scanner",
      value: imageOnSlide.scanner,
      list: listScannerMetas,
      message: "Scanner Metadata",
      onchange: handleSelect
    }
  ];

  const fileData = [
    {
      controlId: "fileUploader",
      label: "Image",
      fileType: imageOnSlide.fileType,
      setUploadedFile: setImageUploaded,
      required: true
    }
  ];

  useEffect(() => {
    if (props.authCheckAgent) {
      props.authCheckAgent();
    }

    fetchList("listscanners");
  }, [experimentId]);

  const fetchList = (fetch, id) => {
    wsCall(
      fetch,
      "GET",
      !id ? { offset: "0", loadAll: false } : { qsParams: { loadAll: false }, urlParams: [id] },
      true,
      null,
      response => listSuccess(response, fetch),
      wsCallFail
    );
  };

  function wsCallFail(response) {
    response.json().then(responseJson => {
      setPageErrorsJson(responseJson);
      setShowErrorSummary(true);
    });
  }

  function listSuccess(response, fetch) {
    response.json().then(responseJson => {
      if (fetch === "listscanners") {
        setListScannerMetas(responseJson);
      }
    });
  }

  const getSelectionList = select => {
    return select.list.rows
      ? select.list.rows.map((element, index) => {
          return (
            <option key={index} value={element.name}>
              {element.name}
            </option>
          );
        })
      : select.name === "statisticalMethod"
      ? select.list.map((element, index) => {
          return (
            <option key={index} value={element.name}>
              {element.name}
            </option>
          );
        })
      : select.list.map((element, index) => {
          return (
            <option key={index} value={element}>
              {element}
            </option>
          );
        });
  };

  function handleSubmit(e) {
    setValidated(true);

    if (e.currentTarget.checkValidity()) {
      setShowLoading(true);

      setShowErrorSummary(false);

      wsCall(
        "addimage",
        "POST",
        {
          arraydatasetId: experimentId,
          slideId: slideId
        },
        true,
        {
          scanner: { name: imageOnSlide.scanner },
          file: imageUploaded
        },
        response => {
          setEnablePrompt(false);
          setShowLoading(false);
          setEnableImageOnSlide(false);
          history.push("/experiments/editExperiment/" + experimentId);
        },
        addSlideOnExpFailure
      );
    }
    e.preventDefault();
  }

  function addSlideOnExpFailure(response) {
    response.json().then(responseJson => {
      setPageErrorsJson(responseJson);
      setShowErrorSummary(true);
      setPageErrorMessage("");
      setShowLoading(false);
    });
  }

  const getImageFileUploader = () => {
    return (
      <>
        {fileData.map((data, index) => {
          return (
            <Form.Group
              as={Row}
              controlId={data.controlId}
              key={index + data.controlId}
              className="gg-align-center mt-0 pt-0"
            >
              <Col xs={12} lg={9}>
                <FormLabel label={data.label} className="required-asterik pb-0 mb-0" />
                <ResumableUploader
                  className="mt-0 pt-0"
                  history={history}
                  headerObject={{
                    Authorization: window.localStorage.getItem("token") || "",
                    Accept: "*/*"
                  }}
                  fileType={data.fileType}
                  uploadService={getWsUrl("upload")}
                  maxFiles={1}
                  setUploadedFile={data.setUploadedFile}
                  onProcessFile={fileId => {}}
                  required={data.required}
                  // filetypes={["jpg", "jpeg", "png", "tiff"]}
                />
              </Col>
            </Form.Group>
          );
        })}
      </>
    );
  };

  const getImageView = () => {
    return (
      <>
        <Form.Group as={Row} controlId={"image"} className="gg-align-center mb-3">
          <Col xs={12} lg={9}>
            <FormLabel label={"Image"} className="required-asterik" />
            <Form.Control type="text" name={"image"} value={imageView.file.originalName} readOnly plaintext />
          </Col>
        </Form.Group>
        <Form.Group as={Row} controlId={"scannermetadata"} className="gg-align-center mb-3">
          <Col xs={12} lg={9}>
            <FormLabel label={"Scanner Metadata"} className="required-asterik" />
            <Form.Control type="text" name={"metadata"} value={imageView.scanner.name} readOnly plaintext />
          </Col>
        </Form.Group>
      </>
    );
  };

  return (
    <>
      <Modal
        show={enableImageOnSlide}
        onHide={() => {
          setImageView();
          setEnableImageOnSlide(false);
        }}
        animation={false}
        size="xl"
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>{!imageView ? "Add Image to Slide" : "View Image Details"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Container maxWidth="xl">
            <div className="page-container">
              {showErrorSummary === true && (
                <ErrorSummary
                  show={showErrorSummary}
                  form="rawdata"
                  errorJson={pageErrorsJson}
                  errorMessage={pageErrorMessage}
                />
              )}
              {showErrorSummary === true && window.scrollTo({ top: 0, behavior: "smooth" })}

              {enablePrompt && <Prompt message="If you leave you will lose this data!" />}

              {!imageView ? (
                <>
                  {getImageFileUploader()}
                  <Form noValidate validated={validated} onSubmit={e => handleSubmit(e)}>
                    {FormData.map((element, index) => {
                      return (
                        <>
                          <Form.Group as={Row} controlId={index} key={index} className="gg-align-center mb-3">
                            <Col xs={12} lg={9}>
                              <FormLabel label={element.label} className="required-asterik" />
                              <Form.Control
                                as="select"
                                name={element.name}
                                value={element.value}
                                onChange={element.onchange}
                                required={true}
                              >
                                <option value="">Select {element.label}</option>
                                {(element.list.length > 0 || (element.list.rows && element.list.rows.length > 0)) &&
                                  getSelectionList(element)}
                              </Form.Control>
                              <Feedback message={`${element.message} is required`} />
                            </Col>
                          </Form.Group>
                        </>
                      );
                    })}

                    <div className="mt-4 mb-4 text-center">
                      <Button
                        className="gg-btn-outline-reg"
                        onClick={() => {
                          setImageView();
                          setEnableImageOnSlide(false);
                        }}
                      >
                        Cancel
                      </Button>
                      &nbsp;
                      <Button type="submit" className="gg-btn-blue-reg">
                        Submit
                      </Button>
                    </div>
                  </Form>
                </>
              ) : (
                getImageView()
              )}
            </div>
          </Container>
        </Modal.Body>

        <Loading show={showLoading} />
      </Modal>
    </>
  );
};

export { ImageOnSlideExp };
