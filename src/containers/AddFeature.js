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
import { FeatureMetaData } from "./FeatureMetaData";
import { Linkers } from "./Linkers";
import { Peptides } from "./Peptides";
import { Proteins } from "./Proteins";
import { Lipids } from "./Lipids";
import { AddFeatureGlycoTypes } from "./AddFeatureGlycoTypes";
import { SourceForGlycanInFeature } from "../components/SourceForGlycanInFeature";

const AddFeature = props => {
  useEffect(props.authCheckAgent, []);

  const featureTypes = {
    LINKED_GLYCAN: "Linked Glycan",
    GLYCO_LIPID: "glycolipid",
    GLYCO_PEPTIDE: "glycopeptide",
    GLYCO_PROTEIN: "glycoprotein",
    GLYCO_PROTEIN_LINKED_GLYCOPEPTIDE: "glycoprotein_linked_glycopeptide",
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
    name: "",
    featureId: "",
    linker: {},
    glycans: [],
    lipid: {},
    peptide: {},
    isLipidLinkedToSurfaceUsingLinker: "No"
  };

  const history = useHistory();
  const [showLoading, setShowLoading] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [showErrorSummary, setShowErrorSummary] = useState(false);
  const [pageErrorsJson, setPageErrorsJson] = useState({});
  const [errorMessage, setErrorMessage] = useState("");
  const [genericInfoValidated, setGenericInfoValidated] = useState(false);
  const [linkerValidated, setLinkerValidated] = useState(false);
  const [validLinker, setValidLinker] = useState(true);
  // const [glycanPickIndex, setGlycanPickIndex] = useState(0);
  const [showGlycanPicker, setShowGlycanPicker] = useState(false);
  const [showLinkerPicker, setShowLinkerPicker] = useState(false);
  const [glycoLipidGlycanLinkerListStep4, setGlycoLipidGlycanLinkerListStep4] = useState();
  const [glycoProteinPepTideListStep4, setGlycoProteinPepTideListStep4] = useState([{ position: 0 }]);

  const [featureAddState, setFeatureAddState] = useReducer((oldState, newState) => ({ ...oldState, ...newState }), {
    ...featureAddInitState,
    ...{ type: "LINKED_GLYCAN" }
  });

  const [featureMetaData, setFeatureMetaData] = useState();
  const [metadataforAddFeature, setMetadataforAddFeature] = useState([]);
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
          setErrorMessage("Glycan selection is required.");
          setShowErrorSummary(true);
          return;
        }
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
    } else if (activeStep === 3) {
      setGenericInfoValidated(true);
      if (!glycoLipidGlycanLinkerListStep4) {
        setErrorMessage("Glycan selection is required.");
        setShowErrorSummary(true);
        return;
      }
    } else if (activeStep === 4) {
      if (featureAddState.name === "") {
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
      setGenericInfoValidated(false);
    }
    setActiveStep(prevActiveStep => prevActiveStep - stepDecrement);
  };

  const handleTypeSelect = e => {
    const newValue = e.target.value;
    setGlycoLipidGlycanLinkerListStep4();
    setFeatureMetaData();
    setFeatureAddState({ ...featureAddInitState, ...{ type: newValue } });
  };

  const handleChange = e => {
    const name = e.target.name;
    const newValue = e.target.value;
    setFeatureAddState({ [name]: newValue });
  };

  const handleLinkerSelect = (linker, isModal) => {
    if (isModal && featureAddState.type === "GLYCO_LIPID") {
      setShowLinkerPicker(false);
      let selectedGlycans = [...featureAddState.glycans];
      selectedGlycans[0].linker = linker;
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

    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth"
    });
  };

  const handlePeptideSelect = peptide => {
    setFeatureAddState({ peptide: peptide });
    setLinkerValidated(false);

    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth"
    });
  };

  const handleProteinSelect = protein => {
    setFeatureAddState({ protein: protein });
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth"
    });
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
    return (
      <FeatureMetaData
        metadataType={"Feature"}
        importedInAPage={true}
        importedPageData={metadataforAddFeature}
        setMetadataforImportedPage={setMetadataforAddFeature}
        setImportedPageDataToSubmit={setFeatureMetaData}
        handleBack={handleBack}
        handleNext={featureAddState.type === "GLYCO_LIPID" ? handleNextGlycoLipid : handleNextLinker}
        importPageContent={getStep3Content}
      />
    );
  };

  const getTableforLinkers = isModal => {
    return (
      <>
        <Linkers
          onlyMyLinkers={onlyMyLinkers}
          isModal={isModal}
          selectButtonHeader={"Select"}
          showSelectButton
          selectButtonHandler={handleLinkerSelect}
          showOnlyMyLinkersOrGlycansCheckBox
          handleChangeForOnlyMyLinkersGlycans={() => setOnlyMyLinkers(!onlyMyLinkers)}
          onlyMyLinkersGlycans={onlyMyLinkers}
          onlyMyLinkersGlycansCheckBoxLabel={"Show all available linkers"}
          isImported
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
            <Col md={4}>
              <Form.Control
                type="text"
                name="lipid"
                value={featureAddState.lipid.name}
                disabled={true}
                placeholder="No lipid selected"
                isInvalid={linkerValidated}
              />
              <Feedback message="Please select a lipid from below"></Feedback>
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
    if (linker.type !== "SMALLMOLECULE" && featureAddState.glycans.length === 0) {
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
    }

    setShowLoading(true);
    wsCall("addfeature", "POST", null, true, featureObj, addFeatureSuccess, addFeatureError);

    function addFeatureSuccess() {
      history.push("/features");
    }

    function addFeatureError(response) {
      response.json().then(responseJson => {
        setPageErrorsJson(responseJson);
        setShowErrorSummary(true);
      });
    }
  }

  function getLinkedGlycanData(featureObj) {
    featureObj = {
      type: "LINKEDGLYCAN",

      name: featureAddState.name,
      internalId: featureAddState.featureId,
      linker: featureAddState.linker,
      glycans: featureAddState.glycans.map(glycanObj => {
        let glycanDetails = {};
        let reducingEndConfiguration = {};

        glycanDetails.glycan = glycanObj;

        reducingEndConfiguration.type = glycanObj.opensRing;
        reducingEndConfiguration.comment = glycanObj.opensRing === 0 ? glycanObj.equilibriumComment : "";
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
      metadata: featureMetaData
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
      reducingEndConfiguration.comment = glycanObj.opensRing === 0 ? glycanObj.equilibriumComment : "";
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
      glycans: [{ glycans: glycans, type: "LINKEDGLYCAN" }],
      positionMap: featureAddState.glycans.reduce((map, glycanObj) => {
        if (glycanObj && glycanObj.glycan && glycanObj.glycan.id) {
          map[glycanObj.position] = glycanObj.glycan.id;
        }
        return map;
      }, {}),
      metadata: featureMetaData
    };

    return featureObj;
  }
  const getGlycanTabletoSelect = showSelect => {
    return (
      <>
        {currentGlycanSelection && (
          <Form.Group as={Row} controlId="name">
            <FormLabel label="Selected Glycan" />
            <Col md={4}>
              <Form.Control
                type="text"
                name="glycan_name"
                value={currentGlycanSelection.id}
                disabled={true}
                placeholder="No linker selected"
              />
            </Col>
          </Form.Group>
        )}

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
              Cell: row => (row.value ? parseFloat(row.value).toFixed(4) : "")
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
          selectButtonHandler={handleGlycanSelect}
        />
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
            <AddFeatureGlycoTypes
              showGlycanPicker={showGlycanPicker}
              showLinkerPicker={showLinkerPicker}
              setShowLinkerPicker={setShowLinkerPicker}
              setShowGlycanPicker={setShowGlycanPicker}
              getTableforLinkers={getTableforLinkers}
              getGlycanTabletoSelect={getGlycanTabletoSelect}
              glycoProteinPepTideListStep4={glycoProteinPepTideListStep4}
              setGlycoProteinPepTideListStep4={setGlycoProteinPepTideListStep4}
              setPosition={setPosition}
              deleteRow={deleteRowGlycoTypes}
            />
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

  const getCase3PeptideFeature = () => {
    return (
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
                <input key={index} type="button" onClick={() => displayGlycanPicker(index)} value={"Pick Glycan"} />
              )
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

  function setPosition(e) {
    const value = e.target.value;

    let glycoFeatureData = [...glycoProteinPepTideListStep4];
    glycoFeatureData.push({ position: value, glycan: {}, linker: {}, ranger: {} });
    setGlycoProteinPepTideListStep4(glycoFeatureData);
  }

  function deleteRowGlycoTypes(deleteRow) {}

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

                  {featureAddState.type === "GLYCO_LIPID" && featureTypes[key] === "glycolipid" && (
                    <>
                      <div style={{ margin: "15px" }}>
                        Is the lipid linked to the surface using a linker?
                        <div style={{ marginTop: "15px" }}>{getGlycoLipidStep1()}</div>
                      </div>
                    </>
                  )}

                  {featureAddState.type === "GLYCO_PEPTIDE" && featureTypes[key] === "glycopeptide" && (
                    <>
                      <div style={{ margin: "15px" }}>
                        Is the peptide linked to the surface using a linker?
                        <div style={{ marginTop: "15px" }}>{getGlycoLipidStep1()}</div>
                      </div>
                    </>
                  )}

                  {featureAddState.type === "GLYCO_PROTEIN" && featureTypes[key] === "glycoprotein" && (
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
          (linkerValidated || Object.keys(featureAddState.linker).length > 0) && (
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
                <Col md={4} className="sequence-label-div">
                  <Form.Control
                    as="textarea"
                    rows={5}
                    className="sequence-textarea"
                    value={
                      featureAddState.linker.type === "SMALLMOLECULE_LINKER"
                        ? featureAddState.linker && featureAddState.linker.inChiSequence
                          ? featureAddState.linker.inChiSequence.trim()
                          : "No sequence"
                        : featureAddState.linker &&
                          featureAddState.linker.sequence &&
                          formatSequenceForDisplay(
                            featureAddState.linker.sequence && featureAddState.linker.sequence.trim(),
                            60
                          )
                    }
                    disabled
                    isInvalid={linkerValidated && !validLinker}
                  />
                  <Feedback message="Glycans cannot be attached to this protein/peptide linker. If you did not mean to add glycans to this feature, please select another type of feature."></Feedback>
                </Col>
              </Form.Group>
            </Form>
          )}

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

  const getCase2ForGlycoLipid = () => {
    return (
      <>
        <Form className="form-container">
          {/* {glycoLipidGlycanLinkerListStep4 && (
            <ReactTable
              columns={[
                {
                  Header: "Glycan",
                  accessor: "glycan",
                  Cell: (row, index) => {
                    return row.original.glycan ? row.original.glycan : "No Glycan Selected";
                  },
                  minWidth: 150
                },
                {
                  Header: "Linker",
                  accessor: "linker",
                  Cell: (row, index) => {
                    ;
                    return row.original.linker ? (
                      row.original.linker
                    ) : (
                      <Button
                        style={{
                          backgroundColor: "lightgray"
                        }}
                        onClick={() => setShowLinkerPicker(true)}
                      >
                        Add linker
                      </Button>
                    );
                  },
                  minWidth: 150
                },
                {
                  Header: "Action",
                  Cell: (row, index) => {
                    return (
                      <>
                        <FontAwesomeIcon
                          key={"delete" + index}
                          icon={["far", "trash-alt"]}
                          size="xs"
                          title="Delete"
                          className="caution-color table-btn"
                          onClick={() => setGlycoLipidGlycanLinkerListStep4()}
                          // onClick={() => deletePrompt(row.original[props.keyColumn])}
                        />
                        &nbsp;
                      </>
                    );
                  }
                }
              ]}
              data={glycoLipidGlycanLinkerListStep4}
              defaultPageSize={glycoLipidGlycanLinkerListStep4.length}
              showPagination={false}
              showSearchBox
            />
          )} */}
        </Form>

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
        {featureAddState.type === "LINKED_GLYCAN" && (
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
                      : featureAddState.linker &&
                        featureAddState.linker.sequence &&
                        formatSequenceForDisplay(featureAddState.linker.sequence, 60)}
                  </label>
                </Col>
              </Form.Group>

              {/* {featureAddState.glycans && <AddGlycanInfoToFeature glycans={featureAddState.glycans} />} */}
            </Form>
          </>
        )}

        <Form className="form-container">
          {featureAddState.type !== "LINKED_GLYCAN" && (
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
                    <input key={index} type="button" onClick={() => displayGlycanPicker(index)} value={"Pick Glycan"} />
                  )
                }
              ]}
              data={featureAddState.glycans}
              defaultPageSize={featureAddState.glycans.length}
              showPagination={false}
              showSearchBox
            />
          )}

          {getGlycanWizard()}
        </Form>
      </>
    );
  };

  const getGlycanWizard = () => {
    return (
      <>
        {(featureAddState.type === "LINKED_GLYCAN" || featureAddState.type === "GLYCO_LIPID") && showGlycanPicker ? (
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
          />
        ) : (
          <>
            <div>
              {((featureAddState.type === "GLYCO_LIPID" && featureAddState.glycans.length < 1) ||
                featureAddState.type === "LINKED_GLYCAN") && (
                <input type="button" onClick={() => setShowGlycanPicker(true)} value={"Pick Glycans"} />
              )}
            </div>
            &nbsp;&nbsp;
            {featureAddState.glycans.length > 0 && getSelectedGlycanList()}
          </>
        )}
      </>
    );
  };

  function getReducingEndState(opensRing) {
    switch (opensRing) {
      case 0:
        return "Equilibrium";
      case 1:
        return "Unknown";
      case 2:
        return "Open Ring";
      case 3:
        return "Beta";
      case 4:
        return "Alpha";
      default:
        return "Unknown";
    }
  }

  const handleGlycanSelect = glycan => {
    let glycansList = [...featureAddState.glycans];
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

    setFeatureAddState({ glycans: glycansList });
    setGlycoLipidGlycanLinkerListStep4(glycoLipidGlycanLinkerList);
    setErrorMessage("");
    setShowErrorSummary(false);
  };

  const handleDeletedSelectedGlycan = deleteRow => {
    let selectedGlycans = [...featureAddState.glycans];
    var selectedRow = selectedGlycans.find(e => e.id === deleteRow.id);
    var selectedRowIndex = selectedGlycans.indexOf(selectedRow);
    selectedGlycans.splice(selectedRowIndex, 1);
    setFeatureAddState({ glycans: selectedGlycans });
  };

  const getSelectedGlycanList = () => {
    return (
      <>
        <GlygenTable
          columns={[
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
              Header: "Source",
              accessor: "source.type"
            },
            {
              Header: "Reducing end state",
              accessor: "opensRing",
              Cell: row => {
                return getReducingEndState(row.value);
              }
            },
            ...(featureAddState.type === "GLYCO_LIPID"
              ? [
                  {
                    Header: "Linker",
                    accessor: "linker",
                    Cell: (row, index) => {
                      return row.original.linker ? (
                        row.original.linker.name
                      ) : (
                        <Button
                          style={{
                            backgroundColor: "lightgray"
                          }}
                          onClick={() => setShowLinkerPicker(true)}
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
          data={featureAddState.glycans}
          defaultPageSize={featureAddState.glycans.length}
          showDeleteButton
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
      <>
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
                      Cell: row => row.original && row.original.glytoucanId
                    },
                    {
                      Header: "Name",
                      accessor: "glycan",
                      Cell: row => row.original && row.original.name
                    },
                    {
                      Header: "Glycan",
                      accessor: "glycan",
                      // eslint-disable-next-line react/display-name
                      Cell: (row, index) =>
                        //{
                        // return <StructureImage key={index} base64={row.original.cartoon}></StructureImage>;
                        // },
                        row.original ? (
                          row.original.cartoon ? (
                            <StructureImage key={index} base64={row.original.cartoon}></StructureImage>
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
      </>
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

        <div>
          {(featureAddState.type === "GLYCO_LIPID" ||
          featureAddState.type === "GLYCO_PEPTIDE" ||
          featureAddState.type === "GLYCO_PROTEIN"
            ? activeStep !== 4
            : activeStep !== 3) && (
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
          )}
          &nbsp;&nbsp;
          <ErrorSummary show={showErrorSummary} form="feature" errorJson={pageErrorsJson} errorMessage={errorMessage} />
          <Typography component={"span"} variant={"body2"}>
            {/* {featureAddState.type === "GLYCO_LIPID" || featureAddState.type === "GLYCO_PEPTIDE"
              ? getStepContentForGlycoLipid(activeStep)
              : getStepContentForLinkedGlycan(activeStep)} */}
            {getStepContent(featureAddState.type, activeStep)}
          </Typography>
          {(featureAddState.type === "GLYCO_LIPID" ||
          featureAddState.type === "GLYCO_PEPTIDE" ||
          featureAddState.type === "GLYCO_PROTEIN"
            ? activeStep !== 4
            : activeStep !== 3) && (
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
          )}
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
