/* eslint-disable react/prop-types */
import React, { useEffect, useState, useReducer } from "react";
import "./AddFeature.css";
import PropTypes from "prop-types";
import { Helmet } from "react-helmet";
import { head, getMeta } from "../utils/head";
import { Loading } from "../components/Loading";
import { Stepper, Step, StepLabel, Button, Typography } from "@material-ui/core";
import { ErrorSummary } from "../components/ErrorSummary";
import { Form, FormCheck, Col, Row, Modal } from "react-bootstrap";
import { FormLabel, Feedback, Title } from "../components/FormControls";
import { GlygenTable } from "../components/GlygenTable";
import ReactTable from "react-table";
import { StructureImage } from "../components/StructureImage";
import { getAAPositionsFromSequence } from "../utils/sequence";
import { wsCall } from "../utils/wsUtils";
import { useHistory } from "react-router-dom";
import { FeatureMetaData } from "../containers/FeatureMetaData";

const AddFeature = props => {
  useEffect(props.authCheckAgent, []);

  const steps = ["Select Feature Type", "Select Linker", "Select Glycan", "Generic Feature Info", "Review and Add"];

  const featureTypes = {
    NORMAL: "Normal",
    CONTROL: "Control",
    NEGATIVE_CONTROL: "Negative Control",
    COMPOUND: "Organic Compound",
    LANDING_LIGHT: "Landing Light"
  };
  const featureAddInitState = {
    name: "",
    featureId: "",
    linker: {},
    glycans: []
  };

  const history = useHistory();
  const [showLoading, setShowLoading] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  const [showErrorSummary, setShowErrorSummary] = useState(false);
  const [pageErrorsJson, setPageErrorsJson] = useState({});

  const [genericInfoValidated, setGenericInfoValidated] = useState(false);
  const [linkerValidated, setLinkerValidated] = useState(false);
  const [validLinker, setValidLinker] = useState(true);

  const [glycanPickIndex, setGlycanPickIndex] = useState(0);
  const [showGlycanPicker, setShowGlycanPicker] = useState(false);

  const [featureAddState, setFeatureAddState] = useReducer((oldState, newState) => ({ ...oldState, ...newState }), {
    ...featureAddInitState,
    ...{ type: "NORMAL" }
  });

  const [featureMetaData, setFeatureMetaData] = useState();
  const [metadataforAddFeature, setMetadataforAddFeature] = useState([]);
  const [onlyMyglycans, setOnlyMyglycans] = useState(false);
  const [onlyMyLinkers, setOnlyMyLinkers] = useState(false);
  const [linkerFetchWS, setLinkerFetchWS] = useState("listalllinkers");

  const isStepSkipped = step => {
    return featureAddState.type !== "NORMAL" && step === 2 && activeStep === 3;
  };

  const handleNext = () => {
    var stepIncrement = 1;
    if (activeStep === 1) {
      setLinkerValidated(true);
      if (featureAddState.type !== "NORMAL") {
        stepIncrement += 1;
      } else {
        if (featureAddState.linker && featureAddState.linker.id) {
          var isValidLinker = setupGlycanSelection(featureAddState.linker);
          setValidLinker(isValidLinker);
        } else {
          return;
        }
      }
    } else if (activeStep === 2) {
      if (featureAddState.glycans[0].glycan && !featureAddState.glycans[0].glycan.id) {
        return;
      }
    } else if (activeStep === 3) {
      setGenericInfoValidated(true);
      if (featureAddState.name === "") {
        return;
      }
    } else if (activeStep === 4) {
      addFeature();
      return;
    }
    setActiveStep(prevActiveStep => prevActiveStep + stepIncrement);
  };

  const handleBack = () => {
    var stepDecrement = 1;
    if (activeStep === 1) {
      setLinkerValidated(false);
    }
    if (activeStep === 3) {
      if (featureAddState.type !== "NORMAL") {
        stepDecrement += 1;
      }
      setGenericInfoValidated(false);
    }
    setActiveStep(prevActiveStep => prevActiveStep - stepDecrement);
  };

  const handleTypeSelect = e => {
    const newValue = e.target.value;
    setFeatureAddState({ ...featureAddInitState, ...{ type: newValue } });
  };

  const handleChange = e => {
    const name = e.target.name;
    const newValue = e.target.value;
    setFeatureAddState({ [name]: newValue });
  };

  const handleLinkerSelect = linker => {
    setFeatureAddState({ linker: linker });
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth"
    });
    setValidLinker(true);
  };

  const handleGlycanSelect = glycan => {
    setShowGlycanPicker(false);
    var pickedGlycans = featureAddState.glycans;
    pickedGlycans[glycanPickIndex].glycan = glycan;
    setFeatureAddState({ glycans: pickedGlycans });
  };

  const getStep3Content = () => {
    return (
      <>
        <div className="radioform1">
          <Form.Group as={Row} controlId="name">
            <FormLabel label="Name" className={"required-asterik"} />
            <Col md={4}>
              <Form.Control
                type="text"
                name="name"
                placeholder="Name"
                value={featureAddState.name}
                onChange={handleChange}
                isInvalid={genericInfoValidated && featureAddState.name === ""}
                maxLength={50}
                required
              />
              <Feedback message="Name is required"></Feedback>
            </Col>
          </Form.Group>

          <Form.Group as={Row} controlId="featureId">
            <FormLabel label="Feature Id" className={"required-asterik"} />
            <Col md={4}>
              <Form.Control
                type="text"
                name="featureId"
                placeholder="Feature Id"
                value={featureAddState.featureId}
                onChange={handleChange}
                isInvalid={genericInfoValidated && featureAddState.featureId === ""}
                maxLength={30}
                required
              />
              <Feedback message="Feature Id is required"></Feedback>
            </Col>
          </Form.Group>
        </div>
      </>
    );
  };

  const getMetadata = () => {
    return (
      <FeatureMetaData
        metadataType={"Feature"}
        importedInAPage={true}
        importedPageData={metadataforAddFeature}
        setMetadataforImportedPage={setMetadataforAddFeature}
        setImportedPageDataToSubmit={setFeatureMetaData}
        handleBack={handleBack}
        handleNext={handleNext}
        importPageContent={getStep3Content}
      />
    );
  };

  const getTableforLinkers = fetchws => {
    debugger;
    return (
      <>
        <GlygenTable
          columns={[
            {
              Header: "PubChem Id",
              accessor: "pubChemId",
              // eslint-disable-next-line react/prop-types
              // eslint-disable-next-line react/display-name
              Cell: (row, index) =>
                row.value ? (
                  <a key={index} href={row.original.pubChemUrl} target="_blank" rel="noopener noreferrer">
                    {row.value}
                  </a>
                ) : (
                  ""
                ),
              minWidth: 70
            },
            {
              Header: "Name",
              accessor: "name",
              minWidth: 50
            },
            {
              Header: "Type",
              accessor: "type"
            },
            {
              Header: "Classification",
              accessor: "classification",
              // eslint-disable-next-line react/display-name
              Cell: (row, index) =>
                row.value ? (
                  <a
                    key={index}
                    href={row.value.uri}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={row.value.classification}
                  >
                    {row.value.classification}
                  </a>
                ) : (
                  ""
                )
            },
            {
              Header: "Structure Image",
              accessor: "imageURL",
              // eslint-disable-next-line react/prop-types
              // eslint-disable-next-line react/display-name
              Cell: (row, index) => <StructureImage key={index} imgUrl={row.value}></StructureImage>,
              minWidth: 150
            },
            {
              Header: "Mass",
              accessor: "mass",
              // eslint-disable-next-line react/prop-types
              // eslint-disable-next-line react/display-name
              Cell: (row, index) => <div key={index}>{row.value ? parseFloat(row.value).toFixed(4) : ""}</div>,
              minWidth: 70
            },
            {
              Header: "InChiKey",
              accessor: "inChiKey",
              minWidth: 150
            },
            {
              Header: "Sequence",
              accessor: "sequence",
              minWidth: 70
            }
          ]}
          defaultPageSize={10}
          defaultSortColumn="dateModified"
          defaultSortOrder={0}
          showCommentsButton
          commentsRefColumn="pubChemId"
          fetchWS={fetchws}
          keyColumn="id"
          showRowsInfo
          infoRowsText="Linkers"
          showSelectButton
          selectButtonHeader="Select"
          selectButtonHandler={handleLinkerSelect}
        />
      </>
    );
  };
  function formatSequenceForDisplay(sequence, charsPerLine) {
    return sequence.match(new RegExp(".{1," + charsPerLine + "}", "g")).join("\n");
  }

  function setupGlycanSelection(linker) {
    var valid = true; // all NORMAL features are initially valid
    var chooseGlycanTableData = [
      {
        glycan: undefined
      }
    ];
    if (linker.type !== "SMALLMOLECULE_LINKER" && featureAddState.glycans.length === 0) {
      valid = false; //if linker is protein/peptide, then invalidate until a valid attachable position is found
      chooseGlycanTableData = getAAPositionsFromSequence(linker.sequence);
      if (chooseGlycanTableData.length > 0) {
        valid = true; //attachable position for glycan found
        chooseGlycanTableData.forEach(e => (e["glycan"] = undefined));
      }
    }
    featureAddState.glycans.length === 0 && setFeatureAddState({ glycans: chooseGlycanTableData });
    return valid;
  }

  function displayGlycanPicker(index) {
    setShowGlycanPicker(true);
    setGlycanPickIndex(index);
  }

  function addFeature() {
    var featureObj = {
      type: featureAddState.type,
      name: featureAddState.name,
      internalId: featureAddState.featureId,
      linker: featureAddState.linker,
      glycans: featureAddState.glycans.map(glycanObj => glycanObj.glycan),
      positionMap: featureAddState.glycans.reduce((map, glycanObj) => {
        if (glycanObj && glycanObj.glycan && glycanObj.glycan.id) {
          map[glycanObj.position] = glycanObj.glycan.id;
        }
        return map;
      }, {}),
      metadata: featureMetaData
    };

    setShowLoading(true);
    wsCall("addfeature", "POST", null, true, featureObj, addFeatureSuccess, addFeatureError);

    function addFeatureSuccess() {
      history.push("/features");
    }

    function addFeatureError(response) {
      response.json().then(responseJson => {
        console.log(responseJson);
        setPageErrorsJson(responseJson);
        setShowErrorSummary(true);
      });
    }
  }

  function getStepContent(stepIndex) {
    switch (stepIndex) {
      case 0:
        return (
          <Form className="radioform">
            {Object.keys(featureTypes).map(key => {
              return (
                <FormCheck key={key} className="line-break-2">
                  <FormCheck.Label>
                    <FormCheck.Input
                      type="radio"
                      value={key}
                      onChange={handleTypeSelect}
                      checked={featureAddState.type === key}
                    />
                    {featureTypes[key]}
                  </FormCheck.Label>
                </FormCheck>
              );
            })}
          </Form>
        );
      case 1:
        return (
          <>
            {(linkerValidated || Object.keys(featureAddState.linker).length > 0) && (
              <Form className="radioform1">
                <Form.Group as={Row} controlId="name">
                  <FormLabel label="Selected Linker" />
                  <Col md={4}>
                    <Form.Control
                      type="text"
                      name="linker_name"
                      value={featureAddState.linker.name}
                      disabled={true}
                      placeholder="No linker selected"
                      isInvalid={linkerValidated && Object.keys(featureAddState.linker).length === 0}
                    />
                    <Feedback message="Please select a linker from below"></Feedback>
                  </Col>
                </Form.Group>
                {featureAddState.linker.imageURL && (
                  <Form.Group as={Row} controlId="name">
                    <Col md={{ span: 3, offset: 2 }}>
                      <FormLabel label={""} />
                    </Col>

                    <Col md={4}>
                      <StructureImage imgUrl={featureAddState.linker.imageURL}></StructureImage>
                    </Col>
                  </Form.Group>
                )}
                <Form.Group as={Row} controlId="sequence">
                  <FormLabel label={featureAddState.linker.type === "SMALLMOLECULE_LINKER" ? "InChI" : "AA sequence"} />
                  <Col md={6} className="sequence-label-div">
                    <Form.Control
                      rows={6}
                      className="sequence-textarea"
                      as="label"
                      isInvalid={linkerValidated && !validLinker}
                    >
                      {featureAddState.linker.type === "SMALLMOLECULE_LINKER"
                        ? featureAddState.linker && featureAddState.linker.inChiSequence
                          ? featureAddState.linker.inChiSequence
                          : "No sequence"
                        : formatSequenceForDisplay(featureAddState.linker.sequence, 60)}
                    </Form.Control>
                    <Feedback message="Glycans cannot be attached to this protein/peptide linker. If you did not mean to add glycans to this feature, please select another type of feature."></Feedback>
                  </Col>
                </Form.Group>
              </Form>
            )}

            <Form className="form-container">
              <div style={{ textAlign: "right", marginBottom: "-25px", fontSize: "18px", marginLeft: "30px" }}>
                <input
                  type="checkbox"
                  style={{
                    height: "20px",
                    width: "15px"
                  }}
                  onChange={() => {
                    setOnlyMyLinkers(!onlyMyLinkers);
                  }}
                  checked={onlyMyLinkers}
                />

                <span style={{ textAlign: "left", marginLeft: "2px", marginTop: "-1px" }}>
                  {"all available linkers"}
                </span>
              </div>

              {onlyMyLinkers ? getTableforLinkers("listalllinkers") : getTableforLinkers("linkerlist")}
            </Form>
          </>
        );
      case 2:
        return (
          <>
            <Form className="radioform1">
              <Form.Group as={Row} controlId="name">
                <FormLabel label="Selected Linker" />
                <Col md={4} className="sequence-label-div">
                  <label>{featureAddState.linker.name ? featureAddState.linker.name : "-"}</label>
                </Col>
              </Form.Group>
              {featureAddState.linker.imageURL && (
                <Form.Group as={Row} controlId="name">
                  <Col md={{ span: 3, offset: 2 }}>
                    <FormLabel label={""} />
                  </Col>

                  <Col md={4}>
                    <StructureImage imgUrl={featureAddState.linker.imageURL} />
                  </Col>
                </Form.Group>
              )}
              <Form.Group as={Row} controlId="sequence">
                <FormLabel label={featureAddState.linker.type === "SMALLMOLECULE_LINKER" ? "InChI" : "AA sequence"} />
                <Col md={4} className="sequence-label-div">
                  <label className="sequence-textarea">
                    {featureAddState.linker.type === "SMALLMOLECULE_LINKER"
                      ? featureAddState.linker && featureAddState.linker.inChiSequence
                        ? featureAddState.linker.inChiSequence
                        : "No sequence"
                      : formatSequenceForDisplay(featureAddState.linker.sequence, 60)}
                  </label>
                </Col>
              </Form.Group>
            </Form>
            <Form className="form-container">
              <ReactTable
                columns={[
                  ...(featureAddState.linker.type !== "SMALLMOLECULE_LINKER"
                    ? [
                        {
                          Header: "Position",
                          accessor: "position"
                        },
                        {
                          Header: "Amino Acid",
                          accessor: "aminoAcid"
                        }
                      ]
                    : []),
                  {
                    Header: "Glycan",
                    accessor: "glycan",
                    // eslint-disable-next-line react/display-name
                    Cell: (row, index) =>
                      row.value ? (
                        row.value.cartoon ? (
                          <StructureImage key={index} base64={row.value.cartoon}></StructureImage>
                        ) : (
                          row.value.name
                        )
                      ) : (
                        "No Glycan Selected"
                      ),
                    minWidth: 150
                  },
                  {
                    Header: "",
                    // eslint-disable-next-line react/display-name
                    Cell: ({ index }) => (
                      <input
                        key={index}
                        type="button"
                        onClick={() => displayGlycanPicker(index)}
                        value={"Pick Glycan"}
                      />
                    )
                  }
                ]}
                data={featureAddState.glycans}
                defaultPageSize={featureAddState.glycans.length}
                showPagination={false}
              />
              {showGlycanPicker && (
                <Modal
                  size="xl"
                  aria-labelledby="contained-modal-title-vcenter"
                  centered
                  show={showGlycanPicker}
                  onHide={() => setShowGlycanPicker(false)}
                >
                  <Modal.Header closeButton>
                    <Modal.Title id="contained-modal-title-vcenter">
                      Pick Glycan for position {glycanPickIndex + 1}:
                    </Modal.Title>
                  </Modal.Header>
                  <Modal.Body>
                    <GlygenTable
                      columns={[
                        {
                          Header: "Select",
                          Cell: (row, index) => (
                            <div style={{ textAlign: "center" }}>
                              <input
                                key={index}
                                type="button"
                                onClick={() => handleGlycanSelect(row.original)}
                                value={"Select"}
                              />
                            </div>
                          )
                        },
                        {
                          Header: "Internal Id",
                          accessor: "internalId"
                        },
                        {
                          Header: "Glytoucan Id",
                          accessor: "glytoucanId"
                        },
                        {
                          Header: "Name",
                          accessor: "name"
                        },
                        {
                          Header: "Structure Image",
                          accessor: "cartoon",
                          // eslint-disable-next-line react/prop-types
                          // eslint-disable-next-line react/display-name
                          Cell: row => <StructureImage base64={row.value}></StructureImage>,
                          minWidth: 300
                        },
                        {
                          Header: "Mass",
                          accessor: "mass",
                          // eslint-disable-next-line react/prop-types
                          Cell: row => (row.value ? parseFloat(row.value).toFixed(4) : "")
                        }
                      ]}
                      defaultPageSize={10}
                      fetchWS="listallglycans"
                      keyColumn="id"
                      showRowsInfo
                      showSearchBox
                      infoRowsText="Glycans"
                    />
                  </Modal.Body>
                  <Modal.Footer>
                    <Button onClick={() => setShowGlycanPicker(false)}>Close</Button>
                  </Modal.Footer>
                </Modal>
              )}
            </Form>
          </>
        );
      case 3:
        return getMetadata();
      case 4:
        return (
          <Form className="radioform2">
            <Form.Group as={Row} controlId="name">
              <FormLabel label="Name" />
              <Col md={6}>
                <Form.Control as="input" value={featureAddState.name} disabled />
              </Col>
            </Form.Group>
            <Form.Group as={Row} controlId="featureId">
              <FormLabel label="Feature Id" />
              <Col md={6}>
                <Form.Control as="input" value={featureAddState.featureId} disabled />
              </Col>
            </Form.Group>
            <Form.Group as={Row} controlId="linker">
              <FormLabel label="Linker Details:" />
            </Form.Group>
            <Form.Group as={Row} controlId="linkerName">
              <FormLabel label="Name" className="linker-field-label" />
              <Col md={6}>
                <Form.Control as="input" value={featureAddState.linker.name} disabled />
              </Col>
            </Form.Group>
            {featureAddState.linker.imageURL && (
              <Form.Group as={Row} controlId="name">
                <FormLabel label="Structure Image" className="linker-field-label" />
                <Col md={6}>
                  <StructureImage imgUrl={featureAddState.linker.imageURL}></StructureImage>
                </Col>
              </Form.Group>
            )}
            {featureAddState.linker.sequence && (
              <Form.Group as={Row} controlId="sequence">
                <FormLabel label="Sequence" className="linker-field-label" />
                <Col md={6} className="sequence-label-div">
                  <Form.Control
                    as="textarea"
                    className="sequence-textarea"
                    value={featureAddState.linker.sequence}
                    disabled
                  />
                </Col>
              </Form.Group>
            )}
            <Form.Group as={Row} controlId="glycan">
              <FormLabel label="Attached Glycan(s) Details:" />
            </Form.Group>
            <Form.Group as={Row} controlId="glycanTable">
              <Col className="selected-glycans-review">
                {featureAddState.glycans && (
                  <ReactTable
                    columns={[
                      ...(featureAddState.linker.type !== "SMALLMOLECULE_LINKER"
                        ? [
                            {
                              Header: "Position",
                              accessor: "position"
                            },
                            {
                              Header: "Amino Acid",
                              accessor: "aminoAcid"
                            }
                          ]
                        : []),
                      {
                        Header: "Glytoucan Id",
                        accessor: "glycan",
                        Cell: row => row.value && row.value.glytoucanId
                      },
                      {
                        Header: "Name",
                        accessor: "glycan",
                        Cell: row => row.value && row.value.name
                      },
                      {
                        Header: "Glycan",
                        accessor: "glycan",
                        // eslint-disable-next-line react/display-name
                        Cell: (row, index) =>
                          row.value ? (
                            row.value.cartoon ? (
                              <StructureImage key={index} base64={row.value.cartoon}></StructureImage>
                            ) : (
                              "No Image"
                            )
                          ) : (
                            "No Glycan Selected"
                          ),
                        minWidth: 150
                      }
                    ]}
                    data={featureAddState.glycans}
                    defaultPageSize={featureAddState.glycans.length}
                    showPagination={false}
                  />
                )}
              </Col>
            </Form.Group>
          </Form>
        );
      default:
        return "Invalid step";
    }
  }

  return (
    <>
      <Helmet>
        <title>{head.addFeature.title}</title>
        {getMeta(head.addFeature)}
      </Helmet>

      <div className="page-container">
        <Title title="Add Feature to Repository" />

        <Stepper activeStep={activeStep}>
          {steps.map((label, index) => {
            const stepProps = {};
            const labelProps = {};
            if (isStepSkipped(index)) {
              labelProps.optional = <Typography variant="caption">Not Applicable</Typography>;
              stepProps.completed = false;
            }
            return (
              <Step key={label} {...stepProps}>
                <StepLabel {...labelProps}>{label}</StepLabel>
              </Step>
            );
          })}
        </Stepper>
        <div>
          <div>
            {activeStep !== 3 && (
              <div className="button-div text-center">
                <Button disabled={activeStep === 0} variant="contained" onClick={handleBack} className="stepper-button">
                  Back
                </Button>
                <Button variant="contained" onClick={handleNext} className="stepper-button">
                  {activeStep === steps.length - 1 ? "Finish" : "Next"}
                </Button>
              </div>
            )}

            <ErrorSummary show={showErrorSummary} form="feature" errorJson={pageErrorsJson}></ErrorSummary>

            <Typography component={"span"} variant={"body2"}>
              {getStepContent(activeStep)}
            </Typography>

            {activeStep !== 3 && (
              <div className="button-div text-center">
                <Button disabled={activeStep === 0} variant="contained" onClick={handleBack} className="stepper-button">
                  Back
                </Button>
                <Button variant="contained" onClick={handleNext} className="stepper-button">
                  {activeStep === steps.length - 1 ? "Finish" : "Next"}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <Loading show={showLoading}></Loading>
    </>
  );
};

AddFeature.propTypes = {
  authCheckAgent: PropTypes.func
};

export { AddFeature };
