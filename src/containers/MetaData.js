/* eslint-disable no-loop-func */
/* eslint-disable array-callback-return */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useReducer, useRef } from "react";
import { Feedback, FormLabel, BlueCheckbox } from "../components/FormControls";
import { ErrorSummary } from "../components/ErrorSummary";
import { wsCall } from "../utils/wsUtils";
import PropTypes from "prop-types";
import { Descriptors } from "../components/Descriptors";
import "../containers/MetaData.css";
import { useHistory, Prompt, Link } from "react-router-dom";
import { Form, Row, Col, Button, Alert } from "react-bootstrap";
import { DragDropContext } from "react-beautiful-dnd";
import { Loading } from "../components/Loading";
import { FormControlLabel, FormGroup } from "@material-ui/core";

const MetaData = props => {
  // useEffect(props.authCheckAgent, []);

  var meta = [];

  const history = useHistory();
  const [isUpdate, setIsUpdate] = useState(false);
  const [validated, setValidated] = useState(false);
  const [errorName, setErrorName] = useState(false);
  const [errorType, setErrorType] = useState(false);
  const [assayCurrentStep, setAssayCurrentStep] = useState(0);
  const [sampleModel, setSampleModel] = useState([]);
  const [showLoading, setShowLoading] = useState(false);
  const [enablePrompt, setEnablePrompt] = useState(false);
  const [pageErrorsJson, setPageErrorsJson] = useState({});
  const [isAllExpanded, setIsAllExpanded] = useState(false);
  const [duplicateName, setDuplicateName] = useState(false);
  const [characterCounter, setCharacterCounter] = useState();
  const [updateSampleName, setUpdateSampleName] = useState("");
  const [pageErrorMessage, setPageErrorMessage] = useState("");
  const [loadDescriptors, setLoadDescriptors] = useState(false);
  const [showErrorSummary, setShowErrorSummary] = useState(false);
  const [addDescriptorSelection, setAddDescriptorSelection] = useState("select");
  const [loadDataOnFirstNextInUpdate, setLoadDataOnFirstNextInUpdate] = useState(false);
  const [mandateGroupLimitDeceed, setMandateGroupLimitDeceed] = useState(new Map());
  const [mandateGroupLimitExceed, setMandateGroupLimitExceed] = useState(new Map());

  useEffect(() => {
    setShowLoading(true);

    if (props.metaID) {
      !props.isCopy && setIsUpdate(true);

      wsCall(
        props.getMetaData,
        "GET",
        [props.metaID],
        true,
        null,
        getSampleForUpdateSuccess,
        getSampleForUpdateFailure
      );
    } else {
      wsCall(
        "listtemplates",
        "GET",
        { type: props.type },
        true,
        null,
        getListTemplatesSuccess,
        getListTemplatesFailure
      );
    }
  }, [props.metaID]);

  const metaDetails = {
    name: "",
    selectedtemplate: "",
    description: "",
    sample: {}
  };

  const [metaDataDetails, setMetaDataDetails] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    metaDetails
  );

  const handleChange = e => {
    const name = e.target.name;
    const value = e.target.value;

    if (name === "name") {
      setErrorName(false);
      setDuplicateName(false);

      if (updateSampleName !== value) {
        wsCall(
          "availablemetadataname",
          "GET",
          { name: encodeURIComponent(value.trim()), metadatatype: props.type },
          true,
          null,
          checkMetadataNameSuccess,
          checkMetadataNameFailure
        );
      }
    } else if (name === "type") {
      resetNewlyAddedItemsIfAny();
      setErrorType(false);
      setValidated(false);
    } else if (name === "description") {
      setCharacterCounter(value.length);
    }

    setMetaDataDetails({ [name]: value });
    setEnablePrompt(true);
  };

  // const handleUnitSelectionChange=(e)=>{
  //   const value = e.target.value;
  //   setAddDescriptorSelection(value);
  // }

  const resetNewlyAddedItemsIfAny = () => {
    const currentSelectedSample = sampleModel.find(i => i.name === metaDataDetails.selectedtemplate);
    if (currentSelectedSample) {
      const nonMandatoryAddedDGroups = currentSelectedSample.descriptors.filter(
        i => i.mandatory === false && (i.isNewlyAddedNonMandatory === false || i.isNewlyAdded === false)
      );

      nonMandatoryAddedDGroups &&
        nonMandatoryAddedDGroups.forEach(dg => {
          dg.isNewlyAddedNonMandatory = false;
          dg.isNewlyAdded = false;
        });
    }
  };

  const handleNext = () => {
    if (
      metaDataDetails.name === "" &&
      (metaDataDetails.selectedtemplate === "" || metaDataDetails.selectedtemplate === "select")
    ) {
      setErrorName(true);
      setErrorType(true);
    } else if (metaDataDetails.selectedtemplate === "" || metaDataDetails.selectedtemplate === "select") {
      setErrorType(true);
    } else if (metaDataDetails.name === "") {
      setErrorName(true);
    } else {
      if ((isUpdate || props.isCopy) && !loadDataOnFirstNextInUpdate && props.metadataType !== "Assay") {
        setSampleUpdateData();
      } else if ((isUpdate || props.isCopy) && !loadDataOnFirstNextInUpdate && props.metadataType === "Assay") {
        setAssayMetadataUpdate();
      }
      setLoadDescriptors(true);
    }
  };

  const handleChangeMetaForm = (descriptorDetails, e, groupId, dateElementId) => {
    let id = "";
    let name = "";
    let value = "";
    let descriptor;
    let flag;
    let descriptorGroupEditedIndex;

    if (dateElementId === "checkBox") {
      if (descriptorDetails.group) {
        descriptor = descriptorDetails.descriptors.find(i => i.id === groupId);
      } else {
        descriptor = descriptorDetails;
      }

      if (!descriptor) {
        descriptor = descriptorDetails.descriptors.map(subDesc => {
          let d;

          if (subDesc.group) {
            d = subDesc.descriptors.find(e => e.id === groupId);
            if (d) {
              return d;
            }
          }
        });
      } else {
        id = groupId;
        name = descriptor.name;
        flag = e.target.checked;
      }
    } else if (dateElementId) {
      let dateField = handleDate(descriptorDetails, groupId, dateElementId, e);

      id = dateField.id;
      name = dateField.name;

      let day = e._d.getDate() < 10 ? `0${e._d.getDate()}` : e._d.getDate();
      let month = e._d.getMonth() + 1 < 10 ? `0${e._d.getMonth() + 1}` : e._d.getMonth();
      let year = e._d.getFullYear();

      value = `${month}/${day}/${year}`;
    } else if (e.target.name === "unitlevel") {
      id = e.target.id;
      name = e.target.name;
      value = e.target.options[e.target.selectedIndex].value;
    } else {
      id = e.target.id;
      name = e.target.name;
      value = e.target.value;
    }

    let selectedSample;
    let sampleModelUpdated;
    let selectedSampleIndex;

    if (isUpdate || props.isCopy) {
      selectedSample = { ...sampleModel };
    } else {
      sampleModelUpdated = [...sampleModel];
      selectedSample = sampleModelUpdated.find(i => i.name === metaDataDetails.selectedtemplate);
      selectedSampleIndex = sampleModelUpdated.indexOf(selectedSample);
    }

    if (descriptorDetails.group) {
      if (!descriptor) {
        descriptor = descriptorDetails.descriptors.find(i => i.id === id);
      }

      if (!descriptor) {
        let editedSubGroup = "";
        let editedSubGroupIndex;
        const subGroupDescriptors = descriptorDetails.descriptors.find(i => i.id === groupId);
        const subGroupDescriptorIndex = descriptorDetails.descriptors.indexOf(subGroupDescriptors);

        if (subGroupDescriptors.group) {
          editedSubGroup = subGroupDescriptors.descriptors.find(i => i.name === name);
          editedSubGroupIndex = subGroupDescriptors.descriptors.indexOf(editedSubGroup);
          if (name === "unitlevel") {
            editedSubGroup.unit = value;
          } else if (dateElementId === "checkBox") {
            editedSubGroup = handleCheckBox(editedSubGroup, flag, e);
          } else {
            editedSubGroup.value = value;
          }
          subGroupDescriptors.descriptors[editedSubGroupIndex] = editedSubGroup;
        } else {
          editedSubGroup = subGroupDescriptors.find(i => i.id === id);
          if (name === "unitlevel") {
            editedSubGroup.unit = value;
          } else if (dateElementId === "checkBox") {
            editedSubGroup = handleCheckBox(editedSubGroup, flag, e);
          } else {
            editedSubGroup.value = value;
          }
        }
        descriptorDetails.descriptors[subGroupDescriptorIndex] = subGroupDescriptors;
      } else {
        let editedDescGroup = descriptorDetails.descriptors;
        let editedDesc = editedDescGroup.find(i => i.id === id);

        if (name === "unitlevel") {
          editedDesc.unit = value;
        } else if (dateElementId === "checkBox") {
          editedDesc = handleCheckBox(editedDesc, flag, e);
        } else {
          editedDesc.value = value;
        }
      }
    } else {
      if (name === "unitlevel") {
        descriptorDetails.unit = value;
      } else if (dateElementId === "checkBox") {
        descriptorDetails = handleCheckBox(descriptorDetails, flag, e);
      } else {
        descriptorDetails.value = value;
      }
    }

    if (groupId && !dateElementId) {
      let groupSelected = selectedSample.descriptors.find(e => e.id === groupId);
      let subGroupIndex = groupSelected.descriptors.indexOf(descriptorDetails);

      groupSelected.descriptors[subGroupIndex] = descriptorDetails;
      descriptorGroupEditedIndex = selectedSample.descriptors.indexOf(groupSelected);

      selectedSample.descriptors[descriptorGroupEditedIndex] = groupSelected;
    } else {
      descriptorGroupEditedIndex = selectedSample.descriptors.indexOf(descriptorDetails);
      selectedSample.descriptors[descriptorGroupEditedIndex] = descriptorDetails;
    }

    if (isUpdate || props.isCopy) {
      setSampleModel(selectedSample);
    } else {
      sampleModelUpdated[selectedSampleIndex] = selectedSample;
      setSampleModel(sampleModelUpdated);
    }

    props.importedInAPage && props.setMetadataforImportedPage(sampleModel);
  };

  function handleCheckBox(descriptorDetails, flag, e) {
    if (e.target.name === "notApplicable" && flag) {
      descriptorDetails.notApplicable = flag;
      if (descriptorDetails.notRecorded) {
        descriptorDetails.notRecorded = false;
      }
    } else if (e.target.name === "notApplicable" && !flag) {
      descriptorDetails.notApplicable = flag;
    } else if (e.target.name === "notRecorded" && flag) {
      descriptorDetails.notRecorded = flag;
      if (descriptorDetails.notApplicable) {
        descriptorDetails.notApplicable = false;
      }
    } else if (e.target.name === "notRecorded" && !flag) {
      descriptorDetails.notRecorded = flag;
    } else { // other boolean
      descriptorDetails.value = flag;
    }

    if (descriptorDetails.notApplicable || descriptorDetails.notRecorded) {
      descriptorDetails.disabled = true;
    } else if (!descriptorDetails.notApplicable && !descriptorDetails.notRecorded) {
      descriptorDetails.disabled = false;
    }

    return descriptorDetails;
  }

  function handleDate(descriptorDetails, groupId, dateElementId, e) {
    let dateField = "";

    if (descriptorDetails.group && !groupId) {
      dateField = descriptorDetails.descriptors.find(i => i.id === dateElementId);
    } else if (groupId) {
      descriptorDetails.descriptors.forEach(element => {
        if (element.id === dateElementId) {
          dateField = element;
        } else if (element.group) {
          element.descriptors.forEach(element => {
            if (element.id === dateElementId) {
              dateField = element;
            }
          });
        }
      });
    }

    return dateField;
  }

  const getAddons = () => {
    let sampleModelUpdate;
    let selectedSample;
    let name;

    const onDescriptorChange = ({ target: { value } }) => {
      setAddDescriptorSelection(value);
      name = value;
      if (value !== "Select" && value !== "select") {
        if (isUpdate || props.isCopy) {
          sampleModelUpdate = { ...sampleModel };
          selectedSample = sampleModelUpdate;
        } else {
          sampleModelUpdate = [...sampleModel];
          selectedSample = sampleModelUpdate.find(i => i.name === metaDataDetails.selectedtemplate);
        }

        var existedElement = selectedSample.descriptors.find(e => e.name === name && !e.isNewlyAdded);
        handleAddDescriptorGroups(existedElement);
      }
    };

    return (
      <>
        <Form.Group as={Row} controlId={""} className="gg-align-center">
          <Col xs={12} lg={4}>
            <FormLabel label="Add Descriptors" />
            <Form.Control
              as="select"
              value={addDescriptorSelection}
              onChange={onDescriptorChange}
            >
              {getDescriptorOptions()}
            </Form.Control>
          </Col>
        </Form.Group>
      </>
    );
  };

  const getDescriptorOptions = () => {
    const options = [];
    let sortOptions = [];
    let sampleType;
    let desc = [];

    if (isUpdate || props.isCopy) {
      sampleType = { ...sampleModel };
    } else if (props.importedInAPage) {
      sampleType = sampleModel[0];
    } else if (props.metadataType !== "Assay") {
      sampleType = sampleModel.find(i => i.name === metaDataDetails.selectedtemplate);
    } else if (props.metadataType === "Assay") {
      sampleType = sampleModel[0];
    }

    desc = sampleType.descriptors;

    options.push(
      <option key={0} value={"Select"}>
        Select Descriptor
      </option>
    );

    if (assayCurrentStep === 2 && props.metadataType === "Assay") {
      let refCount = desc.filter(i => i.name === "Reference");
      const occurrences = sortOptions.filter(i => i === "Reference");

      if (refCount[0].maxOccurrence > refCount.length) {
        occurrences.length < 1 && sortOptions.push(refCount[0].name);
      }
    } else {
      desc.forEach(d => {
        const occurrences = sortOptions.filter(i => i === d.name);

        if ((d.name !== "Reference" && props.metadataType === "Assay") || props.metadataType !== "Assay") {
          if (!d.mandateGroup) {
            if (d.maxOccurrence === 1 && !d.mandatory) {
              if (d.group) {
                if (d.isDeleted) {
                  occurrences.length < 1 && sortOptions.push(d.name);
                }
              }
            } else if (d.maxOccurrence > 1) {
              let currentDisplayCount = desc.filter(e => e.name === d.name);
              if (currentDisplayCount.length < d.maxOccurrence) {
                occurrences.length < 1 && sortOptions.push(d.name);
              }
            }
          }
        }

        // if (props.metadataType === "Assay" && d.displayLabel && !d.displayLabelSelected) {
        //   sortOptions.push(d.name);
        // }
      });
    }

    sortOptions.sort().forEach((element, index) => {
      options.push(
        <option key={index + 1} value={element}>
          {element}
        </option>
      );
    });

    return options;
  };

  const handleAddDescriptorGroups = elementSelected => {
    const errorMessage = "MaxOccurrence for the descriptor has been reached";
    var selectedSample;
    var sampleModelUpdate;
    let maxCurrentOrder;

    if (isUpdate || props.isCopy) {
      sampleModelUpdate = { ...sampleModel };
      selectedSample = sampleModelUpdate;
    } else {
      sampleModelUpdate = [...sampleModel];
      selectedSample = sampleModelUpdate.find(i => i.name === metaDataDetails.selectedtemplate);
    }

    var existedElement = selectedSample.descriptors.find(e => e.name === elementSelected.name && !e.isNewlyAdded);

    var newItemsCount = selectedSample.descriptors.filter(
      e => e.isNewlyAdded === true && e.name === elementSelected.name
    ).length;

    maxCurrentOrder = selectedSample.descriptors[selectedSample.descriptors.length - 1].order;

    if (
      existedElement.isDeleted ||
      (props.metadataType === "Assay" && existedElement.displayLabel && !existedElement.displayLabelSelected)
    ) {
      if (existedElement.mandateGroup) {
        let sameGroupItemDeletedTobe = selectedSample.descriptors.filter(
          e => e.mandateGroup && e.mandateGroup.id === existedElement.mandateGroup.id
        );

        sameGroupItemDeletedTobe.forEach(descGroup => {
          descGroup.isDeleted = false;
        });
      } else {
        if (props.metadataType === "Assay" && existedElement.displayLabel && !existedElement.displayLabelSelected) {
          existedElement.displayLabelSelected = true;
        }

        existedElement.isDeleted = false;
      }
    } else if (existedElement) {
      if (newItemsCount + 1 < existedElement.maxOccurrence) {
        selectedSample.descriptors = creatNewDescriptorElement(
          existedElement,
          newItemsCount,
          selectedSample,
          maxCurrentOrder
        );
      } else if (
        !existedElement.isNewlyAddedNonMandatory &&
        !existedElement.mandatory &&
        newItemsCount + 1 < existedElement.maxOccurrence
      ) {
        if (props.metadataType === "Assay") {
          maxCurrentOrder = Math.max(
            ...selectedSample.descriptors.map(desc => {
              return desc.order;
            }),
            0
          );
          existedElement.order = maxCurrentOrder + 1;
        }
        existedElement.isNewlyAddedNonMandatory = true;
      } else {
        alert(errorMessage);
      }
    } else {
      alert(errorMessage);
    }

    if (props.metadataType === "Assay") {
      sortAssayDescriptors(selectedSample);
    }

    setSampleModel(sampleModelUpdate);
    setAddDescriptorSelection("");
    //props.importedInAPage && props.setMetadataforImportedPage(sampleModel);
  };

  function validateUserInput(subGroupAddElement, subGroupAddDescriptor) {
    let flag = true;

    subGroupAddDescriptor.descriptors.forEach(ele => {
      if (ele.mandatory) {
        if (!ele.value || (ele.value && ele.value.length < 1) || ele.value === "") {
          flag = false;
        }
      }
    });

    return flag;
  }

  const handleAddDescriptorSubGroups = (selectedGroup, selectedSubGrpDesc) => {
    let sampleModelUpdate;
    let itemByType;
    let itemByTypeIndex;
    let selectedDescriptorIndex;
    let maxCurrentOrder;

    if (isUpdate || props.isCopy) {
      sampleModelUpdate = { ...sampleModel };
    } else {
      sampleModelUpdate = [...sampleModel];

      itemByType = sampleModelUpdate.find(i => i.name === metaDataDetails.selectedtemplate);
      itemByTypeIndex = sampleModelUpdate.indexOf(itemByType);
    }

    var existedElement = selectedGroup.descriptors.find(e => e.name === selectedSubGrpDesc.name && !e.isNewlyAdded);

    var newItemsCount = selectedGroup.descriptors.filter(
      e => e.isNewlyAdded === true && e.name === selectedSubGrpDesc.name
    ).length;

    maxCurrentOrder = selectedGroup.descriptors[selectedGroup.descriptors.length - 1].order;

    if (newItemsCount + 1 < selectedSubGrpDesc.maxOccurrence) {
      selectedGroup.descriptors = creatNewDescriptorElement(
        existedElement,
        newItemsCount,
        selectedGroup,
        maxCurrentOrder
      );

      if (isUpdate || props.isCopy) {
        setSampleModel(sampleModelUpdate);
      } else {
        selectedDescriptorIndex = itemByType.descriptors.indexOf(selectedGroup);
        itemByType.descriptors[selectedDescriptorIndex] = selectedGroup;
        sampleModelUpdate[itemByTypeIndex] = itemByType;
        setSampleModel(sampleModelUpdate);
      }
    }

    props.importedInAPage && props.setMetadataforImportedPage(sampleModel);
  };

  function creatNewDescriptorElement(existedElement, newItemsCount, selectedGroup, maxCurrentOrder) {
    var newElement = JSON.parse(JSON.stringify(existedElement));

    if (newItemsCount > 0) {
      newElement.id = `newlyAddedItems${Math.floor(Math.random() * 1000000)}${existedElement.name.trim()}`;

      let duplicateElements = selectedGroup.descriptors.filter(i => i.id === newElement.id);

      if (duplicateElements.length > 0) {
        newElement.id = `newlyAddedItems${Math.floor(Math.random() * 1000000)}${existedElement.name.trim()}`;
      }
    } else {
      newElement.id = "newlyAddedItems" + newItemsCount + existedElement.name.trim();
    }

    newElement.isNewlyAdded = true;
    newElement.isNewlyAddedNonMandatory = true;
    //newElement.order = maxCurrentOrder + 1;
    newElement.group &&
      newElement.descriptors.forEach(e => {
        e.value = "";
        e.id = "newlyAddedItems" + newItemsCount + e.id;
      });

    const selectedElementIndex = selectedGroup.descriptors.indexOf(existedElement);
    const totalSelectedElementsDuplicateCount = selectedElementIndex + 1 + newItemsCount;

    let listUptoSelectedElements = selectedGroup.descriptors.slice(0, totalSelectedElementsDuplicateCount);
    let listOfRemainingsAfterSelectedElements = selectedGroup.descriptors.slice(totalSelectedElementsDuplicateCount);

    listUptoSelectedElements.push(newElement);
    const reArrangedList = listUptoSelectedElements.concat(listOfRemainingsAfterSelectedElements);

    return reArrangedList;
  }

  const sortAssayDescriptors = selectedMetadata => {
    selectedMetadata.descriptors.forEach(desc => {
      if (desc.group) {
        desc.descriptors.sort((a, b) => a.order - b.order);
      }
    });
    selectedMetadata.descriptors.sort((a, b) => a.order - b.order);
  };

  const handleDelete = id => {
    var sampleModelDelete;
    var itemByType;
    var itemByTypeIndex;

    if (isUpdate || props.isCopy) {
      itemByType = { ...sampleModel };

      //itemByType = sampleModelDelete.find(i => i.name === metaDataDetails.selectedtemplate);
     // itemByTypeIndex = sampleModelDelete.indexOf(itemByType);
    } else {
      sampleModelDelete = [...sampleModel];

      itemByType = sampleModelDelete.find(i => i.name === metaDataDetails.selectedtemplate);
      itemByTypeIndex = sampleModelDelete.indexOf(itemByType);
    }

    var itemDescriptors = itemByType.descriptors;
    var itemToBeDeleted = itemDescriptors.find(i => i.id === id);
    var itemToBeDeletedIndex = itemDescriptors.indexOf(itemToBeDeleted);

    if (!itemToBeDeleted.id.startsWith("newly") && itemToBeDeleted.isNewlyAddedNonMandatory === undefined) {
      if (itemToBeDeleted.mandateGroup) {
        let sameGroupItemDeletedTobe = itemDescriptors.filter(
          e => e.mandateGroup && e.mandateGroup.id === itemToBeDeleted.mandateGroup.id
        );

        sameGroupItemDeletedTobe.forEach(descGroup => {
          descGroup.isDeleted = true;
        });
      } else {
        itemToBeDeleted.isDeleted = true;

        if (props.metadataType === "Assay" && itemToBeDeleted.displayLabel && itemToBeDeleted.displayLabelSelected) {
          itemToBeDeleted.displayLabelSelected = false;
        }

        let itemSubDescriptors = itemToBeDeleted.descriptors;

        let listtoBeDeleted = itemSubDescriptors.filter(e => e.isNewlyAddedNonMandatory);

        listtoBeDeleted.forEach(newlyAddedEle => {
          itemToBeDeleted.descriptors.splice(itemToBeDeleted.descriptors.indexOf(newlyAddedEle), 1);
        });

        itemSubDescriptors.forEach(d => {
          if (!d.id.startsWith("newly") && d.group) {
            var dg = d.descriptors;
            dg.forEach(sgd => {
              sgd.value = undefined;
              sgd.notApplicable = false;
              sgd.notRecorded = false;
              sgd.disabled = false;
            });
          } else if (!d.group) {
            d.value = undefined;
            d.notApplicable = false;
            d.notRecorded = false;
            d.disabled = false;
          }
        });
      }
    } else if (itemToBeDeleted.id.startsWith("newly")) {
      const ItemToBeDeletedIndex = itemDescriptors.indexOf(itemToBeDeleted);
      itemDescriptors.splice(ItemToBeDeletedIndex, 1);
    } else {
      itemToBeDeleted.isNewlyAddedNonMandatory = false;
      itemToBeDeleted.isNewlyAdded = false;
      itemToBeDeleted.order = 0;

      const itemSubDescriptors = itemToBeDeleted.descriptors;

      itemSubDescriptors.forEach(d => {
        if (d.id.startsWith("newly")) {
          const newlyAddedsubGroupIndex = itemSubDescriptors.indexOf(d);
          itemSubDescriptors.splice(newlyAddedsubGroupIndex, 1);
        } else if (d.group) {
          var dg = d.descriptors;
          dg.forEach(sgd => {
            sgd.value = undefined;
            sgd.notApplicable = false;
            sgd.notRecorded = false;
            sgd.disabled = false;
          });
        } else {
          d.value = undefined;
          d.notApplicable = false;
          d.notRecorded = false;
          d.disabled = false;
        }
      });
    }

    if (props.metadataType === "Assay") {
      var reOrderItems;

      if (itemToBeDeletedIndex + 1 < itemDescriptors.length) {
        reOrderItems = itemDescriptors.slice(itemToBeDeletedIndex + 1);
      } else if (itemToBeDeletedIndex + 1 === itemDescriptors.length) {
        reOrderItems = itemDescriptors.slice(itemToBeDeletedIndex);
      }

      reOrderItems &&
        reOrderItems.length > 0 &&
        reOrderItems.forEach(item => {
          if (item.order !== 0) {
            item.order--;
          }
        });
    }

    itemByType.descriptors = itemDescriptors;

    if (isUpdate || props.isCopy) {
      setSampleModel(itemByType);
    } else {
      sampleModelDelete[itemByTypeIndex] = itemByType;
      setSampleModel(sampleModelDelete);
    }

    props.importedInAPage && props.setMetadataforImportedPage(sampleModel);
  };

  const handleCancelModal = (selectedSubGroup, selectedGroup) => {
    let sampleModelDelete;
    let itemByType;
    let itemByTypeIndex;
    let itemDescriptors;

    if (isUpdate || props.isCopy) {
      itemByType = { ...sampleModel };
    } else {
      sampleModelDelete = [...sampleModel];
      itemByType = sampleModelDelete.find(i => i.name === metaDataDetails.selectedtemplate);
      itemByTypeIndex = sampleModelDelete.indexOf(itemByType);
    }

    itemDescriptors = itemByType.descriptors;

    let sameSubGroups;
    let cancelledElement;

    let selectedMainGroup = itemDescriptors.find(e => e.id === selectedGroup.id);
    let selectedMainGroupIndex = itemDescriptors.indexOf(selectedMainGroup);

    sameSubGroups = selectedMainGroup.descriptors.filter(e => e.name === selectedSubGroup.name);

    if (sameSubGroups.length > 0) {
      cancelledElement = sameSubGroups[sameSubGroups.length - 1];
    }

    if (cancelledElement) {
      cancelledElement.descriptors.forEach(ele => {
        ele.value = "";
      });
    }

    itemDescriptors[selectedMainGroupIndex] = selectedMainGroup;
    itemByType.descriptors = itemDescriptors;

    if (isUpdate || props.isCopy) {
      setSampleModel(itemByType);
    } else {
      sampleModelDelete[itemByTypeIndex] = itemByType;
      setSampleModel(sampleModelDelete);
    }
    props.importedInAPage && props.setMetadataforImportedPage(sampleModel);
  };

  const handleSubGroupDelete = (id, selectedSubGroup) => {
    var sampleModelDelete;
    var itemByType;
    var itemByTypeIndex;
    let itemToBeDeleted;
    let itemToBeDeletedIndex;
    let selectedElement;
    let selectedElementIndex;

    if (isUpdate || props.isCopy) {
      itemByType = { ...sampleModel };
    } else {
      sampleModelDelete = [...sampleModel];
      itemByType = sampleModelDelete.find(i => i.name === metaDataDetails.selectedtemplate);
      itemByTypeIndex = sampleModelDelete.indexOf(itemByType);
    }

    var itemDescriptors = itemByType.descriptors;
    let subGroupElement;
    let subGroupIndex;

    if (!selectedSubGroup) {
      selectedElement = itemDescriptors.find(i => i.id === id);
      selectedElementIndex = itemDescriptors.indexOf(selectedElement);
    }

    if (selectedSubGroup) {
      if (!selectedSubGroup.id.startsWith("newly")) {
        selectedSubGroup.descriptors.forEach(ele => {
          ele.value = "";
        });

        itemDescriptors.forEach(e => {
          if (e.group) {
            subGroupElement = e.descriptors.find(i => i.id === id);
            if (subGroupElement) {
              subGroupIndex = e.descriptors.indexOf(subGroupElement);
              e.descriptors[subGroupIndex] = selectedSubGroup;
            }
          }
        });
      } else {
        itemDescriptors.forEach(e => {
          if (e.group) {
            subGroupElement = e.descriptors.find(i => i.id === id);
            if (subGroupElement) {
              subGroupIndex = e.descriptors.indexOf(subGroupElement);
              e.descriptors.splice(subGroupIndex, 1);
            }
          }
        });
      }
    } else if (!selectedElement.group) {
      itemDescriptors.splice(selectedElementIndex, 1);
    } else {
      itemToBeDeleted = selectedElement.descriptors.find(i => i.id === id);
      itemToBeDeletedIndex = selectedElement.descriptors.indexOf(itemToBeDeleted);
      selectedElement.descriptors.splice(itemToBeDeletedIndex, 1);
      itemDescriptors[selectedElementIndex] = selectedElement;
    }

    itemByType.descriptors = itemDescriptors;

    if (isUpdate || props.isCopy) {
      setSampleModel(itemByType);
    } else {
      sampleModelDelete[itemByTypeIndex] = itemByType;
      setSampleModel(sampleModelDelete);
    }
    props.importedInAPage && props.setMetadataforImportedPage(sampleModel);
  };

  const getMetaData = () => {
    meta = (
      <>
        {!props.importedInAPage && (
          <>
            <Form.Group as={Row} controlId="name" className="gg-align-center mb-3">
              <Col xs={12} lg={9}>
                <FormLabel label="Name" className="required-asterik" />
                <Form.Control type="text" name="name" disabled value={metaDataDetails.name} />
              </Col>
            </Form.Group>
            {(sampleModel && sampleModel.length > 1) ||
            (sampleModel && sampleModel.name && !sampleModel.name.startsWith("Default")) ? (
              <Form.Group as={Row} controlId="type" className="gg-align-center mb-3">
                <Col xs={12} lg={9}>
                  <FormLabel
                    label={`${props.metadataType === "Printrun" ? "Print Run" : props.metadataType} Type`}
                    className="required-asterik"
                  />
                  <Form.Control type="text" name="type" disabled value={metaDataDetails.selectedtemplate} />
                </Col>
              </Form.Group>
            ) : (
              ""
            )}

            {/* groups with max Occurrence hasn't met */}
            {getAddons()}
          </>
        )}

        {props.metadataType === "Feature" && (
          <>
            <Form.Group as={Row} className="gg-align-center mb-3" controlId="name">
              <Col xs={12} lg={9}>
                <FormLabel label="Name" className={"required-asterik"} />
                <Form.Control
                  type="text"
                  name="name"
                  placeholder="Name"
                  value={props.featureAddState.name}
                  onChange={e => {
                    props.setFeatureAddState({ name: e.target.value });
                    props.setFeatureAddState({ invalidName: false });
                  }}
                  isInvalid={props.featureAddState.invalidName}
                  maxLength={50}
                  required
                />
                <Feedback message="Name is required" />
              </Col>
            </Form.Group>

            <Form.Group as={Row} className="gg-align-center mb-3" controlId="featureId">
              <Col xs={12} lg={9}>
                <FormLabel label="Feature ID" className={"required-asterik"} />
                <Form.Control
                  type="text"
                  name="featureId"
                  placeholder="Feature ID"
                  value={props.featureAddState.featureId}
                  onChange={e => {
                    props.setFeatureAddState({ featureId: e.target.value });
                    props.setFeatureAddState({ validateFeatureId: false });
                  }}
                  isInvalid={props.featureAddState.validateFeatureId}
                  maxLength={30}
                  required
                />
                <Feedback message="Feature ID is required" />
              </Col>
            </Form.Group>

            {getAddons()}
          </>
        )}

        {props.metadataType === "Assay" ? (
          <DragDropContext onDragEnd={dragEnd}>{loadDescriptorsAndGroups()}</DragDropContext>
        ) : (
          loadDescriptorsAndGroups()
        )}
      </>
    );
    return meta;
  };

  const loadDescriptorsAndGroups = () => {
    return (
      <>
        <Descriptors
          metaDataTemplate={metaDataDetails.selectedtemplate}
          metaType={props.metadataType}
          descriptors={sampleModel}
          handleChange={handleChangeMetaForm}
          handleDelete={handleDelete}
          validateUserInput={validateUserInput}
          isAllExpanded={isAllExpanded}
          // descriptorSubGroup={getDescriptorSubGroup}
          handleSubGroupDelete={handleSubGroupDelete}
          handleCancelModal={handleCancelModal}
          isUpdate={isUpdate}
          isCopySample={props.isCopy}
          handleUnitSelectionChange={handleChangeMetaForm}
          handleAddDescriptorGroups={handleAddDescriptorGroups}
          handleAddDescriptorSubGroups={handleAddDescriptorSubGroups}
          defaultSelectionChangeSuperGroup={defaultSelectionChangeSuperGroup}
          defaultSelectionChangeSubGroup={defaultSelectionChangeSubGroup}
          nonXorGroupApporRec={nonXorGroupApporRec}
          setAssayCurrentStep={setAssayCurrentStep}
          assayCurrentStep={assayCurrentStep}
          setLoadDataOnFirstNextInUpdate={setLoadDataOnFirstNextInUpdate}
          loadDataOnFirstNextInUpdate={loadDataOnFirstNextInUpdate}
        />

        <div className="mb-3">
          <div>
            <sup>1</sup>
            {` Information was not provided by vendor, manufacturer or customer etc.`}
          </div>
          <div>
            <sup>2</sup>
            {` Information was not recorded during the experiment.`}
          </div>
        </div>
      </>
    );
  };

  const dragEnd = result => {
    const { source, destination } = result;
    var sampleModelDragandDrop;
    var itemByType;
    var itemByTypeIndex;

    if (!destination) {
      return;
    }

    if (isUpdate || props.isCopy) {
      itemByType = { ...sampleModel };
    } else {
      sampleModelDragandDrop = [...sampleModel];
      itemByType = sampleModelDragandDrop.find(i => i.name === metaDataDetails.selectedtemplate);
      itemByTypeIndex = sampleModelDragandDrop.indexOf(itemByType);
    }

    var itemDescriptors = itemByType.descriptors;

    const sourceIndex = source.index;
    const destinationIndex = destination.index;

    const sourceElement = itemDescriptors[sourceIndex];
    const destinationElement = itemDescriptors[destinationIndex];

    const destinationOrder = destinationElement.order;
    sourceElement.order = destinationOrder;

    itemDescriptors.splice(sourceIndex, 1);

    itemDescriptors.splice(destinationIndex, 0, sourceElement);

    if (sourceIndex < destinationIndex) {
      const reOrderItems = itemDescriptors.slice(sourceIndex, destinationIndex);
      reOrderItems.forEach(item => {
        item.order--;
      });
    } else if (sourceIndex > destinationIndex) {
      const reOrderItems = itemDescriptors.slice(destinationIndex + 1, sourceIndex + 1);
      reOrderItems.forEach(item => {
        item.order++;
      });
    }

    itemByType.descriptors = itemDescriptors;

    if (isUpdate || props.isCopy) {
      setSampleModel(itemByType);
    } else {
      sampleModelDragandDrop[itemByTypeIndex] = itemByType;
      setSampleModel(sampleModelDragandDrop);
    }
  };

  function defaultSelectionChangeSuperGroup(latestDefaultSelection, notApplicableOrRecorded) {
    var sampleModelDragandDrop;
    var itemByType;
    var itemByTypeIndex;
    let indexOfCurrentDefaultSelection;
    let indexOfLatestDefaultSelection;

    if (isUpdate || props.isCopy) {
      itemByType = { ...sampleModel };
    } else {
      sampleModelDragandDrop = [...sampleModel];
      itemByType = sampleModelDragandDrop.find(i => i.name === metaDataDetails.selectedtemplate);
      itemByTypeIndex = sampleModelDragandDrop.indexOf(itemByType);
    }

    var itemDescriptors = itemByType.descriptors;

    let currentDefaultSelection = itemDescriptors.filter(
      i =>
        i.mandateGroup &&
        i.mandateGroup.id === latestDefaultSelection.mandateGroup.id &&
        (i.mandateGroup.defaultSelection || i.mandateGroup.notApplicable || i.mandateGroup.notRecorded)
      // i.mandateGroup.defaultSelection === true
    );

    if (currentDefaultSelection.length > 1) {
      if (isUpdate) {
        // let listOfRemoveDefaultSelection=
        currentDefaultSelection.filter(e => {
          if (e.id !== latestDefaultSelection.id) {
            e.mandateGroup.notApplicable = false;
            e.mandateGroup.notRecorded = false;
            e.mandateGroup.defaultSelection = false;
          }
        });

        latestDefaultSelection.mandateGroup.defaultSelection = true;
        latestDefaultSelection.mandateGroup.notApplicable = false;
        latestDefaultSelection.mandateGroup.notRecorded = false;
      } else {
        let newlyAddedNonMGroupsofCurrentDefaultSelection = itemDescriptors.filter(
          i =>
            i.mandateGroup &&
            i.mandateGroup.id === latestDefaultSelection.mandateGroup.id &&
            i.mandateGroup.defaultSelection === true &&
            i.id.startsWith("newly")
        );

        newlyAddedNonMGroupsofCurrentDefaultSelection.forEach(desc => {
          itemDescriptors.splice(itemDescriptors.indexOf(desc), 1);
        });

        currentDefaultSelection = itemDescriptors.filter(
          i =>
            i.mandateGroup &&
            i.mandateGroup.id === latestDefaultSelection.mandateGroup.id &&
            i.mandateGroup.defaultSelection === true &&
            !i.id.startsWith("newly")
        );

        currentDefaultSelection[0].mandateGroup.defaultSelection = false;
        currentDefaultSelection[0].mandateGroup.notApplicable = false;
        currentDefaultSelection[0].mandateGroup.notRecorded = false;
      }
    } else if (currentDefaultSelection.length < 1 && !notApplicableOrRecorded) {
      currentDefaultSelection = itemDescriptors.filter(
        i =>
          i.mandateGroup &&
          i.mandateGroup.id === latestDefaultSelection.mandateGroup.id &&
          i.mandateGroup.defaultSelection === false &&
          (i.mandateGroup.notApplicable || i.mandateGroup.notRecorded)
      );

      indexOfCurrentDefaultSelection = itemDescriptors.indexOf(currentDefaultSelection[0]);
      currentDefaultSelection[0].mandateGroup.notApplicable = false;
      currentDefaultSelection[0].mandateGroup.notRecorded = false;
      itemDescriptors[indexOfCurrentDefaultSelection] = currentDefaultSelection[0];
    } else if ((currentDefaultSelection.length === 1 && notApplicableOrRecorded) || !notApplicableOrRecorded) {
      if (currentDefaultSelection[0]) {
        if (currentDefaultSelection[0].group) {
          currentDefaultSelection[0].descriptors.forEach(d => {
            if (d.group) {
              var dg = d.descriptors;
              dg.forEach(sgd => {
                if (sgd.disabled) {
                  sgd.disabled = false;
                  sgd.notApplicable = false;
                  sgd.notRecorded = false;
                }
                sgd.value = undefined;
              });
            } else if (!d.group) {
              if (d.disabled) {
                d.disabled = false;
                d.notApplicable = false;
                d.notRecorded = false;
              }
              d.value = undefined;
            }
          });
        } else {
          currentDefaultSelection[0].value = undefined;
        }
      }

      indexOfCurrentDefaultSelection = itemDescriptors.indexOf(currentDefaultSelection[0]);
      currentDefaultSelection[0].mandateGroup.defaultSelection = false;
      currentDefaultSelection[0].mandateGroup.notApplicable = false;
      currentDefaultSelection[0].mandateGroup.notRecorded = false;
      itemDescriptors[indexOfCurrentDefaultSelection] = currentDefaultSelection[0];
    }

    if (notApplicableOrRecorded) {
      let sameXorGroup = itemDescriptors.filter(
        i => i.mandateGroup && i.mandateGroup.id === latestDefaultSelection.mandateGroup.id
      );
      if (sameXorGroup.length > 0) {
        let lastElementIntheGroup = sameXorGroup[sameXorGroup.length - 1];
        lastElementIntheGroup.mandateGroup.defaultSelection = false;

        if (notApplicableOrRecorded === "notApplicable") {
          lastElementIntheGroup.mandateGroup.notApplicable = true;
          lastElementIntheGroup.mandateGroup.notRecorded = false;
        } else if (notApplicableOrRecorded === "notRecorded") {
          lastElementIntheGroup.mandateGroup.notRecorded = true;
          lastElementIntheGroup.mandateGroup.notApplicable = false;
        }
      }
    } else {
      indexOfLatestDefaultSelection = itemDescriptors.indexOf(latestDefaultSelection);
      latestDefaultSelection.mandateGroup.defaultSelection = true;
      itemDescriptors[indexOfLatestDefaultSelection] = latestDefaultSelection;
    }

    itemByType.descriptors = itemDescriptors;

    if (isUpdate || props.isCopy) {
      setSampleModel(itemByType);
    } else {
      sampleModelDragandDrop[itemByTypeIndex] = itemByType;
      setSampleModel(sampleModelDragandDrop);
    }
  }

  function defaultSelectionChangeSubGroup(latestDefaultSelection, notApplicableOrRecorded, sg) {
    var sampleModelDragandDrop;
    var itemByType;
    var itemByTypeIndex;
    let indexOfCurrentDefaultSelection;
    let indexOfLatestDefaultSelection;
    let currentDefaultSelection;
    let superGroup = sg.descriptors ? sg.descriptors : sg;

    if (isUpdate || props.isCopy) {
      itemByType = { ...sampleModel };
    } else {
      sampleModelDragandDrop = [...sampleModel];
      itemByType = sampleModelDragandDrop.find(i => i.name === metaDataDetails.selectedtemplate);
      itemByTypeIndex = sampleModelDragandDrop.indexOf(itemByType);
    }

    var itemDescriptors = itemByType.descriptors;

    superGroup.filter(
      i =>
        i.mandateGroup &&
        i.mandateGroup.id === latestDefaultSelection.mandateGroup.id &&
        (i.mandateGroup.defaultSelection || i.mandateGroup.notApplicable || i.mandateGroup.notRecorded)
    );

    currentDefaultSelection = superGroup.filter(
      i =>
        i.mandateGroup &&
        i.mandateGroup.id === latestDefaultSelection.mandateGroup.id &&
        (i.mandateGroup.defaultSelection || i.mandateGroup.notApplicable || i.mandateGroup.notRecorded)
      // i.mandateGroup.defaultSelection === true
    );

    if ((currentDefaultSelection.length === 1 && notApplicableOrRecorded) || !notApplicableOrRecorded) {
      if (currentDefaultSelection[0]) {
        if (currentDefaultSelection[0].group) {
          currentDefaultSelection[0].descriptors.forEach(d => {
            if (d.group) {
              var dg = d.descriptors;
              dg.forEach(sgd => {
                if (sgd.disabled) {
                  sgd.disabled = false;
                  sgd.notApplicable = false;
                  sgd.notRecorded = false;
                }
                sgd.value = undefined;
              });
            } else if (!d.group) {
              if (d.disabled) {
                d.disabled = false;
                d.notApplicable = false;
                d.notRecorded = false;
              }
              d.value = undefined;
            }
          });
        } else {
          currentDefaultSelection[0].value = undefined;
        }
      }

      indexOfCurrentDefaultSelection = superGroup.indexOf(currentDefaultSelection[0]);
      currentDefaultSelection[0].mandateGroup.defaultSelection = false;
      currentDefaultSelection[0].mandateGroup.notApplicable = false;
      currentDefaultSelection[0].mandateGroup.notRecorded = false;
      superGroup[indexOfCurrentDefaultSelection] = currentDefaultSelection[0];
    }

    if (notApplicableOrRecorded) {
      let sameXorGroup = superGroup.filter(
        i => i.mandateGroup && i.mandateGroup.id === latestDefaultSelection.mandateGroup.id
      );

      if (sameXorGroup.length > 0) {
        let lastElementIntheGroup = sameXorGroup[sameXorGroup.length - 1];
        lastElementIntheGroup.mandateGroup.defaultSelection = false;

        if (notApplicableOrRecorded === "notApplicable") {
          lastElementIntheGroup.mandateGroup.notApplicable = true;
          lastElementIntheGroup.mandateGroup.notRecorded = false;
        } else if (notApplicableOrRecorded === "notRecorded") {
          lastElementIntheGroup.mandateGroup.notRecorded = true;
          lastElementIntheGroup.mandateGroup.notApplicable = false;
        }
      }
    } else {
      indexOfLatestDefaultSelection = superGroup.indexOf(latestDefaultSelection);
      latestDefaultSelection.mandateGroup.defaultSelection = true;
      if (!latestDefaultSelection.group && latestDefaultSelection.namespace.name === "boolean") {
        latestDefaultSelection.value = true;
      }
      superGroup[indexOfLatestDefaultSelection] = latestDefaultSelection;
    }

    if (isUpdate || props.isCopy) {
      setSampleModel(itemByType);
    } else {
      sampleModelDragandDrop[itemByTypeIndex] = itemByType;
      setSampleModel(sampleModelDragandDrop);
    }
  }

  function nonXorGroupApporRec(desc, notAppOrRec) {
    var sampleModelNonXorGroup;
    var itemByType;
    var itemByTypeIndex;
    let indexOfLatestSelection;

    if (isUpdate || props.isCopy) {
      itemByType = { ...sampleModel };
    } else {
      sampleModelNonXorGroup = [...sampleModel];
      itemByType = sampleModelNonXorGroup.find(i => i.name === metaDataDetails.selectedtemplate);
      itemByTypeIndex = sampleModelNonXorGroup.indexOf(itemByType);
    }

    var itemDescriptors = itemByType.descriptors;

    indexOfLatestSelection = itemDescriptors.indexOf(desc);

    if (!notAppOrRec) {
      desc.notApplicable = false;
      desc.notRecorded = false;
    } else if (notAppOrRec === "notApplicable") {
      desc.notApplicable = true;
      desc.notRecorded = false;
    } else if (notAppOrRec === "notRecorded") {
      desc.notRecorded = true;
      desc.notApplicable = false;
    }

    itemDescriptors[indexOfLatestSelection] = desc;

    itemByType.descriptors = itemDescriptors;

    if (isUpdate || props.isCopy) {
      setSampleModel(itemByType);
    } else {
      sampleModelNonXorGroup[itemByTypeIndex] = itemByType;
      setSampleModel(sampleModelNonXorGroup);
    }
  }

  const getXorList = (mandateGroupMap, message) => {
    let itr = mandateGroupMap.entries();
    let listMandatoryGroup = [];

    for (var pair of itr) {
      var groupId = pair[0];
      var element = pair[1];
      listMandatoryGroup.push(getList(element, groupId));
    }
    return (
      <>
        <Alert
          variant="danger"
          style={{
            width: "fit-content",
            marginLeft: "25%"
          }}
        >
          <span
            style={{
              color: "#",
              fontWeight: "bold",
              // paddingRight: "600px",
              borderColor: "#f5c6cb",
              textTransform: "uppercase"
            }}
          >
            {message}
          </span>
          <br />
          {listMandatoryGroup}
        </Alert>
      </>
    );
  };

  const getList = (groupElements, groupId) => {
    let sameGroupElements = groupElements.map((element, index) => {
      return `   ${element.name.toUpperCase()},`;
    });

    return (
      <>
        <Row style={{ marginTop: "10px" }}>
          <Col md={4} style={{ textAlign: "right" }}>{`Group ID: ${groupId}`}</Col>
          <Col md={8} style={{ textAlign: "left" }}>
            {sameGroupElements}
          </Col>
        </Row>
      </>
    );
  };

  const getListTemplate = () => {
    return (
      <>
        <Form.Group as={Row} controlId="type" className="gg-align-center mb-3">
          <Col xs={12} lg={9}>
            {(sampleModel && sampleModel.length > 1) ||
              (sampleModel && sampleModel.name && !sampleModel.name.startsWith("Default") && (
                <FormLabel
                  label={`${props.metadataType === "Printrun" ? "Print Run" : props.metadataType} Type`}
                  className="required-asterik"
                />
              ))}
            {((sampleModel && sampleModel.name && !sampleModel.name.startsWith("Default")) ||
              sampleModel.length > 0) && (
              <Form.Control
                as="select"
                name="selectedtemplate"
                value={metaDataDetails.selectedtemplate}
                onChange={handleChange}
                isInvalid={errorType}
                disabled={isUpdate || props.isCopy}
                required
              >
                <option value={metaDataDetails.selectedtemplate}>{metaDataDetails.selectedtemplate}</option>
              </Form.Control>
            )}
            <Feedback message={`${props.metadataType} Type is required`} />
          </Col>
        </Form.Group>
      </>
    );
  };

  const getStartMetadataPage = () => {
    return (
      <>
        <Form.Group as={Row} controlId="name" className="gg-align-center mb-3 mt-2">
          <Col xs={12} lg={9}>
            <FormLabel label="Name" className="required-asterik" />
            <Form.Control
              type="text"
              name="name"
              placeholder="Enter Name"
              value={metaDataDetails.name}
              onChange={handleChange}
              required
              isInvalid={errorName}
              maxLength={50}
            />
            <Feedback
              message={
                duplicateName ? "Another sample has the same Name. Please use a different Name." : "Name is required"
              }
            />
          </Col>
        </Form.Group>

        <Form.Group as={Row} controlId="description" className="gg-align-center mb-3">
          <Col xs={12} lg={9}>
            <FormLabel label="Description" />
            <Form.Control
              as="textarea"
              rows={4}
              name="description"
              placeholder="Enter Description"
              value={metaDataDetails.description}
              onChange={handleChange}
              maxLength={2000}
            />
            <div className="text-right text-muted">
              {metaDataDetails.description === "0" ? "0" : characterCounter} /2000
            </div>
          </Col>
        </Form.Group>

        {!isUpdate && !props.isCopy &&
          ((sampleModel && sampleModel.length > 1) ||
            (sampleModel && sampleModel.name && !sampleModel.name.startsWith("Default"))) && (
          <Form.Group as={Row} controlId="description" className="gg-align-center mb-3">
            <Col xs={12} lg={9}>
              <FormLabel
                label={`${props.metadataType === "Printrun" ? "Print Run" : props.metadataType} Type`}
                className="required-asterik"
              />

              <Form.Control
                as="select"
                name="selectedtemplate"
                value={metaDataDetails.selectedtemplate}
                onChange={handleChange}
                isInvalid={errorType}
                disabled={isUpdate || props.isCopy}
                required
              >
                <option value="select">Select {`${props.metadataType} Type`}</option>
                {sampleModel.map((element, index) => {
                  return (
                    <option key={index} value={element.name}>
                      {element.name}
                    </option>
                  );
                })}
              </Form.Control>
              <Feedback message={`${props.metadataType} Type is required`} />
            </Col>
            </Form.Group>)}

        {(isUpdate || props.isCopy) && getListTemplate()}

        {props.metadataType === "Assay" && sampleModel.length > 0 && (
          <>
            <Form.Group as={Row} className="gg-align-center mb-3" controlId={"displayLabel"}>
              <Col xs={12} lg={9}>
                <FormLabel
                  label={`Did your assay contain the following steps? Please note that these steps
                        can also be added manually later on by selecting Next step`}
                />

                {listAssayDisplayLabelCheckBox()}
              </Col>
            </Form.Group>
          </>
        )}
      </>
    );
  };

  const listAssayDisplayLabelCheckBox = () => {
    return sampleModel[0].descriptors.map(ele => {
      if (ele.displayLabel) {
        return (
          <>
            <FormGroup controlid={ele.id}>
              <Col xs={12} lg={9}>
                <FormControlLabel
                  control={
                    <BlueCheckbox
                      id={ele.id}
                      name="assayDescCheckbox"
                      onChange={handleAssayDisplayLabelChange}
                      checked={ele.displayLabelSelected}
                      size="medium"
                    />
                  }
                  label={ele.displayLabel}
                />
              </Col>
            </FormGroup>
          </>
        );
      }
    });
  };

  const handleAssayDisplayLabelChange = e => {
    const flag = e.target.checked;
    const id = e.currentTarget.id;

    let sModel = [...sampleModel];

    let selectedItem = sModel[0].descriptors.find(i => i.id === id);
    selectedItem.displayLabelSelected = flag;

    if (flag) {
      selectedItem.isDeleted = false;
    }

    setSampleModel(sModel);
  };

  // const getExpandCollapseIcon = () => {
  //   return (
  //     <>
  //       <FontAwesomeIcon
  //         className={"plus-button-icon"}
  //         icon={["fas", isAllExpanded ? "minus" : "plus"]}
  //         size="2x"
  //         title={isAllExpanded ? "Collapse" : "Expand"}
  //         onClick={() => setIsAllExpanded(!isAllExpanded)}
  //       />
  //     </>
  //   );
  // };

  function handleSubmit(e) {
    if ((assayCurrentStep === 2 && props.metadataType === "Assay") || props.metadataType !== "Assay") {
      setValidated(true);

      if (e.currentTarget.checkValidity() && !isGroupMandate()) {
        setShowLoading(true);

        if (props.importedPageData) {
          props.handleNext(e);
          props.setImportedPageDataToSubmit(metadataToSubmit());
          setShowLoading(false);
        } else {
          if (isUpdate) {
            wsCall(props.updateMeta, "POST", null, true, metadataToSubmit(), addMetaSuccess, addMetaFailure);
          } else {
            wsCall(props.addMeta, "POST", null, true, metadataToSubmit(), addMetaSuccess, addMetaFailure);
          }
        }
      }
    } else {
      validateAssayStep2Data(e);
    }

    e.preventDefault();
  }

  function metadataToSubmit() {
    let selectedItemByType;

    if (isUpdate || props.isCopy) {
      selectedItemByType = sampleModel;
    } else {
      selectedItemByType = sampleModel.find(i => i.name === metaDataDetails.selectedtemplate);
    }

    const descriptorGroups = getDescriptorGroups(selectedItemByType);

    const descriptors = getDescriptors(selectedItemByType);
    var base = process.env.REACT_APP_BASENAME;
    let objectToBeSaved = {
      name: metaDataDetails.name,
      description: metaDataDetails.description,
      user: {
        name: window.localStorage.getItem(base ? base + "_loggedinuser" : "loggedinuser")
      },
      template: metaDataDetails.selectedtemplate,
      descriptors: descriptors,
      descriptorGroups: descriptorGroups,
      id: isUpdate ? metaDataDetails.id : ""
    };
    return props.importedPageData ? objectToBeSaved : JSON.stringify(objectToBeSaved);
  }

  function isGroupMandate() {
    let flag = false;
    let selectedItemByType;

    if (isUpdate || props.isCopy) {
      selectedItemByType = sampleModel;
    } else {
      selectedItemByType = sampleModel.find(i => i.name === metaDataDetails.selectedtemplate);
    }

    const groupDescriptors = selectedItemByType.descriptors.filter(i => i.group === true && i.mandateGroup);

    const NAorNRSelectedGroups = selectedItemByType.descriptors.filter(
      i => i.group === true && i.mandateGroup && (i.mandateGroup.notRecorded || i.mandateGroup.notApplicable)
    );

    NAorNRSelectedGroups.forEach(e => {
      let deleteList = groupDescriptors.filter(i => i.mandateGroup.id === e.mandateGroup.id);

      deleteList.forEach(i => {
        var row = groupDescriptors.indexOf(i);
        groupDescriptors.splice(row, 1);
      });
    });

    const mandatoryGroupsFilled = groupDescriptors.filter(function(e) {
      const filledDesc = e.descriptors.filter(function(subDescriptor) {
        if (!subDescriptor.group && (subDescriptor.value || subDescriptor.notRecorded || subDescriptor.notApplicable)) {
          return subDescriptor;
        } else if (subDescriptor.group) {
          const filledSubGroups = subDescriptor.descriptors.filter(i => i.value || i.notRecorded || i.notApplicable);
          if (filledSubGroups.length > 0) {
            return subDescriptor;
          }
        }
      });

      if (filledDesc.length > 0) {
        return filledDesc;
      }
    });

    let mandateGroupExceed = new Map();
    let mandateGroupDeceed = new Map();

    groupDescriptors.filter(function(e) {
      const sameGroupItems = mandatoryGroupsFilled.filter(i => i.mandateGroup.id === e.mandateGroup.id);

      if (sameGroupItems.length > 1 && sameGroupItems.filter(i => i.xorMandate).length > 1) {
        mandateGroupExceed.set(e.mandateGroup.id, sameGroupItems);
      } else {
        let deceedGroup = [];
        if (mandateGroupDeceed.size > 0) {
          deceedGroup = mandateGroupDeceed.get(e.mandateGroup.id);
          if (!deceedGroup) {
            deceedGroup = [];
          }
        }
        deceedGroup.push(e);

        mandateGroupDeceed.set(e.mandateGroup.id, deceedGroup);
      }
    });

    if (mandateGroupDeceed.size > 0) {
      const itr = mandateGroupDeceed.entries();

      for (var descriptorPair of itr) {
        var pair = descriptorPair[1];
        pair.filter(function(desc) {
          if (
            !desc.xorMandate &&
            desc.descriptors.filter(i => i.value || i.notRecorded || i.notApplicable).length > 0
          ) {
            mandateGroupDeceed.delete(descriptorPair[0]);
          } else if (
            desc.xorMandate &&
            desc.descriptors.filter(i => i.value && (i.value !== undefined || i.notRecorded || i.notApplicable))
              .length > 0
          ) {
            mandateGroupDeceed.delete(descriptorPair[0]);
          }
        });
      }
    }

    if (mandateGroupExceed.size > 0 || mandateGroupDeceed.size > 0) {
      flag = true;
    }

    setMandateGroupLimitDeceed(mandateGroupDeceed);
    setMandateGroupLimitExceed(mandateGroupExceed);

    return flag;
  }

  function addMetaSuccess(response) {
    console.log(response);

    setEnablePrompt(false);
    setShowLoading(false);
    history.push("/" + props.redirectTo);
  }

  function addMetaFailure(response) {
    var formError = false;
    let aggregatedSummary = "";

    response.json().then(responseJson => {
      responseJson.errors &&
        responseJson.errors.forEach(element => {
          if (element.defaultMessage === "NotFound") {
            if (aggregatedSummary.includes("Please")) {
              aggregatedSummary += `${","} ${element.objectName}`;
            } else {
              aggregatedSummary += `Please Add Descriptor Groups: ${element.objectName}`;
            }
            formError = true;
          } else if (element.objectName === "name") {
            setValidated(false);
            setErrorName(true);
            setLoadDescriptors(false);
            setDuplicateName(true);
            formError = true;
          }
        });

      if (!formError) {
        setPageErrorsJson(responseJson);
        setShowErrorSummary(true);
      } else if (aggregatedSummary) {
        setPageErrorMessage(aggregatedSummary);
        setShowErrorSummary(true);
      }

      setShowLoading(false);
    });
  }

  function getListTemplatesSuccess(response) {
    response.json().then(responseJson => {
      responseJson.forEach(template => {
        template.descriptors.forEach(desc => {
          if (desc.group) {
            desc.descriptors.sort((a, b) => a.order - b.order);
          }
        });
        template.descriptors.sort((a, b) => a.order - b.order);
      });

      setMetaDataDetails({ sample: responseJson });

      if (props.importedPageData && props.importedPageData.length > 0) {
        setSampleModel(props.importedPageData);
      } else {
        setSampleModel(responseJson);
      }

      if (responseJson.length === 1) {
        setMetaDataDetails({ selectedtemplate: responseJson[0].name });
      }

      setShowLoading(false);
    });
  }

  function getSampleForUpdateSuccess(response) {
    response.json().then(responseJson => {
      setMetaDataDetails({
        name: props.isCopy ? "" : responseJson.name,
        selectedtemplate: responseJson.template,
        description: responseJson.description,
        sample: responseJson,
        id: responseJson.id
      });

      !props.isCopy && setUpdateSampleName(responseJson.name);

      const templateType = responseJson.templateType;
      wsCall("gettemplate", "GET", [templateType], true, null, getSampleTemplateSuccess, getSampleTemplateFailure);
    });
  }

  function getSampleTemplateSuccess(response) {
    response.json().then(responseJson => {
      setMetaDataDetails({
        type: responseJson.name
      });

      if (props.importedInAPage && props.importedPageData && props.importedPageData.id) {
        setSampleModel(props.importedPageData);
      } else {
        setSampleModel(responseJson);
        props.importedInAPage && props.setMetadataforImportedPage(responseJson);
      }
      setShowLoading(false);
    });
  }

  function setSampleUpdateData() {
    let sampleModelUpdate = sampleModel;

    if (sampleModel.descriptors && sampleModel.descriptors.length > 0) {
      metaDataDetails.sample.descriptors.forEach(generalDsc => {
        let simpleDesc;
        // let templateDesc = sampleModelUpdate.descriptors.find(i => i.id === generalDsc.key.id);

        if (generalDsc.key && generalDsc.key.id) {
          simpleDesc = sampleModelUpdate.descriptors.find(i => i.id === generalDsc.key.id && i.group === false);
        }

        if (simpleDesc) {
          if (generalDsc.key.mandateGroup && (generalDsc.notApplicable || generalDsc.notRecorded)) {
            simpleDesc.mandateGroup.defaultSelection = false;

            if (generalDsc.notApplicable) {
              simpleDesc.mandateGroup.notApplicable = true;
            } else if (generalDsc.notRecorded) {
              simpleDesc.mandateGroup.notRecorded = true;
            }
          } else if (generalDsc.key.mandateGroup) {
            simpleDesc.mandateGroup.defaultSelection = true;

            let defaultSelectedUnfilledDesc = sampleModelUpdate.descriptors.find(
              e => e.mandateGroup && e.mandateGroup.id === simpleDesc.mandateGroup.id && e.mandateGroup.defaultSelection
            );

            if (defaultSelectedUnfilledDesc.id !== simpleDesc.id) {
              simpleDesc.mandateGroup.defaultSelection = false;
            } else if (generalDsc.value) {
              simpleDesc.value = generalDsc.value;
              simpleDesc.unit = generalDsc.unit ? generalDsc.unit : "";
            }
          } else if (!generalDsc.key.mandateGroup && (generalDsc.notApplicable || generalDsc.notRecorded)) {
            if (generalDsc.notApplicable) {
              simpleDesc.notApplicable = true;
            } else {
              simpleDesc.notRecorded = true;
            }
          } else {
            if (generalDsc.value) {
              simpleDesc.value = generalDsc.value;
              simpleDesc.unit = generalDsc.unit ? generalDsc.unit : "";
            } else {
              simpleDesc.disabled = true;
              if (generalDsc.notApplicable) {
                simpleDesc.notApplicable = true;
              } else if (generalDsc.notRecorded) {
                simpleDesc.notRecorded = true;
              }
            }
          }
        }
      });

      metaDataDetails.sample.descriptorGroups.forEach(group => {
        let templateDescriptorGroup;
        let tempDescGroup = sampleModelUpdate.descriptors.find(i => i.id === group.key.id);

        let filledDescriptors = tempDescGroup.descriptors.filter(i => i.value && i.value !== "");

        if (!tempDescGroup) {
          templateDescriptorGroup = sampleModelUpdate.descriptors.find(i => i.id === group.key.id);

          var newElement = JSON.parse(JSON.stringify(templateDescriptorGroup));
          newElement.id = "newlyAddedItems" + templateDescriptorGroup.id;
          newElement.isNewlyAdded = true;
          newElement.order = group.order;
          newElement.group &&
            newElement.descriptors.forEach(e => {
              e.id = "newlyAddedItems" + e.id;
            });

          sampleModelUpdate.descriptors.push(newElement);
        } else if (filledDescriptors.length > 0) {   // we need another fresh copy, this one already has values 
          templateDescriptorGroup = sampleModelUpdate.descriptors.find(i => i.id === group.key.id);
          tempDescGroup = JSON.parse(JSON.stringify(templateDescriptorGroup));
          sampleModelUpdate.descriptors.push(tempDescGroup);
        }
        if (tempDescGroup) {
          if (group.key.mandateGroup && (group.notApplicable || group.notRecorded)) {
            templateDescriptorGroup = tempDescGroup;
            templateDescriptorGroup.mandateGroup.defaultSelection = false;

            if (group.notApplicable) {
              templateDescriptorGroup.mandateGroup.notApplicable = true;
            } else if (group.notRecorded) {
              templateDescriptorGroup.mandateGroup.notRecorded = true;
            }
          } else if (group.key.mandateGroup) {
            templateDescriptorGroup = tempDescGroup;
            if (group.descriptors.length > 0) {
              templateDescriptorGroup.mandateGroup.defaultSelection = true;

              let defaultSelectedUnfilledDesc = sampleModelUpdate.descriptors.find(
                e =>
                  e.mandateGroup &&
                  e.mandateGroup.id === templateDescriptorGroup.mandateGroup.id &&
                  e.mandateGroup.defaultSelection
              );

              if (defaultSelectedUnfilledDesc.id !== templateDescriptorGroup.id) {
                defaultSelectedUnfilledDesc.mandateGroup.defaultSelection = false;
              }
            }
          } else if (!group.key.mandateGroup && (group.notApplicable || group.notRecorded)) {
            templateDescriptorGroup = tempDescGroup;

            if (group.notApplicable) {
              templateDescriptorGroup.notApplicable = true;
            } else {
              templateDescriptorGroup.notRecorded = true;
            }
          } else {
            templateDescriptorGroup = tempDescGroup;
          }
        }

        if (templateDescriptorGroup.descriptors) {
          if (!templateDescriptorGroup.mandatory && !tempDescGroup) {
            templateDescriptorGroup.id = "newlyAddedItems" + templateDescriptorGroup.id;
            templateDescriptorGroup.isNewlyAdded = true;
          }
          group.descriptors.forEach(dbRetrivedDesc => {
            const subDescriptor =
              templateDescriptorGroup && templateDescriptorGroup.descriptors.find(i => i.id === dbRetrivedDesc.key.id);
            const newlyAddedGroupsInDBRetrivedDesc =
              templateDescriptorGroup && group.descriptors.filter(i => i.key.id === dbRetrivedDesc.key.id);

            if (dbRetrivedDesc.key.mandateGroup) {
              if ((dbRetrivedDesc.group && dbRetrivedDesc.descriptors.length > 0) ||
                (dbRetrivedDesc.value)) {
                subDescriptor.mandateGroup.defaultSelection = true;

                let defaultSelectedUnfilledDesc = templateDescriptorGroup.descriptors.find(
                  e =>
                    e.mandateGroup &&
                    e.mandateGroup.id === subDescriptor.mandateGroup.id &&
                    e.mandateGroup.defaultSelection
                );

                if (defaultSelectedUnfilledDesc.id !== subDescriptor.id) {
                  defaultSelectedUnfilledDesc.mandateGroup.defaultSelection = false;
                }
              }
            }

            if (subDescriptor && !subDescriptor.group) {
              if (dbRetrivedDesc.notApplicable) {
                subDescriptor.notApplicable = true;
                subDescriptor.disabled = true;
              } else if (dbRetrivedDesc.notRecorded) {
                subDescriptor.notRecorded = true;
                subDescriptor.disabled = true;
              } else {
                subDescriptor.value = dbRetrivedDesc.value;
                subDescriptor.unit = dbRetrivedDesc.unit ? dbRetrivedDesc.unit : "";
              }
            } else {
              /*if (subDescriptor && !subDescriptor.mandatory && newlyAddedGroupsInDBRetrivedDesc.length < 2) {
                subDescriptor.id = "newlyAddedItems" + subDescriptor.id;
                subDescriptor.isNewlyAdded = true;
              } else */if (
                newlyAddedGroupsInDBRetrivedDesc.length > 1 &&
                subDescriptor.descriptors.filter(e => e.value && e.value.length > 0).length > 0
              ) {
                var newElement = JSON.parse(JSON.stringify(subDescriptor));
                newElement.id = "newlyAddedItems" + dbRetrivedDesc.id;
                newElement.isNewlyAdded = true;
                newElement.order = subDescriptor.order;
                newElement.group &&
                  newElement.descriptors.forEach(ele => {
                    let retrievedItem = dbRetrivedDesc.descriptors.find(j => j.name === ele.name);
                    ele.id = "newlyAddedItems" + retrievedItem.id;
                    ele.value = retrievedItem.value;
                  });

                templateDescriptorGroup.descriptors.push(newElement);
              } else {
                dbRetrivedDesc.group &&
                  dbRetrivedDesc.descriptors.forEach(subGroupDesc => {
                    if (subDescriptor && subDescriptor.group) {
                      const subGrp =
                        subDescriptor.group && subDescriptor.descriptors.find(i => i.id === subGroupDesc.key.id);
                      subGrp.value = subGroupDesc.value;
                      subGrp.unit = subGroupDesc.unit ? subGroupDesc.unit : "";
                    }
                  });
              }
            }
          });
        }
      });
      // sampleModelUpdate.descriptors && sampleModelUpdate.descriptors.length > 0 && setSampleModel(sampleModelUpdate);
    }
  }

  function setAssayMetadataUpdate() {
    let sampleModelUpdate = sampleModel;

    metaDataDetails.sample.descriptors.forEach(generalDsc => {
      let simpleDescs;

      if (generalDsc.key && generalDsc.key.id) {
        simpleDescs = sampleModelUpdate.descriptors.find(i => i.id === generalDsc.key.id && i.group === false);
      }

      if (simpleDescs) {
        simpleDescs.value = generalDsc.value;
        simpleDescs.unit = generalDsc.unit ? generalDsc.unit : "";
      }
    });

    sampleModelUpdate.descriptors.forEach(ele => {
      let groupsToDisplay = metaDataDetails.sample.descriptorGroups.filter(i => i.key.id === ele.id);
      let templateDescriptorGroup;

      if (groupsToDisplay.length === 1) {
        templateDescriptorGroup = ele;
        templateDescriptorGroup.order = groupsToDisplay[0].order;
      } else if (groupsToDisplay.length > 1) {
        templateDescriptorGroup = ele;
        templateDescriptorGroup.order = groupsToDisplay[0].order;

        let newGroupsToAdd = groupsToDisplay.slice(1, groupsToDisplay.length);

        newGroupsToAdd.forEach(ele => {
          var newElement = JSON.parse(JSON.stringify(ele.key));
          newElement.id = "newlyAddedItems" + ele.id;
          newElement.isNewlyAdded = true;
          newElement.isNewlyAddedNonMandatory = ele.isNewlyAddedNonMandatory;
          newElement.order = ele.order;
          newElement.group &&
            newElement.descriptors.forEach(e => {
              const subGrp = ele.descriptors.find(i => i.key.id === e.id);
              if (subGrp) {
                e.id = "newlyAddedItems" + e.id;
                e.value = subGrp.value;
                e.unit = subGrp.unit ? subGrp.unit : "";
              }
            });

          sampleModelUpdate.descriptors.push(newElement);
        });
      }

      if (templateDescriptorGroup && templateDescriptorGroup.descriptors) {
        if (
          !templateDescriptorGroup.mandatory
          // && !tempDescGroup
        ) {
          templateDescriptorGroup.id = "newlyAddedItems" + templateDescriptorGroup.id;
          templateDescriptorGroup.isNewlyAdded = true;
        }
        groupsToDisplay[0].descriptors.forEach(descriptor => {
          const subdescriptor =
            templateDescriptorGroup && templateDescriptorGroup.descriptors.find(i => i.id === descriptor.key.id);
          if (subdescriptor && !subdescriptor.group) {
            subdescriptor.value = descriptor.value;
            subdescriptor.unit = descriptor.unit ? descriptor.unit : "";
          } else {
            if (subdescriptor && !subdescriptor.mandatory) {
              subdescriptor.id = "newlyAddedItems" + subdescriptor.id;
              subdescriptor.isNewlyAdded = true;
            }
            descriptor.group &&
              descriptor.descriptors.forEach(subGroupDesc => {
                const subGrp = subdescriptor.descriptors.find(i => i.id === subGroupDesc.key.id);
                subGrp.value = subGroupDesc.value;
                subGrp.unit = subGroupDesc.unit ? subGroupDesc.unit : "";
              });
          }
        });
      }
    });
    setSampleModel(sampleModelUpdate);
  }

  function getListTemplatesFailure(response) {
    response.json().then(responseJson => {
      setPageErrorsJson(responseJson);
    });
    setPageErrorMessage("");
    setShowErrorSummary(true);
    setShowLoading(false);
  }

  function getSampleTemplateFailure(response) {
    response.json().then(responseJson => {
      setPageErrorsJson(responseJson);
    });
    setPageErrorMessage("");
    setShowErrorSummary(true);
    setShowLoading(false);
  }

  function getSampleForUpdateFailure(response) {
    response.json().then(responseJson => {
      setPageErrorsJson(responseJson);
    });
    setPageErrorMessage("");
    setShowErrorSummary(true);
    setShowLoading(false);
  }

  function checkMetadataNameSuccess(response) {
    response.json().then(responseJson => {
      if (!responseJson) {
        setValidated(false);
        setErrorName(true);
        setDuplicateName(true);
      }
      setShowLoading(false);
    });
  }

  function checkMetadataNameFailure(response) {
    response.json().then(responseJson => {
      setPageErrorsJson(responseJson);
      setValidated(false);
    });
    setPageErrorMessage("");
    setShowErrorSummary(true);
    setShowLoading(false);
  }

  const getButtonsForImportedPage = () => {
    return (
      <>
        {props.type === "FEATURE" ? (
          <div className="mt-4 mb-4 text-center">
            <Link to="/features">
              <Button className="gg-btn-outline mt-2 gg-mr-20 btn-to-lower">Back to Features</Button>
            </Link>
            <Button onClick={props.handleBack} className="gg-btn-blue mt-2 gg-ml-20 gg-mr-20">
              Back
            </Button>
            <Button type="submit" className="gg-btn-blue mt-2 gg-ml-20">
              Next
            </Button>
          </div>
        ) : (
          <div className="mt-4 mb-4 text-center">
            <Button onClick={props.handleBack} className="gg-btn-blue mt-2 gg-ml-20 gg-mr-20">
              Back
            </Button>
            <Button type="submit" className="gg-btn-blue mt-2 gg-ml-20">
              Next
            </Button>
          </div>
        )}
      </>
    );
  };

  const getPageLoaded = () => {
    let sample;

    if (sampleModel.length === 1 && !sampleModel.descriptors) {
      sample = sampleModel[0];
    } else if (sampleModel.descriptors) {
      sample = sampleModel;
    }

    return (
      <>
        {getButtonsForImportedPage()}
        <Row>
          <Col>
            {props.metadataType !== "Assay" &&
              (!loadDataOnFirstNextInUpdate || props.importSpotchange) &&
              !props.importedPageData.id &&
              sample &&
              setSampleUpdateData()}

            {props.metadataType === "Assay" &&
              (!loadDataOnFirstNextInUpdate || props.importSpotchange) &&
              !props.importedPageData.id &&
              setAssayMetadataUpdate()}

            {((props.importedPageData && props.importedPageData.id) || props.metadataType === "Feature") &&
              sample &&
              getMetaData()}
          </Col>
        </Row>
        {getButtonsForImportedPage()}
      </>
    );
  };

  function validateAssayStep2Data(e) {
    setValidated(true);

    if (!e.currentTarget.checkValidity()) {
      e.preventDefault();
    } else {
      setAssayCurrentStep(2);
    }
  }

  return (
    <>
      {showErrorSummary === true && (
        <ErrorSummary
          show={showErrorSummary}
          form="slideLayouts"
          errorJson={pageErrorsJson}
          errorMessage={pageErrorMessage}
        />
      )}

      {mandateGroupLimitExceed.size > 0 &&
        getXorList(mandateGroupLimitExceed, "Enter only 1 Descriptor from each group")}

      {mandateGroupLimitDeceed.size > 0 &&
        getXorList(mandateGroupLimitDeceed, "Enter Atleast 1 Descriptor from below group")}

      {enablePrompt && (
        <Prompt
          message={(location, action) => {
            if (location.pathname.includes("cog")) {
              return false;
            } else {
              return "If you leave you will lose this data!";
            }
          }}
        />
      )}

      <Form noValidate validated={validated} onSubmit={e => handleSubmit(e)}>
        {!loadDescriptors && !props.importedInAPage && (
          <>
            {getStartMetadataPage()}
            <div className="text-center mb-2">
              <Link to={"/" + props.redirectTo}>
                <Button className="gg-btn-outline mt-2 gg-mr-20">Back to {`${props.metadataType}`}</Button>
              </Link>
              <Button
                disabled={
                  (metaDataDetails.name === "" && metaDataDetails.selectedtemplate === "" && !isUpdate) || errorName
                }
                onClick={handleNext}
                className="gg-btn-blue mt-2 gg-ml-20"
              >
                Next
              </Button>
            </div>
          </>
        )}

        {loadDescriptors && !props.importedInAPage && (
          <>
            <Row>
              <Col>
                <div>
                  {getMetaData()}
                  <div className="text-center mb-3">
                    <Button onClick={() => setLoadDescriptors(false)} className="gg-btn-outline mt-2 gg-mr-20">
                      Back
                    </Button>
                    <Button type="submit" className="gg-btn-blue mt-2 gg-ml-20">
                      {props.metadataType === "Assay" && assayCurrentStep === 1 ? "Next" : "Submit"}
                    </Button>
                  </div>
                </div>
              </Col>
            </Row>
          </>
        )}

        {props.importedInAPage ? <>{getPageLoaded()}</> : ""}

        {showLoading && <Loading show={showLoading} />}
      </Form>
    </>
  );
};

function getkey(descriptorGroup) {
  return { uri: descriptorGroup.uri, id: descriptorGroup.id };
}

function getDescriptors(selectedItemByType) {
  var descriptors = [];

  const simpleDescriptors = selectedItemByType.descriptors.filter(i => i.group === false);

  simpleDescriptors.forEach(descriptor => {
    let notRecorded;
    let notApplicable;

    if (descriptor.mandateGroup) {
      let notRecOrApp = simpleDescriptors.filter(
        e =>
          e.mandateGroup &&
          e.mandateGroup.id === descriptor.mandateGroup.id &&
          (e.mandateGroup.notRecorded || e.mandateGroup.notApplicable)
      );

      if (notRecOrApp.length > 0) {
        notRecorded = notRecOrApp[0].mandateGroup.notRecorded;
        notApplicable = notRecOrApp[0].mandateGroup.notApplicable;
      }
    } else if (!descriptor.value) {
      notRecorded = descriptor.notRecorded;
      notApplicable = descriptor.notApplicable;
    }

    if ((descriptor.value !== undefined && descriptor.value !== "") || notRecorded || notApplicable) {
      descriptors.push({
        id: descriptor.id,
        value: descriptor.value,
        notRecorded: notRecorded ? true : false,
        notApplicable: notApplicable ? true : false,
        unit: descriptor.unit,
        key: {
          "@type": "descriptortemplate",
          ...getkey(descriptor)
        },
        "@type": "descriptor"
      });
    }
  });

  return descriptors;
}

function getDescriptorGroups(selectedItemByType) {
  const descrGroups = selectedItemByType.descriptors.filter(i => i.group === true);

  var dArray = [];
  var dgArray = [];
  var sgdArray = [];

  descrGroups.forEach(d => {
    let notApplicable = false;
    let notRecorded = false;
    let notAppRecGroup;

    if (d.mandateGroup) {
      notAppRecGroup = descrGroups.filter(
        e =>
          e.mandateGroup &&
          e.mandateGroup.id === d.mandateGroup.id &&
          (e.mandateGroup.notApplicable || e.mandateGroup.notRecorded)
      );
    }

    if ((d.allowNotApplicable || d.allowNotRecorded) && (d.notApplicable || d.notRecorded)) {
      dArray.push({
        name: d.name,
        descriptors: null,
        order: d.order ? d.order : -1,
        key: {
          "@type": "descriptortemplate",
          ...getkey(d)
        },
        notApplicable: d.notApplicable,
        notRecorded: d.notRecorded,
        "@type": "descriptorgroup"
      });
    } else if (d.mandateGroup && notAppRecGroup.length > 0) {
      if (notAppRecGroup.length > 0) {
        if (notAppRecGroup[0].mandateGroup.notRecorded) {
          notRecorded = true;
        } else if (notAppRecGroup[0].mandateGroup.notApplicable) {
          notApplicable = true;
        }
      }

      dArray.push({
        name: d.name,
        descriptors: null,
        order: d.order ? d.order : -1,
        key: {
          "@type": "descriptortemplate",
          ...getkey(d)
        },
        notApplicable: notApplicable,
        notRecorded: notRecorded,
        "@type": "descriptorgroup"
      });
    } else {
      var dDescriptors = d.descriptors;
      dgArray = [];

      dDescriptors.forEach(dg => {
        var dgDescriptors = dg.descriptors;
        sgdArray = [];
        if (dgDescriptors && dgDescriptors.length > 0) {
          dgDescriptors.forEach(sgd => {
            let notRecorded;
            let notApplicable;

            if (sgd.mandateGroup) {
              let notRecOrApp = dgDescriptors.filter(
                e =>
                  e.mandateGroup &&
                  e.mandateGroup.id === sgd.mandateGroup.id &&
                  (e.mandateGroup.notRecorded || e.mandateGroup.notApplicable)
              );

              let oneDescSelectedFromSameGroup = dgDescriptors.filter(
                e =>
                  e.mandateGroup &&
                  e.mandateGroup.id === sgd.mandateGroup.id &&
                  !e.mandateGroup.notRecorded &&
                  !e.mandateGroup.notApplicable &&
                  e.value &&
                  e.value.length > 0
              );

              if (notRecOrApp.length > 0) {
                notRecorded = notRecOrApp[0].mandateGroup.notRecorded;
                notApplicable = notRecOrApp[0].mandateGroup.notApplicable;
              } else if (oneDescSelectedFromSameGroup.length > 0 && !sgd.value) {
                notRecorded = true;
              }
            } else if (!sgd.value) {
              notRecorded = sgd.notRecorded;
              notApplicable = sgd.notApplicable;
            }

            if ((sgd.value !== undefined && sgd.value !== "") || notRecorded || notApplicable) {
              sgdArray.push({
                name: sgd.name,
                value: sgd.value,
                notRecorded: notRecorded ? true : false,
                notApplicable: notApplicable ? true : false,
                unit: sgd.unit ? sgd.unit : "",
                key: {
                  "@type": "descriptortemplate",
                  ...getkey(sgd)
                },
                "@type": "descriptor"
              });
            } else {
              if (d.mandateGroup && descrGroups) {
                let filledMandateGrp = descrGroups.filter(
                  e =>
                    e.mandateGroup &&
                    e.mandateGroup.id === d.mandateGroup.id &&
                    (e.mandateGroup.notApplicable || e.mandateGroup.notRecorded)
                );

                filledMandateGrp.length > 0 &&
                  sgdArray.push({
                    name: sgd.name,
                    value: "",
                    notRecorded: filledMandateGrp[0].mandateGroup.notRecorded ? true : false,
                    notApplicable: filledMandateGrp[0].mandateGroup.notApplicable ? true : false,
                    unit: sgd.unit ? sgd.unit : "",
                    key: {
                      "@type": "descriptortemplate",
                      ...getkey(sgd)
                    },
                    "@type": "descriptor"
                  });
              }
            }
          });
        } else {
          let notRecorded;
          let notApplicable;

          if (dg.mandateGroup && dgDescriptors) {
            let notRecOrApp = dgDescriptors.filter(
              e =>
                e.mandateGroup &&
                e.mandateGroup.id === dg.mandateGroup.id &&
                (e.mandateGroup.notRecorded || e.mandateGroup.notApplicable)
            );

            let oneDescSelectedFromSameGroup = dgDescriptors.filter(
              e =>
                e.mandateGroup &&
                e.mandateGroup.id === dg.mandateGroup.id &&
                !e.mandateGroup.notRecorded &&
                !e.mandateGroup.notApplicable &&
                e.value &&
                e.value.length > 0
            );

            if (notRecOrApp.length > 0) {
              notRecorded = notRecOrApp[0].mandateGroup.notRecorded;
              notApplicable = notRecOrApp[0].mandateGroup.notApplicable;
            } else if (oneDescSelectedFromSameGroup.length > 0 && !dg.value) {
              notRecorded = true;
            }
          } else if (!dg.value) {
            notRecorded = dg.notRecorded;
            notApplicable = dg.notApplicable;
          }

          if ((dg.value !== undefined && dg.value !== "") || notRecorded || notApplicable) {
            dgArray.push({
              name: dg.name,
              value: dg.value,
              notRecorded: notRecorded ? true : false,
              notApplicable: notApplicable ? true : false,
              unit: dg.unit ? dg.unit : "",
              key: {
                "@type": "descriptortemplate",
                ...getkey(dg)
              },
              "@type": "descriptor"
            });
          } else {
            if (d.mandateGroup) {
              let filledMandateGrp = descrGroups.filter(
                e =>
                  e.mandateGroup &&
                  e.mandateGroup.id === d.mandateGroup.id &&
                  (e.mandateGroup.notApplicable || e.mandateGroup.notRecorded)
              );

              filledMandateGrp.length > 0 &&
                sgdArray.push({
                  name: dg.name,
                  value: "",
                  notRecorded: filledMandateGrp[0].mandateGroup.notRecorded ? true : false,
                  notApplicable: filledMandateGrp[0].mandateGroup.notApplicable ? true : false,
                  unit: dg.unit ? dg.unit : "",
                  key: {
                    "@type": "descriptortemplate",
                    ...getkey(dg)
                  },
                  "@type": "descriptor"
                });
            }
          }
        }

        if (dgDescriptors && sgdArray.length !== 0) {
          dgArray.push({
            descriptors: sgdArray,
            key: {
              "@type": "descriptortemplate",
              ...getkey(dg)
            },
            "@type": "descriptorgroup"
          });
        }
      });

      if (dgArray.length > 0) {
        dArray.push({
          name: d.name,
          descriptors: dgArray,
          order: d.order ? d.order : -1,
          key: {
            "@type": "descriptortemplate",
            ...getkey(d)
          },
          "@type": "descriptorgroup"
        });
      }
    }
  });

  return dArray;
}

MetaData.propTypes = {
  search: PropTypes.string,
  metaID: PropTypes.string,
  isCopy: PropTypes.bool,
  type: PropTypes.string,
  getMetaData: PropTypes.string,
  addMeta: PropTypes.string,
  updateMeta: PropTypes.string,
  redirectTo: PropTypes.string,
  metadataType: PropTypes.string,
  importedInAPage: PropTypes.bool,
  setMetadataforImportedPage: PropTypes.func,
  importedPageData: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  setImportedPageDataToSubmit: PropTypes.func,
  handleBack: PropTypes.func,
  handleNext: PropTypes.func
};

export { MetaData, getDescriptorGroups, getDescriptors };
