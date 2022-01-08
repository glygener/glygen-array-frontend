/* eslint-disable react/prop-types */
import React, { useEffect, useState, useReducer } from "react";
import "./AddFeature.css";
import PropTypes from "prop-types";
import { Helmet } from "react-helmet";
import { head, getMeta } from "../utils/head";
import { Loading } from "../components/Loading";
import { Stepper, Step, StepLabel, Typography } from "@material-ui/core";
import { ErrorSummary } from "../components/ErrorSummary";
import { Form, FormCheck, Col, Row, Modal, Button } from "react-bootstrap";
import { FormLabel, Feedback } from "../components/FormControls";
import { GlygenTable } from "../components/GlygenTable";
import ReactTable from "react-table";
import { StructureImage } from "../components/StructureImage";
import { getAAPositionsFromSequence } from "../utils/sequence";
import { wsCall } from "../utils/wsUtils";
import { Linkers } from "./Linkers";
import { Peptides } from "./Peptides";
import { Proteins } from "./Proteins";
import { Lipids } from "./Lipids";
import { SourceForGlycanInFeature } from "../components/SourceForGlycanInFeature";
import { getMetadataSubmitData } from "../containers/FeatureMetadata";
import { FeatureView } from "./FeatureView";
import { getToolTip } from "../utils/commonUtils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ScrollToTop } from "../components/ScrollToTop";
import { GlycoPeptides } from "../components/GlycoPeptides";
import { useHistory, Link } from "react-router-dom";
import { GlycanInfoViewModal } from "../components/GlycanInfoViewModal";
import { LineTooltip } from "../components/tooltip/LineTooltip";
import { MetaData } from "./MetaData";
import Container from "@material-ui/core/Container";
import { Card } from "react-bootstrap";
import { PageHeading } from "../components/FormControls";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import RadioGroup from "@material-ui/core/RadioGroup";
import { BlueRadio } from "../components/FormControls";
import { Image } from "react-bootstrap";
import plusIcon from "../images/icons/plus.svg";

const AddFeature = (props) => {
  useEffect(props.authCheckAgent, []);

  const featureTypes = {
    LINKED_GLYCAN: "Linked Glycan",
    GLYCO_LIPID: "GlycoLipid",
    GLYCO_PEPTIDE: "GlycoPeptide",
    GLYCO_PROTEIN: "GlycoProtein",
    GLYCO_PROTEIN_LINKED_GLYCOPEPTIDE: "GlycoProtein linked GlycoPeptide",
    CONTROL: "Control",
    LANDING_LIGHT: "Landing Light"
  };

  const glycoLipidOptionsPage1 = {
    YES: "Yes",
    NO: "No",
  };

  const featureAddInitState = {
    name: "",
    featureId: "",
    linker: {},
    glycans: [],
    rangeGlycans: [],
    rangeGlycoPeptides: [],
    glycoPeptides: [],
    lipid: {},
    peptide: {},
    protein: {},
    isLipidLinkedToSurfaceUsingLinker: "No",
    positionDetails: {
      isPosition: false,
      number: "",
    },
  };

  const history = useHistory();
  const [showLoading, setShowLoading] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [showErrorSummary, setShowErrorSummary] = useState(false);
  const [pageErrorsJson, setPageErrorsJson] = useState({});
  const [errorMessage, setErrorMessage] = useState("");
  const [linkerValidated, setLinkerValidated] = useState(false);
  const [validLinker, setValidLinker] = useState(true);
  const [showGlycanPicker, setShowGlycanPicker] = useState(false);
  const [showLinkerPicker, setShowLinkerPicker] = useState(false);
  const [glycoProteinPepTideListStep4, setGlycoProteinPepTideListStep4] = useState([{ position: 0 }]);
  const [showGlycoPeptides, setShowGlycoPeptides] = useState(false);
  const [linkerForSelectedGlycan, setLinkerForSelectedGlycan] = useState();

  const [invalidMinRange, setInvalidMinRange] = useState(false);
  const [invalidMaxRange, setInvalidMaxRange] = useState(false);

  const [glycanViewInfo, setGlycanViewInfo] = useState(false);
  const [enableGlycanViewInfoDialog, setEnableGlycanViewInfoDialog] = useState(false);
  const [enableGlycoPeptideRange, setEnableGlycoPeptideRange] = useState(false);
  const [rowSelectedForRange, setRowSelectedForRange] = useState(false);

  const [metaDataStep, setMetaDataStep] = useState(false);

  const [featureMetadata, setFeatureMetadata] = useState([]);
  const [spotMetaDataToSubmit, setSpotMetaDataToSubmit] = useState();

  const [featureAddState, setFeatureAddState] = useReducer((oldState, newState) => ({ ...oldState, ...newState }), {
    ...featureAddInitState,
    ...{ type: "LINKED_GLYCAN" },
  });

  const [onlyMyglycans, setOnlyMyglycans] = useState(false);
  const [onlyMyLinkers, setOnlyMyLinkers] = useState(false);
  var [rowSelected, setRowSelected] = useState([]);
  var [currentGlycanSelection, setCurrentGlycanSelection] = useState();

  const generalSteps = ["Feature Type", "Select Linker", "Select Glycan", "Generic Information", "Review and Add"];

  const glycoLipidSteps = [
    "Select Feature Type",
    "Select Linker",
    "Select Lipid",
    "Select Glycan",
    "Generic Information",
    "Review and Add",
  ];

  const glycoPeptideSteps = [
    "Feature Type",
    "Select Linker",
    "Select Peptide",
    "Select Glycan",
    "Generic Information",
    "Review and Add",
  ];

  const glycoProteinSteps = [
    "Feature Type",
    "Select Linker",
    "Select Protein",
    "Select Glycan",
    "Generic Information",
    "Review and Add",
  ];

  const glycoProteinLinkedGlycoPeptideSteps = [
    "Feature Type",
    "Select Linker",
    "Select Protein",
    "Select Glycan",
    "Generic Information",
    "Review and Add",
  ];

  function getSteps(type) {
    switch (type) {
      case "LINKED_GLYCAN":
      case "CONTROL":
      case "NEGATIVE_CONTROL":
      case "COMPOUND":
      case "LANDING_LIGHT":
        return generalSteps;

      case "GLYCO_LIPID":
        return glycoLipidSteps;
      case "GLYCO_PEPTIDE":
        return glycoPeptideSteps;
      case "GLYCO_PROTEIN":
        return glycoProteinSteps;
      case "GLYCO_PROTEIN_LINKED_GLYCOPEPTIDE":
        return glycoProteinLinkedGlycoPeptideSteps;

      default:
        return generalSteps;
    }
  }

  function getMoleculeType(typeIndex) {
    switch (typeIndex) {
      case "LINKED_GLYCAN":
        return `${featureTypes.LINKED_GLYCAN}`;
      case "GLYCO_LIPID":
        return `${featureTypes.GLYCO_LIPID}`;
      case "GLYCO_PEPTIDE":
        return `${featureTypes.GLYCO_PEPTIDE}`;
      case "GLYCO_PROTEIN":
        return `${featureTypes.GLYCO_PROTEIN}`;
      case "GLYCO_PROTEIN_LINKED_GLYCOPEPTIDE":
        return `${featureTypes.GLYCO_PROTEIN_LINKED_GLYCOPEPTIDE}`;
      case "CONTROL":
        return `${featureTypes.CONTROL}`;
      case "NEGATIVE_CONTROL":
        return `${featureTypes.NEGATIVE_CONTROL}`;
      case "COMPOUND":
        return `${featureTypes.COMPOUND}`;
      case "LANDING_LIGHT":
        return `${featureTypes.LANDING_LIGHT}`;
      default:
        return "Unknown typeIndex";
    }
  }
  function getStepLabel(stepIndex) {
    switch (stepIndex) {
      case 0:
        return "Select the Feature Type";
      case 1:
        return `Select Linker From the Table Below (${getMoleculeType(featureAddState.type)})`;
      case 2:
        return `Select Lipid From the Table Below (${getMoleculeType(featureAddState.type)})`;
      case 3:
        return `Select Glycan From the Table Below (${getMoleculeType(featureAddState.type)})`;
      case 4:
        return `Add Generic Information (${getMoleculeType(featureAddState.type)})`;
      case 5:
        return "Review and Add Molecule to Repository";
      default:
        return "Unknown stepIndex";
    }
  }

  const isStepSkipped = (step) => {
    return featureAddState.type !== "LINKED_GLYCAN" && featureAddState.isLipidLinkedToSurfaceUsingLinker === "No"
      ? step === 1 && activeStep === 2
      : (featureAddState.type === "CONTROL" ||
          featureAddState.type === "NEGATIVE_CONTROL" ||
          featureAddState.type === "COMPOUND" ||
          featureAddState.type === "LANDING_LIGHT") &&
          step === 2 &&
          activeStep === 3;
  };

  const handleNextLinker = () => {
    var stepIncrement = 1;

    if (activeStep === 2) {
      setMetaDataStep(true);
    } else if (metaDataStep) {
      setMetaDataStep(false);
    }

    if (activeStep === 1) {
      setLinkerValidated(true);
      if (featureAddState.type !== "LINKED_GLYCAN") {
        stepIncrement += 1;
      } else {
        if (featureAddState.linker && featureAddState.linker.id) {
          let isValidLinker = setupGlycanSelection(featureAddState.linker);
          setValidLinker(isValidLinker);
        } else {
          return;
        }
      }
    } else if (activeStep === 2) {
      if (featureAddState.type === "LINKED_GLYCAN") {
        if (featureAddState.glycans.length < 1) {
          setPageErrorsJson({});
          setErrorMessage("Glycan selection is required.");
          setShowErrorSummary(true);
          return;
        }
      }
    } else if (activeStep === 4) {
      addFeature();
      return;
    }
    setActiveStep((prevActiveStep) => prevActiveStep + stepIncrement);
  };

  const handleNextGlycoLipid = () => {
    var stepIncrement = 1;

    if (activeStep === 3) {
      setMetaDataStep(true);
    } else if (metaDataStep) {
      setMetaDataStep(false);
    }

    if (activeStep === 0 && featureAddState.isLipidLinkedToSurfaceUsingLinker === "No") {
      stepIncrement = stepIncrement + 1;
    } else if (activeStep === 1) {
      if (featureAddState.isLipidLinkedToSurfaceUsingLinker === "Yes") {
        if (featureAddState.linker && featureAddState.linker.id) {
          // let isValidPeptideLinker = setupGlycanSelection(featureAddState.peptide);
          // setValidLinker(isValidPeptideLinker);
        } else {
          setLinkerValidated(true);
          return;
        }
        setOnlyMyLinkers(false);
      }
    } else if (activeStep === 2) {
      if (featureAddState.type === "GLYCO_LIPID") {
        if (featureAddState.lipid && !featureAddState.lipid.id) {
          setLinkerValidated(true);
          return;
        }
      }

      if (featureAddState.type === "GLYCO_PEPTIDE") {
        if (featureAddState.peptide && !featureAddState.peptide.id) {
          setLinkerValidated(true);
          return;
        } else {
          let isValidPeptideLinker = setupGlycanSelection(featureAddState.peptide);
          setValidLinker(isValidPeptideLinker);
        }
      }

      if (featureAddState.type === "GLYCO_PROTEIN" || featureAddState.type === "GLYCO_PROTEIN_LINKED_GLYCOPEPTIDE") {
        if (featureAddState.protein && !featureAddState.protein.id) {
          setLinkerValidated(true);
          return;
        } else {
          let isValidPeptideLinker = setupGlycanSelection(featureAddState.protein);
          setValidLinker(isValidPeptideLinker);
        }
      }
    } else if (activeStep === 3) {
      let count = 0;

      if (featureAddState.type === "GLYCO_PEPTIDE" || featureAddState.type === "GLYCO_PROTEIN") {
        if (featureAddState.rangeGlycans.length < 1) {
          let unfilledPositions = featureAddState.glycans.filter((i) => !i.glycan);
          if (unfilledPositions.length > 0) {
            count++;
          }
        }
      } else if (featureAddState.type === "GLYCO_PROTEIN_LINKED_GLYCOPEPTIDE") {
        if (featureAddState.rangeGlycoPeptides.length < 1) {
          let unfilledPositions = featureAddState.glycoPeptides.filter((i) => !i.glycoPeptide);
          if (unfilledPositions.length > 0) {
            count++;
          }
        }
      } else if (featureAddState.type === "GLYCO_LIPID") {
        if (featureAddState.glycans.length < 1) {
          count++;
        }
      }

      if (count > 0) {
        if (featureAddState.type === "GLYCO_PROTEIN_LINKED_GLYCOPEPTIDE") {
          setErrorMessage("GlycoPeptide selection is required.");
        } else {
          setErrorMessage("Glycan selection is required.");
        }
        setPageErrorsJson({});
        setShowErrorSummary(true);
        return;
      } else {
        setShowErrorSummary(false);
      }
    } else if (activeStep === 5) {
      addFeature();
      return;
    }

    setActiveStep((prevActiveStep) => prevActiveStep + stepIncrement);
  };

  const handleBack = () => {
    var stepDecrement = 1;
    if (metaDataStep) {
      setMetaDataStep(false);
    } else if (activeStep > 3) {
      setMetaDataStep(true);
    }

    setErrorMessage("");
    setPageErrorsJson({});
    setShowErrorSummary(false);

    if (activeStep === 1) {
      setLinkerValidated(false);
    } else if (
      activeStep === 2 &&
      featureAddState.type !== "LINKED_GLYCAN" &&
      featureAddState.isLipidLinkedToSurfaceUsingLinker === "No"
    ) {
      stepDecrement += 1;
    }
    // if (activeStep === 3) {
    //   // if (featureAddState.type !== "LINKED_GLYCAN" && featureAddState.isLipidLinkedToSurfaceUsingLinker === "No") {
    //   //   stepDecrement += 1;
    //   // }
    // }
    setOnlyMyLinkers(false);
    setActiveStep((prevActiveStep) => prevActiveStep - stepDecrement);
  };

  const handleTypeSelect = (e) => {
    const newValue = e.target.value;
    setFeatureAddState({ ...featureAddInitState, ...{ type: newValue } });
  };

  const handleLinkerSelect = (linker, isModal) => {
    if (isModal && featureAddState.type === "GLYCO_LIPID") {
      setShowLinkerPicker(false);
      let selectedGlycans = [...featureAddState.glycans];
      selectedGlycans[0].linker = linker;
      setFeatureAddState({ glycans: selectedGlycans });
    } else if (
      isModal &&
      (featureAddState.type === "GLYCO_PEPTIDE" || featureAddState.type === "GLYCO_PROTEIN") &&
      !featureAddState.positionDetails.isPosition
    ) {
      setShowLinkerPicker(false);
      let selectedGlycans = [...featureAddState.rangeGlycans];

      let index =
        linkerForSelectedGlycan && linkerForSelectedGlycan.glycan
          ? linkerForSelectedGlycan.glycan.index
          : linkerForSelectedGlycan.index;

      let glycan = selectedGlycans.find((i) => i.index === index);
      let glycanIndex = selectedGlycans.indexOf(glycan);

      glycan.linker = linker;
      selectedGlycans[glycanIndex] = glycan;
      setFeatureAddState({ rangeGlycans: selectedGlycans });
    } else if (
      isModal &&
      (featureAddState.type === "GLYCO_PEPTIDE" || featureAddState.type === "GLYCO_PROTEIN") &&
      featureAddState.positionDetails.isPosition
    ) {
      setShowLinkerPicker(false);

      let selectedGlycans = [...featureAddState.glycans];

      let index =
        linkerForSelectedGlycan && linkerForSelectedGlycan.glycan
          ? linkerForSelectedGlycan.glycan.index
          : linkerForSelectedGlycan.index;

      let glycan = selectedGlycans.find((i) => i.glycan && i.glycan.index === index);

      let glycanIndex = selectedGlycans.indexOf(glycan);

      glycan.linker = linker;
      selectedGlycans[glycanIndex] = glycan;
      setFeatureAddState({ glycans: selectedGlycans });
    } else {
      setFeatureAddState({ linker: linker });
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "smooth",
      });
      setValidLinker(true);
    }
  };

  const handleLipidSelect = (lipid) => {
    setFeatureAddState({ lipid: lipid });
    setLinkerValidated(false);

    ScrollToTop();
  };

  const handlePeptideSelect = (peptide) => {
    setFeatureAddState({ peptide: peptide });
    setLinkerValidated(false);

    ScrollToTop();
  };

  const handleProteinSelect = (protein) => {
    setFeatureAddState({ protein: protein });
    setLinkerValidated(false);

    if (featureAddState.type === "GLYCO_PROTEIN_LINKED_GLYCOPEPTIDE") {
      setFeatureAddState({ glycoPeptides: [] });
    }

    ScrollToTop();
  };

  const handleChecboxChange = (row) => {
    var selectedrows = [...rowSelected];
    var deselectedRow = selectedrows.find((e) => e.id === row.id);

    if (deselectedRow) {
      var deselectedRowIndex = selectedrows.indexOf(deselectedRow);
      selectedrows.splice(deselectedRowIndex, 1);
    } else {
      selectedrows.push(row);
      setErrorMessage("");
      setShowErrorSummary(false);
    }

    setCurrentGlycanSelection(row);
    setFeatureAddState({ glycans: selectedrows });
    setRowSelected(selectedrows);
  };

  const checkSelection = (row) => {
    if (featureAddState.glycans && featureAddState.glycans.length > 0) {
      rowSelected = [...featureAddState.glycans];
    }
    return rowSelected.find((e) => e.id === row.id);
  };

  const getGlycoLipidStep1 = () => {
    return (
      <RadioGroup
        name="molecule-type"
        onChange={(e) => {
          setFeatureAddState({
            isLipidLinkedToSurfaceUsingLinker: e.target.value,
          });
          setLinkerValidated(false);
        }}
        value={featureAddState.isLipidLinkedToSurfaceUsingLinker}
      >
        {Object.keys(glycoLipidOptionsPage1).map((key) => {
          return (
            <FormControlLabel
              value={glycoLipidOptionsPage1[key]}
              control={<BlueRadio />}
              label={glycoLipidOptionsPage1[key]}
            />

            // <FormCheck key={key} className="line-break-2">
            //   <FormCheck.Label>
            //     <FormCheck.Input
            //       type="radio"
            //       value={glycoLipidOptionsPage1[key]}
            //       onChange={(e) => {
            //         setFeatureAddState({
            //           isLipidLinkedToSurfaceUsingLinker: e.target.value,
            //         });
            //         setLinkerValidated(false);
            //       }}
            //       checked={featureAddState.isLipidLinkedToSurfaceUsingLinker === glycoLipidOptionsPage1[key]}
            //     />
            //     {glycoLipidOptionsPage1[key]}
            //   </FormCheck.Label>
            // </FormCheck>
          );
        })}
      </RadioGroup>
    );
  };

  const getMetadata = () => {
    return (
      <>
        <MetaData
          type={"FEATURE"}
          featureAddState={featureAddState}
          setFeatureAddState={setFeatureAddState}
          metadataType={"Feature"}
          importedInAPage={true}
          importedPageData={featureMetadata}
          setMetadataforImportedPage={setFeatureMetadata}
          handleBack={handleBack}
          handleNext={featureAddState.type === "LINKED_GLYCAN" ? handleNextLinker : handleNextGlycoLipid}
          setImportedPageDataToSubmit={setSpotMetaDataToSubmit}
        />
      </>
    );
  };

  const getTableforLinkers = (isModal) => {
    return (
      <>
        <Linkers
          onlyMyLinkers={onlyMyLinkers}
          isModal={isModal}
          selectButtonHeader={"Select"}
          showSelectButton
          showOnlyMyLinkersOrGlycansCheckBox
          handleChangeForOnlyMyLinkersGlycans={() => setOnlyMyLinkers(!onlyMyLinkers)}
          onlyMyLinkersGlycans={onlyMyLinkers}
          onlyMyLinkersGlycansCheckBoxLabel={"Show all available linkers"}
          isImported
          selectButtonHandler={handleLinkerSelect}
        />
      </>
    );
  };

  const getTableforPeptides = (isModal) => {
    return (
      <>
        <Form className="radioform1">
          <Form.Group as={Row} controlId="peptide" className="gg-align-center mb-3">
            <Col xs={12} lg={9}>
              <FormLabel label="Selected Peptide" />
              <Form.Control
                type="text"
                name="peptide"
                value={featureAddState.peptide.name}
                disabled={true}
                placeholder="No Peptide selected"
                isInvalid={linkerValidated}
              />
              <Feedback message="Please select a Peptide from the table below"></Feedback>
            </Col>
          </Form.Group>
        </Form>

        <Peptides
          onlyMyLinkers={onlyMyLinkers}
          isModal={isModal}
          selectButtonHeader={"Select"}
          showSelectButton
          selectButtonHandler={handlePeptideSelect}
          showOnlyMyLinkersOrGlycansCheckBox
          handleChangeForOnlyMyLinkersGlycans={() => setOnlyMyLinkers(!onlyMyLinkers)}
          onlyMyLinkersGlycans={onlyMyLinkers}
          onlyMyLinkersGlycansCheckBoxLabel={"Show all available peptides"}
          isImported
        />
      </>
    );
  };

  const getTableforProteins = (isModal) => {
    return (
      <>
        <Form className="radioform1">
          <Form.Group as={Row} controlId="protein" className="gg-align-center mb-3">
            <Col xs={12} lg={9}>
              <FormLabel label="Selected Protein" />
              <Form.Control
                type="text"
                name="protein"
                value={featureAddState.protein.name}
                disabled={true}
                placeholder="No Protein selected"
                isInvalid={linkerValidated}
              />
              <Feedback message="Please select a Protein from the table below" />
            </Col>
          </Form.Group>
        </Form>

        <Proteins
          onlyMyLinkers={onlyMyLinkers}
          isModal={isModal}
          selectButtonHeader={"Select"}
          showSelectButton
          selectButtonHandler={handleProteinSelect}
          showOnlyMyLinkersOrGlycansCheckBox
          handleChangeForOnlyMyLinkersGlycans={() => setOnlyMyLinkers(!onlyMyLinkers)}
          onlyMyLinkersGlycans={onlyMyLinkers}
          onlyMyLinkersGlycansCheckBoxLabel={"Show all available proteins"}
          isImported
        />
      </>
    );
  };

  const getTableforLipids = (isModal) => {
    return (
      <>
        <Form>
          <Form.Group as={Row} controlId="lipid" className="gg-align-center">
            <Col xs={12} lg={9}>
              <FormLabel label="Selected Lipid" />
              {!featureAddState.lipid.name ? (
                <>
                  <Form.Control
                    type="text"
                    name="lipid"
                    value={featureAddState.lipid.name}
                    disabled={true}
                    placeholder="No lipid selected"
                    isInvalid={linkerValidated}
                  />
                  <Feedback message="Please select a lipid from the table below"></Feedback>
                </>
              ) : (
                <Form.Control
                  type="text"
                  readOnly
                  disabled
                  defaultValue={featureAddState.lipid.name ? featureAddState.lipid.name : ""}
                />
                //  <label>{featureAddState.lipid.name ? featureAddState.lipid.name : ""}</label>
              )}
            </Col>
          </Form.Group>

          {featureAddState.lipid.imageURL && (
            <Form.Group as={Row} controlId="lipidimage" className="gg-align-center">
              <Col md={4}>
                <StructureImage imgUrl={featureAddState.lipid.imageURL}></StructureImage>
              </Col>
            </Form.Group>
          )}
        </Form>

        <Lipids
          onlyMyLinkers={onlyMyLinkers}
          isModal={isModal}
          selectButtonHeader={"Select"}
          showSelectButton
          selectButtonHandler={handleLipidSelect}
          showOnlyMyLinkersOrGlycansCheckBox
          handleChangeForOnlyMyLinkersGlycans={() => setOnlyMyLinkers(!onlyMyLinkers)}
          onlyMyLinkersGlycans={onlyMyLinkers}
          onlyMyLinkersGlycansCheckBoxLabel={"Show all available lipids"}
          isImported
        />
      </>
    );
  };

  function formatSequenceForDisplay(sequence, charsPerLine) {
    return sequence.match(new RegExp(".{1," + charsPerLine + "}", "g")).join("\n");
  }

  function setupGlycanSelection(linker) {
    var valid = true; // all NORMAL features are initially valid
    var chooseGlycanTableData = [{ glycan: [] }];

    if (linker.type !== "SMALLMOLECULE" && linker.sequence) {
      chooseGlycanTableData = getAAPositionsFromSequence(linker.sequence);

      if (featureAddState.type === "GLYCO_PROTEIN_LINKED_GLYCOPEPTIDE" && featureAddState.glycoPeptides.length === 0) {
        valid = false; //if linker is protein/peptide, then invalidate until a valid attachable position is found
        if (chooseGlycanTableData.length > 0) {
          valid = true; //attachable position for glycoPeptide found
          chooseGlycanTableData.forEach((e) => (e["glycoPeptide"] = undefined));
        }
        setFeatureAddState({ glycoPeptides: chooseGlycanTableData });
      } else if (featureAddState.glycans.length === 0) {
        valid = false; //if linker is protein/peptide, then invalidate until a valid attachable position is found
        if (chooseGlycanTableData.length > 0) {
          valid = true; //attachable position for glycan found
          chooseGlycanTableData.forEach((e) => (e["glycan"] = undefined));
        }
        setFeatureAddState({ glycans: chooseGlycanTableData });
      }
    }

    return valid;
  }

  function displayGlycanPicker(index) {
    setShowGlycanPicker(true);
    // setGlycanPickIndex(index);
  }

  function addFeature() {
    let featureObj = {};

    if (featureAddState.type === "LINKED_GLYCAN") {
      featureObj = getLinkedGlycanData(featureObj);
    } else if (featureAddState.type === "GLYCO_LIPID") {
      featureObj = getGlycoLipidData(featureObj);
    } else if (featureAddState.type === "GLYCO_PEPTIDE") {
      featureObj = getGlycoData(featureObj, "GLYCOPEPTIDE");
    } else if (featureAddState.type === "GLYCO_PROTEIN") {
      featureObj = getGlycoData(featureObj, "GLYCOPROTEIN");
    } else if (featureAddState.type === "GLYCO_PROTEIN_LINKED_GLYCOPEPTIDE") {
      featureObj = getGlycoProteinLinkedPeptide(featureObj, "GPLINKEDGLYCOPEPTIDE");
    }

    setShowLoading(true);
    wsCall("addfeature", "POST", null, true, featureObj, addFeatureSuccess, addFeatureError);

    function addFeatureSuccess() {
      setShowLoading(false);
      history.push("/features");
    }

    function addFeatureError(response) {
      response.json().then((responseJson) => {
        setShowErrorSummary(true);
        setErrorMessage("");
        setPageErrorsJson(responseJson);
        setShowLoading(false);
      });
    }
  }

  function metadataToSubmit() {
    const descriptorGroups = getMetadataSubmitData(featureMetadata);

    // const descriptors = getDescriptors();

    let objectToBeSaved = {
      name: featureAddState.name,
      user: {
        name: window.localStorage.getItem("loggedinuser"),
      },
      template: "Default Feature",
      descriptors: [],
      descriptorGroups: descriptorGroups,
      id: "",
    };

    return objectToBeSaved;
  }

  function getLinkedGlycanData(featureObj) {
    featureObj = {
      type: "LINKEDGLYCAN",

      name: featureAddState.name,
      internalId: featureAddState.featureId,
      linker: featureAddState.linker,
      glycans: featureAddState.glycans.map((glycanObj) => {
        let glycanDetails = {};
        let reducingEndConfiguration = {};

        glycanDetails.glycan = glycanObj;

        glycanDetails.urls = glycanObj.urls;
        glycanDetails.publications = glycanObj.papers;

        reducingEndConfiguration.type = glycanObj.opensRing;
        reducingEndConfiguration.comment = glycanObj.opensRing === 4 ? glycanObj.equilibriumComment : "";
        glycanDetails.reducingEndConfiguration = reducingEndConfiguration;

        glycanDetails.source = glycanObj.source;
        return glycanDetails;
      }),

      positionMap: featureAddState.glycans.reduce((map, glycanObj) => {
        if (glycanObj && glycanObj.glycan && glycanObj.glycan.id) {
          map[glycanObj.position] = glycanObj.glycan.id;
        }
        return map;
      }, {}),

      metadata: metadataToSubmit(),
    };
    return featureObj;
  }

  function getGlycoLipidData(featureObj) {
    let glycans = featureAddState.glycans.map((glycanObj) => {
      let glycans = {};
      let reducingEndConfiguration = {};

      glycans.glycan = glycanObj;
      glycans.urls = glycanObj.urls;

      glycans.publications = glycanObj.papers;

      reducingEndConfiguration.type = glycanObj.opensRing;
      reducingEndConfiguration.comment = glycanObj.opensRing === 4 ? glycanObj.equilibriumComment : "";
      glycans.reducingEndConfiguration = reducingEndConfiguration;
      glycans.linker = glycanObj.linker;
      glycans.source = glycanObj.source;

      return glycans;
    });

    featureObj = {
      type: "GLYCOLIPID",

      name: featureAddState.name,
      internalId: featureAddState.featureId,
      linker: featureAddState.linker,
      lipid: featureAddState.lipid,
      glycans: [{ glycans: glycans, type: "LINKEDGLYCAN", linker: glycans[0].linker }],
      positionMap: featureAddState.glycans.reduce((map, glycanObj) => {
        if (glycanObj && glycanObj.glycan && glycanObj.glycan.id) {
          map[glycanObj.position] = glycanObj.glycan.id;
        }
        return map;
      }, {}),

      metadata: metadataToSubmit(),
    };

    return featureObj;
  }

  function getGlycoData(featureObj, type) {
    let glycanList = featureAddState.rangeGlycans.length > 0 ? featureAddState.rangeGlycans : featureAddState.glycans;

    let glycans = glycanList.map((positionDetails) => {
      let range;
      let glycanObj;
      if (featureAddState.rangeGlycans.length > 0) {
        glycanObj = positionDetails;
      } else {
        glycanObj = positionDetails.glycan;
      }

      let glycans = {};
      glycans.type = "LINKEDGLYCAN";
      let reducingEndConfiguration = {};

      glycans.glycan = glycanObj;
      glycans.urls = glycanObj.urls;

      glycans.publications = glycanObj.papers;

      reducingEndConfiguration.type = glycanObj.opensRing;
      reducingEndConfiguration.comment = glycanObj.opensRing === 4 ? glycanObj.equilibriumComment : "";
      glycans.reducingEndConfiguration = reducingEndConfiguration;

      glycans.source = glycanObj.source;

      if (featureAddState.rangeGlycans.length > 0) {
        range = {
          min: glycanObj.min,
          max: glycanObj.max,
        };
      }

      return {
        glycans: [glycans],
        linker: glycanObj.linker,
        range: range,
        type: "LINKEDGLYCAN",
      };
    });

    featureObj = {
      type: type,
      name: featureAddState.name,
      internalId: featureAddState.featureId,
      linker: featureAddState.linker,
      ...getKey(type),
      glycans: glycans,
      positionMap: featureAddState.glycans.reduce((map, glycanObj) => {
        if (glycanObj && glycanObj.glycan && glycanObj.glycan.id) {
          map[glycanObj.position] = glycanObj.glycan.id;
        }
        return map;
      }, {}),

      metadata: metadataToSubmit(),
    };

    return featureObj;
  }

  function getGlycoProteinLinkedPeptide(featureObj, type) {
    let glycoPeptides =
      featureAddState.rangeGlycoPeptides.length > 0
        ? featureAddState.rangeGlycoPeptides
        : featureAddState.glycoPeptides;

    let glycoPep = glycoPeptides.map((gp) => {
      let range;
      let glycoPeptideObj;

      if (featureAddState.rangeGlycoPeptides.length > 0) {
        glycoPeptideObj = gp;
      } else {
        glycoPeptideObj = gp.glycoPeptide;
      }

      if (featureAddState.rangeGlycoPeptides.length > 0) {
        range = {
          min: glycoPeptideObj.minRange,
          max: glycoPeptideObj.maxRange,
        };

        glycoPeptideObj.range = range;
      }

      return glycoPeptideObj;
      // return {
      // glycoPeptides: glycoPeptideObj,
      // linker: glycoPeptideObj.linker,
      // range: range,
      // type: "GLYCOPEPTIDE"
      // };
    });

    featureObj = {
      type: type,
      name: featureAddState.name,
      internalId: featureAddState.featureId,
      linker: featureAddState.linker,
      protein: featureAddState.protein,
      peptides: glycoPep,
      positionMap: featureAddState.glycoPeptides.reduce((map, glycoPeptideObj) => {
        if (glycoPeptideObj && glycoPeptideObj.glycoPeptide && glycoPeptideObj.glycoPeptide.id) {
          map[glycoPeptideObj.position] = glycoPeptideObj.glycoPeptide.id;
        }
        return map;
      }, {}),

      metadata: metadataToSubmit(),
    };

    return featureObj;
  }

  function getKey(type) {
    return type === "GLYCOPEPTIDE" ? { peptide: featureAddState.peptide } : { protein: featureAddState.protein };
  }

  const getGlycanTabletoSelect = (showSelect) => {
    return (
      <>
        {currentGlycanSelection && <>{displaySelectedGlycanInfoInFeature()}</>}

        <GlygenTable
          columns={[
            {
              Header: "Internal Id",
              accessor: "internalId",
            },
            {
              Header: "Glytoucan Id",
              accessor: "glytoucanId",
            },
            {
              Header: "Name",
              accessor: "name",
            },
            {
              Header: "Structure Image",
              accessor: "cartoon",
              Cell: (row) => <StructureImage base64={row.value} />,
              minWidth: 300,
            },
            {
              Header: "Mass",
              accessor: "mass",
              Cell: (row) => (row.value ? parseFloat(row.value).toFixed(2) : ""),
            },
          ]}
          defaultPageSize={10}
          fetchWS={onlyMyglycans ? "listallglycans" : "glycanlist"}
          keyColumn="id"
          showRowsInfo
          showSearchBox
          infoRowsText="Glycans"
          showOnlyMyLinkersOrGlycansCheckBox
          showCheckboxColumn={showSelect ? false : true}
          handleChangeForOnlyMyLinkersGlycans={() => setOnlyMyglycans(!onlyMyglycans)}
          onlyMyLinkersGlycans={onlyMyglycans}
          onlyMyLinkersGlycansCheckBoxLabel={"Show all available glycans"}
          checkboxChangeHandler={handleChecboxChange}
          defaultCheckboxHandler={checkSelection}
          selectButtonHeader="Select"
          showSelectButton={showSelect}
          selectButtonHandler={
            featureAddState.positionDetails.isPosition ? handleGlycanSelectionForPosition : handleGlycanSelect
          }
        />
      </>
    );
  };

  const displaySelectedGlycanInfoInFeature = () => {
    return (
      <>
        <Form>
          <Form.Group as={Row} controlId="id" className="gg-align-center mb-3">
            <Col xs={12} lg={9}>
              <FormLabel label="Selected Glycan" />
              <Form.Control
                type="text"
                readOnly
                disabled
                defaultValue={currentGlycanSelection.id ? currentGlycanSelection.id : ""}
              />
            </Col>
          </Form.Group>

          <Form.Group as={Row} controlId="glytoucanId" className="gg-align-center mb-3">
            <Col xs={12} lg={9}>
              <FormLabel label="Glytoucan ID" />
              <Form.Control
                type="text"
                readOnly
                disabled
                defaultValue={currentGlycanSelection.glytoucanId ? currentGlycanSelection.glytoucanId : ""}
              />
            </Col>
          </Form.Group>
          <Form.Group as={Row} controlId="image" className="gg-align-center">
            <Col md={4}>
              <StructureImage base64={currentGlycanSelection.cartoon} />
            </Col>
          </Form.Group>
        </Form>
      </>
    );
  };

  function getStepContentForLinkedGlycan(stepIndex) {
    switch (stepIndex) {
      case 0:
        return getCase0();
      case 1:
        return getCase1();
      case 2:
        return getCase2();
      case 3:
        return getMetadata();
      case 4:
        return getCase4();
      default:
        return "Invalid step";
    }
  }

  function getStepContentForGlycoLipid(stepIndex) {
    switch (stepIndex) {
      case 0:
        return getCase0();
      case 1:
        return getCase1();
      case 2:
        if (featureAddState.type === "GLYCO_LIPID") {
          return getTableforLipids(false);
        } else if (featureAddState.type === "GLYCO_PEPTIDE") {
          return getTableforPeptides(false);
        } else if (
          featureAddState.type === "GLYCO_PROTEIN" ||
          featureAddState.type === "GLYCO_PROTEIN_LINKED_GLYCOPEPTIDE"
        ) {
          return getTableforProteins(false);
        }
        break;
      case 3:
        return featureAddState.type === "GLYCO_LIPID" ? (
          getCase2ForGlycoLipid()
        ) : featureAddState.type !== "GLYCO_PROTEIN_LINKED_GLYCOPEPTIDE" ? (
          <>
            {getCase3PeptideFeature()}
            {getCase2ForGlycoLipid()}
          </>
        ) : (
          <>
            {getCase3GlycoProteinLinkedPeptideFeature()}
            {getCase2ForGlycoLipid()}
          </>
        );

      case 4:
        return getMetadata();
      case 5:
        return getCase4();

      default:
        return "Invalid step";
    }
  }

  function setPosition(e) {
    const value = e.target.value;

    let glycoFeatureData = [...glycoProteinPepTideListStep4];
    glycoFeatureData.push({ position: value, glycan: {}, linker: {}, ranger: {} });
    setGlycoProteinPepTideListStep4(glycoFeatureData);
  }

  function getStepContent(type, activeStep) {
    switch (type) {
      case "LINKED_GLYCAN":
      case "CONTROL":
      case "NEGATIVE_CONTROL":
      case "COMPOUND":
      case "LANDING_LIGHT":
        return getStepContentForLinkedGlycan(activeStep);

      case "GLYCO_LIPID":
      case "GLYCO_PEPTIDE":
      case "GLYCO_PROTEIN":
      case "GLYCO_PROTEIN_LINKED_GLYCOPEPTIDE":
        return getStepContentForGlycoLipid(activeStep);

      default:
        return "Invalid step";
    }
  }

  const getCase0 = () => {
    return (
      <>
        <Form className="radioform">
          <Row className5="gg-align-center">
            <Col sm="auto">
              <RadioGroup name="molecule-type" onChange={handleTypeSelect} value={featureAddState.type}>
                {Object.keys(featureTypes).map((key) => {
                  return (
                    <>
                      <FormControlLabel value={key} control={<BlueRadio />} label={featureTypes[key]} />
                      {featureAddState.type === "GLYCO_LIPID" && featureTypes[key] === "GlycoLipid" && (
                        <div className="ml-4">
                          <h5 className="gg-blue">Is the lipid linked to the surface using a linker?</h5>
                          {getGlycoLipidStep1()}
                        </div>
                      )}

                      {featureAddState.type === "GLYCO_PEPTIDE" && featureTypes[key] === "GlycoPeptide" && (
                        <div className="ml-4">
                          <h5 className="gg-blue">Is the peptide linked to the surface using a linker?</h5>
                          {getGlycoLipidStep1()}
                        </div>
                      )}

                      {((featureAddState.type === "GLYCO_PROTEIN" && featureTypes[key] === "GlycoProtein") ||
                        (featureAddState.type === "GLYCO_PROTEIN_LINKED_GLYCOPEPTIDE" &&
                          featureTypes[key] === "GlycoProtein linked GlycoPeptide")) && (
                        <div className="ml-4">
                          <h5 className="gg-blue">Is the protein linked to the surface using a linker?</h5>
                          {getGlycoLipidStep1()}
                        </div>
                      )}
                    </>
                  );
                })}
              </RadioGroup>
            </Col>
          </Row>
        </Form>
      </>
    );
  };

  const getCase1 = () => {
    return (
      <>
        {((featureAddState.type === "GLYCO_LIPID" && featureAddState.isLipidLinkedToSurfaceUsingLinker === "Yes") ||
          (featureAddState.type === "GLYCO_PEPTIDE" && featureAddState.isLipidLinkedToSurfaceUsingLinker === "Yes") ||
          (featureAddState.type === "GLYCO_PROTEIN" && featureAddState.isLipidLinkedToSurfaceUsingLinker === "Yes") ||
          (featureAddState.type === "GLYCO_PROTEIN_LINKED_GLYCOPEPTIDE" &&
            featureAddState.isLipidLinkedToSurfaceUsingLinker === "Yes") ||
          featureAddState.type === "LINKED_GLYCAN" ||
          featureAddState.type === "CONTROL" ||
          featureAddState.type === "NEGATIVE_CONTROL" ||
          featureAddState.type === "COMPOUND" ||
          featureAddState.type === "LANDING_LIGHT") &&
          (linkerValidated || Object.keys(featureAddState.linker).length > 0) &&
          getSelectedLinkerInformation()}

        {((featureAddState.type === "GLYCO_LIPID" && featureAddState.isLipidLinkedToSurfaceUsingLinker === "Yes") ||
          (featureAddState.type === "GLYCO_PEPTIDE" && featureAddState.isLipidLinkedToSurfaceUsingLinker === "Yes") ||
          (featureAddState.type === "GLYCO_PROTEIN" && featureAddState.isLipidLinkedToSurfaceUsingLinker === "Yes") ||
          (featureAddState.type === "GLYCO_PROTEIN_LINKED_GLYCOPEPTIDE" &&
            featureAddState.isLipidLinkedToSurfaceUsingLinker === "Yes") ||
          featureAddState.type === "LINKED_GLYCAN" ||
          featureAddState.type === "CONTROL" ||
          featureAddState.type === "NEGATIVE_CONTROL" ||
          featureAddState.type === "COMPOUND" ||
          featureAddState.type === "LANDING_LIGHT") && <FormCheck>{getTableforLinkers(false)}</FormCheck>}
      </>
    );
  };

  const getSelectedLinkerInformation = () => {
    return (
      <>
        <Form>
          <Form.Group as={Row} controlId="name" className="gg-align-center mb-3">
            <Col xs={12} lg={9}>
              <FormLabel label="Selected Linker" />
              {!featureAddState.linker.name ? (
                <>
                  <Form.Control
                    type="text"
                    name="linker_name"
                    value={featureAddState.linker.name}
                    disabled={true}
                    placeholder="No linker selected"
                    isInvalid={linkerValidated && Object.keys(featureAddState.linker).length === 0}
                  />
                  <Feedback message="Please select a linker from the table below"></Feedback>
                </>
              ) : (
                <>
                  <Form.Control
                    type="text"
                    readOnly
                    disabled
                    defaultValue={featureAddState.linker.name ? featureAddState.linker.name : ""}
                  />
                </>
                // <label> {featureAddState.linker.name ? featureAddState.linker.name : ""}</label>
              )}
            </Col>
          </Form.Group>

          {featureAddState.linker.iupacName && (
            <Form.Group as={Row} controlId="iupacname" className="gg-align-center mb-3">
              <Col xs={12} lg={9}>
                <FormLabel label="IUPAC Name" />
                <>
                  <Form.Control
                    type="text"
                    readOnly
                    disabled
                    defaultValue={featureAddState.linker.iupacName ? featureAddState.linker.iupacName : ""}
                  />
                </>
                {/* <label>{featureAddState.linker.iupacName ? featureAddState.linker.iupacName : ""}</label> */}
              </Col>
            </Form.Group>
          )}

          {featureAddState.linker.imageURL ? (
            <Form.Group as={Row} controlId="name" className="gg-align-center text-center mb-3">
              <Col md={4}>
                <StructureImage imgUrl={featureAddState.linker.imageURL}></StructureImage>
              </Col>
            </Form.Group>
          ) : (
            (featureAddState.linker.description || featureAddState.linker.comment) && (
              <Form.Group as={Row} controlId="comment" className="gg-align-center mb-3">
                <Col xs={12} lg={9}>
                  <FormLabel label="Comment" />
                  <>
                    <Form.Control
                      type="text"
                      readOnly
                      disabled
                      defaultValue={
                        featureAddState.linker.comment
                          ? featureAddState.linker.comment
                          : featureAddState.linker.description
                          ? featureAddState.linker.description
                          : ""
                      }
                    />
                  </>
                </Col>
              </Form.Group>
            )
          )}
        </Form>
      </>
    );
  };

  const getCase3PeptideFeature = () => {
    return (
      <>
        {/* <div className="text-center mt-4 mb-4">
          <h3 className="gg-blue">List of Glycans in Positions</h3>
          <h5>
            Add glycan and linker for each available position below by clicking <strong>Pick Glycan</strong> and
            providing the glycan details.
          </h5>
        </div> */}
        <PageHeading
          title="List of Glycans in Positions"
          subTitle="Add glycan and linker for each available position below and provide the glycan details."
        />
        <ReactTable
          columns={[
            ...(featureAddState.linker.type !== "SMALLMOLECULE_LINKER"
              ? [
                  {
                    Header: "Position",
                    accessor: "position",
                  },
                  {
                    Header: "Amino Acid",
                    accessor: "aminoAcid",
                  },
                ]
              : []),
            {
              Header: "Glycan",
              accessor: "glycan",
              // eslint-disable-next-line react/display-name
              Cell: (row, index) =>
                row.value ? (
                  row.value.cartoon ? (
                    <StructureImage key={index} base64={row.value.cartoon} />
                  ) : row.value.name ? (
                    row.value.name
                  ) : (
                    "No Glycan Selected"
                  )
                ) : (
                  "No Glycan Selected"
                ),
              minWidth: 150,
            },
            ...(featureAddState.type === "GLYCO_PEPTIDE" || featureAddState.type === "GLYCO_PROTEIN"
              ? [
                  {
                    Header: "Linker",
                    accessor: "linker",
                    Cell: (row, index) => {
                      return row.original.linker ? (
                        getToolTip(row.original.linker.name)
                      ) : (
                        <Button
                          className="gg-btn-outline-reg"
                          // style={{
                          //   backgroundColor: "lightgray",
                          // }}
                          onClick={() => {
                            setLinkerForSelectedGlycan(row.original);
                            setShowLinkerPicker(true);
                          }}
                          disabled={!row.original.glycan}
                        >
                          Add Linker
                        </Button>
                      );
                    },
                    minWidth: 150,
                  },
                ]
              : []),
            {
              Header: "",
              // eslint-disable-next-line react/display-name
              Cell: ({ row, index }) => {
                return row.glycan ? (
                  <>
                    <FontAwesomeIcon
                      key={"delete" + index}
                      icon={["far", "trash-alt"]}
                      size="lg"
                      alt="Delete selected position icon"
                      title="Delete selected position icon"
                      className="caution-color tbl-icon-btn"
                      onClick={() => {
                        let glycansList = featureAddState.glycans;

                        let selectedPosition = glycansList.find((e) => e.position === row.position);
                        let positionIndex = featureAddState.glycans.indexOf(selectedPosition);

                        selectedPosition.glycan = undefined;
                        selectedPosition.linker = undefined;
                        glycansList[positionIndex] = selectedPosition;
                        setFeatureAddState({ glycans: glycansList });
                      }}
                    />
                  </>
                ) : (
                  <>
                    <Button
                      className="gg-btn-outline-reg"
                      key={index}
                      // type="button"
                      onClick={() => {
                        displayGlycanPicker(index);
                        let positionSelected = {};
                        positionSelected.number = row.position;
                        positionSelected.isPosition = true;

                        setFeatureAddState({ positionDetails: positionSelected });
                      }}
                      // value="Pick Glycan"
                      disabled={featureAddState.rangeGlycans.length > 0}
                    >
                      {/* Pick Glycan */}
                      Select Glycan
                    </Button>
                  </>
                );
              },
            },
          ]}
          data={featureAddState.glycans}
          defaultPageSize={featureAddState.glycans.length}
          showPagination={false}
          showSearchBox
        />
      </>
    );
  };

  const getGlycanInfoDisplay = (glycan) => {
    setEnableGlycanViewInfoDialog(true);
    setGlycanViewInfo(glycan.original);
  };

  const getCase3GlycoProteinLinkedPeptideFeature = () => {
    return (
      <>
        {/* <div className="text-center mt-4 mb-4">
          <h3 className="gg-blue">List of GlycoPeptides in Positions</h3>
          <h5>
            Add GlycoPeptide and linker for each available position below by clicking <strong>Pick Glycan</strong>
          </h5>
        </div> */}
        <PageHeading
          title="List of GlycoPeptides in Positions"
          subTitle="Add glycoPeptide and linker for each available position below."
        />
        <ReactTable
          columns={[
            ...(featureAddState.linker.type !== "SMALLMOLECULE_LINKER"
              ? [
                  {
                    Header: "Position",
                    accessor: "position",
                  },
                  {
                    Header: "Amino Acid",
                    accessor: "aminoAcid",
                  },
                ]
              : []),
            {
              Header: "GlycoPeptide",
              accessor: "glycoPeptide",
              // eslint-disable-next-line react/display-name
              Cell: (row, index) =>
                row.value ? (
                  row.value.cartoon ? (
                    <StructureImage key={index} base64={row.value.cartoon} />
                  ) : row.value.name ? (
                    row.value.name
                  ) : (
                    "No GlycoPeptide Selected"
                  )
                ) : (
                  "No GlycoPeptide Selected"
                ),
              minWidth: 150,
            },
            {
              Header: "Linker",
              accessor: "glycoPeptide",
              Cell: (row, index) => {
                return row.value && row.value.linker ? (
                  <Link key={index} to={"/linkers/editLinker/" + row.value.id} target="_blank">
                    {getToolTip(row.value.linker.name)}
                  </Link>
                ) : (
                  "No Linker Selected"
                );
                //   <Button
                //     style={{
                //       backgroundColor: "lightgray"
                //     }}
                //     onClick={() => {
                //       setLinkerForSelectedGlycoPeptide(row.original);
                //       setShowLinkerPicker(true);
                //     }}
                //     disabled={!row.original.glycoPeptide}
                //   >
                //     Add linker
                //   </Button>
              },
              minWidth: 150,
            },
            {
              Header: "",
              // eslint-disable-next-line react/display-name
              Cell: ({ row, index }) => {
                return row.glycoPeptide && row.glycoPeptide.name ? (
                  <>
                    <FontAwesomeIcon
                      key={"delete" + index}
                      icon={["far", "trash-alt"]}
                      size="lg"
                      alt="Delete selected position icon"
                      title="Delete selected position icon"
                      className="caution-color tbl-icon-btn"
                      onClick={() => {
                        let glycoPeptidesList = featureAddState.glycoPeptides;

                        let selectedPosition = glycoPeptidesList.find((e) => e.position === row.position);
                        let positionIndex = featureAddState.glycoPeptides.indexOf(selectedPosition);

                        selectedPosition.glycoPeptide = undefined;
                        selectedPosition.linker = undefined;
                        glycoPeptidesList[positionIndex] = selectedPosition;
                        setFeatureAddState({ glycoPeptides: glycoPeptidesList });
                      }}
                    />
                  </>
                ) : (
                  <>
                    <Button
                      className="gg-btn-outline-reg"
                      key={index}
                      onClick={() => {
                        setShowGlycoPeptides(true);

                        let positionSelected = {};
                        positionSelected.number = row.position;
                        positionSelected.isPosition = true;

                        setFeatureAddState({ positionDetails: positionSelected });
                      }}
                      disabled={featureAddState.rangeGlycoPeptides.length > 0}
                    >
                      {/* Pick GlycoPeptide */}
                      Select GlycoPeptide
                    </Button>
                  </>
                );
              },
            },
          ]}
          data={featureAddState.glycoPeptides}
          defaultPageSize={featureAddState.glycoPeptides.length}
          showPagination={false}
          showSearchBox
        />
        {showGlycoPeptides && getGlycoPeptidesModal()}
      </>
    );
  };

  const deleteGlycoPeptideLinkedProteinSelection = (row) => {
    let glycoPeptidesList = featureAddState.rangeGlycoPeptides;

    let selectedGlycoPep = glycoPeptidesList.find((e) => e.index === row.index);
    let selectedIndex = glycoPeptidesList.indexOf(selectedGlycoPep);
    glycoPeptidesList.splice(selectedIndex, 1);

    setFeatureAddState({ rangeGlycoPeptides: glycoPeptidesList });
  };

  const viewGlycoPeptide = (row) => {
    let glycoPeptideId =
      row.original && row.original.glycoPeptide
        ? row.original.glycoPeptide.id
        : row.original && row.original.id
        ? row.original.id
        : row.id;

    window.open(`/features/viewFeature/${glycoPeptideId}`, "_blank");
  };

  const glycoPeptideList = () => {
    return (
      <>
        <GlycoPeptides
          customViewonClick
          viewOnClick={viewGlycoPeptide}
          selectButtonHeader="Select"
          showSelectButton
          // ={featureAddState.rangeGlycoPeptides.length > 0 ? false : true}
          selectButtonHandler={
            featureAddState.positionDetails.isPosition
              ? handleGlycoPeptideSelectionForPosition
              : handleGlycoPeptideSelectGPLGP
          }
        />
      </>
    );
  };

  const getGlycoPeptidesModal = () => {
    return (
      <>
        <Modal
          size="xl"
          aria-labelledby="contained-modal-title-vcenter"
          centered
          show={showGlycoPeptides}
          onHide={() => setShowGlycoPeptides(false)}
        >
          <Modal.Header closeButton>
            <Modal.Title id="contained-modal-title-vcenter" className="gg-blue">
              Select GlycoPeptide:
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>{glycoPeptideList()}</Modal.Body>
          {/* <Modal.Footer>
            <Button onClick={() => setShowGlycoPeptides(false)}>Close</Button>
          </Modal.Footer> */}
        </Modal>
      </>
    );
  };

  const getCase2ForGlycoLipid = () => {
    return (
      <>
        {getGlycanWizard()}

        {showLinkerPicker && (
          <Modal
            size="xl"
            aria-labelledby="contained-modal-title-vcenter"
            centered
            show={showLinkerPicker}
            onHide={() => setShowLinkerPicker(false)}
          >
            <Modal.Header closeButton>
              <Modal.Title id="contained-modal-title-vcenter" className="gg-blue">
                Select Linker:
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>{getTableforLinkers(true)}</Modal.Body>
            {/* <Modal.Footer>
              <Button onClick={() => setShowLinkerPicker(false)}>Close</Button>
            </Modal.Footer> */}
          </Modal>
        )}
      </>
    );
  };

  const getCase2 = () => {
    return (
      <>
        {featureAddState.type === "LINKED_GLYCAN" && <>{getSelectedLinkerInformation()}</>}

        <Form>
          {featureAddState.type !== "LINKED_GLYCAN" && (
            <>
              <ReactTable
                columns={[
                  ...(featureAddState.linker.type !== "SMALLMOLECULE_LINKER"
                    ? [
                        {
                          Header: "Position",
                          accessor: "position",
                        },
                        {
                          Header: "Amino Acid",
                          accessor: "aminoAcid",
                        },
                      ]
                    : []),
                  {
                    Header: "Glycan",
                    accessor: "glycan",
                    // eslint-disable-next-line react/display-name
                    Cell: (row, index) =>
                      row.value ? (
                        row.value.cartoon ? (
                          <StructureImage key={index} base64={row.value.cartoon} />
                        ) : (
                          row.value.name
                        )
                      ) : (
                        "No Glycan Selected"
                      ),
                    minWidth: 150,
                  },
                  {
                    Header: "",
                    // eslint-disable-next-line react/display-name
                    Cell: ({ index }) => (
                      // <input
                      //   key={index}
                      //   type="button"
                      //   onClick={() => displayGlycanPicker(index)}
                      //   value={"Pick Glycan"}
                      // />
                      <Button key={index} onClick={() => displayGlycanPicker(index)} className="gg-btn-outline-reg">
                        {/* Pick Glycan */}
                        Select Glycan
                      </Button>
                    ),
                  },
                ]}
                data={featureAddState.glycans}
                defaultPageSize={featureAddState.glycans.length}
                showPagination={false}
                showSearchBox
              />
            </>
          )}

          {getGlycanWizard()}
        </Form>
      </>
    );
  };

  const getGlycanWizard = () => {
    return (
      <>
        {(featureAddState.type === "LINKED_GLYCAN" ||
          featureAddState.type === "GLYCO_LIPID" ||
          featureAddState.type === "GLYCO_PEPTIDE" ||
          featureAddState.type === "GLYCO_PROTEIN" ||
          featureAddState.type === "GLYCO_PROTEIN_LINKED_GLYCOPEPTIDE") &&
        showGlycanPicker ? (
          <SourceForGlycanInFeature
            showGlycanPicker={showGlycanPicker}
            setShowGlycanPicker={setShowGlycanPicker}
            getGlycanTabletoSelect={getGlycanTabletoSelect}
            glycoProteinPepTideListStep4={glycoProteinPepTideListStep4}
            setGlycoProteinPepTideListStep4={setGlycoProteinPepTideListStep4}
            featureAddState={featureAddState}
            setFeatureAddState={setFeatureAddState}
            currentGlycanSelection={currentGlycanSelection}
            setCurrentGlycanSelection={setCurrentGlycanSelection}
            displaySelectedGlycanInfoInFeature={displaySelectedGlycanInfoInFeature}
            maxRange={
              featureAddState.type === "GLYCO_PEPTIDE"
                ? featureAddState.peptide.sequence.length
                : featureAddState.type === "GLYCO_PROTEIN" ||
                  featureAddState.type === "GLYCO_PROTEIN_LINKED_GLYCOPEPTIDE"
                ? featureAddState.protein.sequence.length
                : ""
            }
          />
        ) : featureAddState.type === "GLYCO_PROTEIN_LINKED_GLYCOPEPTIDE" ? (
          getSelectedGlycoPeptideListWizard()
        ) : (
          getSelectedGlycanListWizard()
        )}
      </>
    );
  };

  const getSelectedGlycanListWizard = () => {
    return (
      <>
        {/* <div className="text-center mt-4 mb-4">
          <h3 className="gg-blue">List of Glycans</h3>
          <h5>
            Add one or more glycans to the linker by clicking <strong>Pick Glycan</strong> and providing the glycan
            details.
          </h5>
        </div> */}
        <PageHeading
          title="List of Glycans"
          subTitle="Add one or more glycans to the linker and provide the glycan details."
        />
        <div className="text-center mb-4">
          {((featureAddState.type === "GLYCO_LIPID" && featureAddState.glycans.length < 1) ||
            featureAddState.type === "GLYCO_PEPTIDE" ||
            featureAddState.type === "GLYCO_PROTEIN" ||
            featureAddState.type === "LINKED_GLYCAN") && (
            <Button
              className="gg-btn-blue"
              onClick={() => {
                let pd = featureAddState.positionDetails;
                pd.isPosition = false;
                setFeatureAddState({ positionDetails: pd });
                setShowGlycanPicker(true);
              }}
              disabled={
                (featureAddState.type === "GLYCO_PEPTIDE" || featureAddState.type === "GLYCO_PROTEIN") &&
                featureAddState.glycans.filter((i) => i.glycan).length > 0
              }
            >
              Add Glycan
            </Button>
          )}
        </div>
        {getSelectedGlycanList()}
      </>
    );
  };

  const getSelectedGlycoPeptideListWizard = () => {
    return (
      <>
        {/* <div style={{ textAlign: "center", marginTop: "50px" }}>
          <h3>{"List of GlycoPeptides"}</h3>
          <p>{"Add one or more glycopeptides to the protein by clicking ‘Pick GlycoPeptide."}</p>
        </div> */}
        <PageHeading title="List of GlycoPeptides" subTitle="Add one or more glycoPeptides to the protein." />
        <div className="text-center mb-4">
          <Button
            className="gg-btn-blue"
            // type="button"
            onClick={() => {
              let pd = featureAddState.positionDetails;
              pd.isPosition = false;
              setFeatureAddState({ positionDetails: pd });
              setShowGlycoPeptides(true);
            }}
            // value={"Pick Glyco Peptide"}
            disabled={featureAddState.glycoPeptides.filter((i) => i.glycoPeptide).length > 0}
          >
            Add GlycoPeptide
          </Button>
        </div>
        {featureAddState.rangeGlycoPeptides.length > 0 && getRangeGlycoPeptidesList()}

        {enableGlycoPeptideRange && getRangeModal()}
      </>
    );
  };

  const getRangeModal = () => {
    return (
      <>
        <Modal
          size="xl"
          aria-labelledby="contained-modal-title-vcenter"
          centered
          show={enableGlycoPeptideRange}
          onHide={() => setEnableGlycoPeptideRange(false)}
        >
          <Modal.Header closeButton>
            <Modal.Title id="contained-modal-title-vcenter" className="gg-blue">
              Enter Range:
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group as={Row} controlId="minRange" className="gg-align-center mb-3">
              <Col xs={12} lg={9}>
                <FormLabel label="Min Range" />
                <Form.Control
                  type="number"
                  name="minRange"
                  placeholder="Enter Min Range"
                  value={
                    rowSelectedForRange.original &&
                    rowSelectedForRange.original.glycoPeptide &&
                    rowSelectedForRange.original.glycoPeptide.range &&
                    rowSelectedForRange.original.glycoPeptide.range.minRange
                  }
                  onChange={(e) => handleRange(e, rowSelectedForRange.original)}
                  isInvalid={invalidMinRange}
                />
                <Feedback message="Invalid Min Range" />
              </Col>
            </Form.Group>

            <Form.Group as={Row} controlId="maxRange" className="gg-align-center mb-3">
              <Col xs={12} lg={9}>
                <FormLabel label="Max Range" />
                <Form.Control
                  type="number"
                  name="maxRange"
                  placeholder="Enter Max Range"
                  value={
                    rowSelectedForRange.original &&
                    rowSelectedForRange.original.glycoPeptide &&
                    rowSelectedForRange.original.glycoPeptide.range &&
                    rowSelectedForRange.original.glycoPeptide.maxRange
                  }
                  onChange={(e) => handleRange(e, rowSelectedForRange.original)}
                  isInvalid={invalidMaxRange}
                />
                <Feedback message="Invalid Max Range" />
              </Col>
            </Form.Group>
            <Row>
              <div className="text-center mb-2 mt-2">
                <Button
                  className="gg-btn-blue-reg"
                  onClick={() => {
                    setEnableGlycoPeptideRange(false);
                  }}
                  disabled={
                    invalidMaxRange ||
                    invalidMinRange ||
                    (rowSelectedForRange.original &&
                      rowSelectedForRange.original.glycoPeptide &&
                      (!rowSelectedForRange.original.glycoPeptide.range.maxRange ||
                        !rowSelectedForRange.original.glycoPeptide.range.minRange))
                  }
                >
                  Save
                </Button>
              </div>
            </Row>
          </Modal.Body>
          {/* <Modal.Footer>
            <Button
              onClick={() => setEnableGlycoPeptideRange(false)}
              style={{
                backgroundColor: "lightgray",
                border: "none",
                color: "black",
              }}
            >
              Close
            </Button>
          </Modal.Footer> */}
        </Modal>
      </>
    );
  };
  const handleRange = (e, row) => {
    const listGlycoPeptides = featureAddState.rangeGlycoPeptides;
    const rowSelected = listGlycoPeptides.find((i) => i.index === row.index);
    const rowSelectedIndex = listGlycoPeptides.indexOf(rowSelected);
    let range = rowSelected.range === null ? {} : rowSelected.range;

    if (e.target.name === "minRange") {
      if (parseInt(e.target.value) > featureAddState.protein.sequence.length) {
        setInvalidMinRange(true);
      } else if (range.maxRange && parseInt(e.target.value) > range.maxRange) {
        setInvalidMinRange(true);
      } else {
        range.minRange = e.target.value;
        setInvalidMinRange(false);
      }
    } else {
      if (parseInt(e.target.value) > featureAddState.protein.sequence.length) {
        setInvalidMaxRange(true);
      } else if (range.minRange && parseInt(e.target.value) < range.minRange) {
        setInvalidMaxRange(true);
      } else {
        range.maxRange = e.target.value;
        setInvalidMaxRange(false);
      }
    }

    rowSelected.range = range;
    listGlycoPeptides[rowSelectedIndex] = rowSelected;
    setFeatureAddState({ rangeGlycoPeptides: listGlycoPeptides });
  };

  const getRangeGlycoPeptidesList = () => {
    return (
      <GlycoPeptides
        data={featureAddState.rangeGlycoPeptides}
        customViewonClick
        viewOnClick={viewGlycoPeptide}
        showDeleteButton
        customDeleteOnClick
        deleteOnClick={deleteGlycoPeptideLinkedProteinSelection}
        LinkerandRange
        handleRange={handleRange}
        setShowLinkerPicker={setShowLinkerPicker}
        setEnableGlycoPeptideRange={setEnableGlycoPeptideRange}
        enableGlycoPeptideRange={enableGlycoPeptideRange}
        setRowSelectedForRange={setRowSelectedForRange}
      />
    );
  };

  function getReducingEndState(opensRing) {
    switch (opensRing) {
      case 0:
        return "Open Ring";
      case 1:
        return "Alpha";
      case 2:
        return "Beta";
      case 3:
        return "Unknown";
      case 4:
        return "Equilibrium";

      default:
        return "Unknown";
    }
  }

  const handleGlycanSelect = (glycan) => {
    let glycansList;

    if (
      (featureAddState.type === "GLYCO_PEPTIDE" || featureAddState.type === "GLYCO_PROTEIN") &&
      !featureAddState.positionDetails.isPosition
    ) {
      glycansList = [...featureAddState.rangeGlycans];
    } else {
      glycansList = [...featureAddState.glycans];
    }

    if (!currentGlycanSelection) {
      glycansList.push(glycan);
      setCurrentGlycanSelection(glycan);
    } else {
      var selectedRow = glycansList.find((e) => e.id === currentGlycanSelection.id);
      var selectedRowIndex = glycansList.indexOf(selectedRow);
      glycansList[selectedRowIndex] = glycan;
      setCurrentGlycanSelection(glycan);
    }

    if (
      (featureAddState.type === "GLYCO_PEPTIDE" || featureAddState.type === "GLYCO_PROTEIN") &&
      !featureAddState.positionDetails.isPosition
    ) {
      setFeatureAddState({ rangeGlycans: glycansList });
    } else {
      setFeatureAddState({ glycans: glycansList });
    }

    setErrorMessage("");
    setShowErrorSummary(false);
  };

  const handleGlycanSelectionForPosition = (glycan) => {
    let glycansList = [...featureAddState.glycans];

    let glycanObj = glycansList.find((i) => i.position === featureAddState.positionDetails.number);
    var selectedRowIndex = glycansList.indexOf(glycanObj);

    glycanObj.glycan = glycan;
    glycansList[selectedRowIndex] = glycanObj;

    setCurrentGlycanSelection(glycan);
    setFeatureAddState({ glycans: glycansList });
  };

  const handleGlycoPeptideSelectGPLGP = (glycoPeptide) => {
    let glycoPeptideList;
    let glycoPeptidesWithIndex;
    let currentMaxIndex;

    glycoPeptideList = [...featureAddState.rangeGlycoPeptides];
    glycoPeptidesWithIndex = glycoPeptideList.filter((i) => i.index >= 0);

    if (glycoPeptidesWithIndex.length > 0) {
      let indexes = [];
      glycoPeptideList.forEach((i) => {
        if (i.index >= 0) {
          indexes.push(i.index);
        }
      });
      currentMaxIndex = Math.max(...indexes);
    }

    if (currentMaxIndex >= 0) {
      glycoPeptide.index = currentMaxIndex + 1;
    } else {
      glycoPeptide.index = 0;
    }

    glycoPeptideList.push(glycoPeptide);

    setFeatureAddState({ rangeGlycoPeptides: glycoPeptideList });
    setErrorMessage("");
    setShowErrorSummary(false);
    setShowGlycoPeptides(false);
  };

  const handleGlycoPeptideSelectionForPosition = (glycoPeptide) => {
    let glycoPeptidesList = [...featureAddState.glycoPeptides];

    let peptideObj = {};
    peptideObj = glycoPeptidesList.find((i) => i.position === featureAddState.positionDetails.number);
    var selectedRowIndex = glycoPeptidesList.indexOf(peptideObj);

    glycoPeptide.index = featureAddState.positionDetails.number;

    peptideObj.glycoPeptide = glycoPeptide;
    glycoPeptidesList[selectedRowIndex] = peptideObj;

    setFeatureAddState({ glycoPeptides: glycoPeptidesList });
    setShowGlycoPeptides(false);
  };

  const handleDeletedSelectedGlycan = (deleteRow) => {
    let selectedGlycans;
    let selectedRow;
    let selectedRowIndex;

    if (featureAddState.type === "GLYCO_LIPID" || featureAddState.type === "LINKED_GLYCAN") {
      selectedGlycans = [...featureAddState.glycans];
      selectedRow = selectedGlycans.find((e) => e.id === deleteRow.id);
    } else if (
      featureAddState.type === "GLYCO_PEPTIDE" ||
      featureAddState.type === "GLYCO_PROTEIN" ||
      featureAddState.type === "GLYCO_PROTEIN_LINKED_GLYCOPEPTIDE"
    ) {
      selectedGlycans = [...featureAddState.rangeGlycans];
      selectedRow = selectedGlycans.find((e) => e.index === deleteRow.index);
    }

    selectedRowIndex = selectedGlycans.indexOf(selectedRow);
    selectedGlycans.splice(selectedRowIndex, 1);

    if (featureAddState.type === "GLYCO_LIPID" || featureAddState.type === "LINKED_GLYCAN") {
      setFeatureAddState({ glycans: selectedGlycans });
    } else if (
      featureAddState.type === "GLYCO_PEPTIDE" ||
      featureAddState.type === "GLYCO_PROTEIN" ||
      featureAddState.type === "GLYCO_PROTEIN_LINKED_GLYCOPEPTIDE"
    ) {
      setFeatureAddState({ rangeGlycans: selectedGlycans });
    }
  };

  const getSelectedGlycanList = () => {
    return (
      <>
        <ReactTable
          columns={[
            {
              Header: "Name",
              accessor: "name",
              Cell: (row) => getToolTip(row.original.name),
              sortMethod: (a, b) => {
                if ((a !== null && a.length) === (b !== null && b.length)) {
                  return a > b ? 1 : -1;
                }
                return (a !== null && a.length) > (b !== null && b.length) ? 1 : -1;
              },
            },
            {
              Header: "Structure Image",
              accessor: "cartoon",
              Cell: (row) => {
                return row.value ? <StructureImage base64={row.value} /> : "";
              },
              sortable: false,
              minWidth: 300,
            },
            {
              Header: "Source",
              accessor: "source.type",
              Cell: (row) => {
                return row.original && row.original.source
                  ? row.original.source.type === "NOTRECORDED"
                    ? getToolTip("Not Recorded")
                    : row.original.source.type === "COMMERCIAL"
                    ? getToolTip("Commercial")
                    : getToolTip("Non Commercial")
                  : "";
              },
              sortMethod: (a, b) => {
                if (a && a.length === b && b.length) {
                  return a > b ? 1 : -1;
                }
                return (a !== null && a.length) > (b !== null && b.length) ? 1 : -1;
              },
            },
            {
              Header: "Reducing end state",
              accessor: "opensRing",
              Cell: (row) => {
                return getToolTip(getReducingEndState(row.value));
              },
              sortMethod: (a, b) => {
                if (a.length === b.length) {
                  return a > b ? 1 : -1;
                }
                return a.length > b.length ? 1 : -1;
              },
            },

            ...(featureAddState.type === "GLYCO_PEPTIDE" || featureAddState.type === "GLYCO_PROTEIN"
              ? [
                  {
                    Header: "Range",
                    accessor: "range",
                    Cell: (row) => {
                      return row.original && row.original.min && row.original.max
                        ? getToolTip(`${row.original.min} - ${row.original.max}`)
                        : "";
                    },
                    sortMethod: (a, b) => {
                      if (a && a.length === b && b.length) {
                        return a > b ? 1 : -1;
                      }
                      return (a !== null && a.length) > (b !== null && b.length) ? 1 : -1;
                    },
                  },
                ]
              : []),

            ...(featureAddState.type === "GLYCO_LIPID" ||
            featureAddState.type === "GLYCO_PEPTIDE" ||
            featureAddState.type === "GLYCO_PROTEIN"
              ? [
                  {
                    Header: "Linker",
                    accessor: "linker",
                    Cell: (row, index) => {
                      return row.original.linker ? (
                        getToolTip(row.original.linker.name)
                      ) : (
                        <Button
                          className="gg-btn-outline-reg"
                          onClick={() => {
                            setLinkerForSelectedGlycan(row.original);
                            setShowLinkerPicker(true);
                          }}
                        >
                          Add Linker
                        </Button>
                      );
                    },
                    sortMethod: (a, b) => {
                      if (a && a.length === b && b.length) {
                        return a > b ? 1 : -1;
                      }
                      return (a !== null && a.length) > (b !== null && b.length) ? 1 : -1;
                    },
                    minWidth: 150,
                  },
                ]
              : []),
            {
              Header: "Actions",
              Cell: (row, index) => {
                return (
                  <>
                    <LineTooltip text="View Details">
                      <Link to={""}>
                        <FontAwesomeIcon
                          key={"view" + index}
                          icon={["far", "eye"]}
                          alt="View icon"
                          size="lg"
                          color="#45818e"
                          className="tbl-icon-btn"
                          onClick={() => getGlycanInfoDisplay(row)}
                        />
                      </Link>
                    </LineTooltip>

                    <LineTooltip text="Delete">
                      <Link to={""}>
                        <FontAwesomeIcon
                          key={"delete" + index}
                          icon={["far", "trash-alt"]}
                          alt="Delete selected glycan icon"
                          size="lg"
                          title="Delete icon"
                          className="caution-color tbl-icon-btn"
                          onClick={() => handleDeletedSelectedGlycan(row.original)}
                        />
                      </Link>
                    </LineTooltip>
                  </>
                );
              },
            },
          ]}
          data={
            featureAddState.type === "GLYCO_LIPID" || featureAddState.type === "LINKED_GLYCAN"
              ? featureAddState.glycans
              : featureAddState.rangeGlycans
          }
          defaultPageSize={5}
          // showDeleteButton
          // customDeleteOnClick
          // deleteOnClick={handleDeletedSelectedGlycan}
          // showViewIcon
          // customViewonClick
          // viewOnClick={getGlycanInfoDisplay}
          showPagination={false}
          showRowsInfo={false}
          infoRowsText="Selected Glycans"
        />
        {enableGlycanViewInfoDialog && (
          <GlycanInfoViewModal
            setEnableGlycanViewInfoDialog={setEnableGlycanViewInfoDialog}
            enableGlycanViewInfoDialog={enableGlycanViewInfoDialog}
            glycanViewInfo={glycanViewInfo}
          />
        )}
      </>
    );
  };

  const getCase4 = () => {
    return (
      <FeatureView
        name={featureAddState.name}
        featureId={featureAddState.featureId}
        positionDetails={featureAddState.positionDetails}
        getSelectedLinkerInformation={getSelectedLinkerInformation}
        linker={featureAddState.linker}
        peptide={featureAddState.peptide}
        protein={featureAddState.protein}
        lipid={featureAddState.type === "GLYCO_LIPID" ? featureAddState.lipid : ""}
        type={featureAddState.type}
        linkerSeletion={featureAddState.isLipidLinkedToSurfaceUsingLinker}
        metadata={featureMetadata}
        rangeGlycans={featureAddState.rangeGlycans}
        rangeGlycoPeptides={featureAddState.rangeGlycoPeptides}
        viewGlycoPeptide={viewGlycoPeptide}
        glycoPeptides={featureAddState.glycoPeptides}
        glycans={
          (featureAddState.type === "GLYCO_PEPTIDE" || featureAddState.type === "GLYCO_PROTEIN") &&
          featureAddState.rangeGlycans.length > 0
            ? featureAddState.rangeGlycans
            : featureAddState.glycans
        }
      />
    );
  };

  return (
    <>
      <Helmet>
        <title>{head.addFeature.title}</title>
        {getMeta(head.addFeature)}
      </Helmet>
      <Container maxWidth="xl">
        <div className="page-container">
          <PageHeading
            title="Add Feature to Repository"
            subTitle="Please provide the information for the new feature."
          />
          <Card>
            <Card.Body>
              <Stepper className="steper-responsive text-center" activeStep={activeStep} alternativeLabel>
                {getSteps(featureAddState.type).map((label, index) => {
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
              <h5 className="text-center gg-blue mt-4">{getStepLabel(activeStep)}</h5>

              {!metaDataStep && (
                <div className="mt-4 mb-4 text-center">
                  <Link to="/features">
                    <Button className="gg-btn-outline mt-2 gg-mr-20 btn-to-lower">Back to Features</Button>
                  </Link>
                  <Button
                    disabled={activeStep === 0}
                    onClick={handleBack}
                    className="gg-btn-blue mt-2 gg-ml-20 gg-mr-20"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={
                      featureAddState.type === "GLYCO_LIPID" ||
                      featureAddState.type === "GLYCO_PEPTIDE" ||
                      featureAddState.type === "GLYCO_PROTEIN" ||
                      featureAddState.type === "GLYCO_PROTEIN_LINKED_GLYCOPEPTIDE"
                        ? handleNextGlycoLipid
                        : handleNextLinker
                    }
                    className="gg-btn-blue mt-2 gg-ml-20"
                  >
                    {activeStep === getSteps(featureAddState.type).length - 1 ? "Submit" : "Next"}
                  </Button>
                </div>
              )}

              <ErrorSummary
                show={showErrorSummary}
                form="feature"
                errorJson={pageErrorsJson}
                errorMessage={errorMessage}
              />
              <div className="mt-4 mb-2">
                <span>{getStepContent(featureAddState.type, activeStep)}</span>
              </div>
              {!metaDataStep && (
                <div className="text-center mb-4">
                  <Link to="/features">
                    <Button className="gg-btn-outline mt-2 gg-mr-20 btn-to-lower">Back to Features</Button>
                  </Link>
                  <Button
                    disabled={activeStep === 0}
                    onClick={handleBack}
                    className="gg-btn-blue mt-2 gg-ml-20 gg-mr-20"
                  >
                    Back
                  </Button>
                  <Button
                    variant="contained"
                    onClick={
                      featureAddState.type === "GLYCO_LIPID" ||
                      featureAddState.type === "GLYCO_PEPTIDE" ||
                      featureAddState.type === "GLYCO_PROTEIN" ||
                      featureAddState.type === "GLYCO_PROTEIN_LINKED_GLYCOPEPTIDE"
                        ? handleNextGlycoLipid
                        : handleNextLinker
                    }
                    className="gg-btn-blue mt-2 gg-ml-20"
                  >
                    {activeStep === getSteps(featureAddState.type).length - 1 ? "Submit" : "Next"}
                  </Button>
                </div>
              )}
            </Card.Body>
          </Card>
        </div>
      </Container>
      <Loading show={showLoading}></Loading>
    </>
  );
};

AddFeature.propTypes = {
  authCheckAgent: PropTypes.func
};

export { AddFeature };
