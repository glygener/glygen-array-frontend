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
import { Linkers } from "./Linkers";
import { Peptides } from "./Peptides";
import { Proteins } from "./Proteins";
import { Lipids } from "./Lipids";
import { SourceForGlycanInFeature } from "../components/SourceForGlycanInFeature";
import { updateMetadataTemplate, getMetadataSubmitData } from "../containers/FeatureMetadata";
import { FeatureView } from "./FeatureView";
import { getToolTip } from "../utils/commonUtils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ScrollToTop } from "../components/ScrollToTop";

const AddFeature = props => {
  useEffect(props.authCheckAgent, []);

  const featureTypes = {
    LINKED_GLYCAN: "Linked Glycan",
    GLYCO_LIPID: "GlycoLipid",
    GLYCO_PEPTIDE: "GlycoPeptide",
    GLYCO_PROTEIN: "GlycoProtein",
    GLYCO_PROTEIN_LINKED_GLYCOPEPTIDE: "GlycoProtein linked GlycoPeptide",
    CONTROL: "Control",
    NEGATIVE_CONTROL: "Negative Control",
    COMPOUND: "Organic Compound",
    LANDING_LIGHT: "Landing Light"
  };

  const glycoLipidOptionsPage1 = {
    YES: "Yes",
    NO: "No"
  };

  const featureAddInitState = {
    linker: {},
    glycans: [],
    rangeGlycans: [],
    lipid: {},
    peptide: {},
    protein: {},
    isLipidLinkedToSurfaceUsingLinker: "No",
    positionDetails: {
      isPosition: false,
      number: ""
    }
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
  const [linkerForSelectedGlycan, setLinkerForSelectedGlycan] = useState();
  const [glycoLipidGlycanLinkerListStep4, setGlycoLipidGlycanLinkerListStep4] = useState();
  const [glycoProteinPepTideListStep4, setGlycoProteinPepTideListStep4] = useState([{ position: 0 }]);

  const [featureAddState, setFeatureAddState] = useReducer((oldState, newState) => ({ ...oldState, ...newState }), {
    ...featureAddInitState,
    ...{ type: "LINKED_GLYCAN" }
  });

  const featureMetaDataInitState = {
    commercial: { vendor: "", catalogueNumber: "", batchId: "", vendorNotRecorded: false },
    nonCommercial: { providerLab: "", batchId: "", method: "", sourceComment: "", providerLabNotRecorded: false },
    purity: {
      comment: "",
      value: "",
      method: "",
      purityNotSpecified: "specify",
      valueNotRecorded: false,
      methodNotRecorded: false
    },
    source: "notSpecified",
    validatedCommNonComm: false,
    validateMethod: false,
    validateValue: false,
    invalidName: false,
    validateFeatureId: false,
    featureId: "",
    name: ""
  };

  const [featureMetaData, setFeatureMetaData] = useReducer(
    (oldState, newState) => ({ ...oldState, ...newState }),
    featureMetaDataInitState
  );

  const [metadataTemplate, setMetadataTemplate] = useState([]);
  const [onlyMyglycans, setOnlyMyglycans] = useState(false);
  const [onlyMyLinkers, setOnlyMyLinkers] = useState(false);
  var [rowSelected, setRowSelected] = useState([]);
  var [currentGlycanSelection, setCurrentGlycanSelection] = useState();

  const generalSteps = [
    "Select Feature Type",
    "Select Linker",
    "Select Glycan",
    "Generic Feature Info",
    "Review and Add"
  ];

  const glycoLipidSteps = [
    "Select Feature Type",
    "Select Linker",
    "Select Lipid",
    "Select Glycan",
    "Generic Feature Info",
    "Review and Add"
  ];

  const glycoPeptideSteps = [
    "Select Feature Type",
    "Select Linker",
    "Select Peptide",
    "Select Glycan",
    "Generic Feature Info",
    "Review and Add"
  ];

  const glycoProteinSteps = [
    "Select Feature Type",
    "Select Linker",
    "Select Protein",
    "Select Glycan",
    "Generic Feature Info",
    "Review and Add"
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

      // case "GLYCO_PROTEIN_LINKED_GLYCOPEPTIDE":
      // return glycoProteinSteps;

      default:
        return generalSteps;
    }
  }

  const isStepSkipped = step => {
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
    } else if (activeStep === 3) {
      let result = getMetadataStep();
      if (!result) {
        return;
      }
    } else if (activeStep === 4) {
      addFeature();
      return;
    }
    setActiveStep(prevActiveStep => prevActiveStep + stepIncrement);
  };

  const getMetadataStep = () => {
    if (featureMetaData.name === "") {
      setFeatureMetaData({ invalidName: true });
    }

    if (featureMetaData.featureId === "") {
      setFeatureMetaData({ validateFeatureId: true });
    }

    if (featureMetaData.purity.purityNotSpecified === "specify") {
      if (featureMetaData.purity.method === "" && !featureMetaData.purity.methodNotRecorded) {
        setFeatureMetaData({ validateMethod: true });
      }
      if (featureMetaData.purity.value === "" && !featureMetaData.purity.valueNotRecorded) {
        setFeatureMetaData({ validateValue: true });
      }
    }

    if (featureMetaData.source === "commercial" && !featureMetaData.commercial.vendorNotRecorded) {
      if (featureMetaData.commercial.vendor === "") {
        setFeatureMetaData({ validatedCommNonComm: true });
      }
    } else if (featureMetaData.source === "nonCommercial" && !featureMetaData.nonCommercial.providerLabNotRecorded) {
      if (featureMetaData.nonCommercial.providerLab === "") {
        setFeatureMetaData({ validatedCommNonComm: true });
      }
    }

    if (
      featureMetaData.validatedCommNonComm ||
      (featureMetaData.source === "commercial" &&
        !featureMetaData.commercial.vendorNotRecorded &&
        featureMetaData.commercial.vendor === "") ||
      (featureMetaData.source === "nonCommercial" &&
        !featureMetaData.nonCommercial.providerLabNotRecorded &&
        featureMetaData.nonCommercial.providerLab === "") ||
      (featureMetaData.purity.purityNotSpecified === "specify" &&
        ((!featureMetaData.purity.methodNotRecorded && featureMetaData.purity.method === "") ||
          (!featureMetaData.purity.valueNotRecorded && featureMetaData.purity.value === ""))) ||
      featureMetaData.validateValue ||
      featureMetaData.validateMethod ||
      featureMetaData.invalidName ||
      featureMetaData.name === "" ||
      featureMetaData.featureId === "" ||
      featureMetaData.validateFeatureId
    ) {
      return false;
    } else {
      metadataList();
      return true;
    }
  };

  function metadataList() {
    wsCall("listtemplates", "GET", { type: "FEATURE" }, true, null, getListTemplatesSuccess, getListTemplatesFailure);

    function getListTemplatesSuccess(response) {
      response.json().then(resp => {
        let respJson = resp;

        updateMetadataTemplate(respJson, featureMetaData, setMetadataTemplate);
      });
    }
    function getListTemplatesFailure(response) {
      response.json().then(responseJson => {
        setPageErrorsJson(responseJson);
      });
      // setPageErrorMessage("");
      setShowErrorSummary(true);
    }
  }

  const handleNextGlycoLipid = () => {
    var stepIncrement = 1;

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

      if (featureAddState.type === "GLYCO_PROTEIN") {
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
          let unfilledPositions = featureAddState.glycans.filter(i => !i.glycan);
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
        setPageErrorsJson({});
        setErrorMessage("Glycan selection is required.");
        setShowErrorSummary(true);
        return;
      } else {
        setShowErrorSummary(false);
      }
    } else if (activeStep === 4) {
      let result = getMetadataStep();
      if (!result) {
        return;
      }
    } else if (activeStep === 5) {
      addFeature();
      return;
    }

    setActiveStep(prevActiveStep => prevActiveStep + stepIncrement);
  };

  const handleBack = () => {
    var stepDecrement = 1;
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
    if (activeStep === 3) {
      // if (featureAddState.type !== "LINKED_GLYCAN" && featureAddState.isLipidLinkedToSurfaceUsingLinker === "No") {
      //   stepDecrement += 1;
      // }
    }
    setActiveStep(prevActiveStep => prevActiveStep - stepDecrement);
  };

  const handleTypeSelect = e => {
    const newValue = e.target.value;
    setGlycoLipidGlycanLinkerListStep4();
    setFeatureMetaData({ ...featureMetaDataInitState });
    setFeatureAddState({ ...featureAddInitState, ...{ type: newValue } });
  };

  const handleLinkerSelect = (linker, isModal) => {
    debugger;
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

      let glycan = selectedGlycans.find(i => i.index === linkerForSelectedGlycan.index);
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
      debugger;
      let selectedGlycans = [...featureAddState.glycans];

      let glycan = selectedGlycans.find(i => i.index === linkerForSelectedGlycan.index);
      let glycanIndex = selectedGlycans.indexOf(glycan);

      glycan.linker = linker;
      selectedGlycans[glycanIndex] = glycan;
      setFeatureAddState({ glycans: selectedGlycans });
    } else {
      setFeatureAddState({ linker: linker });
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "smooth"
      });
      setValidLinker(true);
    }
  };

  const handleLipidSelect = lipid => {
    setFeatureAddState({ lipid: lipid });
    setLinkerValidated(false);

    ScrollToTop();
  };

  const handlePeptideSelect = peptide => {
    setFeatureAddState({ peptide: peptide });
    setLinkerValidated(false);

    ScrollToTop();
  };

  const handleProteinSelect = protein => {
    setFeatureAddState({ protein: protein });
    setLinkerValidated(false);

    ScrollToTop();
  };

  const handleChecboxChange = row => {
    var selectedrows = [...rowSelected];
    var deselectedRow = selectedrows.find(e => e.id === row.id);

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

  const checkSelection = row => {
    if (featureAddState.glycans && featureAddState.glycans.length > 0) {
      rowSelected = [...featureAddState.glycans];
    }
    return rowSelected.find(e => e.id === row.id);
  };

  const getGlycoLipidStep1 = () => {
    return (
      <>
        {Object.keys(glycoLipidOptionsPage1).map(key => {
          return (
            <FormCheck key={key} className="line-break-2">
              <FormCheck.Label>
                <FormCheck.Input
                  type="radio"
                  value={glycoLipidOptionsPage1[key]}
                  onChange={e => {
                    setFeatureAddState({
                      isLipidLinkedToSurfaceUsingLinker: e.target.value
                    });
                    setLinkerValidated(false);
                  }}
                  checked={featureAddState.isLipidLinkedToSurfaceUsingLinker === glycoLipidOptionsPage1[key]}
                />
                {glycoLipidOptionsPage1[key]}
              </FormCheck.Label>
            </FormCheck>
          );
        })}
      </>
    );
  };

  const getMetadata = () => {
    return <SourceForGlycanInFeature metadata={featureMetaData} setMetadata={setFeatureMetaData} isMetadata />;
  };

  const getTableforLinkers = isModal => {
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

  const getTableforPeptides = isModal => {
    return (
      <>
        <Form className="radioform1">
          <Form.Group as={Row} controlId="peptide">
            <FormLabel label="Selected Peptide" />
            <Col md={4}>
              <Form.Control
                type="text"
                name="peptide"
                value={featureAddState.peptide.name}
                disabled={true}
                placeholder="No Peptide selected"
                isInvalid={linkerValidated}
              />
              <Feedback message="Please select a Peptide from below"></Feedback>
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

  const getTableforProteins = isModal => {
    return (
      <>
        <Form className="radioform1">
          <Form.Group as={Row} controlId="protein">
            <FormLabel label="Selected Protein" />
            <Col md={4}>
              <Form.Control
                type="text"
                name="protein"
                value={featureAddState.protein.name}
                disabled={true}
                placeholder="No Protein selected"
                isInvalid={linkerValidated}
              />
              <Feedback message="Please select a Protein from below" />
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

  const getTableforLipids = isModal => {
    return (
      <>
        <Form className="radioform1">
          <Form.Group as={Row} controlId="lipid">
            <FormLabel label="Selected Lipid" />
            <Col md={4} className="sequence-label-div">
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
                  <Feedback message="Please select a lipid from below"></Feedback>
                </>
              ) : (
                <label>{featureAddState.lipid.name ? featureAddState.lipid.name : ""}</label>
              )}
            </Col>
          </Form.Group>

          {featureAddState.lipid.imageURL && (
            <Form.Group as={Row} controlId="lipidimage">
              <Col md={{ span: 3, offset: 2 }}>
                <FormLabel label={""} />
              </Col>

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
    var chooseGlycanTableData = [
      {
        glycan: []
      }
    ];
    if (linker.type !== "SMALLMOLECULE") {
      valid = false; //if linker is protein/peptide, then invalidate until a valid attachable position is found
      chooseGlycanTableData = getAAPositionsFromSequence(linker.sequence);
      if (chooseGlycanTableData.length > 0) {
        valid = true; //attachable position for glycan found
        chooseGlycanTableData.forEach(e => (e["glycan"] = undefined));
      }
      setFeatureAddState({ glycans: chooseGlycanTableData });
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
    }

    setShowLoading(true);
    wsCall("addfeature", "POST", null, true, featureObj, addFeatureSuccess, addFeatureError);

    function addFeatureSuccess() {
      setShowLoading(false);
      history.push("/features");
    }

    function addFeatureError(response) {
      response.json().then(responseJson => {
        setPageErrorsJson(responseJson);
        setErrorMessage("");
        setShowErrorSummary(true);
        setShowLoading(false);
      });
    }
  }

  function metadataToSubmit() {
    const descriptorGroups = getMetadataSubmitData(metadataTemplate);
    // const descriptors = getDescriptors();

    let objectToBeSaved = {
      name: featureMetaData.name,
      user: {
        name: window.localStorage.getItem("loggedinuser")
      },
      template: "Default Feature",
      descriptors: [],
      descriptorGroups: descriptorGroups,
      id: ""
    };
    return objectToBeSaved;
  }

  function getLinkedGlycanData(featureObj) {
    featureObj = {
      type: "LINKEDGLYCAN",

      name: featureMetaData.name,
      linker: featureAddState.linker,
      glycans: featureAddState.glycans.map(glycanObj => {
        let glycanDetails = {};
        let reducingEndConfiguration = {};

        glycanDetails.glycan = glycanObj;

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

      metadata: metadataTemplate.length > 0 && metadataToSubmit()
    };
    return featureObj;
  }

  function getGlycoLipidData(featureObj) {
    let glycans = featureAddState.glycans.map(glycanObj => {
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

      name: featureMetaData.name,
      linker: featureAddState.linker,
      lipid: featureAddState.lipid,
      glycans: [{ glycans: glycans, type: "LINKEDGLYCAN", linker: glycans[0].linker }],
      positionMap: featureAddState.glycans.reduce((map, glycanObj) => {
        if (glycanObj && glycanObj.glycan && glycanObj.glycan.id) {
          map[glycanObj.position] = glycanObj.glycan.id;
        }
        return map;
      }, {}),

      metadata: metadataTemplate.length > 0 && metadataToSubmit()
    };

    return featureObj;
  }

  function getGlycoData(featureObj, type) {
    let glycanList = featureAddState.rangeGlycans.length > 0 ? featureAddState.rangeGlycans : featureAddState.glycans;

    let glycans = glycanList.map(positionDetails => {
      let range;
      let glycanObj;
      if (featureAddState.rangeGlycans.length > 0) {
        glycanObj = positionDetails;
      } else {
        glycanObj = positionDetails.glycan;
      }

      let glycans = {};
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
          max: glycanObj.max
        };
      }

      return {
        glycans: glycans,
        linker: glycanObj.linker,
        range: range,
        type: "LINKEDGLYCAN"
      };
    });

    featureObj = {
      type: type,

      name: featureMetaData.name,
      linker: featureAddState.linker,
      ...getKey(type),
      glycans: [{ glycans: glycans }],
      positionMap: featureAddState.glycans.reduce((map, glycanObj) => {
        if (glycanObj && glycanObj.glycan && glycanObj.glycan.id) {
          map[glycanObj.position] = glycanObj.glycan.id;
        }
        return map;
      }, {}),

      metadata: metadataTemplate.length > 0 && metadataToSubmit()
    };

    return featureObj;
  }

  function getKey(type) {
    return type === "GLYCOPEPTIDE" ? { peptide: featureAddState.peptide } : { protein: featureAddState.protein };
  }

  const getGlycanTabletoSelect = showSelect => {
    return (
      <>
        {currentGlycanSelection && <>{displaySelectedGlycanInfoInFeature()}</>}

        <GlygenTable
          columns={[
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
              Cell: row => <StructureImage base64={row.value} />,
              minWidth: 300
            },
            {
              Header: "Mass",
              accessor: "mass",
              Cell: row => (row.value ? parseFloat(row.value).toFixed(2) : "")
            }
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
          <Form.Group as={Row} controlId="id">
            <FormLabel label="Selected Glycan" />
            <Col md={4} className="sequence-label-div">
              <label>{currentGlycanSelection.id ? currentGlycanSelection.id : ""}</label>
            </Col>
          </Form.Group>

          <Form.Group as={Row} controlId="glytoucanId">
            <FormLabel label="Glytoucan Id" />
            <Col md={4} className="sequence-label-div">
              <label>{currentGlycanSelection.glytoucanId ? currentGlycanSelection.glytoucanId : ""}</label>
            </Col>
          </Form.Group>

          <Form.Group as={Row} controlId="image">
            <Col md={{ span: 3, offset: 2 }}>
              <FormLabel label={""} />
            </Col>
            <Col md={4}>
              <StructureImage base64={currentGlycanSelection.cartoon}></StructureImage>
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
        ) : (
          <>
            {getCase3PeptideFeature()}
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

                  {featureAddState.type === "GLYCO_LIPID" && featureTypes[key] === "GlycoLipid" && (
                    <>
                      <div style={{ margin: "15px" }}>
                        Is the lipid linked to the surface using a linker?
                        <div style={{ marginTop: "15px" }}>{getGlycoLipidStep1()}</div>
                      </div>
                    </>
                  )}

                  {featureAddState.type === "GLYCO_PEPTIDE" && featureTypes[key] === "GlycoPeptide" && (
                    <>
                      <div style={{ margin: "15px" }}>
                        Is the peptide linked to the surface using a linker?
                        <div style={{ marginTop: "15px" }}>{getGlycoLipidStep1()}</div>
                      </div>
                    </>
                  )}

                  {featureAddState.type === "GLYCO_PROTEIN" && featureTypes[key] === "GlycoProtein" && (
                    <>
                      <div style={{ margin: "15px" }}>
                        Is the protein linked to the surface using a linker?
                        <div style={{ marginTop: "15px" }}>{getGlycoLipidStep1()}</div>
                      </div>
                    </>
                  )}
                </FormCheck.Label>
              </FormCheck>
            );
          })}
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
          featureAddState.type === "LINKED_GLYCAN" ||
          featureAddState.type === "CONTROL" ||
          featureAddState.type === "NEGATIVE_CONTROL" ||
          featureAddState.type === "COMPOUND" ||
          featureAddState.type === "LANDING_LIGHT") && (
          <Form className="form-container">{getTableforLinkers(false)}</Form>
        )}
      </>
    );
  };

  const getSelectedLinkerInformation = () => {
    return (
      <>
        <Form className="radioform1">
          <Form.Group as={Row} controlId="name">
            <FormLabel label="Selected Linker" />
            <Col md={4} className="sequence-label-div">
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
                  <Feedback message="Please select a linker from below"></Feedback>
                </>
              ) : (
                <label>{featureAddState.linker.name ? featureAddState.linker.name : ""}</label>
              )}
            </Col>
          </Form.Group>

          {featureAddState.linker.iupacName && (
            <Form.Group as={Row} controlId="iupacname">
              <FormLabel label="IUPAC Name" />
              <Col md={4} className="sequence-label-div">
                <label>{featureAddState.linker.iupacName ? featureAddState.linker.iupacName : ""}</label>
              </Col>
            </Form.Group>
          )}

          {featureAddState.linker && featureAddState.linker.type !== "SMALLMOLECULE" ? (
            featureAddState.linker.imageURL && (
              <Form.Group as={Row} controlId="name">
                <Col md={{ span: 3, offset: 2 }}>
                  <FormLabel label={""} />
                </Col>
                <Col md={4}>
                  <StructureImage imgUrl={featureAddState.linker.imageURL}></StructureImage>
                </Col>
              </Form.Group>
            )
          ) : (
            <Form.Group as={Row} controlId="comment">
              <FormLabel label="Comment" />
              <Col md={4} className="sequence-label-div">
                <label>{featureAddState.linker.description ? featureAddState.linker.description : ""}</label>
              </Col>
            </Form.Group>
          )}
        </Form>
      </>
    );
  };

  const getCase3PeptideFeature = () => {
    return (
      <>
        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <h3>{"List of Glycans in Positions"}</h3>
          <p>
            {
              "Add Glycan and linker for each available position below by clicking ‘Pick Glycan’ and providing the glycan details."
            }
          </p>
        </div>
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
                    <StructureImage key={index} base64={row.value.cartoon} />
                  ) : row.value.name ? (
                    row.value.name
                  ) : (
                    "No Glycan Selected"
                  )
                ) : (
                  "No Glycan Selected"
                ),
              minWidth: 150
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
                          style={{
                            backgroundColor: "lightgray"
                          }}
                          onClick={() => {
                            setLinkerForSelectedGlycan(row.original);
                            setShowLinkerPicker(true);
                          }}
                          disabled={!row.original.glycan}
                        >
                          Add linker
                        </Button>
                      );
                    },
                    minWidth: 150
                  }
                ]
              : []),
            {
              Header: "",
              // eslint-disable-next-line react/display-name
              Cell: ({ row, index }) => {
                return row.glycan && row.glycan.name ? (
                  <>
                    <FontAwesomeIcon
                      key={"delete" + index}
                      icon={["far", "trash-alt"]}
                      size="xs"
                      title="Delete"
                      className="caution-color table-btn"
                      onClick={() => {
                        let glycansList = featureAddState.glycans;

                        let selectedPosition = glycansList.find(e => e.position === row.position);
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
                    <input
                      key={index}
                      type="button"
                      onClick={() => {
                        displayGlycanPicker(index);

                        let positionSelected = {};
                        positionSelected.number = row.position;
                        positionSelected.isPosition = true;

                        setFeatureAddState({ positionDetails: positionSelected });
                      }}
                      value={"Pick Glycan"}
                      disabled={featureAddState.rangeGlycans.length > 0}
                    />
                  </>
                );
              }
            }
          ]}
          data={featureAddState.glycans}
          defaultPageSize={featureAddState.glycans.length}
          showPagination={false}
          showSearchBox
        />
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
              <Modal.Title id="contained-modal-title-vcenter">Pick Linker:</Modal.Title>
            </Modal.Header>
            <Modal.Body>{getTableforLinkers(true)}</Modal.Body>
            <Modal.Footer>
              <Button onClick={() => setShowLinkerPicker(false)}>Close</Button>
            </Modal.Footer>
          </Modal>
        )}
      </>
    );
  };

  const getCase2 = () => {
    return (
      <>
        {featureAddState.type === "LINKED_GLYCAN" && <>{getSelectedLinkerInformation()}</>}

        <Form className="form-container">
          {featureAddState.type !== "LINKED_GLYCAN" && (
            <>
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
                          <StructureImage key={index} base64={row.value.cartoon} />
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
          featureAddState.type === "GLYCO_PROTEIN") &&
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
                : featureAddState.type === "GLYCO_PROTEIN"
                ? featureAddState.protein.sequence.length
                : ""
            }
          />
        ) : (
          <>
            <div style={{ textAlign: "center", marginTop: "50px" }}>
              <h3>{"List of glycans"}</h3>
              <p>
                {"Add one or more glycans to the linker by clicking ‘Pick Glycan’ and providing the glycan details."}
              </p>
            </div>
            <div>
              {((featureAddState.type === "GLYCO_LIPID" && featureAddState.glycans.length < 1) ||
                featureAddState.type === "GLYCO_PEPTIDE" ||
                featureAddState.type === "GLYCO_PROTEIN" ||
                featureAddState.type === "LINKED_GLYCAN") && (
                <input
                  type="button"
                  onClick={() => {
                    let pd = featureAddState.positionDetails;
                    pd.isPosition = false;
                    setFeatureAddState({ positionDetails: pd });
                    setShowGlycanPicker(true);
                  }}
                  value={"Pick Glycan"}
                  disabled={
                    (featureAddState.type === "GLYCO_PEPTIDE" || featureAddState.type === "GLYCO_PROTEIN") &&
                    featureAddState.glycans.filter(i => i.glycan && i.glycan.name).length > 0
                  }
                />
              )}
            </div>
            &nbsp;&nbsp;
            {getSelectedGlycanList()}
          </>
        )}
      </>
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

  const handleGlycanSelect = glycan => {
    let glycansList;

    if (
      (featureAddState.type === "GLYCO_PEPTIDE" || featureAddState.type === "GLYCO_PROTEIN") &&
      !featureAddState.positionDetails.isPosition
    ) {
      glycansList = [...featureAddState.rangeGlycans];
    } else {
      glycansList = [...featureAddState.glycans];
    }

    let glycoLipidGlycanLinkerList = [];

    glycoLipidGlycanLinkerList.push({
      glycan: glycan.name
    });

    if (!currentGlycanSelection) {
      glycansList.push(glycan);
      setCurrentGlycanSelection(glycan);
    } else {
      var selectedRow = glycansList.find(e => e.id === currentGlycanSelection.id);
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

    setGlycoLipidGlycanLinkerListStep4(glycoLipidGlycanLinkerList);
    setErrorMessage("");
    setShowErrorSummary(false);
  };

  const handleGlycanSelectionForPosition = glycan => {
    let glycansList = [...featureAddState.glycans];

    let glycanObj = glycansList.find(i => i.position === featureAddState.positionDetails.number);
    var selectedRowIndex = glycansList.indexOf(glycanObj);

    glycanObj.glycan = glycan;
    glycansList[selectedRowIndex] = glycanObj;

    setCurrentGlycanSelection(glycan);
    setFeatureAddState({ glycans: glycansList });
  };

  const handleDeletedSelectedGlycan = deleteRow => {
    debugger;
    let selectedGlycans;
    if (featureAddState.type === "GLYCO_LIPID") {
      selectedGlycans = [...featureAddState.glycans];
    } else if (featureAddState.type === "GLYCO_PEPTIDE" || featureAddState.type === "GLYCO_PROTEIN") {
      selectedGlycans = [...featureAddState.rangeGlycans];
    }

    var selectedRow = selectedGlycans.find(e => e.id === deleteRow.id);
    var selectedRowIndex = selectedGlycans.indexOf(selectedRow);
    selectedGlycans.splice(selectedRowIndex, 1);

    if (featureAddState.type === "GLYCO_LIPID") {
      setFeatureAddState({ glycans: selectedGlycans });
    } else if (featureAddState.type === "GLYCO_PEPTIDE" || featureAddState.type === "GLYCO_PROTEIN") {
      setFeatureAddState({ rangeGlycans: selectedGlycans });
    }
  };

  const getSelectedGlycanList = () => {
    return (
      <>
        <GlygenTable
          columns={[
            {
              Header: "Name",
              accessor: "name",
              Cell: row => getToolTip(row.original.name)
            },
            {
              Header: "Structure Image",
              accessor: "cartoon",
              Cell: row => {
                return row.value ? <StructureImage base64={row.value} /> : "";
              },
              minWidth: 300
            },
            {
              Header: "Source",
              accessor: "source.type",
              Cell: row => {
                return row.original && row.original.source
                  ? row.original.source.type === "NOTRECORDED"
                    ? getToolTip("Not Recorded")
                    : row.original.source.type === "COMMERCIAL"
                    ? getToolTip("Commercial")
                    : getToolTip("Non Commercial")
                  : "";
              }
            },
            {
              Header: "Reducing end state",
              accessor: "opensRing",
              Cell: row => {
                return getToolTip(getReducingEndState(row.value));
              }
            },

            ...(featureAddState.type === "GLYCO_PEPTIDE" || featureAddState.type === "GLYCO_PROTEIN"
              ? [
                  {
                    Header: "Range",
                    accessor: "range",
                    Cell: row => {
                      return getToolTip(`${row.original.min} - ${row.original.max}`);
                    }
                  }
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
                          style={{
                            backgroundColor: "lightgray"
                          }}
                          onClick={() => {
                            setLinkerForSelectedGlycan(row.original);
                            setShowLinkerPicker(true);
                          }}
                        >
                          Add linker
                        </Button>
                      );
                    },
                    minWidth: 150
                  }
                ]
              : [])
          ]}
          data={
            featureAddState.type === "GLYCO_LIPID" || featureAddState.type === "LINKED_GLYCAN"
              ? featureAddState.glycans
              : featureAddState.rangeGlycans
          }
          defaultPageSize={5}
          showDeleteButton
          customDeleteOnClick
          deleteOnClick={handleDeletedSelectedGlycan}
          showPagination={false}
          showRowsInfo={false}
          infoRowsText="Selected Glycans"
        />
      </>
    );
  };

  const getCase4 = () => {
    return (
      <FeatureView
        linker={featureAddState.linker}
        peptide={featureAddState.peptide}
        protein={featureAddState.protein}
        lipid={featureAddState.type === "GLYCO_LIPID" ? featureAddState.lipid : ""}
        type={featureAddState.type}
        linkerSeletion={featureAddState.isLipidLinkedToSurfaceUsingLinker}
        metadata={featureMetaData}
        rangeGlycans={featureAddState.rangeGlycans}
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

      <div className="page-container">
        <Title title="Add Feature to Repository" />
        <Stepper activeStep={activeStep}>
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
        <div className="button-div text-center">
          <Button disabled={activeStep === 0} variant="contained" onClick={handleBack} className="stepper-button">
            Back
          </Button>
          <Button
            variant="contained"
            onClick={
              featureAddState.type === "GLYCO_LIPID" ||
              featureAddState.type === "GLYCO_PEPTIDE" ||
              featureAddState.type === "GLYCO_PROTEIN"
                ? handleNextGlycoLipid
                : handleNextLinker
            }
            className="stepper-button"
          >
            {activeStep === getSteps(featureAddState.type).length - 1 ? "Finish" : "Next"}
          </Button>
        </div>
        &nbsp;&nbsp;
        <ErrorSummary show={showErrorSummary} form="feature" errorJson={pageErrorsJson} errorMessage={errorMessage} />
        <Typography component={"span"} variant={"body2"}>
          {getStepContent(featureAddState.type, activeStep)}
        </Typography>
        <div className="button-div text-center">
          <Button disabled={activeStep === 0} variant="contained" onClick={handleBack} className="stepper-button">
            Back
          </Button>
          <Button
            variant="contained"
            onClick={
              featureAddState.type === "GLYCO_LIPID" ||
              featureAddState.type === "GLYCO_PEPTIDE" ||
              featureAddState.type === "GLYCO_PROTEIN"
                ? handleNextGlycoLipid
                : handleNextLinker
            }
            className="stepper-button"
          >
            {activeStep === getSteps(featureAddState.type).length - 1 ? "Finish" : "Next"}
          </Button>
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
