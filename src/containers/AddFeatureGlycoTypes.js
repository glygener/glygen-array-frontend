import React, { useState, useReducer } from "react";
import ReactTable from "react-table";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import PropTypes from "prop-types";
import { Stepper, Step, StepLabel, Typography } from "@material-ui/core";
import { Form, Row, Col, Modal, Button } from "react-bootstrap";
import { FormLabel } from "../components/FormControls";

const AddFeatureGlycoTypes = props => {
  const glycoTypes = {
    position: "",
    glycans: {},
    linker: {},
    minRange: 0,
    maxRange: 0
  };

  const [glycoFeatureTypes, setGlycoFeatureTypes] = useReducer((oldState, newState) => ({ ...oldState, ...newState }), {
    ...glycoTypes,
    ...{ type: "LINKED_GLYCAN" }
  });

  const steps = ["Position and Select Glycans", "Select Linker", "Add Range"];
  const [activeStep, setActiveStep] = useState(0);
  const [showSelectionModal, setShowSelectionModal] = useState(false);

  const handleNext = () => {
    var stepIncrement = 1;
    if (activeStep === 2) {
    } else if (activeStep === 3) {
    } else if (activeStep === 4) {
    } else if (activeStep === 5) {
      //   addFeature();
      return;
    }

    setActiveStep(prevActiveStep => prevActiveStep + stepIncrement);
  };

  const handleBack = () => {
    var stepDecrement = 1;

    if (activeStep === 1) {
    }
    if (activeStep === 3) {
    }
    setActiveStep(prevActiveStep => prevActiveStep - stepDecrement);
  };

  function getStepContent(activeStep) {
    switch (activeStep) {
      case 0:
        return (
          <>
            {/* <Form.Group as={Row} controlId="position" style={{ marginTop: "5%", marginBottom: "5%" }}>
              <FormLabel label="Position" />
              <Col md={4}>
                <Form.Control
                  type="text"
                  name="position"
                  placeholder="Enter position"
                  value={glycoFeatureTypes.position}
                  onChange={e => setGlycoFeatureTypes({ position: e.target.value })}
                />
              </Col>
            </Form.Group> */}
            {props.getGlycanTabletoSelect(true)}
          </>
        );

      case 1:
        return props.getTableforLinkers(true);

      case 2:
        return (
          <>
            <Form.Group as={Row} controlId="Range">
              <FormLabel label={"Range"} className="required-asterik" />
              <Col md={4}>
                <Form.Control
                  type="text"
                  name="range"
                  placeholder="Enter Range"
                  value={glycoFeatureTypes.range}
                  onChange={e => setGlycoFeatureTypes({ range: e.target.value })}
                />
              </Col>
            </Form.Group>
          </>
        );

      //   case 3:
      // return getStepContentForGlycoLipid(activeStep);

      default:
        return "Invalid step";
    }
  }

  return (
    <>
      {!showSelectionModal && (
        <>
          <Form className="form-container">
            {/* <Button
              onClick={() => setShowSelectionModal(true)}
              className="link-button"
              style={{ width: "150px", marginBottom: "20px", backgroundColor: "rgb(75, 133, 182)" }}
            >
              Pick Glycans
            </Button> */}

            <input
              type="button"
              onClick={() => setShowSelectionModal(true)}
              value={"Pick Glycan"}
              style={{ marginBottom: "20px" }}
            />

            <ReactTable
              columns={[
                // {
                //   Header: "Position",
                //   Cell: (row, index) => {
                //     return row.original.position ? row.original.position : 0;
                //   },
                //   minWidth: 150
                // },
                {
                  Header: "Glycan",
                  Cell: (row, index) => {
                    return row.original.glycan ? row.original.glycan.name : "No Glycan Selected";
                  },
                  minWidth: 150
                },
                {
                  Header: "Linker",
                  Cell: (row, index) => {
                    return row.original.linker ? row.original.linker.name : "No Linker Selected";
                  },
                  minWidth: 150
                },
                {
                  Header: "Range",
                  Cell: (row, index) => {
                    return row.original.range ? row.original.range.value : "";
                  },
                  minWidth: 150
                },
                {
                  Header: "Action",
                  Cell: (row, index) => {
                    return row.original.glycan ? (
                      <>
                        <FontAwesomeIcon
                          key={"delete" + index}
                          icon={["far", "trash-alt"]}
                          size="xs"
                          title="Delete"
                          className="caution-color table-btn"
                          onClick={() => props.deleteRow(index)}
                        />
                        &nbsp;
                      </>
                    ) : (
                      ""
                    );
                  }
                }
              ]}
              data={props.glycoProteinPepTideListStep4}
              defaultPageSize={
                props.glycoProteinPepTideListStep4.length < 5 ? 1 : props.glycoProteinPepTideListStep4.length
              }
              showPagination={false}
              showSearchBox
            />
          </Form>
        </>
      )}

      {showSelectionModal && (
        <>
          <Modal
            size="xl"
            aria-labelledby="contained-modal-title-vcenter"
            centered
            show={showSelectionModal}
            onHide={() => {
              setShowSelectionModal(false);
              setGlycoFeatureTypes({ position: "" });
            }}
          >
            <Modal.Header closeButton></Modal.Header>
            <Modal.Body>
              <Stepper activeStep={activeStep}>
                {steps.map((label, index) => {
                  const stepProps = {};
                  const labelProps = {};

                  return (
                    <Step key={label} {...stepProps}>
                      <StepLabel {...labelProps}>{label}</StepLabel>
                    </Step>
                  );
                })}
              </Stepper>
              <div className="button-div text-center">
                <Button disabled={activeStep === 0} variant="contained" onClick={handleBack} className="stepper-button">
                  Back
                </Button>
                <Button variant="contained" onClick={handleNext} className="stepper-button">
                  {activeStep === steps.length - 1 ? "Finish" : "Next"}
                </Button>
              </div>
              &nbsp;&nbsp;
              {/* <ErrorSummary show={showErrorSummary} form="feature" errorJson={pageErrorsJson} errorMessage={errorMessage} /> */}
              <Typography component={"span"} variant={"body2"}>
                {getStepContent(activeStep)}
              </Typography>
              <div className="button-div text-center">
                <Button disabled={activeStep === 0} variant="contained" onClick={handleBack} className="stepper-button">
                  Back
                </Button>
                <Button variant="contained" onClick={handleNext} className="stepper-button">
                  {activeStep === steps.length - 1 ? "Finish" : "Next"}
                </Button>
              </div>
            </Modal.Body>
            <Modal.Footer>
              <Button
                onClick={() => {
                  setShowSelectionModal(false);
                  setGlycoFeatureTypes({ position: "" });
                }}
              >
                Close
              </Button>
            </Modal.Footer>
          </Modal>
        </>
      )}
    </>
  );
};

AddFeatureGlycoTypes.propTypes = {
  showLinkerPicker: PropTypes.bool,
  showGlycanPicker: PropTypes.bool,
  setShowLinkerPicker: PropTypes.func,
  setShowGlycanPicker: PropTypes.func,
  getTableforLinkers: PropTypes.func,
  getGlycanTabletoSelect: PropTypes.func,
  glycoProteinPepTideListStep4: PropTypes.array,
  setGlycoProteinPepTideListStep4: PropTypes.func,
  setPosition: PropTypes.func,
  deleteRow: PropTypes.func
};

export { AddFeatureGlycoTypes };

//   return (
//     <>
//       <Form className="form-container">
//         <ReactTable
//           columns={[
//             {
//               Header: "Position",
//               Cell: (row, index) => {
//                 return row.original.position ? (
//                   row.original.position
//                 ) : (
//                   <Form.Control type="text" value={row.original.position} onChange={e => props.setPosition(e)} />
//                 );
//               },
//               minWidth: 150
//             },
//             {
//               Header: "Glycan",
//               Cell: (row, index) => {
//                 return row.original.glycan ? (
//                   row.original.glycan.name
//                 ) : (
//                   <Button onClick={() => props.setShowGlycanPicker(true)}>Add glycan</Button>
//                 );
//               },
//               minWidth: 150
//             },
//             {
//               Header: "Linker",
//               Cell: (row, index) => {
//                 return row.original.linker ? (
//                   row.original.linker.name
//                 ) : (
//                   <Button onClick={() => props.setShowLinkerPicker(true)}>Add linker</Button>
//                 );
//               },
//               minWidth: 150
//             },
//             {
//               Header: "Action",
//               Cell: (row, index) => {
//                 return (
//                   <>
//                     <FontAwesomeIcon
//                       key={"delete" + index}
//                       icon={["far", "trash-alt"]}
//                       size="xs"
//                       title="Delete"
//                       className="caution-color table-btn"
//                       onClick={() => props.deleteRow(index)}
//                       // onClick={() => deletePrompt(row.original[props.keyColumn])}
//                     />
//                     &nbsp;
//                   </>
//                 );
//               }
//             }
//           ]}
//           data={props.glycoProteinPepTideListStep4}
//           defaultPageSize={
//             props.glycoProteinPepTideListStep4.length < 5 ? 1 : props.glycoProteinPepTideListStep4.length
//           }
//           showPagination={false}
//           showSearchBox
//         />
//       </Form>
//       {props.showGlycanPicker && (
//         <Modal
//           size="xl"
//           aria-labelledby="contained-modal-title-vcenter"
//           centered
//           show={props.showGlycanPicker}
//           onHide={() => props.setShowGlycanPicker(false)}
//         >
//           <Modal.Header closeButton>
//             <Modal.Title id="contained-modal-title-vcenter">Pick Glycans:</Modal.Title>
//           </Modal.Header>
//           <Modal.Body>{props.getGlycanTabletoSelect(false)}</Modal.Body>
//           <Modal.Footer>
//             <Button onClick={() => props.setShowLinkerPicker(false)}>Close</Button>
//           </Modal.Footer>
//         </Modal>
//       )}
//       {/* <div style={{ marginTop: "10%" }}>{props.getGlycanTabletoSelect(true)}</div> */}
//       {props.showLinkerPicker && (
//         <Modal
//           size="lg"
//           aria-labelledby="contained-modal-title-vcenter"
//           centered
//           show={props.showLinkerPicker}
//           onHide={() => props.setShowLinkerPicker(false)}
//         >
//           <Modal.Header closeButton>
//             <Modal.Title id="contained-modal-title-vcenter">Pick Linker:</Modal.Title>
//           </Modal.Header>
//           <Modal.Body>{props.getTableforLinkers(true)}</Modal.Body>
//           <Modal.Footer>
//             <Button onClick={() => props.setShowLinkerPicker(false)}>Close</Button>
//           </Modal.Footer>
//         </Modal>
//       )}
//     </>
//   );
