/* eslint-disable no-loop-func */
/* eslint-disable array-callback-return */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useReducer } from "react";
import { Feedback, FormLabel } from "../components/FormControls";
import { ErrorSummary } from "../components/ErrorSummary";
import { wsCall } from "../utils/wsUtils";
import PropTypes from "prop-types";
import { Descriptors } from "../components/Descriptors";
import "../containers/MetaData.css";
import { useHistory, Prompt } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Form, Row, Col, Button, Popover, OverlayTrigger, Alert } from "react-bootstrap";
import { DragDropContext } from "react-beautiful-dnd";

const MetaData = props => {
  // useEffect(props.authCheckAgent, []);

  var meta = [];

  const history = useHistory();
  const [isUpdate, setIsUpdate] = useState(false);
  const [validated, setValidated] = useState(false);
  const [errorName, setErrorName] = useState(false);
  const [errorType, setErrorType] = useState(false);
  const [sampleModel, setSampleModel] = useState([]);
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
  const [addDescriptorSubGroupSelection, setAddDescriptorSubGroupSelection] = useState("select");
  const [mandateGroupLimitDeceed, setMandateGroupLimitDeceed] = useState(new Map());
  const [mandateGroupLimitExceed, setMandateGroupLimitExceed] = useState(new Map());

  useEffect(() => {
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

  const editDescriptorGroup = selectedDescriptorSubGroup => {
    return (
      <>
        <div>
          <Form.Group
            as={Row}
            controlId={""}
            style={{
              textAlign: "right"
            }}
          >
            <Col md={8}>
              <h6
                style={{
                  textAlign: "left"
                }}
              >
                Descriptors
              </h6>
              <Form.Control
                as="select"
                value={addDescriptorSubGroupSelection}
                onChange={handleDescriptorSubGroupSelectChange}
                key={addDescriptorSubGroupSelection}
              >
                {getDescriptorSubGroupOptions(selectedDescriptorSubGroup)}
              </Form.Control>
            </Col>
            {addDescriptorSubGroupSelection !== "Select" && addDescriptorSubGroupSelection !== "select" && (
              <FontAwesomeIcon
                className={"plus-button-icon"}
                icon={["fas", "plus"]}
                size="lg"
                title="Add Sub Group Descriptors"
                // onClick={() => handleAddSubGroupDescriptors(selectedDescriptorSubGroup, addDescriptorSubGroupSelection)}
              />
            )}
          </Form.Group>
        </div>
      </>
    );
  };

  const getDescriptorSubGroupOptions = selectedDescriptorSubGroup => {
    var sampleType;
    var options = [];
    var sortOptions = [];

    if (isUpdate) {
      sampleType = { ...sampleModel };
    } else {
      sampleType = sampleModel.find(i => i.name === metaDataDetails.selectedtemplate);
    }
    const subGroupSelected = sampleType.descriptors.find(i => i.name === selectedDescriptorSubGroup.name);

    options.push(
      <option key={0} value={"select"}>
        select
      </option>
    );

    subGroupSelected.descriptors.forEach(descriptor => {
      if (!descriptor.group && descriptor.maxOccurrence > 1) {
        const occurrances = sortOptions.filter(i => i === descriptor.name);
        occurrances.length < 1 && sortOptions.push(descriptor.name);
      } else if (descriptor.maxOccurrence > 1) {
        const occurrances = sortOptions.filter(i => i === descriptor.name);
        occurrances.length < 1 && sortOptions.push(descriptor.name);
      }
    });

    sortOptions.sort().forEach((element, index) => {
      options.push(
        <option key={index} value={element}>
          {element}
        </option>
      );
    });

    return options;
  };

  const getDescriptorSubGroup = selectedDescriptorSubGroup => {
    const popover = (
      <Popover
        id="popover-basic"
        style={{
          width: "30%"
        }}
      >
        <Popover.Title as="h3"> &nbsp;</Popover.Title>
        <Popover.Content>{editDescriptorGroup(selectedDescriptorSubGroup)}</Popover.Content>
      </Popover>
    );

    return (
      <OverlayTrigger rootClose trigger="click" placement="left" overlay={popover}>
        <FontAwesomeIcon
          className={"add-subGroup-button"}
          icon={["fas", "cog"]}
          size="xs"
          title="Add Sub Group Descriptors"
        />
      </OverlayTrigger>
    );
  };

  const getAddons = () => {
    const popover = (
      <Popover
        id="popover-basic"
        style={{
          width: "30%",
          paddingTop: 0
        }}
      >
        <Popover.Title as="h3">Descriptors</Popover.Title>
        <Popover.Content>{addDescriptorsandDescriptorGroups()}</Popover.Content>
      </Popover>
    );

    return (
      <OverlayTrigger rootClose trigger={"click"} placement="right" overlay={popover}>
        <FontAwesomeIcon
          className={"add-subGroup-button"}
          icon={["fas", "cog"]}
          size="xs"
          title="Add Sub Group Descriptors"
        />
      </OverlayTrigger>
    );
  };

  const addDescriptorsandDescriptorGroups = () => {
    let sampleModelUpdate;
    let selectedSample;
    let name;

    return (
      <>
        <Form.Group as={Row} controlId={""}>
          <Col md={10}>
            <Form.Control
              as="select"
              value={addDescriptorSelection}
              onChange={e => {
                setAddDescriptorSelection(e.target.value);
                name = e.target.value;
                if (e.target.value !== "Select" && e.target.value !== "select") {
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
              }}
            >
              {getDescriptorOptions()}
            </Form.Control>
          </Col>
        </Form.Group>
      </>
    );
  };

  const handleDescriptorSubGroupSelectChange = e => {
    const value = e.target.value;
    setAddDescriptorSubGroupSelection(value);
  };

  const getDescriptorOptions = () => {
    const options = [];
    var sortOptions = [];
    var sampleType;

    if (isUpdate || props.isCopy) {
      sampleType = { ...sampleModel };
    } else {
      sampleType = sampleModel.find(i => i.name === metaDataDetails.selectedtemplate);
    }

    const descriptors = sampleType.descriptors;

    options.push(
      <option key={0} value={"Select"}>
        select
      </option>
    );

    descriptors &&
      descriptors.forEach(descriptor => {
        if (!descriptor.group && descriptor.maxOccurrence > 0) {
          const occurrances = sortOptions.filter(i => i === descriptor.name);
          occurrances.length < 1 && sortOptions.push(descriptor.name);
        } else if (descriptor.maxOccurrence > 0) {
          const occurrances = sortOptions.filter(i => i === descriptor.name);
          occurrances.length < 1 && sortOptions.push(descriptor.name);
        }
      });

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

    if (existedElement.isDeleted) {
      if (existedElement.mandateGroup) {
        let sameGroupItemDeletedTobe = selectedSample.descriptors.filter(
          e => e.mandateGroup && e.mandateGroup.id === existedElement.mandateGroup.id
        );

        sameGroupItemDeletedTobe.forEach(descGroup => {
          descGroup.isDeleted = false;
        });
      } else {
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

    if (isUpdate) {
      selectedGroup = { ...sampleModel };
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

      if (isUpdate) {
        setSampleModel(selectedGroup);
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
    newElement.order = maxCurrentOrder + 1;
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
            });
          } else if (!d.group) {
            d.value = undefined;
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
          });
        } else {
          d.value = undefined;
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
            <Form.Group as={Row} controlId="name">
              <FormLabel label="Name" className="required-asterik" />
              <Col md={6}>
                <Form.Control type="text" name="name" disabled value={metaDataDetails.name} />
              </Col>
              <Col md={3}>
                {/* {getExpandCollapseIcon()} */}
                {getAddons()}
              </Col>
            </Form.Group>

            {(sampleModel && sampleModel.length > 1) ||
            (sampleModel && sampleModel.name && !sampleModel.name.startsWith("Default")) ? (
              <Form.Group as={Row} controlId="type">
                <FormLabel label={`${props.metadataType} Type`} className="required-asterik" />
                <Col md={6}>
                  <Form.Control type="text" name="type" disabled value={metaDataDetails.selectedtemplate} />
                </Col>
              </Form.Group>
            ) : (
              ""
            )}
          </>
        )}

        {props.metadataType === "Feature" && (
          <>
            <Form.Group as={Row} className="gg-align-center mb-3" controlId="name">
              <Col xs={10} lg={7}>
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
              <Col xs={10} lg={7}>
                <FormLabel label="Feature Id" className={"required-asterik"} />
                <Form.Control
                  type="text"
                  name="featureId"
                  placeholder="Feature Id"
                  value={props.featureAddState.featureId}
                  onChange={e => {
                    props.setFeatureAddState({ featureId: e.target.value });
                    props.setFeatureAddState({ validateFeatureId: false });
                  }}
                  isInvalid={props.featureAddState.validateFeatureId}
                  maxLength={30}
                  required
                />
                <Feedback message="Feature Id is required" />
              </Col>
            </Form.Group>
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
          setLoadDataOnFirstNextInUpdate={setLoadDataOnFirstNextInUpdate}
          handleUnitSelectionChange={handleChangeMetaForm}
          handleAddDescriptorGroups={handleAddDescriptorGroups}
          handleAddDescriptorSubGroups={handleAddDescriptorSubGroups}
          defaultSelectionChange={defaultSelectionChange}
        />
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

  function defaultSelectionChange(latestDefaultSelection, notApplicableOrRecorded) {
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
        i.mandateGroup.defaultSelection === true
    );

    // let latestDefaultSelection = itemDescriptors.find(
    //   i =>
    //     i.mandateGroup &&
    //     i.mandateGroup.id === grp.mandateGroup.id &&
    //     i.mandateGroup.defaultSelection === false &&
    //     i.id === grp.id
    // );

    if (currentDefaultSelection.length > 1) {
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
      indexOfCurrentDefaultSelection = itemDescriptors.indexOf(currentDefaultSelection[0]);
      currentDefaultSelection[0].mandateGroup.defaultSelection = false;
      itemDescriptors[indexOfCurrentDefaultSelection] = currentDefaultSelection[0];
    }

    if (notApplicableOrRecorded) {
      let sameXorGroup = itemDescriptors.filter(
        i => i.mandateGroup && i.mandateGroup.id === latestDefaultSelection.mandateGroup.id
      );
      if (sameXorGroup.length > 0) {
        let lastElementIntheGroup = sameXorGroup[sameXorGroup.length - 1];
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
        <Form.Group as={Row} controlId="type">
          {(sampleModel && sampleModel.length > 1) ||
            (sampleModel && sampleModel.name && !sampleModel.name.startsWith("Default") && (
              <FormLabel label={`${props.metadataType} Type`} className="required-asterik" />
            ))}
          <Col md={6}>
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
        <Form.Group as={Row} controlId="name">
          <FormLabel label="Name" className="required-asterik" />
          <Col md={6}>
            <Form.Control
              type="text"
              name="name"
              placeholder="name"
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
        <Form.Group as={Row} controlId="description">
          <FormLabel label="Description" />
          <Col md={6}>
            <Form.Control
              as="textarea"
              rows={4}
              name="description"
              placeholder="description"
              value={metaDataDetails.description}
              onChange={handleChange}
              maxLength={2000}
            />
            <div className="text-right text-muted">
              {metaDataDetails.description === "0" ? "0" : characterCounter} /2000
            </div>
          </Col>
        </Form.Group>

        {(!isUpdate || !props.isCopy) && (
          <Form.Group as={Row} controlId="description">
            <FormLabel label={`${props.metadataType} Type`} className="required-asterik" />
            <Col md={6}>
              <Form.Control
                as="select"
                name="selectedtemplate"
                value={metaDataDetails.selectedtemplate}
                onChange={handleChange}
                isInvalid={errorType}
                disabled={isUpdate || props.isCopy}
                required
              >
                <option value="select">Select</option>
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
          </Form.Group>
        )}

        {isUpdate && props.isCopy && getListTemplate()}
      </>
    );
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
    setValidated(true);

    if (
      e.currentTarget.checkValidity()

      // && !isGroupMandate()
    ) {
      if (props.importedPageData) {
        props.handleNext(e);
        props.setImportedPageDataToSubmit(metadataToSubmit());
      } else {
        if (isUpdate) {
          wsCall(props.updateMeta, "POST", null, true, metadataToSubmit(), addMetaSuccess, addMetaFailure);
        } else {
          wsCall(props.addMeta, "POST", null, true, metadataToSubmit(), addMetaSuccess, addMetaFailure);
        }
      }
    }

    e.preventDefault();
  }

  function metadataToSubmit() {
    const descriptorGroups = getDescriptorGroups();
    const descriptors = getDescriptors();

    let objectToBeSaved = {
      name: metaDataDetails.name,
      description: metaDataDetails.description,
      user: {
        name: window.localStorage.getItem("loggedinuser")
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
    var selectedItemByType;

    if (isUpdate || props.isCopy) {
      selectedItemByType = sampleModel;
    } else {
      selectedItemByType = sampleModel.find(i => i.name === metaDataDetails.selectedtemplate);
    }

    const groupDescriptors = selectedItemByType.descriptors.filter(i => i.group === true && i.mandateGroup);

    const mandatoryGroupsFilled = groupDescriptors.filter(function(e) {
      const filledDesc = e.descriptors.filter(function(subDescriptor) {
        if (!subDescriptor.group && subDescriptor.value) {
          return subDescriptor;
        } else if (subDescriptor.group) {
          const filledSubGroups = subDescriptor.descriptors.filter(i => i.value);
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
      const sameGroupItems = mandatoryGroupsFilled.filter(i => i.mandateGroup === e.mandateGroup);
      if (sameGroupItems.length > 1 && sameGroupItems.filter(i => i.xorMandate).length > 1) {
        mandateGroupExceed.set(e.mandateGroup, sameGroupItems);
      } else {
        let deceedGroup = [];
        if (mandateGroupDeceed.size > 0) {
          deceedGroup = mandateGroupDeceed.get(e.mandateGroup);
          if (!deceedGroup) {
            deceedGroup = [];
          }
        }
        deceedGroup.push(e);

        // if (
        //   (e.descriptors.filter(i => i.value).length === 0 && !e.xorMandate) ||
        //   (e.descriptors.filter(i => i.value).length < 1 && e.xorMandate)
        // ) {
        mandateGroupDeceed.set(e.mandateGroup, deceedGroup);
        // }
      }
    });

    if (mandateGroupDeceed.size > 0) {
      const itr = mandateGroupDeceed.entries();

      for (var descriptorPair of itr) {
        var pair = descriptorPair[1];
        pair.filter(function(desc) {
          if (!desc.xorMandate && desc.descriptors.filter(i => i.value).length > 0) {
            mandateGroupDeceed.delete(descriptorPair[0]);
          } else if (desc.xorMandate && desc.descriptors.filter(i => i.value && i.value !== undefined).length > 0) {
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

  function getDescriptors() {
    var descriptors = [];
    var selectedItemByType;

    if (isUpdate || props.isCopy) {
      selectedItemByType = sampleModel;
    } else {
      selectedItemByType = sampleModel.find(i => i.name === metaDataDetails.selectedtemplate);
    }
    const simpleDescriptors = selectedItemByType.descriptors.filter(i => i.group === false);

    descriptors = simpleDescriptors.map(descriptor => {
      return {
        id: descriptor.id,
        value: descriptor.value,
        unit: descriptor.unit,
        key: {
          "@type": "descriptortemplate",
          ...getkey(descriptor)
        },
        "@type": "descriptor"
      };
    });

    return descriptors;
  }

  function getDescriptorGroups() {
    var selectedItemByType;

    if (isUpdate || props.isCopy) {
      selectedItemByType = sampleModel;
    } else {
      selectedItemByType = sampleModel.find(i => i.name === metaDataDetails.selectedtemplate);
    }

    const descrGroups = selectedItemByType.descriptors.filter(
      i => i.group === true && i.descriptors.filter(j => j.value)
    );

    var dArray = [];
    var dgArray = [];
    var sgdArray = [];

    descrGroups.forEach(d => {
      var dgDescriptors = d.descriptors;
      dgArray = [];
      dgDescriptors.forEach(dg => {
        var dDescriptors = dg.descriptors;
        sgdArray = [];
        if (dDescriptors && dDescriptors.length > 0) {
          dDescriptors.forEach(sgd => {
            if (sgd.value) {
              sgdArray.push({
                name: sgd.name,
                value: sgd.value,
                unit: sgd.unit ? dg.unit : "",
                key: {
                  "@type": "descriptortemplate",
                  ...getkey(sgd)
                },
                "@type": "descriptor"
              });
            }
          });
        } else if (dg.value) {
          dgArray.push({
            name: dg.name,
            value: dg.value,
            unit: dg.unit ? dg.unit : "",
            key: {
              "@type": "descriptortemplate",
              ...getkey(dg)
            },
            "@type": "descriptor"
          });
        }

        if (dDescriptors && sgdArray.length !== 0) {
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
          descriptors: dgArray,
          order: d.order ? d.order : -1,
          key: {
            "@type": "descriptortemplate",
            ...getkey(d)
          },
          "@type": "descriptorgroup"
        });
      }
    });
    return dArray;
  }

  function getkey(descriptorGroup) {
    return descriptorGroup.id.startsWith("newly")
      ? { uri: descriptorGroup.uri, id: descriptorGroup.id }
      : { id: descriptorGroup.id };
  }

  function addMetaSuccess(response) {
    console.log(response);

    setEnablePrompt(false);
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
    });
  }

  function setSampleUpdateData() {
    let sampleModelUpdate = sampleModel;

    if (sampleModel.descriptors && sampleModel.descriptors.length > 0) {
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

      metaDataDetails.sample.descriptorGroups.forEach(group => {
        let templateDescriptorGroup;
        let tempDescGroup = sampleModelUpdate.descriptors.find(i => i.order === group.order);

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
        } else {
          templateDescriptorGroup = tempDescGroup;
        }

        if (templateDescriptorGroup.descriptors) {
          if (!templateDescriptorGroup.mandatory && !tempDescGroup) {
            templateDescriptorGroup.id = "newlyAddedItems" + templateDescriptorGroup.id;
            templateDescriptorGroup.isNewlyAdded = true;
          }
          group.descriptors.forEach(descriptor => {
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
                  if (subdescriptor && subdescriptor.group) {
                    const subGrp =
                      subdescriptor.group && subdescriptor.descriptors.find(i => i.id === subGroupDesc.key.id);
                    subGrp.value = subGroupDesc.value;
                    subGrp.unit = subGroupDesc.unit ? subGroupDesc.unit : "";
                  }
                });
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
  }

  function getSampleTemplateFailure(response) {
    response.json().then(responseJson => {
      setPageErrorsJson(responseJson);
    });
    setPageErrorMessage("");
    setShowErrorSummary(true);
  }

  function getSampleForUpdateFailure(response) {
    response.json().then(responseJson => {
      setPageErrorsJson(responseJson);
    });
    setPageErrorMessage("");
    setShowErrorSummary(true);
  }

  function checkMetadataNameSuccess(response) {
    response.json().then(responseJson => {
      if (!responseJson) {
        setValidated(false);
        setErrorName(true);
        setDuplicateName(true);
      }
    });
  }

  function checkMetadataNameFailure(response) {
    response.json().then(responseJson => {
      setPageErrorsJson(responseJson);
      setValidated(false);
    });
    setPageErrorMessage("");
    setShowErrorSummary(true);
  }

  const getButtonsForImportedPage = () => {
    return (
      <>
        <div className={"button-div line-break-2 text-center"}>
          <Button onClick={props.handleBack} className={"button-test"}>
            <span className={"MuiButton-label"}>Back</span>
            <span className={"MuiTouchRipple-root"}></span>
          </Button>

          <Button type="submit" className={"button-test"}>
            <span className={"MuiButton-label"}>Next</span>
            <span className={"MuiTouchRipple-root"}></span>
          </Button>
        </div>
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
              !loadDataOnFirstNextInUpdate &&
              !props.importedPageData.id &&
              sample &&
              setSampleUpdateData()}

            {props.metadataType === "Assay" &&
              !loadDataOnFirstNextInUpdate &&
              !props.importedPageData.id &&
              setAssayMetadataUpdate()}

            {(props.importedPageData.id || props.metadataType === "Feature") && sample && getMetaData()}
          </Col>
        </Row>
        {getButtonsForImportedPage()}
      </>
    );
  };
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

      {enablePrompt && <Prompt message="If you leave you will lose this data!" />}
      <Form noValidate validated={validated} onSubmit={e => handleSubmit(e)}>
        {!loadDescriptors && !props.importedInAPage && (
          <>
            <Row>
              <Col md={10}>
                {getStartMetadataPage()}
                <Row className={"text-center"}>
                  <Col span={6}>
                    <Button
                      disabled={
                        (metaDataDetails.name === "" && metaDataDetails.selectedtemplate === "" && !isUpdate) ||
                        errorName
                      }
                      onClick={handleNext}
                    >
                      Next
                    </Button>
                  </Col>
                </Row>
              </Col>
            </Row>
          </>
        )}

        {loadDescriptors && !props.importedInAPage && (
          <>
            <Row>
              <Col>
                <div
                  style={{
                    marginBottom: "100px",
                    marginTop: "30px"
                  }}
                >
                  {getMetaData()}
                  <div className={"button-div line-break-2 text-center"}>
                    <Button onClick={() => setLoadDescriptors(false)}>Back</Button>
                    &nbsp;
                    <Button type="submit">Submit</Button>
                  </div>
                </div>
              </Col>
            </Row>
          </>
        )}

        {props.importedInAPage ? <>{getPageLoaded()}</> : ""}
      </Form>
    </>
  );
};

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
  handleNext: PropTypes.func,
  idChange: PropTypes.bool
};

export { MetaData };
