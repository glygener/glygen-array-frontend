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
import { Loading } from "../components/Loading";
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
      (isUpdate || props.isCopy) && !loadDataOnFirstNextInUpdate && setSampleUpdateData();
      setLoadDescriptors(true);
    }
  };

  const handleChangeMetaForm = (descriptorDetails, e, subGroupId, dateElementId) => {
    let id = "";
    let name = "";
    let value = "";

    if (dateElementId) {
      let dateField = "";

      if (descriptorDetails.group && !subGroupId) {
        dateField = descriptorDetails.descriptors.find(i => i.id === dateElementId);
      } else if (subGroupId) {
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

    var selectedSample;
    var sampleModelUpdated;
    var selectedSampleIndex;

    if (isUpdate || props.isCopy) {
      selectedSample = { ...sampleModel };
    } else {
      sampleModelUpdated = [...sampleModel];
      selectedSample = sampleModelUpdated.find(i => i.name === metaDataDetails.selectedtemplate);
      selectedSampleIndex = sampleModelUpdated.indexOf(selectedSample);
    }

    const descriptorGroupEditedIndex = selectedSample.descriptors.indexOf(descriptorDetails);

    if (descriptorDetails.group) {
      const descriptor = descriptorDetails.descriptors.find(i => i.id === id);

      if (!descriptor) {
        var editedSubGroup = "";
        var editedSubGroupIndex;
        const subGroupDescriptors = descriptorDetails.descriptors.find(i => i.id === subGroupId);
        const subGroupDescriptorIndex = descriptorDetails.descriptors.indexOf(subGroupDescriptors);

        if (subGroupDescriptors.group) {
          editedSubGroup = subGroupDescriptors.descriptors.find(i => i.name === name);
          editedSubGroupIndex = subGroupDescriptors.descriptors.indexOf(editedSubGroup);
          if (name === "unitlevel") {
            editedSubGroup.unit = value;
          } else {
            editedSubGroup.value = value;
          }
          subGroupDescriptors.descriptors[editedSubGroupIndex] = editedSubGroup;
        } else {
          editedSubGroup = subGroupDescriptors.find(i => i.id === id);
          if (name === "unitlevel") {
            editedSubGroup.unit = value;
          } else {
            editedSubGroup.value = value;
          }
        }
        descriptorDetails.descriptors[subGroupDescriptorIndex] = subGroupDescriptors;
      } else {
        const editedDescGroup = descriptorDetails.descriptors;
        const editedDesc = editedDescGroup.find(i => i.id === id);
        if (name === "unitlevel") {
          editedDesc.unit = value;
        } else {
          editedDesc.value = value;
        }
      }
    } else {
      if (name === "unitlevel") {
        descriptorDetails.unit = value;
      } else {
        descriptorDetails.value = value;
      }
    }

    selectedSample.descriptors[descriptorGroupEditedIndex] = descriptorDetails;
    if (isUpdate || props.isCopy) {
      setSampleModel(selectedSample);
    } else {
      sampleModelUpdated[selectedSampleIndex] = selectedSample;
      setSampleModel(sampleModelUpdated);
    }
    props.importedInAPage && props.setMetadataforImportedPage(sampleModel);
  };

  const handleDescriptorSelectChange = e => {
    const value = e.target.value;
    setAddDescriptorSelection(value);
  };

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
                onClick={() => handleAddSubGroupDescriptors(selectedDescriptorSubGroup, addDescriptorSubGroupSelection)}
              />
            )}
          </Form.Group>
        </div>
      </>
    );
  };

  const handleAddSubGroupDescriptors = (selectedDescriptorSubGroup, selectedSubGroupValue) => {
    var sampleModelUpdate;
    var selectedDescriptor;
    var selectedDescriptorIndex;

    if (isUpdate) {
      selectedDescriptor = { ...sampleModel };
    } else {
      sampleModelUpdate = [...sampleModel];

      var itemByType = sampleModelUpdate.find(i => i.name === metaDataDetails.selectedtemplate);
      var itemByTypeIndex = sampleModelUpdate.indexOf(itemByType);

      selectedDescriptor = itemByType.descriptors.find(
        i => i.name === selectedDescriptorSubGroup.name,
        i => i.id === selectedDescriptorSubGroup.id
      );
      selectedDescriptorIndex = itemByType.descriptors.indexOf(selectedDescriptor);
    }

    const selectedSubGroup = selectedDescriptor.descriptors.find(i => i.name === selectedSubGroupValue);
    const selectedSubGroupCount = selectedDescriptor.descriptors.filter(i => i.name === selectedSubGroupValue).length;

    if (selectedSubGroup && selectedSubGroupCount < selectedSubGroup.maxOccurrence) {
      const selectedGroupNewItemCount = selectedDescriptor.descriptors.filter(i => i.isNewlyAdded === true).length;

      var newElement = JSON.parse(JSON.stringify(selectedSubGroup));
      newElement.id = "newlyAddedItems" + selectedGroupNewItemCount;
      newElement.isNewlyAdded = true;
      newElement.group &&
        newElement.descriptors.forEach(e => {
          e.value = "";
          e.id = "newlyAddedItems" + selectedGroupNewItemCount + e.id;
        });

      selectedDescriptor.descriptors.push(newElement);

      if (isUpdate) {
        setSampleModel(selectedDescriptor);
      } else {
        itemByType.descriptors[selectedDescriptorIndex] = selectedDescriptor;
        sampleModelUpdate[itemByTypeIndex] = itemByType;
        setSampleModel(sampleModelUpdate);
      }
    }
    props.importedInAPage && props.setMetadataforImportedPage(sampleModel);
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
        <Popover.Title as="h3" style={{ marginTop: "-70px" }}>
          Descriptors
        </Popover.Title>
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

  const addDescriptorsandDescriptorGroups = () => {
    return (
      <>
        <Form.Group as={Row} controlId={""}>
          <Col md={10}>
            <Form.Control as="select" value={addDescriptorSelection} onChange={handleDescriptorSelectChange}>
              {getDescriptorOptions()}
            </Form.Control>
          </Col>
          <Col md={2}>
            {addDescriptorSelection !== "Select" && addDescriptorSelection !== "select" && (
              <FontAwesomeIcon
                className={"plus-button-icon"}
                icon={["fas", "plus"]}
                size="lg"
                title="Add Sub Group Descriptors"
                onClick={() => handleAddDescriptors("")}
              />
            )}
          </Col>
        </Form.Group>
      </>
    );
  };

  const handleAddDescriptors = () => {
    const descriptorValue = addDescriptorSelection;
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

    var existedElement = selectedSample.descriptors.find(e => e.name === descriptorValue && !e.isNewlyAdded);

    var newItemsCount = selectedSample.descriptors.filter(e => e.isNewlyAdded === true && e.name === descriptorValue)
      .length;

    maxCurrentOrder = selectedSample.descriptors[selectedSample.descriptors.length - 1].order;
    var newElement;

    if (existedElement) {
      if (
        (existedElement.mandatory && newItemsCount + 1 < existedElement.maxOccurrence) ||
        (!existedElement.mandatory && newItemsCount > 0 && newItemsCount < existedElement.maxOccurrence) ||
        (!existedElement.mandatory &&
          existedElement.isNewlyAddedNonMandatory &&
          newItemsCount + 1 < existedElement.maxOccurrence)
      ) {
        if (existedElement.isNewlyAddedNonMandatory) {
          newItemsCount = newItemsCount + 1;
        }

        newElement = JSON.parse(JSON.stringify(existedElement));
        newElement.id = "newlyAddedItems" + newItemsCount;
        newElement.isNewlyAdded = true;
        newElement.order = maxCurrentOrder + 1;

        newElement.group &&
          newElement.descriptors.forEach(e => {
            e.value = "";
            e.id = "newlyAddedItems" + newItemsCount + e.id;
          });

        selectedSample.descriptors.push(newElement);
      } else if (
        !existedElement.isNewlyAddedNonMandatory &&
        !existedElement.mandatory &&
        newItemsCount < existedElement.maxOccurrence
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
    //props.importedInAPage && props.setMetadataforImportedPage(sampleModel);
  };

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

    if (!itemToBeDeleted.mandatory) {
      if (itemToBeDeleted.id.startsWith("newly")) {
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
    } else {
      itemDescriptors.splice(itemToBeDeletedIndex, 1);
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

  const handleSubGroupDelete = (group, id) => {
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
    const selectedGroup = itemDescriptors.find(i => i.id === group.id);
    const selectedGroupIndex = itemDescriptors.indexOf(selectedGroup);

    const itemToBeDeleted = selectedGroup.descriptors.find(i => i.id === id);
    const itemToBeDeletedIndex = selectedGroup.descriptors.indexOf(itemToBeDeleted);
    selectedGroup.descriptors.splice(itemToBeDeletedIndex, 1);

    itemDescriptors[selectedGroupIndex] = selectedGroup;
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
            </Form.Group>
            <Form.Group as={Row} controlId="type">
              <FormLabel label="Sample Type" className="required-asterik" />
              <Col md={6}>
                <Form.Control type="text" name="type" disabled value={metaDataDetails.selectedtemplate} />
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
          isAllExpanded={isAllExpanded}
          descriptorSubGroup={getDescriptorSubGroup}
          handleSubGroupDelete={handleSubGroupDelete}
          isUpdate={isUpdate}
          isCopySample={props.isCopy}
          setLoadDataOnFirstNextInUpdate={setLoadDataOnFirstNextInUpdate}
          handleUnitSelectionChange={handleChangeMetaForm}
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

  const getListTemplate = (
    <Form.Group as={Row} controlId="type">
      <FormLabel label={`${props.metadataType} Type`} className="required-asterik" />
      <Col md={6}>
        {sampleModel && sampleModel.length > 1 ? (
          <Form.Control
            as="select"
            name="selectedtemplate"
            value={metaDataDetails.selectedtemplate}
            onChange={handleChange}
            isInvalid={errorType}
            disabled={isUpdate || props.isCopy}
            required
          >
            {!isUpdate && !props.isCopy ? (
              <>
                <option value="select">Select</option>
                {sampleModel.map((element, index) => {
                  return (
                    <option key={index} value={element.name}>
                      {element.name}
                    </option>
                  );
                })}
              </>
            ) : (
              <option value={metaDataDetails.selectedtemplate}>{metaDataDetails.selectedtemplate}</option>
            )}
          </Form.Control>
        ) : (
          <Form.Control
            type="text"
            name="type"
            value={metaDataDetails.selectedtemplate}
            isInvalid={errorType}
            required
            readOnly
          />
        )}
        <Feedback message={`${props.metadataType} Type is required`} />
      </Col>
    </Form.Group>
  );

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
            <span className="character-counter">
              {metaDataDetails.description === "" ? "" : characterCounter} /2000
            </span>
          </Col>
        </Form.Group>

        {getListTemplate}
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

    if (e.currentTarget.checkValidity() && !isGroupMandate()) {
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
    return descriptorGroup.id.startsWith("newly") ? { uri: descriptorGroup.uri } : { id: descriptorGroup.id };
  }

  function addMetaSuccess(response) {
    console.log(response);

    setEnablePrompt(false);
    history.push("/" + props.redirectTo);
  }

  function addMetaFailure(response) {
    var formError = false;

    response.json().then(responseJson => {
      responseJson.errors &&
        responseJson.errors.forEach(element => {
          if (element.objectName === "name") {
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
    metaDataDetails.sample.descriptors.forEach(generalDsc => {
      const simpleDescs = sampleModel.descriptors.find(i => i.id === generalDsc.key.id && i.group === false);

      if (simpleDescs) {
        simpleDescs.value = generalDsc.value;
        simpleDescs.unit = generalDsc.unit ? generalDsc.unit : "";
      }
    });

    metaDataDetails.sample.descriptorGroups.forEach(group => {
      const templateDescriptorGroup = sampleModel.descriptors.find(i => i.id === group.key.id);
      templateDescriptorGroup.order = group.order;

      if (templateDescriptorGroup.descriptors) {
        if (!templateDescriptorGroup.mandatory) {
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
            if (!subdescriptor.mandatory) {
              subdescriptor.id = "newlyAddedItems" + subdescriptor.id;
              subdescriptor.isNewlyAdded = true;
            }
            descriptor.descriptors &&
              descriptor.descriptors.forEach(subGroupDesc => {
                const subGrp = subdescriptor.descriptors.find(i => i.id === subGroupDesc.key.id);
                subGrp.value = subGroupDesc.value;
                subGrp.unit = subGroupDesc.unit ? subGroupDesc.unit : "";
              });
          }
        });
      }
    });
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

  if (sampleModel.length < 1) {
    return <Loading show={true} />;
  }

  const getButtonsForImportedPage = () => {
    return (
      <>
        <div className={"button-div line-break-2"}>
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

  return (
    <>
      {showErrorSummary === true && (
        <ErrorSummary
          show={showErrorSummary}
          form="slideLayouts"
          errorJson={pageErrorsJson}
          errorMessage={pageErrorMessage}
        ></ErrorSummary>
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
                <Row>
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
              <Col md={9}>
                <div
                  style={{
                    marginBottom: "100px",
                    marginTop: "30px"
                  }}
                >
                  {getMetaData()}

                  <>
                    <Button onClick={() => setLoadDescriptors(false)}>Back</Button>
                    &nbsp;
                    <Button type="submit">Submit</Button>
                  </>
                </div>
              </Col>
              <Col md={3}>
                <div
                  style={{
                    position: "fixed",
                    marginTop: "8%"
                  }}
                >
                  {/* {getExpandCollapseIcon()} */}
                  {getAddons()}
                </div>
              </Col>
            </Row>
          </>
        )}

        {props.importedInAPage ? (
          <>
            {getButtonsForImportedPage()}
            <Row>
              <Col md={10}>
                {!loadDataOnFirstNextInUpdate && !props.importedPageData.id && setSampleUpdateData()}

                {props.importPageContent && props.importPageContent()}

                {getMetaData()}
              </Col>
              <Col md={2} style={{ marginLeft: "-35px" }}>
                <div className={"addon-setting"}>{getAddons()}</div>
              </Col>
            </Row>
            {getButtonsForImportedPage()}
          </>
        ) : (
          ""
        )}
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
  idChange: PropTypes.bool,
  importPageContent: PropTypes.func
};

export { MetaData };
