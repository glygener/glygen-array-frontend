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
import { FeatureView } from "./FeatureView";
import { getToolTip } from "../utils/commonUtils";
import { viewGlycoPeptide } from "../utils/FeatureUtils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ScrollToTop } from "../components/ScrollToTop";
import { GlycoPeptides } from "../components/GlycoPeptides";
import { useHistory, Link } from "react-router-dom";
import { ViewInfoModal } from "../components/ViewInfoModal";
import { LineTooltip } from "../components/tooltip/LineTooltip";
import { MetaData, getDescriptorGroups, getDescriptors } from "./MetaData";
import Container from "@material-ui/core/Container";
import { Card } from "react-bootstrap";
import { PageHeading } from "../components/FormControls";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import RadioGroup from "@material-ui/core/RadioGroup";
import { BlueRadio } from "../components/FormControls";
import { HelpToolTip } from "../components/tooltip/HelpToolTip";
import wikiHelpTooltip from "../appData/wikiHelpTooltip.json";
import FeedbackWidget from "../components/FeedbackWidget";
import { scrollToTop } from "react-scroll/modules/mixins/animate-scroll";

const AddFeature = props => {
  useEffect(props.authCheckAgent, []);

  const featureTypes = {
    GLYCAN: "Glycan",
    GLYCO_LIPID: "GlycoLipid",
    GLYCO_PEPTIDE: "GlycoPeptide",
    GLYCO_PROTEIN: "GlycoProtein",
    GLYCO_PROTEIN_LINKED_GLYCOPEPTIDE: "GlycoProtein linked GlycoPeptide",
    CONTROL: "Control",
    LANDING_LIGHT: "Landing Light",
  };

  const glycoLipidOptionsPage1 = {
    YES: "Yes",
    NO: "No",
  };

  const controlAndLandingOptions = {
    // Glycan: "Glycan",
    PEPTIDE: "Peptide",
    PROTEIN: "Protein",
    LIPID: "Lipid",
    Linker: "Linker",
    OTHER: "Other",
  };

  const negativeControlOptions = {
    ...controlAndLandingOptions,
    NEGATIVE_CONTROL: "Negative Control",
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
    controlSubType: "Peptide",
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

  const [glycanViewInfo, setGlycanViewInfo] = useState();
  const [enableGlycanViewInfoDialog, setEnableGlycanViewInfoDialog] = useState(false);

  const [linkerViewInfo, setLinkerViewInfo] = useState();
  const [enableLinkerView, setEnableLinkerView] = useState(false);

  const [enableGlycoPeptideRange, setEnableGlycoPeptideRange] = useState(false);
  const [rowSelectedForRange, setRowSelectedForRange] = useState(false);

  const [metaDataStep, setMetaDataStep] = useState(false);

  const [featureMetadata, setFeatureMetadata] = useState([]);
  const [spotMetaDataToSubmit, setSpotMetaDataToSubmit] = useState();

  const [enableControlSubtypeTable, setEnableControlSubtypeTable] = useState(false);

  const [featureAddState, setFeatureAddState] = useReducer((oldState, newState) => ({ ...oldState, ...newState }), {
    ...featureAddInitState,
    ...{ type: "GLYCAN" },
  });

  const [onlyMyglycans, setOnlyMyglycans] = useState(false);
  const [onlyMyLinkers, setOnlyMyLinkers] = useState(false);
  var [rowSelected, setRowSelected] = useState([]);
  var [currentGlycanSelection, setCurrentGlycanSelection] = useState();

  const generalSteps = [
    {
      stepTitle: "Feature Type",
      helpSection: {
        title: wikiHelpTooltip.feature.add_feature_type.title,
        url: wikiHelpTooltip.feature.add_feature_type.url,
      },
    },
    {
      stepTitle: "Select Linker",
      helpSection: {
        title: wikiHelpTooltip.feature.molecule_selection.select_linker.title,
        url: wikiHelpTooltip.feature.molecule_selection.select_linker.url,
      },
    },
    {
      stepTitle: "Select Glycan",
      helpSection: {
        title: wikiHelpTooltip.feature.molecule_selection.select_glycan.title,
        url: wikiHelpTooltip.feature.molecule_selection.select_glycan.url,
      },
    },
    {
      stepTitle: "Generic Information",
      helpSection: {
        title: wikiHelpTooltip.feature.generic_information.title,
        url: wikiHelpTooltip.feature.generic_information.url,
      },
    },
    {
      stepTitle: "Review and Add",
      helpSection: {
        title: wikiHelpTooltip.feature.common_information.title,
        url: wikiHelpTooltip.feature.common_information.url,
      },
    },
  ];

  const controlAndLandingSteps = [
    {
      stepTitle: "Feature Type",
      helpSection: {
        title: wikiHelpTooltip.feature.add_feature_type.title,
        url: wikiHelpTooltip.feature.add_feature_type.url,
      },
    },
    {
      stepTitle: "Select Molecule",
      helpSection: {
        title: wikiHelpTooltip.feature.molecule_selection.select_molecule.title,
        url: wikiHelpTooltip.feature.molecule_selection.select_molecule.url,
      },
    },
    {
      stepTitle: "Generic Information",
      helpSection: {
        title: wikiHelpTooltip.feature.generic_information.title,
        url: wikiHelpTooltip.feature.generic_information.url,
      },
    },
    {
      stepTitle: "Review and Add",
      helpSection: {
        title: wikiHelpTooltip.feature.common_information.title,
        url: wikiHelpTooltip.feature.common_information.url,
      },
    },
  ];

  const glycoLipidSteps = [
    {
      stepTitle: "Feature Type",
      helpSection: {
        title: wikiHelpTooltip.feature.add_feature_type.title,
        url: wikiHelpTooltip.feature.add_feature_type.url,
      },
    },
    {
      stepTitle: "Select Linker",
      helpSection: {
        title: wikiHelpTooltip.feature.molecule_selection.select_linker.title,
        url: wikiHelpTooltip.feature.molecule_selection.select_linker.url,
      },
    },
    {
      stepTitle: "Select Lipid",
      helpSection: {
        title: wikiHelpTooltip.feature.molecule_selection.select_lipid.title,
        url: wikiHelpTooltip.feature.molecule_selection.select_lipid.url,
      },
    },
    {
      stepTitle: "Select Glycan",
      helpSection: {
        title: wikiHelpTooltip.feature.molecule_selection.select_glycan.title,
        url: wikiHelpTooltip.feature.molecule_selection.select_glycan.url,
      },
    },
    {
      stepTitle: "Generic Information",
      helpSection: {
        title: wikiHelpTooltip.feature.generic_information.title,
        url: wikiHelpTooltip.feature.generic_information.url,
      },
    },
    {
      stepTitle: "Review and Add",
      helpSection: {
        title: wikiHelpTooltip.feature.common_information.title,
        url: wikiHelpTooltip.feature.common_information.url,
      },
    },
  ];

  const glycoPeptideSteps = [
    {
      stepTitle: "Feature Type",
      helpSection: {
        title: wikiHelpTooltip.feature.add_feature_type.title,
        url: wikiHelpTooltip.feature.add_feature_type.url,
      },
    },
    {
      stepTitle: "Select Linker",
      helpSection: {
        title: wikiHelpTooltip.feature.molecule_selection.select_linker.title,
        url: wikiHelpTooltip.feature.molecule_selection.select_linker.url,
      },
    },
    {
      stepTitle: "Select Peptide",
      helpSection: {
        title: wikiHelpTooltip.feature.molecule_selection.select_peptide.title,
        url: wikiHelpTooltip.feature.molecule_selection.select_peptide.url,
      },
    },
    {
      stepTitle: "Select Glycan",
      helpSection: {
        title: wikiHelpTooltip.feature.molecule_selection.select_glycan.title,
        url: wikiHelpTooltip.feature.molecule_selection.select_glycan.url,
      },
    },
    {
      stepTitle: "Generic Information",
      helpSection: {
        title: wikiHelpTooltip.feature.generic_information.title,
        url: wikiHelpTooltip.feature.generic_information.url,
      },
    },
    {
      stepTitle: "Review and Add",
      helpSection: {
        title: wikiHelpTooltip.feature.common_information.title,
        url: wikiHelpTooltip.feature.common_information.url,
      },
    },
  ];

  const glycoProteinSteps = [
    {
      stepTitle: "Feature Type",
      helpSection: {
        title: wikiHelpTooltip.feature.add_feature_type.title,
        url: wikiHelpTooltip.feature.add_feature_type.url,
      },
    },
    {
      stepTitle: "Select Linker",
      helpSection: {
        title: wikiHelpTooltip.feature.molecule_selection.select_linker.title,
        url: wikiHelpTooltip.feature.molecule_selection.select_linker.url,
      },
    },
    {
      stepTitle: "Select Protein",
      helpSection: {
        title: wikiHelpTooltip.feature.molecule_selection.select_protein.title,
        url: wikiHelpTooltip.feature.molecule_selection.select_protein.url,
      },
    },
    {
      stepTitle: "Select Glycan",
      helpSection: {
        title: wikiHelpTooltip.feature.molecule_selection.select_glycan.title,
        url: wikiHelpTooltip.feature.molecule_selection.select_glycan.url,
      },
    },
    {
      stepTitle: "Generic Information",
      helpSection: {
        title: wikiHelpTooltip.feature.generic_information.title,
        url: wikiHelpTooltip.feature.generic_information.url,
      },
    },
    {
      stepTitle: "Review and Add",
      helpSection: {
        title: wikiHelpTooltip.feature.common_information.title,
        url: wikiHelpTooltip.feature.common_information.url,
      },
    },
  ];

  const glycoProteinLinkedGlycoPeptideSteps = [
    {
      stepTitle: "Feature Type",
      helpSection: {
        title: wikiHelpTooltip.feature.add_feature_type.title,
        url: wikiHelpTooltip.feature.add_feature_type.url,
      },
    },
    {
      stepTitle: "Select Linker",
      helpSection: {
        title: wikiHelpTooltip.feature.molecule_selection.select_linker.title,
        url: wikiHelpTooltip.feature.molecule_selection.select_linker.url,
      },
    },
    {
      stepTitle: "Select Protein",
      helpSection: {
        title: wikiHelpTooltip.feature.molecule_selection.select_protein.title,
        url: wikiHelpTooltip.feature.molecule_selection.select_protein.url,
      },
    },
    {
      stepTitle: "Select Glycan",
      helpSection: {
        title: wikiHelpTooltip.feature.molecule_selection.select_glycan.title,
        url: wikiHelpTooltip.feature.molecule_selection.select_glycan.url,
      },
    },
    {
      stepTitle: "Generic Information",
      helpSection: {
        title: wikiHelpTooltip.feature.generic_information.title,
        url: wikiHelpTooltip.feature.generic_information.url,
      },
    },
    {
      stepTitle: "Review and Add",
      helpSection: {
        title: wikiHelpTooltip.feature.common_information.title,
        url: wikiHelpTooltip.feature.common_information.url,
      },
    },
  ];

  function getSteps(type) {
    switch (type) {
      case "GLYCAN":
        return generalSteps;

      case "CONTROL":
      case "LANDING_LIGHT":
        return controlAndLandingSteps;
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
      case "GLYCAN":
        return `${featureTypes.GLYCAN}`;
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
      case "LANDING_LIGHT":
        return `${featureTypes.LANDING_LIGHT}`;
      default:
        return "Unknown typeIndex";
    }
  }
  function getStepLabel(stepIndex) {
    const moleculeType = getMoleculeType(featureAddState.type);

    const generalStepLabels = [
      "Select the Feature Type",
      `Select Linker From the Table Below (${moleculeType})`,
      `Select Glycan From the Table Below (${moleculeType})`,
      `Add Generic Information (${moleculeType})`,
      "Review and Add Molecule to Repository",
    ];

    const glycoLipidStepLabels = [
      "Select the Feature Type",
      `Select Linker From the Table Below (${moleculeType})`,
      `Select Lipid From the Table Below (${moleculeType})`,
      `Select Glycan From the Table Below (${moleculeType})`,
      `Add Generic Information (${moleculeType})`,
      "Review and Add Molecule to Repository",
    ];

    const glycoPeptideStepLabels = [
      "Select the Feature Type",
      `Select Linker From the Table Below (${moleculeType})`,
      `Select Peptide From the Table Below (${moleculeType})`,
      `Select Glycan From the Table Below (${moleculeType})`,
      `Add Generic Information (${moleculeType})`,
      "Review and Add Molecule to Repository",
    ];

    const glycoProteinStepLabels = [
      "Select the Feature Type",
      `Select Linker From the Table Below (${moleculeType})`,
      `Select Protein From the Table Below (${moleculeType})`,
      `Select Glycan From the Table Below (${moleculeType})`,
      `Add Generic Information (${moleculeType})`,
      "Review and Add Molecule to Repository",
    ];

    const glycoProteinLinkedGlycoPeptideStepLabels = [
      "Select the Feature Type",
      `Select Linker From the Table Below (${moleculeType})`,
      `Select Protein From the Table Below (${moleculeType})`,
      `Select Glycan From the Table Below (${moleculeType})`,
      `Add Generic Information (${moleculeType})`,
      "Review and Add Molecule to Repository",
    ];

    const controlAndLandingStepLabels = [
      "Select the Feature Type",
      "Select Molecule From the Table Below",
      `Add Generic Information (${moleculeType})`,
      "Review and Add Molecule to Repository",
    ];

    switch (featureAddState.type) {
      case "GLYCAN":
        return generalStepLabels[stepIndex];
      case "CONTROL":
      case "LANDING_LIGHT":
        return controlAndLandingStepLabels[stepIndex];

      case "GLYCO_LIPID":
        return glycoLipidStepLabels[stepIndex];

      case "GLYCO_PEPTIDE":
        return glycoPeptideStepLabels[stepIndex];
      case "GLYCO_PROTEIN":
        return glycoProteinStepLabels[stepIndex];
      case "GLYCO_PROTEIN_LINKED_GLYCOPEPTIDE":
        return glycoProteinLinkedGlycoPeptideStepLabels[stepIndex];

      default:
        return "Unknown stepIndex";
    }
  }

  const isStepSkipped = step => {
    return featureAddState.isLipidLinkedToSurfaceUsingLinker === "No" &&
      featureAddState.type !== "CONTROL" &&
      featureAddState.type !== "LANDING_LIGHT"
      ? step === 1 && activeStep === 2
      : featureAddState.type === "CONTROL" &&
          featureAddState.controlSubType === "Negative Control" &&
          step === 1 &&
          activeStep === 2;
  };

  const handleNextGlycan = () => {
    var stepIncrement = 1;

    ScrollToTop();
    if (metaDataStep) {
      setMetaDataStep(false);
    }
    if (activeStep === 0 && featureAddState.isLipidLinkedToSurfaceUsingLinker === "No") {
      stepIncrement = stepIncrement + 1;
    } else if (activeStep === 1) {
        if (featureAddState.isLipidLinkedToSurfaceUsingLinker === "Yes") {
          setLinkerValidated(true);
          if (featureAddState.type !== "GLYCAN") {
            stepIncrement += 1;
          } else {
            if (featureAddState.linker && featureAddState.linker.id) {
              let isValidLinker = setupGlycanSelection(featureAddState.linker);
              setValidLinker(isValidLinker);
            } else {
              return;
            }
          }
      }
    } else if (activeStep === 2) {
      if (featureAddState.type === "GLYCAN") {
        if (featureAddState.glycans.length < 1) {
          setPageErrorsJson({});
          setErrorMessage("Glycan selection is required.");
          setShowErrorSummary(true);
          return;
        } else {
          setMetaDataStep(true);
        }
      }
    } else if (activeStep === 4) {
      addFeature();
      return;
    }
    setActiveStep(prevActiveStep => prevActiveStep + stepIncrement);
  };

  const handleNextGlycoTypes = () => {
    var stepIncrement = 1;

    ScrollToTop();
    if (metaDataStep) {
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
          let filledPositions = featureAddState.glycans.filter(i => i.glycan);
          if (filledPositions.length < 1) {
            count++;
          }
        }

        if (featureAddState.rangeGlycans.length < 1 && featureAddState.glycans.length < 1) {
          count++;
        }
      } else if (featureAddState.type === "GLYCO_PROTEIN_LINKED_GLYCOPEPTIDE") {
        if (featureAddState.rangeGlycoPeptides.length < 1) {
          let filledPositions = featureAddState.glycoPeptides.filter(i => i.glycoPeptide);
          if (filledPositions.length < 1) {
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
        setMetaDataStep(true);
      }
    } else if (activeStep === 5) {
      addFeature();
      return;
    }

    setActiveStep(prevActiveStep => prevActiveStep + stepIncrement);
  };

  const handleNextLights = () => {
    var stepIncrement = 1;

    ScrollToTop();
    if (metaDataStep) {
      setMetaDataStep(false);
    }

    if (activeStep === 0 && featureAddState.controlSubType !== "Negative Control") {
      setEnableControlSubtypeTable(true);
    } else if (activeStep === 0) {
      stepIncrement += 1;
      setMetaDataStep(true);
    }

    if (activeStep === 1) {
      if (featureAddState.controlSubType !== "Negative Control" && checkMoleculeSelection()) {
        setPageErrorsJson({});
        setErrorMessage("Molecule selection is required.");
        setShowErrorSummary(true);
        return;
      } else {
        setShowErrorSummary(false);
        setMetaDataStep(true);
      }
    } else if (activeStep === 3) {
      addFeature();
      return;
    }

    setActiveStep(prevActiveStep => prevActiveStep + stepIncrement);
  };

  function checkMoleculeSelection() {
    switch (featureAddState.controlSubType) {
      case "Glycan":
        return featureAddState.glycans && featureAddState.glycans.length < 1;
      case "Peptide":
        return featureAddState.peptide && featureAddState.peptide.id ? false : true;
      case "Protein":
        return featureAddState.protein && featureAddState.protein.id ? false : true;
      case "Lipid":
        return featureAddState.lipid && featureAddState.lipid.id ? false : true;
      case "Linker":
        return featureAddState.linker && featureAddState.linker.id ? false : true;
      case "Other":
        return featureAddState.linker && featureAddState.linker.id ? false : true;

      default:
        return false;
    }
  }

  function getControlSubTypeSelectionTable(moleculeSelected) {
    switch (moleculeSelected) {
      case "Glycan":
        return listGlycans(true);
      case "Peptide":
        return listPeptides(false);
      case "Protein":
        return listProteins(false);
      case "Lipid":
        return listLipids(false);
      case "Linker":
        return listLinkers(false);
      case "Other":
        //using same listlinkers table for Other molecule list as the backend api is same for each table differed by type
        return listLinkers(false, "OTHER");

      default:
        return "Invalid step";
    }
  }

  const handleBack = () => {
    var stepDecrement = 1;

    ScrollToTop();
    if (metaDataStep) {
      setMetaDataStep(false);
    } else if (activeStep > 3) {
      setMetaDataStep(true);
    } else if (activeStep > 2 && (featureAddState.type === "CONTROL" || featureAddState.type === "LANDING_LIGHT")) {
      setMetaDataStep(true);
    }

    setErrorMessage("");
    setPageErrorsJson({});
    setShowErrorSummary(false);

    if (activeStep === 1) {
      setLinkerValidated(false);
    } else if (
      activeStep === 2 &&
      featureAddState.type !== "CONTROL" &&
      featureAddState.type !== "LANDING_LIGHT" &&
      featureAddState.isLipidLinkedToSurfaceUsingLinker === "No"
    ) {
      stepDecrement += 1;
    } else if (
      activeStep === 2 &&
      featureAddState.type === "CONTROL" &&
      featureAddState.controlSubType === "Negative Control"
    ) {
      stepDecrement += 1;
    }

    setOnlyMyLinkers(false);
    setActiveStep(prevActiveStep => prevActiveStep - stepDecrement);
  };

  const handleTypeSelect = e => {
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

      let glycan = selectedGlycans.find(i => i.index === index);
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

      let glycan = selectedGlycans.find(i => i.glycan && i.glycan.index === index);

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
      setErrorMessage("");
      setShowErrorSummary(false);
    }
  };

  const handleLipidSelect = lipid => {
    setFeatureAddState({ lipid: lipid });
    setLinkerValidated(false);

    setErrorMessage("");
    setShowErrorSummary(false);

    ScrollToTop();
  };

  const handlePeptideSelect = peptide => {
    setFeatureAddState({ peptide: peptide, glycans: [] });
    setLinkerValidated(false);
    setErrorMessage("");
    setShowErrorSummary(false);

    ScrollToTop();
  };

  const handleProteinSelect = protein => {
    setFeatureAddState({ protein: protein, glycans: [] });
    setLinkerValidated(false);

    if (featureAddState.type === "GLYCO_PROTEIN_LINKED_GLYCOPEPTIDE") {
      setFeatureAddState({ glycoPeptides: [] });
    }

    setErrorMessage("");
    setShowErrorSummary(false);

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
      <RadioGroup
        name="molecule-type-a"
        onChange={e => {
          setFeatureAddState({
            isLipidLinkedToSurfaceUsingLinker: e.target.value,
          });
          setLinkerValidated(false);
        }}
        value={featureAddState.isLipidLinkedToSurfaceUsingLinker}
      >
        {Object.keys(glycoLipidOptionsPage1).map(key => {
          return (
            <FormControlLabel
              value={glycoLipidOptionsPage1[key]}
              control={<BlueRadio />}
              label={glycoLipidOptionsPage1[key]}
            />
          );
        })}
      </RadioGroup>
    );
  };

  const getLandingStep1 = () => {
    return (
      <RadioGroup
        name="molecule-type-b"
        onChange={e => {
          setFeatureAddState({
            ...featureAddInitState,
            ...{
              type: featureAddState.type,
              controlSubType: e.target.value,
            },
          });
          setLinkerValidated(false);
        }}
        value={featureAddState.controlSubType}
      >
        {Object.keys(controlAndLandingOptions).map(key => {
          return (
            <FormControlLabel
              value={controlAndLandingOptions[key]}
              control={<BlueRadio />}
              label={controlAndLandingOptions[key]}
            />
          );
        })}
      </RadioGroup>
    );
  };

  const getControlStep1 = () => {
    return (
      <RadioGroup
        name="molecule-type-c"
        onChange={e => {
          setFeatureAddState({
            ...featureAddInitState,
            ...{
              type: featureAddState.type,
              controlSubType: e.target.value,
            },
          });
          setLinkerValidated(false);
        }}
        value={featureAddState.controlSubType ? featureAddState.controlSubType : ""}
      >
        {Object.keys(negativeControlOptions).map(key => {
          return (
            <FormControlLabel
              value={negativeControlOptions[key]}
              control={<BlueRadio />}
              label={negativeControlOptions[key]}
            />
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
          handleNext={
            featureAddState.type === "GLYCAN"
              ? handleNextGlycan
              : featureAddState.type === "CONTROL" || featureAddState.type === "LANDING_LIGHT"
              ? handleNextLights
              : handleNextGlycoTypes
          }
          setImportedPageDataToSubmit={setSpotMetaDataToSubmit}
        />
      </>
    );
  };

  const listLinkers = (isModal, type) => {
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
          linkerType={type}
          disableTooltip
          cardStyle={{ borderWidth: 0 }}
        />
      </>
    );
  };

  const listPeptides = isModal => {
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
          disableTooltip
          cardStyle={{ borderWidth: 0 }}
        />
      </>
    );
  };

  const listProteins = isModal => {
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
          disableTooltip
          cardStyle={{ borderWidth: 0 }}
        />
      </>
    );
  };

  const listLipids = isModal => {
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
          disableTooltip
          cardStyle={{ borderWidth: 0 }}
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
          chooseGlycanTableData.forEach(e => (e["glycoPeptide"] = undefined));
        }
        setFeatureAddState({ glycoPeptides: chooseGlycanTableData });
      } else if (featureAddState.glycans.length === 0) {
        valid = false; //if linker is protein/peptide, then invalidate until a valid attachable position is found
        if (chooseGlycanTableData.length > 0) {
          valid = true; //attachable position for glycan found
          chooseGlycanTableData.forEach(e => (e["glycan"] = undefined));
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

    if (featureAddState.type === "GLYCAN") {
      featureObj = getGlycanData(featureObj);
    } else if (featureAddState.type === "GLYCO_LIPID") {
      featureObj = getGlycoLipidData(featureObj);
    } else if (featureAddState.type === "GLYCO_PEPTIDE") {
      featureObj = getGlycoData(featureObj, "GLYCOPEPTIDE");
    } else if (featureAddState.type === "GLYCO_PROTEIN") {
      featureObj = getGlycoData(featureObj, "GLYCOPROTEIN");
    } else if (featureAddState.type === "GLYCO_PROTEIN_LINKED_GLYCOPEPTIDE") {
      featureObj = getGlycoProteinLinkedPeptide(featureObj, "GPLINKEDGLYCOPEPTIDE");
    } else if (featureAddState.type === "CONTROL" || featureAddState.type === "LANDING_LIGHT") {
      featureObj = getControlLandingData(featureObj);
    }

    setShowLoading(true);
    wsCall("addfeature", "POST", null, true, featureObj, addFeatureSuccess, addFeatureError);

    function addFeatureSuccess() {
      setShowLoading(false);
      history.push("/features");
    }

    function addFeatureError(response) {
      response.json().then(responseJson => {
        setShowErrorSummary(true);
        setErrorMessage("");
        setPageErrorsJson(responseJson);
        setShowLoading(false);
      });
    }
  }

  function metadataToSubmit() {
    const descriptorGroups = getDescriptorGroups(featureMetadata[0]);

    const descriptors = getDescriptors(featureMetadata[0]);
    var base = process.env.REACT_APP_BASENAME;

    let objectToBeSaved = {
      name: featureAddState.name,
      user: {
        name: window.localStorage.getItem(base ? base + "_loggedinuser" : "loggedinuser"),
      },
      template: "Default Feature",
      descriptors: descriptors,
      descriptorGroups: descriptorGroups,
      id: "",
    };

    return objectToBeSaved;
  }

  function getGlycanData(featureObj) {
    featureObj = {
      type: "LINKEDGLYCAN",

      name: featureAddState.name,
      internalId: featureAddState.featureId,
      ...getLinker(featureAddState.linker),
      glycans: featureAddState.glycans.map(glycanObj => {
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
        if (glycanObj && glycanObj.glycan && glycanObj.glycan.uri) {
          map[glycanObj.position] = glycanObj.glycan.uri;
        } else if (glycanObj && glycanObj.uri) {
          map[glycanObj.position] = glycanObj.uri;
        }
        return map;
      }, {}),

      metadata: metadataToSubmit(),
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

      name: featureAddState.name,
      internalId: featureAddState.featureId,
      ...getLinker(featureAddState.linker),
      lipid: featureAddState.lipid,
      glycans: [{ glycans: glycans, type: "LINKEDGLYCAN", linker: glycans[0].linker }],
      positionMap: featureAddState.glycans.reduce((map, glycanObj) => {
        if (glycanObj && glycanObj.glycan && glycanObj.glycan.uri) {
          map[glycanObj.position] = glycanObj.glycan.uri;
        } else if (glycanObj && glycanObj.uri) {
          map[glycanObj.position] = glycanObj.uri;
        }
        return map;
      }, {}),

      metadata: metadataToSubmit(),
    };

    return featureObj;
  }

  function getLinker(linker) {
    return featureAddState.linker && featureAddState.linker.id ? { linker: featureAddState.linker } : null;
  }

  function getGlycoData(featureObj, type) {
    let glycanList = featureAddState.rangeGlycans.length > 0 ? featureAddState.rangeGlycans : featureAddState.glycans;

    let glycansList = [];

    glycanList.forEach(positionDetails => {
      let range;
      let glycanObj;
      if (featureAddState.rangeGlycans.length > 0) {
        glycanObj = positionDetails;
      } else {
        glycanObj = positionDetails.glycan;
      }

      if (glycanObj) {
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

        glycansList.push({
          glycans: [glycans],
          linker: positionDetails.linker,
          range: range,
          type: "LINKEDGLYCAN",
        });
      }
    });

    featureObj = {
      type: type,
      name: featureAddState.name,
      internalId: featureAddState.featureId,
      ...getLinker(featureAddState.linker),
      ...getKey(type),
      glycans: glycansList,
      positionMap: featureAddState.glycans.reduce((map, glycanObj) => {
        if (glycanObj && glycanObj.glycan && glycanObj.glycan.uri) {
          map[glycanObj.position] = glycanObj.glycan.uri;
        } else if (glycanObj && glycanObj.uri) {
          map[glycanObj.position] = glycanObj.uri;
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

    let glycoPep = glycoPeptides.map(gp => {
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
      ...getLinker(featureAddState.linker),
      protein: featureAddState.protein,
      peptides: glycoPep,
      positionMap: featureAddState.glycoPeptides.reduce((map, glycoPeptideObj) => {
        if (glycoPeptideObj && glycoPeptideObj.glycoPeptide && glycoPeptideObj.glycoPeptide.uri) {
          map[glycoPeptideObj.position] = glycoPeptideObj.glycoPeptide.uri;
        } else if (glycoPeptideObj && glycoPeptideObj.uri) {
          map[glycoPeptideObj.position] = glycoPeptideObj.uri;
        }
        return map;
      }, {}),

      metadata: metadataToSubmit(),
    };

    return featureObj;
  }

  function getControlLandingData(featureObj) {
    let featureType =
      featureAddState.type === "CONTROL" && featureAddState.controlSubType === "Negative Control"
        ? "NEGATIVE_CONTROL"
        : featureAddState.type === "CONTROL"
        ? "CONTROL"
        : "LANDING_LIGHT";

    featureObj = {
      type: featureType,
      name: featureAddState.name,
      internalId: featureAddState.featureId,
      ...(featureAddState.controlSubType === "Negative Control"
        ? null
        : getLinkerControlLandingLight(featureAddState.controlSubType)),

      // glycans: [],

      // featureAddState.glycans.map(glycanObj => {
      //   let glycanDetails = {};
      //   glycanDetails.glycan = glycanObj;
      //   return glycanDetails;
      // }),

      positionMap: featureAddState.glycans.reduce((map, glycanObj) => {
        if (glycanObj && glycanObj.glycan && glycanObj.glycan.uri) {
          map[glycanObj.position] = glycanObj.glycan.uri;
        } else if (glycanObj && glycanObj.uri) {
          map[glycanObj.position] = glycanObj.uri;
        }
        return map;
      }, {}),

      metadata: metadataToSubmit(),
    };

    return featureObj;
  }

  function getLinkerControlLandingLight(subType) {
    let linkerTypeSelected;

    switch (subType) {
      case "Peptide":
        linkerTypeSelected = featureAddState.peptide;
        break;
      case "Protein":
        linkerTypeSelected = featureAddState.protein;
        break;
      case "Lipid":
        linkerTypeSelected = featureAddState.lipid;
        break;
      case "Linker":
        linkerTypeSelected = featureAddState.linker;
        break;
      case "Other":
        linkerTypeSelected = featureAddState.linker;
        break;

      default:
        return false;
    }

    return linkerTypeSelected ? { linker: linkerTypeSelected } : null;
  }

  function getKey(type) {
    return type === "GLYCOPEPTIDE" ? { peptide: featureAddState.peptide } : { protein: featureAddState.protein };
  }

  const listGlycans = showSelect => {
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
              Cell: row => <StructureImage zoom={true} base64={row.value} />,
              minWidth: 200,
            },
            {
              Header: "Mass",
              accessor: "mass",
              Cell: row => (row.value ? Number(parseFloat(row.value).toFixed(2)).toLocaleString('en-US') : ""),
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

  function getStepContentForGlycan(stepIndex) {
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
          return listLipids(false);
        } else if (featureAddState.type === "GLYCO_PEPTIDE") {
          return listPeptides(false);
        } else if (
          featureAddState.type === "GLYCO_PROTEIN" ||
          featureAddState.type === "GLYCO_PROTEIN_LINKED_GLYCOPEPTIDE"
        ) {
          return listProteins(false);
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

  function getStepContentControlLights(stepIndex) {
    switch (stepIndex) {
      case 0:
        return getCase0();
      case 1:
        return enableControlSubtypeTable && getControlSubTypeSelectionTable(featureAddState.controlSubType);
      case 2:
        return getMetadata();
      case 3:
        return getCase4();
      default:
        return "Invalid step";
    }
  }

  function setPosition(e) {
    const value = e.target.value;

    let glycoFeatureData = [...glycoProteinPepTideListStep4];
    glycoFeatureData.push({
      position: value,
      glycan: {},
      linker: {},
      ranger: {},
    });
    setGlycoProteinPepTideListStep4(glycoFeatureData);
  }

  function getStepContent(type, activeStep) {
    switch (type) {
      case "GLYCAN":
        return getStepContentForGlycan(activeStep);

      case "CONTROL":
      case "LANDING_LIGHT":
        return getStepContentControlLights(activeStep);
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
          <Row>
            <Col sm="auto">
              <RadioGroup name="molecule-type" onChange={handleTypeSelect} value={featureAddState.type}>
                {Object.keys(featureTypes).map((key, index) => {
                  return (
                    <>
                      <FormControlLabel value={key} control={<BlueRadio />} label={featureTypes[key]} key={index} />
                      {featureAddState.type === "GLYCO_LIPID" &&
                        featureTypes[key] === "GlycoLipid" &&
                        linkerSelectionDecision("lipid")}
                        
                      {featureAddState.type === "GLYCAN" &&
                        featureTypes[key] === "Glycan" &&
                        linkerSelectionDecision("glycan")}

                      {featureAddState.type === "GLYCO_PEPTIDE" &&
                        featureTypes[key] === "GlycoPeptide" &&
                        linkerSelectionDecision("peptide")}

                      {((featureAddState.type === "GLYCO_PROTEIN" && featureTypes[key] === "GlycoProtein") ||
                        (featureAddState.type === "GLYCO_PROTEIN_LINKED_GLYCOPEPTIDE" &&
                          featureTypes[key] === "GlycoProtein linked GlycoPeptide")) &&
                        linkerSelectionDecision("protein")}

                      {featureAddState.type === "CONTROL" && featureTypes[key] === "Control" && (
                        <div className="ml-4">{getControlStep1()}</div>
                      )}

                      {featureAddState.type === "LANDING_LIGHT" && featureTypes[key] === "Landing Light" && (
                        <div className="ml-4">{getLandingStep1()}</div>
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

  const linkerSelectionDecision = featureType => {
    return (
      <>
        <div className="ml-4">
          <h5 className="gg-blue">{`Is the ${featureType} linked to the surface using a linker?`}</h5>
          {getGlycoLipidStep1()}
        </div>
      </>
    );
  };

  const getCase1 = () => {
    return (
      <>
        {linkerTableConditionBasedOnType() &&
          (linkerValidated || Object.keys(featureAddState.linker).length > 0) &&
          getSelectedLinkerInformation()}

        {linkerTableConditionBasedOnType() && <FormCheck>{listLinkers(false)}</FormCheck>}
      </>
    );
  };

  function linkerTableConditionBasedOnType() {
    if (
      (featureAddState.type !== "CONTROL" &&
        featureAddState.type !== "LANDING_LIGHT" &&
        featureAddState.isLipidLinkedToSurfaceUsingLinker === "Yes") ||
      featureAddState.type === "GLYCAN" ||
      (featureAddState.type === "CONTROL" && featureAddState.controlSubType === "LINKER") ||
      (featureAddState.type === "LANDING_LIGHT" && featureAddState.controlSubType === "LINKER")
    ) {
      return true;
    } else {
      return false;
    }
  }

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
                    <StructureImage key={index} zoom={true} base64={row.value.cartoon} />
                  ) : row.value.name ? (
                    row.value.name
                  ) : (
                    "No Glycan Selected"
                  )
                ) : (
                  "No Glycan Selected"
                ),
              minWidth: 130,
            },
            ...(featureAddState.type === "GLYCO_PEPTIDE" || featureAddState.type === "GLYCO_PROTEIN"
              ? [
                  {
                    Header: "Linker",
                    accessor: "linker",
                    Cell: (row, index) => {
                      return row.original.linker ? (
                        <>
                          <LineTooltip text="Linker Details">
                            <FontAwesomeIcon
                              key={"linkerView"}
                              icon={["far", "eye"]}
                              alt="View icon"
                              size="lg"
                              color="#45818e"
                              className="tbl-icon-btn"
                              onClick={() => {
                                setEnableLinkerView(true);
                                setLinkerViewInfo(row.original.linker);
                              }}
                            />
                          </LineTooltip>
                        </>
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
                    minWidth: 130,
                  },
                ]
              : []),
            {
              Header: "Action",
              // eslint-disable-next-line react/display-name
              Cell: (row, index) => {
                return row.original && row.original.glycan ? (
                  <>
                    <LineTooltip text="View Details">
                      <FontAwesomeIcon
                        key={"view" + index}
                        icon={["far", "eye"]}
                        alt="View icon"
                        size="lg"
                        color="#45818e"
                        className="tbl-icon-btn"
                        onClick={() => getGlycanInfoDisplay(row)}
                      />
                    </LineTooltip>

                    <FontAwesomeIcon
                      key={"delete" + index}
                      icon={["far", "trash-alt"]}
                      size="lg"
                      alt="Delete selected position icon"
                      title="Delete selected position icon"
                      className="caution-color tbl-icon-btn"
                      onClick={() => {
                        let glycansList = featureAddState.glycans;

                        let selectedPosition = glycansList.find(e => e.position === row.original.position);
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
                        positionSelected.number = row.original.position;
                        positionSelected.isPosition = true;

                        setFeatureAddState({
                          positionDetails: positionSelected,
                        });
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
              minWidth: 130,
            },
          ]}
          data={featureAddState.glycans}
          minRows={0}
          className="MyReactTableClass"
          NoDataComponent={({ state, ...rest }) =>
            !state?.loading ? (
              <p className="pt-2 text-center">
                <strong>No data available</strong>
              </p>
            ) : null
          }
          defaultPageSize={featureAddState.glycans.length}
          showPagination={false}
          showSearchBox
       />
      </>
    );
  };

  const getGlycanInfoDisplay = glycan => {
    setEnableGlycanViewInfoDialog(true);
    setGlycanViewInfo(glycan.original);
  };

  const getCase3GlycoProteinLinkedPeptideFeature = () => {
    return (
      <>
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
                    <StructureImage key={index} zoom={true} base64={row.value.cartoon} />
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
                  <>
                    <LineTooltip text="Linker Details">
                      <FontAwesomeIcon
                        key={"linkerView"}
                        icon={["far", "eye"]}
                        alt="View icon"
                        size="lg"
                        color="#45818e"
                        className="tbl-icon-btn"
                        onClick={() => {
                          setEnableLinkerView(true);
                          setLinkerViewInfo(row.value.linker);
                        }}
                      />
                    </LineTooltip>
                  </>
                ) : (
                  "No Linker Selected"
                );
              },
              minWidth: 100,
            },
            {
              Header: "",
              // eslint-disable-next-line react/display-name
              Cell: (row, index) => {
                return row.original && row.original.glycoPeptide && row.original.glycoPeptide.name ? (
                  <>
                    <LineTooltip text="View Details">
                      <FontAwesomeIcon
                        key={"view" + index}
                        icon={["far", "eye"]}
                        alt="View icon"
                        size="lg"
                        color="#45818e"
                        className="tbl-icon-btn"
                        onClick={() => viewGlycoPeptide(row)}
                      />
                    </LineTooltip>

                    <FontAwesomeIcon
                      key={"delete" + index}
                      icon={["far", "trash-alt"]}
                      size="lg"
                      alt="Delete selected position icon"
                      title="Delete selected position icon"
                      className="caution-color tbl-icon-btn"
                      onClick={() => {
                        let glycoPeptidesList = featureAddState.glycoPeptides;

                        let selectedPosition = glycoPeptidesList.find(e => e.position === row.original.position);
                        let positionIndex = featureAddState.glycoPeptides.indexOf(selectedPosition);

                        selectedPosition.glycoPeptide = undefined;
                        selectedPosition.linker = undefined;
                        glycoPeptidesList[positionIndex] = selectedPosition;
                        setFeatureAddState({
                          glycoPeptides: glycoPeptidesList,
                        });
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
                        positionSelected.number = row.original.position;
                        positionSelected.isPosition = true;

                        setFeatureAddState({
                          positionDetails: positionSelected,
                        });
                      }}
                      disabled={featureAddState.rangeGlycoPeptides.length > 0}
                    >
                      {/* Pick GlycoPeptide */}
                      Select GlycoPeptide
                    </Button>
                  </>
                );
              },
              minWidth: 150,
            },
          ]}
          data={featureAddState.glycoPeptides}
          minRows={0}
          className="MyReactTableClass"
          NoDataComponent={({ state, ...rest }) =>
            !state?.loading ? (
              <p className="pt-2 text-center">
                <strong>No data available</strong>
              </p>
            ) : null
          }
          defaultPageSize={featureAddState.glycoPeptides.length}
          showPagination={false}
          showSearchBox
        />
        {showGlycoPeptides && getGlycoPeptidesModal()}

        {enableLinkerView && (
          <ViewInfoModal
            setEnableModal={setEnableLinkerView}
            enableModal={enableLinkerView}
            linker={linkerViewInfo}
            title={"Linker Information"}
            display={"view"}
          />
        )}
      </>
    );
  };

  const deleteGlycoPeptideLinkedProteinSelection = row => {
    let glycoPeptidesList = featureAddState.rangeGlycoPeptides;

    let selectedGlycoPep = glycoPeptidesList.find(e => e.index === row.index);
    let selectedIndex = glycoPeptidesList.indexOf(selectedGlycoPep);
    glycoPeptidesList.splice(selectedIndex, 1);

    setFeatureAddState({ rangeGlycoPeptides: glycoPeptidesList });
  };

  const glycoPeptideList = () => {
    return (
      <>
        <GlycoPeptides
          customViewonClick
          viewOnClick={viewGlycoPeptide}
          selectButtonHeader="Select"
          showSelectButton
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
            <Modal.Body>{listLinkers(true)}</Modal.Body>
          </Modal>
        )}
      </>
    );
  };

  const getCase2 = () => {
    return (
      <>
        {featureAddState.type === "GLYCAN" && <>{getSelectedLinkerInformation()}</>}

        <Form>
          {featureAddState.type !== "GLYCAN" && (
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
                          <StructureImage key={index} zoom={true} base64={row.value.cartoon} />
                        ) : (
                          row.value.name
                        )
                      ) : (
                        "No Glycan Selected"
                      ),
                    minWidth: 200,
                  },
                  {
                    Header: "",
                    // eslint-disable-next-line react/display-name
                    Cell: ({ index }) => (
                      <Button key={index} onClick={() => displayGlycanPicker(index)} className="gg-btn-outline-reg">
                        {/* Pick Glycan */}
                        Select Glycan
                      </Button>
                    ),
                    minWidth: 130,
                  },
                ]}
                data={featureAddState.glycans}
                minRows={0}
                className="MyReactTableClass"
                NoDataComponent={({ state, ...rest }) =>
                  !state?.loading ? (
                    <p className="pt-2 text-center">
                      <strong>No data available</strong>
                    </p>
                  ) : null
                }
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
        {(featureAddState.type !== "CONTROL" || featureAddState.type !== "LANDING_LIGHT") && showGlycanPicker ? (
          <SourceForGlycanInFeature
            showGlycanPicker={showGlycanPicker}
            setShowErrorSummary={setShowErrorSummary}
            setShowGlycanPicker={setShowGlycanPicker}
            listGlycans={listGlycans}
            glycoProteinPepTideListStep4={glycoProteinPepTideListStep4}
            setGlycoProteinPepTideListStep4={setGlycoProteinPepTideListStep4}
            featureAddState={featureAddState}
            setFeatureAddState={setFeatureAddState}
            currentGlycanSelection={currentGlycanSelection}
            setCurrentGlycanSelection={setCurrentGlycanSelection}
            displaySelectedGlycanInfoInFeature={displaySelectedGlycanInfoInFeature}
            maxRange={
              featureAddState.type === "GLYCO_PEPTIDE"
                ? featureAddState.peptide.sequence && featureAddState.peptide.sequence.length
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
        <PageHeading
          title="List of Glycans"
          subTitle="Add one or more glycans to the linker and provide the glycan details."
        />
        <div className="text-center mb-4">
          {((featureAddState.type === "GLYCO_LIPID" && featureAddState.glycans.length < 1) ||
            featureAddState.type === "GLYCO_PEPTIDE" ||
            featureAddState.type === "GLYCO_PROTEIN" ||
            featureAddState.type === "GLYCAN") && (
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
                featureAddState.glycans.filter(i => i.glycan).length > 0
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
            disabled={featureAddState.glycoPeptides.filter(i => i.glycoPeptide).length > 0}
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
                  onChange={e => handleRange(e, rowSelectedForRange.original)}
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
                  onChange={e => handleRange(e, rowSelectedForRange.original)}
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
        </Modal>
      </>
    );
  };
  const handleRange = (e, row) => {
    const listGlycoPeptides = featureAddState.rangeGlycoPeptides;
    const rowSelected = listGlycoPeptides.find(i => i.index === row.index);
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
        setDisplayLinkerInfo={setLinkerViewInfo}
        displayLinkerInfo={linkerViewInfo}
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

  const handleGlycoPeptideSelectGPLGP = glycoPeptide => {
    let glycoPeptideList;
    let glycoPeptidesWithIndex;
    let currentMaxIndex;

    glycoPeptideList = [...featureAddState.rangeGlycoPeptides];
    glycoPeptidesWithIndex = glycoPeptideList.filter(i => i.index >= 0);

    if (glycoPeptidesWithIndex.length > 0) {
      let indexes = [];
      glycoPeptideList.forEach(i => {
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

  const handleGlycoPeptideSelectionForPosition = glycoPeptide => {
    let glycoPeptidesList = [...featureAddState.glycoPeptides];

    let peptideObj = {};
    peptideObj = glycoPeptidesList.find(i => i.position === featureAddState.positionDetails.number);
    var selectedRowIndex = glycoPeptidesList.indexOf(peptideObj);

    glycoPeptide.index = featureAddState.positionDetails.number;

    peptideObj.glycoPeptide = glycoPeptide;
    glycoPeptidesList[selectedRowIndex] = peptideObj;

    setFeatureAddState({ glycoPeptides: glycoPeptidesList });
    setShowGlycoPeptides(false);
  };

  const handleDeletedSelectedGlycan = deleteRow => {
    let selectedGlycans;
    let selectedRow;
    let selectedRowIndex;

    if (featureAddState.type === "GLYCO_LIPID" || featureAddState.type === "GLYCAN") {
      selectedGlycans = [...featureAddState.glycans];
      selectedRow = selectedGlycans.find(e => e.id === deleteRow.id);
    } else if (
      featureAddState.type === "GLYCO_PEPTIDE" ||
      featureAddState.type === "GLYCO_PROTEIN" ||
      featureAddState.type === "GLYCO_PROTEIN_LINKED_GLYCOPEPTIDE"
    ) {
      selectedGlycans = [...featureAddState.rangeGlycans];
      selectedRow = selectedGlycans.find(e => e.index === deleteRow.index);
    }

    selectedRowIndex = selectedGlycans.indexOf(selectedRow);
    selectedGlycans.splice(selectedRowIndex, 1);

    if (featureAddState.type === "GLYCO_LIPID" || featureAddState.type === "GLYCAN") {
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
              // Header: "Name",
              Header: row => (
                <LineTooltip text="Name">
                  <span>Name</span>
                </LineTooltip>
              ),
              accessor: "name",
              Cell: row => getToolTip(row.original.name),
              sortMethod: (a, b) => {
                if ((a !== null && a.length) === (b !== null && b.length)) {
                  return a > b ? 1 : -1;
                }
                return (a !== null && a.length) > (b !== null && b.length) ? 1 : -1;
              },
            },
            {
              // Header: "Structure Image",
              Header: row => (
                <LineTooltip text="Structure Image">
                  <span>Structure Image</span>
                </LineTooltip>
              ),
              accessor: "cartoon",
              Cell: row => {
                return row.value ? <StructureImage zoom={true} base64={row.value} /> : "";
              },
              sortable: false,
              minWidth: 200,
            },
            {
              // Header: "Source",
              Header: row => (
                <LineTooltip text="Source">
                  <span>Source</span>
                </LineTooltip>
              ),
              accessor: "source.type",
              Cell: row => {
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
              // Header: "Reducing End State",
              Header: row => (
                <LineTooltip text="Reducing End State">
                  <span>Reducing End State</span>
                </LineTooltip>
              ),
              accessor: "opensRing",
              Cell: row => {
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
                    // Header: "Range",
                    Header: row => (
                      <LineTooltip text="Range">
                        <span>Range</span>
                      </LineTooltip>
                    ),
                    accessor: "range",
                    Cell: row => {
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
                    // Header: "Linker",
                    Header: row => (
                      <LineTooltip text="Linker">
                        <span>Linker</span>
                      </LineTooltip>
                    ),
                    accessor: "linker",
                    Cell: (row, index) => {
                      return row.original.linker ? (
                        <>
                          <LineTooltip text="Linker Details">
                            <FontAwesomeIcon
                              key={"linkerView"}
                              icon={["far", "eye"]}
                              alt="View icon"
                              size="lg"
                              color="#45818e"
                              className="tbl-icon-btn"
                              onClick={() => {
                                // linkerDetailsOnModal(row.original.linker, "view");
                                setEnableLinkerView(true);
                                setLinkerViewInfo(row.original.linker);
                              }}
                            />
                          </LineTooltip>
                        </>
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
              // Header: "Actions",
              Header: row => (
                <LineTooltip text="Actions">
                  <span>Actions</span>
                </LineTooltip>
              ),
              Cell: (row, index) => {
                return (
                  <>
                    <LineTooltip text="View Details">
                      <FontAwesomeIcon
                        key={"view" + index}
                        icon={["far", "eye"]}
                        alt="View icon"
                        size="lg"
                        color="#45818e"
                        className="tbl-icon-btn"
                        onClick={() => getGlycanInfoDisplay(row)}
                      />
                    </LineTooltip>

                    <LineTooltip text="Delete">
                      <FontAwesomeIcon
                        key={"delete" + index}
                        icon={["far", "trash-alt"]}
                        alt="Delete selected glycan icon"
                        size="lg"
                        title="Delete icon"
                        className="caution-color tbl-icon-btn"
                        onClick={() => handleDeletedSelectedGlycan(row.original)}
                      />
                    </LineTooltip>
                  </>
                );
              },
              minWidth: 130,
            },
          ]}
          data={
            featureAddState.type === "GLYCO_LIPID" || featureAddState.type === "GLYCAN"
              ? featureAddState.glycans
              : featureAddState.rangeGlycans
          }
          minRows={0}
          className="MyReactTableClass"
          NoDataComponent={({ state, ...rest }) =>
            !state?.loading ? (
              <p className="pt-2 text-center">
                <strong>No data available</strong>
              </p>
            ) : null
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
          <ViewInfoModal
            setEnableModal={setEnableGlycanViewInfoDialog}
            enableModal={enableGlycanViewInfoDialog}
            glycanViewInfo={glycanViewInfo}
            title={"Glycan Information"}
            glycanView
          />
        )}

        {enableLinkerView && (
          <ViewInfoModal
            setEnableModal={setEnableLinkerView}
            enableModal={enableLinkerView}
            linker={linkerViewInfo}
            title={"Linker Information"}
            display={"view"}
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
        // viewGlycoPeptide={viewGlycoPeptide}
        glycoPeptides={featureAddState.glycoPeptides}
        glycans={
          (featureAddState.type === "GLYCO_PEPTIDE" || featureAddState.type === "GLYCO_PROTEIN") &&
          featureAddState.rangeGlycans.length > 0
            ? featureAddState.rangeGlycans
            : featureAddState.glycans
        }
        controlSubType={featureAddState.controlSubType}
      />
    );
  };

  const getStepHelpTitle = activeStep => {
    return getSteps(featureAddState.type)[activeStep].helpSection.title;
  };

  const getStepHelpURL = activeStep => {
    return getSteps(featureAddState.type)[activeStep].helpSection.url;
  };

  return (
    <>
      <Helmet>
        <title>{head.addFeature.title}</title>
        {getMeta(head.addFeature)}
      </Helmet>
      <FeedbackWidget />
      <Container maxWidth="xl">
        <div className="page-container">
          <PageHeading
            title="Add Feature to Repository"
            subTitle="Please provide the information for the new feature."
          />
          <Typography className="text-right" gutterBottom>
            <HelpToolTip
              title={getStepHelpTitle(activeStep)}
              text={wikiHelpTooltip.tooltip_text}
              url={getStepHelpURL(activeStep)}
            />
            {wikiHelpTooltip.help_text}
          </Typography>
          <Card>
            <Card.Body>
              <Stepper className="steper-responsive text-center" activeStep={activeStep} alternativeLabel>
                {getSteps(featureAddState.type).map((step, index) => {
                  const stepProps = {};
                  const labelProps = {};

                  if (isStepSkipped(index)) {
                    labelProps.optional = <Typography variant="caption">Not Applicable</Typography>;
                    stepProps.completed = false;
                  }
                  return (
                    <Step key={index} {...stepProps}>
                      <StepLabel {...labelProps}>{step.stepTitle}</StepLabel>
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
                      featureAddState.type === "CONTROL" || featureAddState.type === "LANDING_LIGHT"
                        ? handleNextLights
                        : featureAddState.type === "GLYCAN"
                        ? handleNextGlycan
                        : handleNextGlycoTypes
                    }
                    className="gg-btn-blue mt-2 gg-ml-20"
                  >
                    {activeStep === getSteps(featureAddState.type).length - 1 ? "Submit" : "Next"}
                  </Button>
                </div>
              )}

              <ErrorSummary
                show={showErrorSummary}
                form="features"
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
                      featureAddState.type === "CONTROL" || featureAddState.type === "LANDING_LIGHT"
                        ? handleNextLights
                        : featureAddState.type === "GLYCAN"
                        ? handleNextGlycan
                        : handleNextGlycoTypes
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
      <Loading show={showLoading} />
    </>
  );
};;

AddFeature.propTypes = {
  authCheckAgent: PropTypes.func
};

export { AddFeature };
