import React, { useState, useReducer, useEffect } from "react";
import { Form, Row, Col, Popover, Modal, Button } from "react-bootstrap";
import { Link, useParams, Prompt, useHistory } from "react-router-dom";
import EditIcon from "@material-ui/icons/Edit";
import { FormLabel, Feedback } from "../components/FormControls";
import { wsCall } from "../utils/wsUtils";
import Container from "@material-ui/core/Container";
import { Loading } from "../components/Loading";
import { GlygenTable } from "../components/GlygenTable";
import { ErrorSummary } from "../components/ErrorSummary";

const SlideOnExperiment = props => {
  let { experimentId } = useParams();
  let { slideView, setSlideView, setEnableSlideModal } = props;

  const [blocks, setBlocks] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [validated, setValidated] = useState(false);
  const [showLoading, setShowLoading] = useState(false);

  let [blocksSelected, setBlocksSelected] = useState([]);
  let [totalBlocksSelected, setTotalBlocksSelected] = useState([]);
  const [listSlide, setListSlide] = useState([]);
  const [pageErrorMessage, setPageErrorMessage] = useState("");
  const [showErrorSummary, setShowErrorSummary] = useState(false);
  const [pageErrorsJson, setPageErrorsJson] = useState({});
  const [listAssayMetas, setListAssayMetas] = useState([]);
  const [enablePrompt, setEnablePrompt] = useState(false);
  const history = useHistory();

  const slide = {
    id: "",
    slide: "",
    assayMetadata: ""
  };

  const [slideOnExp, setSlideOnExp] = useReducer((state, newState) => ({ ...state, ...newState }), slide);

  const handleSelect = e => {
    const name = e.target.name;
    const selectedValue = e.target.options[e.target.selectedIndex].value;

    if (name === "slide" && selectedValue !== "") {
      let slideLayoutId;

      const SlideSelected = listSlide.rows.filter(i => i.name === selectedValue);

      if (SlideSelected && SlideSelected[0].layout) {
        slideLayoutId = SlideSelected[0].layout.id;
        fetchList("getslidelayout", slideLayoutId);
      }
    } else if (selectedValue === "") {
      setBlocks([]);
      setBlocksSelected([]);
    }

    setSlideOnExp({ [name]: selectedValue });
  };

  const FormData = [
    {
      label: "Slide",
      name: "slide",
      value: slideOnExp.slide,
      list: listSlide,
      message: "Slide",
      onchange: handleSelect
    },
    {
      label: "Assay Metadata",
      name: "assayMetadata",
      value: slideOnExp.assayMetadata,
      list: listAssayMetas,
      message: "Assay Metadata",
      onchange: handleSelect
    }
  ];

  useEffect(() => {
    if (props.authCheckAgent) {
      props.authCheckAgent();
    }

    fetchList("listallprintedslide");
    fetchList("listassaymetadata");
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
      if (fetch === "listallprintedslide") {
        setListSlide(responseJson);
      } else if (fetch === "listassaymetadata") {
        setListAssayMetas(responseJson);
      } else if (fetch === "getslidelayout") {
        if (responseJson.blocks && responseJson.blocks.length > 0) {
          setBlocks(responseJson.blocks);
          setBlocksSelected(responseJson.blocks);
          setShowModal(true);
        } else {
          setBlocks([]);
          setBlocksSelected([]);
        }
      }
    });
  }

  const checkSelection = row => {
    if (blocks && blocks.length > 0) {
      totalBlocksSelected = [...blocksSelected];
    }

    return totalBlocksSelected.find(e => e.id === row.id);
  };

  const getBlocksSelectedPanel = () => {
    let listOfBlocks = slideView && slideView.blocks && slideView.blocks.length > 0 ? slideView.blocks : blocksSelected;
    return (
      <Popover id="popover-basic" className="popover-custom mt-3" style={{ maxWidth: "100%", width: "100%" }}>
        <Popover.Title
          style={{
            backgroundColor: "#e6e6e6"
          }}
        >
          <Row>
            <Col>
              <h5>Blocks Selected</h5>
            </Col>
            <Col>
              <Link onClick={() => setShowModal(true)}>
                <h5>
                  <EditIcon /> Edit{" "}
                </h5>
              </Link>
            </Col>
          </Row>
        </Popover.Title>
        <Popover.Content className="popover-body-custom">
          {listOfBlocks.map((block, index) => {
            return (
              <>
                <div
                  key={index + block.id}
                  style={{
                    backgroundColor: "cadetblue",
                    color: "floralwhite",
                    fontSize: "1.1rem",
                    marginBottom: "10px"
                  }}
                >
                  {block.id}
                </div>
              </>
            );
          })}
        </Popover.Content>
      </Popover>
    );
  };

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

  function getBlocksUsed() {
    blocksSelected = blocksSelected.map(block => {
      return block.blockLayout.id.toString();
    });

    return blocksSelected;
  }

  const getBlockSelectTable = () => {
    return (
      <div style={{ height: "450px", overflow: "scroll" }}>
        <GlygenTable
          data={blocks}
          resolveData={data => data.map(row => row)}
          columns={[
            {
              Header: "Id",
              accessor: "id"
            },
            {
              Header: "Row",
              accessor: "row"
            },
            {
              Header: "Column",
              accessor: "column"
            },
            {
              Header: "BlockLayout Name",
              accessor: "blockLayout.name"
            }
          ]}
          pageSizeOptions={[5, 10, 25]}
          defaultPageSize={5}
          pageSize={blocks.length > 5 ? 5 : blocks.length}
          defaultSortColumn="id"
          commentsRefColumn="description"
          keyColumn="id"
          infoRowsText="Blocks"
          showCheckboxColumn
          checkboxChangeHandler={handleChecboxChange}
          defaultCheckboxHandler={checkSelection}
        />
      </div>
    );
  };

  const handleChecboxChange = row => {
    var selectedrow = [...totalBlocksSelected];
    var deselectedRow = selectedrow.find(e => e.id === row.id);

    if (deselectedRow) {
      var deselectedRowIndex = selectedrow.indexOf(deselectedRow);
      selectedrow.splice(deselectedRowIndex, 1);
    } else {
      selectedrow.push(row);
    }

    setBlocksSelected(selectedrow);
    setTotalBlocksSelected(selectedrow);
  };

  function handleSubmit(e) {
    setValidated(true);

    if (e.currentTarget.checkValidity()) {
      setShowLoading(true);
      getBlocksUsed();
      setShowErrorSummary(false);

      wsCall(
        "addslide",
        "POST",
        { arraydatasetId: experimentId },
        true,
        {
          printedSlide: { name: slideOnExp.slide },
          metadata: { name: slideOnExp.assayMetadata },
          blocksUsed: blocksSelected
        },
        response => {
          setEnablePrompt(false);
          setShowLoading(false);
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

  const getSlideView = () => {
    return (
      <>
        <Form.Group as={Row} controlId={"slide"} className="gg-align-center mb-3">
          <Col xs={12} lg={9}>
            <FormLabel label={"Slide"} className="required-asterik" />
            <Form.Control type="text" name={"slide"} value={slideView.printedSlide.name} readOnly plaintext />

            {slideView.blocks && slideView.blocks.length > 0 && <div>{getBlocksSelectedPanel()}</div>}
          </Col>
        </Form.Group>
        <Form.Group as={Row} controlId={"metadata"} className="gg-align-center mb-3">
          <Col xs={12} lg={9}>
            <FormLabel label={"Assay Metadata"} className="required-asterik" />
            <Form.Control type="text" name={"metadata"} value={slideView.metadata.name} readOnly plaintext />
          </Col>
        </Form.Group>
      </>
    );
  };

  return (
    <>
      <Modal
        show={props.enableSlideModal}
        onHide={() => setEnableSlideModal(false)}
        animation={false}
        size="xl"
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>{!slideView ? "Add Slide to DataSet" : "View Slide Details"}</Modal.Title>
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

              {!slideView ? (
                <>
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
                                value={
                                  !slideView
                                    ? element.value
                                    : element.name === "slide"
                                    ? slideView.printedSlide.name
                                    : slideView.metadata.name
                                }
                                onChange={element.onchange}
                                required={true}
                                disabled={slideView && slideView.id}
                              >
                                <option value="">Select {element.label}</option>
                                {(element.list.length > 0 || (element.list.rows && element.list.rows.length > 0)) &&
                                  getSelectionList(element)}
                              </Form.Control>
                              <Feedback message={`${element.message} is required`} />

                              {element.name === "slide" && blocks.length > 0 && !showModal && (
                                <div>{getBlocksSelectedPanel()}</div>
                              )}
                            </Col>
                          </Form.Group>
                        </>
                      );
                    })}
                    <div className="text-center mb-4 mt-4">
                      <Button
                        className="gg-btn-outline mt-2 gg-mr-20"
                        onClick={() => {
                          setEnableSlideModal(false);
                          setSlideView();
                        }}
                      >
                        Cancel
                      </Button>

                      <Button type="submit" className="gg-btn-blue mt-2 gg-ml-20">
                        Submit
                      </Button>
                    </div>
                  </Form>
                </>
              ) : (
                getSlideView()
              )}
            </div>
          </Container>
        </Modal.Body>

        {showModal && (
          <Modal
            size="lg"
            aria-labelledby="contained-modal-title-vcenter"
            centered
            show={showModal}
            onHide={() => setShowModal(false)}
          >
            <Modal.Header closeButton>
              <Modal.Title id="contained-modal-title-vcenter">
                Please Select Blocks included in this Experiment:
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>{getBlockSelectTable()} </Modal.Body>
            <Modal.Footer></Modal.Footer>
          </Modal>
        )}

        <Loading show={showLoading} />
      </Modal>
    </>
  );
};

export { SlideOnExperiment };
