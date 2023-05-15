import React, { useState } from "react";
import PropTypes from "prop-types";
import "../components/Descriptors.css";
import { Feedback, BlueCheckbox, FormLabel, BlueRadio } from "./FormControls";
import { HelpToolTip } from "./tooltip/HelpToolTip";
import { Form, Col, Row, Accordion, Card, Image, Alert } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { ScrollTo } from "react-scroll-to";
import { ContextAwareToggle } from "../utils/commonUtils";
import Datetime from "react-datetime";
import "react-datetime/css/react-datetime.css";
import { Droppable, Draggable } from "react-beautiful-dnd";
import { FormControlLabel, Button } from "@material-ui/core";
import { LineTooltip } from "./tooltip/LineTooltip";
import plusIcon from "../images/icons/plus.svg";
import { ConfirmationModal } from "./ConfirmationModal";

const Descriptors = props => {
  let descriptorsByMetaType;

  const {
    descriptors,
    metaDataTemplate,
    metaType,
    handleDelete,
    handleSubGroupDelete,
    handleCancelModal,
    isUpdate,
    isCopySample,
    setLoadDataOnFirstNextInUpdate,
    loadDataOnFirstNextInUpdate,
    assayCurrentStep,
    setAssayCurrentStep,
    isAllExpanded
  } = props;

  const [enableSubGroupAddModal, setEnableSubGroupAddModal] = useState(false);
  const [subGroupAddElement, setSubGroupAddElement] = useState();
  const [subGroupAddDescriptor, setSubGroupAddDescriptor] = useState();
  const [modalInputValidateError, setModalInputValidateError] = useState(false);

  let descriptorForm = [];
  let descMetaData;
  const simpleDescriptorTitle = "General Descriptors";

  let inputProps = {
    id: "dateField",
    required: true,
    placeholder: "Select Date",
    readOnly: true
  };

  const buildDescriptors = () => {
    if (isUpdate || isCopySample) {
      descriptorsByMetaType = descriptors;
    } else if (metaType === "Feature") {
      descriptorsByMetaType = descriptors[0];
    } else {
      descriptorsByMetaType = descriptors.find(e => e.name === metaDataTemplate);
    }

    var subGroupKeyIndex = 900;
    descMetaData = descriptorsByMetaType.descriptors;
    const accorSimpleDesc = descMetaData.filter(i => i.group !== true);

    //General Descriptors

    if (metaType !== "Feature") {
      if (accorSimpleDesc.length > 0) {
        if ((metaType === "Assay" && assayCurrentStep === 2) || metaType !== "Assay") {
          descriptorForm.push(getSimpleDescriptorsAccord(accorSimpleDesc));
        }
      }
    }

    //sorting for assay to display in order or regular metadatas
    if (metaType === "Assay") {
      descMetaData.sort((a, b) => a.order - b.order);
    } else {
      descMetaData.sort((a, b) => b.group - a.group);
    }

    let accorGroup;

    if (isUpdate || isCopySample) {
      accorGroup =
        metaType === "Assay"
          ? getAssayDroppableUpdateOrCopy(descMetaData, subGroupKeyIndex)
          : loadDescGroups(descMetaData, isUpdate, isCopySample);
    } else {
      accorGroup =
        metaType === "Assay" ? getAssayDroppable(descMetaData, subGroupKeyIndex) : loadDescGroups(descMetaData);
    }

    descriptorForm.push(accorGroup);

    //General Descriptors for FeatureMetadata
    if (metaType === "Feature") {
      if (accorSimpleDesc.length > 0) {
        // descriptorForm.push(loadSimpleDescs(accorSimpleDesc));
        descriptorForm.push(getSimpleDescriptorsAccord(accorSimpleDesc));
      }
    }

    if (loadDataOnFirstNextInUpdate && metaType === "Assay" && assayCurrentStep < 1) {
      setAssayCurrentStep(1);
    }

    !loadDataOnFirstNextInUpdate && setLoadDataOnFirstNextInUpdate(true);

    return descriptorForm;
  };

  const getSimpleDescriptorsAccord = generalDescriptors => {
    let keyIndex = 0;
    const cardHeader = (
      <Card.Header style5={{ height: "65px" }}>
        <Row>
          <Col md={6} className="font-awesome-color" style={{ textAlign: "left" }}>
            <span className="descriptor-header"> {" " + simpleDescriptorTitle}</span>
          </Col>
          <Col md={6} style={{ textAlign: "right" }}>
            <ContextAwareToggle eventKey={isAllExpanded ? generalDescriptors.id : 0} classname={"font-awesome-color"} />
          </Col>
        </Row>
      </Card.Header>
    );

    const cardBody = <Card.Body>{loadSimpleDescs(generalDescriptors)}</Card.Body>;

    return (
      <div key={keyIndex++} style={{ padding: "10px" }}>
        <Accordion defaultActiveKey={isAllExpanded ? generalDescriptors.id : 0}>
          <Card>
            {cardHeader}
            <Accordion.Collapse eventKey={isAllExpanded ? generalDescriptors.id : 0}>{cardBody}</Accordion.Collapse>
          </Card>
        </Accordion>
      </div>
    );
  };

  const loadSimpleDescs = generalDescriptors => {
    return generalDescriptors.map((element, index) => {
      return !element.mandateGroup ? (
        <div
          style={{
            paddingLeft: "10px",
            backgroundColor: element.id.startsWith("newly") ? "#f3f3f3" : ""
          }}
          key={index + element.id}
        >
          {getCardBody(element, 0, generalDescriptors, false)}
          {getNewField(element, element, "")}
        </div>
      ) : (
        element.mandateGroup &&
          element.mandateGroup.xOrMandate &&
          (element.mandateGroup.defaultSelection ||
            element.mandateGroup.notApplicable ||
            element.mandateGroup.notRecorded) && (
            <div key={index + element.id}>{getXorGroupsforSimpleDescs(generalDescriptors, element, index)}</div>
          )
      );
    });
  };

  const getXorGroupsforSimpleDescs = (generalDescriptors, element, index, subGroupSimpleDescriptors) => {
    let listTraversed = generalDescriptors.slice(0, index);

    //skipping the radio button display for mandategroup if there is one for current group
    let alreadyDisplayedXorGroupWiz = listTraversed.filter(
      i =>
        i.mandateGroup &&
        i.mandateGroup.xOrMandate &&
        i.mandateGroup.id === element.mandateGroup.id &&
        (i.mandateGroup.defaultSelection || i.mandateGroup.notApplicable || i.mandateGroup.notRecorded)
    );

    let notRecordedorApp = false;
    if (element.mandateGroup.notApplicable || element.mandateGroup.notRecorded) {
      notRecordedorApp = true;
    }

    return element.mandateGroup.xOrMandate ? (
      <>
        {alreadyDisplayedXorGroupWiz.length < 1 && subGroupSimpleDescriptors
          ? getXorMandateHeader(element, generalDescriptors, subGroupSimpleDescriptors)
          : alreadyDisplayedXorGroupWiz.length < 1 && getXorMandateHeader(element, descMetaData)}

        {!notRecordedorApp && getNewField(element, element, "", true)}
      </>
    ) : (
      getNewField(element, element, "", true)
    );
  };

  const nonXorGroupsWithApplOrRecordEnabled = descriptor => {
    return (
      <>
        <Row
          className={"xorHeaderBox"}
          style={{
            border: "",
            padding: "1em"
          }}
        >
          <Col md={12}>
            <FormLabel label={descriptor.name} className="xorGroupHeader" />
            <FormControlLabel
              control={<BlueRadio />}
              name={descriptor.name}
              value={descriptor.name}
              label={"Information available"}
              onChange={() => {
                props.nonXorGroupApporRec(descriptor);
              }}
              checked={!descriptor.notApplicable && !descriptor.notRecorded ? true : false}
            />

            <FormControlLabel
              control={<BlueRadio />}
              name={`notApplicable${descriptors.name}`}
              value={"notApplicable"}
              label={
                <>
                  Not Applicable
                  <sup>1</sup>
                </>
              }
              onChange={() => {
                props.nonXorGroupApporRec(descriptor, "notApplicable");
              }}
              checked={descriptor.notApplicable === true ? true : false}
            />

            <FormControlLabel
              control={<BlueRadio />}
              name={`notRecorded${descriptor.name}`}
              value={"notRecorded"}
              label={
                <>
                  Not Recorded
                  <sup>2</sup>
                </>
              }
              onChange={() => {
                props.nonXorGroupApporRec(descriptor, "notRecorded");
              }}
              checked={descriptor.notRecorded === true ? true : false}
            />
          </Col>
        </Row>
      </>
    );
  };

  const loadDescGroups = (descMetaData, isUpdate, isCopySample) => {
    return descMetaData.map((descriptor, index) => {
      if (
        (descriptor.group && descriptor.mandatory) ||
        (descriptor.group && !descriptor.mandatory && !descriptor.isDeleted)
      ) {
        if (!descriptor.mandateGroup) {
          if (descriptor.allowNotApplicable || descriptor.allowNotRecorded) {
            if (descriptor.notApplicable || descriptor.notRecorded) {
              return <>{nonXorGroupsWithApplOrRecordEnabled(descriptor)}</>;
            } else {
              return (
                <>
                  {nonXorGroupsWithApplOrRecordEnabled(descriptor)}

                  {getDescriptorGroups(descriptor, index)}
                </>
              );
            }
          } else {
            if (isUpdate || isCopySample) {
              return (descriptor.descriptors.find(i => i.value) || descriptor.isNewlyAdded) && getDescriptorGroups(descriptor, index);
            } else {
              return <>{getDescriptorGroups(descriptor, index)}</>;
            }
          }
        } else {
          if (
            descriptor.mandateGroup &&
            descriptor.mandateGroup.xOrMandate &&
            (descriptor.mandateGroup.defaultSelection ||
              descriptor.mandateGroup.notApplicable ||
              descriptor.mandateGroup.notRecorded)
          ) {
            let listTraversed = descMetaData.slice(0, index);

            //skipping the radio button display for mandategroup if there is one for current group
            let alreadyDisplayedXorGroupWiz = listTraversed.filter(
              i =>
                i.mandateGroup &&
                i.mandateGroup.xOrMandate &&
                i.mandateGroup.id === descriptor.mandateGroup.id &&
                (i.mandateGroup.defaultSelection || i.mandateGroup.notApplicable || i.mandateGroup.notRecorded)
            );

            let notRecordedorApp = false;
            if (descriptor.mandateGroup.notApplicable || descriptor.mandateGroup.notRecorded) {
              notRecordedorApp = true;
            }

            return (
              <>
                {alreadyDisplayedXorGroupWiz.length < 1 && getXorMandateHeader(descriptor, descMetaData)}

                {!notRecordedorApp && getDescriptorGroups(descriptor, index)}
              </>
            );
          }
        }
      }

      return <></>;
    });
  };

  const getXorMandateHeader = (descriptor, descMetaData, superGroup) => {
    let sameXorGroup = descMetaData.filter(
      e =>
        e.mandateGroup &&
        e.mandateGroup.xOrMandate &&
        e.mandateGroup.id === descriptor.mandateGroup.id &&
        !e.id.startsWith("newly")
    );

    return (
      <>
        <Row
          className="xorHeaderBox gg-align-center"
          style={{
            border: descriptor.group ? "" : "none",
            padding: descriptor.group ? "1em" : "none",
            paddingLeft: descriptor.group ? "1em" : "1em"
          }}
        >
          <Col md={12} lg={descriptor.group ? 12 : 11}>
            <FormLabel
              label={descriptor.mandateGroup && descriptor.mandateGroup.xOrMandate && descriptor.mandateGroup.name}
              className="xorGroupHeader"
            />
            {sameXorGroup.map((grp, index) => {
              return !grp.id.startsWith("newly") ? (
                <>
                  <FormControlLabel
                    control={<BlueRadio />}
                    name={grp.name}
                    value={grp.name}
                    label={grp.name}
                    onChange={() => {
                      superGroup
                        ? props.defaultSelectionChangeSubGroup(grp, undefined, superGroup)
                        : props.defaultSelectionChangeSuperGroup(grp);
                    }}
                    checked={grp.mandateGroup.defaultSelection === true ? true : false}
                  />

                  {index === sameXorGroup.length - 1 && (
                    <>
                      <FormControlLabel
                        control={<BlueRadio />}
                        name={`notApplicable${grp.name}`}
                        value={"notApplicable"}
                        label={
                          <>
                            Not Applicable
                            <sup>1</sup>
                          </>
                        }
                        onChange={() => {
                          superGroup
                            ? props.defaultSelectionChangeSubGroup(grp, "notApplicable", superGroup)
                            : props.defaultSelectionChangeSuperGroup(grp, "notApplicable");
                        }}
                        checked={grp.mandateGroup.notApplicable === true ? true : false}
                      />

                      <FormControlLabel
                        control={<BlueRadio />}
                        name={`notRecorded${grp.name}`}
                        value={"notRecorded"}
                        label={
                          <>
                            Not Recorded
                            <sup>2</sup>
                          </>
                        }
                        onChange={() => {
                          superGroup
                            ? props.defaultSelectionChangeSubGroup(grp, "notRecorded", superGroup)
                            : props.defaultSelectionChangeSuperGroup(grp, "notRecorded");
                        }}
                        checked={grp.mandateGroup.notRecorded === true ? true : false}
                      />
                    </>
                  )}
                </>
              ) : (
                ""
              );
            })}
          </Col>
        </Row>
      </>
    );
  };

  const getAssayDroppable = (descMetaData, subGroupKeyIndex) => {
    return (
      <>
        <Droppable droppableId={"descriptors"}>
          {provided => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              {descMetaData.map((descriptor, index) => {
                if (assayCurrentStep === 2 && descriptor.name === "Reference" && !descriptor.isDeleted) {
                  return <>{getDescriptorGroups(descriptor, index)}</>;
                } else if (assayCurrentStep === 1 && descriptor.name !== "Reference") {
                  if (descriptor.group && !descriptor.isDeleted) {
                    if ((descriptor.displayLabel && descriptor.displayLabelSelected) || !descriptor.displayLabel) {
                      return <>{getDescriptorGroups(descriptor, index)}</>;
                    }
                  }
                }
                return <></>;
              })}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </>
    );
  };

  const getAssayDroppableUpdateOrCopy = (descMetaData, subGroupKeyIndex) => {
    return (
      <>
        <Droppable droppableId={"descriptors"}>
          {provided => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              {descMetaData.map((descriptor, index) => {
                if (
                  descriptor.group &&
                  (descriptor.descriptors.find(i => i.value) || descriptor.isNewlyAddedNonMandatory)
                ) {
                  return <>{getDescriptorGroups(descriptor, index)}</>;
                }

                return <></>;
              })}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </>
    );
  };

  const getCardBody = (descriptor, index, groupElement, isSubGroup, duplicateGroup) => {
    let lastAddedIsNewMandatory = false;
    let lastAddedIsNewMandatoryCount;
    let listofGroupElementItems;
    let lastAddedIsNewMandatoryElement;

    if (isSubGroup) {
      lastAddedIsNewMandatoryCount = groupElement.descriptors.filter(
        i => i.isNewlyAddedNonMandatory && i.name === descriptor.name
      ).length;

      listofGroupElementItems = groupElement.descriptors.filter(i => i.name === descriptor.name);

      lastAddedIsNewMandatoryElement = listofGroupElementItems[lastAddedIsNewMandatoryCount];

      if (lastAddedIsNewMandatoryElement && lastAddedIsNewMandatoryElement.id === descriptor.id) {
        lastAddedIsNewMandatory = true;
      } else if (lastAddedIsNewMandatoryCount === 0) {
        lastAddedIsNewMandatory = true;
      }
    }

    return (
      <>
        <Row>
          <Col>
            {!descriptor.id.startsWith("newly") && descriptor.group && (
              <p
                style={{ textAlign: "left", fontWeight: "bold" }}
                className={descriptor.mandatory ? "required-asterik" : ""}
              >
                {descriptor.name}
              </p>
            )}
          </Col>
          <Col
            style={{
              textAlign: isSubGroup ? "left" : "right"
            }}
          >
            {!descriptor.id.startsWith("newly") &&
              (descriptor.maxOccurrence > 1 ||
                (descriptor.maxOccurrence === 1 &&
                  descriptor.descriptors &&
                  descriptor.descriptors.filter(e => !e.value || (e.value && e.value.length < 1)).length > 1)) &&
              groupElement.group && (
                <LineTooltip text="Add Descriptor Group">
                  <span>
                    <FontAwesomeIcon
                      icon={["fas", "plus"]}
                      size="lg"
                      title="Add Descriptor Group"
                      alt="Add Descriptor Group"
                      style={{
                        marginRight: "10px",
                        marginBottom: "6px"
                      }}
                      onClick={() => {
                        setEnableSubGroupAddModal(true);
                        setSubGroupAddElement(groupElement);
                        setSubGroupAddDescriptor(descriptor);
                      }}
                    />
                  </span>
                </LineTooltip>
              )}

            {descriptor.id.startsWith("newly") && !isSubGroup && metaType !== "Feature" && (
              <LineTooltip text="Delete Descriptor">
                <span>
                  <FontAwesomeIcon
                    key={"delete" + index}
                    icon={["far", "trash-alt"]}
                    size="large"
                    title="Delete Descriptor"
                    alt="Delete Descriptor"
                    className="caution-color tbl-icon-btn"
                    style={{ marginRight: "10px", marginBottom: "4px" }}
                    onClick={() => handleSubGroupDelete(descriptor.id)}
                  />
                </span>
              </LineTooltip>
            )}
          </Col>
        </Row>
      </>
    );
  };

  const getSubGroupXorMandateGroup = (descriptor, groupElement, index) => {
    if (
      descriptor.mandateGroup &&
      descriptor.mandateGroup.xOrMandate &&
      (descriptor.mandateGroup.defaultSelection ||
        descriptor.mandateGroup.notApplicable ||
        descriptor.mandateGroup.notRecorded)
    ) {
      let listTraversed = groupElement.descriptors.slice(0, index);

      //skipping the radio button display for mandategroup if there is one for current group
      let alreadyDisplayedXorGroupWiz = listTraversed.filter(
        i =>
          i.mandateGroup &&
          i.mandateGroup.xOrMandate &&
          i.mandateGroup.id === descriptor.mandateGroup.id &&
          (i.mandateGroup.defaultSelection || i.mandateGroup.notApplicable || i.mandateGroup.notRecorded)
      );

      let notRecordedorApp = false;

      if (descriptor.mandateGroup.notApplicable || descriptor.mandateGroup.notRecorded) {
        notRecordedorApp = true;
      }

      return (
        <>
          {alreadyDisplayedXorGroupWiz.length < 1 &&
            getXorMandateHeader(descriptor, groupElement.descriptors, groupElement)}

          {!notRecordedorApp && getDescriptorGroups(descriptor, index)}
        </>
      );
    }
  };

  const getDescriptorGroups = (groupElement, index) => {
    const descriptorWithSubGroups = groupElement.descriptors.filter(i => i.group === true);

    if (descriptorWithSubGroups.length > 0 && !groupElement.descriptors[groupElement.descriptors.length - 1].group) {
      groupElement.descriptors.sort((a, b) => b.group - a.group).reverse();
    } else if (descriptorWithSubGroups.length > 0) {
      groupElement.descriptors.sort((a, b) => a.group - b.group);
    }

    const cardBody = (
      <Card.Body>
        {groupElement.descriptors.map((descriptor, index) => {
          if (descriptor.group && descriptor.mandateGroup) {
            return getSubGroupXorMandateGroup(descriptor, groupElement, index);
          } else if (descriptor.group) {
            let commonGroups = groupElement.descriptors.filter(i => i.name === descriptor.name);

            return (
              <>
                {!descriptor.id.startsWith("newly") && (
                  <span className="font-awesome-color " style={{ float: "left" }}>
                    <span>
                      <HelpToolTip
                        title={groupElement.name}
                        url={groupElement.wikiLink}
                        text={groupElement.description}
                        helpIcon="gg-helpicon-detail"
                      />
                    </span>
                  </span>
                )}

                <div key={descriptor.id.toString()}>
                  {groupElement.isNewlyAdded
                    ? getCardBody(descriptor, index, groupElement, true, true)
                    : getCardBody(descriptor, index, groupElement, true, false)}

                  {!descriptor.id.startsWith("newly") && (
                    /* Creating Sub group Table */
                    <table fluid="true" className="table-striped mb-3">
                      <thead>
                        <tr>
                          {descriptor.descriptors.map(field => {
                            return (
                              <>
                                <th>{field.name}</th>
                              </>
                            );
                          })}
                          <th>{"Action"}</th>
                        </tr>
                      </thead>
                      <tbody className="table-body">
                        {commonGroups.map(desc => {
                          let rowData = [];
                          let filledDescriptors = desc.descriptors.filter(i => i.value && i.value !== "");

                          if (filledDescriptors.length > 0) {
                            rowData.push(
                              desc.descriptors.map(field => {
                                return field.value && field.value !== "" && <td>{field.value}</td>;
                              })
                            );
                            rowData.push(
                              <td>
                                <LineTooltip text="Delete Descriptor">
                                  <span>
                                    <FontAwesomeIcon
                                      key={"delete" + index}
                                      icon={["far", "trash-alt"]}
                                      size="large"
                                      alt="Delete Descriptor"
                                      title="Delete Descriptor"
                                      className="caution-color tbl-icon-btn"
                                      style={{ marginRight: "10px", marginBottom: "4px" }}
                                      onClick={() => handleSubGroupDelete(desc.id, desc)}
                                    />
                                  </span>
                                </LineTooltip>
                              </td>
                            );
                          }
                          return <tr>{rowData}</tr>;
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              </>
            );
          } else {
            return descriptor.mandateGroup &&
              descriptor.mandateGroup.xOrMandate &&
              (descriptor.mandateGroup.defaultSelection ||
                descriptor.mandateGroup.notApplicable ||
                descriptor.mandateGroup.notRecorded) ? (
              <div key={index + descriptor.id}>
                {getXorGroupsforSimpleDescs(groupElement.descriptors, descriptor, index, groupElement)}
              </div>
            ) : (
              (!descriptor.mandateGroup || (descriptor.mandateGroup && !descriptor.mandateGroup.xOrMandate)) && (
                <div
                  style={{
                    textAlign: "left",
                    paddingLeft: "10px"
                  }}
                  key={descriptor.id.toString()}
                >
                  {getNewField(descriptor, groupElement, "")}
                </div>
              )
            );
          }
        })}
      </Card.Body>
    );

    const accCollapse = (
      <Accordion.Collapse eventKey={isAllExpanded ? groupElement.id : 0}>{cardBody}</Accordion.Collapse>
    );

    const accToggle = (
      <ContextAwareToggle eventKey={isAllExpanded ? groupElement.id : 0} classname={"font-awesome-color"} />
    );

    var card = (
      <Card>
        <Card.Header style={{ height: "65px" }}>
          <span className="font-awesome-color" style={{ float: "left" }}>
            <span>
              <HelpToolTip
                title={groupElement.name}
                url={groupElement.wikiLink}
                text={groupElement.description}
                helpIcon="gg-helpicon-detail"
              />
            </span>

            <span
              className={`descriptor-header ${
                groupElement.mandatory && !groupElement.isNewlyAddedNonMandatory ? "required-asterik" : ""
              }`}
            >
              {" " + groupElement.name}
            </span>
          </span>

          <div style={{ float: "right" }} key={groupElement.id}>
            {groupElement.maxOccurrence > 1 && displayPlusIcon(groupElement, descriptorsByMetaType.descriptors, false) && (
              <FontAwesomeIcon
                icon={["fas", "plus"]}
                size="lg"
                title="Add Descriptor Group"
                style={{
                  marginRight: "10px",
                  marginBottom: "6px"
                }}
                onClick={() => props.handleAddDescriptorGroups(groupElement)}
              />
            )}

            {(groupElement.isNewlyAdded ||
              groupElement.isNewlyAddedNonMandatory ||
              (!groupElement.mandatory && !groupElement.mandateGroup) ||
              (groupElement.mandateGroup && groupElement.maxOccurrence > 1 && groupElement.id.startsWith("newly"))) &&
              displayDeleteIcon(groupElement, index)}
            {/* toggle */}
            {accToggle}
          </div>
        </Card.Header>
        {accCollapse}
      </Card>
    );

    return metaType !== "Assay" ? (
      <div
        style={{
          padding: "10px",
          paddingBottom: "20px"
        }}
        key={index}
      >
        <Accordion defaultActiveKey={isAllExpanded ? groupElement.id : 0}>{card}</Accordion>
      </div>
    ) : (
      <Draggable key={groupElement.id} draggableId={groupElement.id} index={index}>
        {provided => (
          <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
            <Accordion style={{ padding: "10px", paddingBottom: "20px" }}>{card}</Accordion>
          </div>
        )}
      </Draggable>
    );
  };

  const displayDeleteIcon = (groupElement, index) => {
    return (
      <>
        <FontAwesomeIcon
          key={"delete" + index}
          icon={["far", "trash-alt"]}
          size="lg"
          title="Delete Descriptor"
          alt="Delete icon"
          className="delete-icon tbl-icon-btn"
          style={{
            marginRight: "20px",
            marginBottom: "6px"
          }}
          onClick={() => handleDelete(groupElement.id)}
        />
      </>
    );
  };

  function displayPlusIcon(element, desc, group) {
    let lastAddedIsNewMandatory = false;
    let lastAddedIsNewMandatoryCount;
    let listofGroupElementItems;
    let lastAddedIsNewMandatoryElement;

    if (group) {
      lastAddedIsNewMandatoryCount = desc.filter(i => !i.group && i.isNewlyAddedNonMandatory && i.name === element.name)
        .length;
    } else {
      lastAddedIsNewMandatoryCount = desc.filter(i => i.isNewlyAddedNonMandatory && i.name === element.name).length;
    }

    listofGroupElementItems = desc.filter(i => i.name === element.name);

    lastAddedIsNewMandatoryElement = listofGroupElementItems[lastAddedIsNewMandatoryCount];

    if (lastAddedIsNewMandatoryElement && lastAddedIsNewMandatoryElement.id === element.id) {
      lastAddedIsNewMandatory = true;
    } else if (lastAddedIsNewMandatoryCount === 0) {
      lastAddedIsNewMandatory = true;
    }

    return lastAddedIsNewMandatory;
  }

  const getNewField = (element, descriptorDetails, subGroupName, simpleDescAndMandateGroup) => {
    if (!element.namespace) {
      element = { ...element, namespace: { name: "label" } };
    } else if (element.namespace && !element.namespace.name) {
      element.namespace = { ...element.namespace, name: "label" };
    }
    return (
      <Form.Group as={Row} controlId={element.id} key={element.id.toString()} className="gg-align-center mb-3">
        <Col xs={12} lg={7}>
          <span className="font-awesome-color" style={{ float: "left" }}>
            <span>
              <HelpToolTip url={element.wikiLink} text={element.description} helpIcon="gg-helpicon-detail" />
            </span>
          </span>

          <FormLabel label={element.name} className={element.mandatory ? "required-asterik" : ""} />
          <Row>
            {element.namespace.name === "text" ? (
              <Col>
                <Form.Control
                  as="textarea"
                  name={element.name}
                  value={element.value || ""}
                  placeholder={element.example && `e.g., ${element.example}`}
                  onChange={e => props.handleChange(descriptorDetails, e, subGroupName, "")}
                  required={element.mandatory ? true : false}
                  maxLength={2000}
                  rows={4}
                  disabled={descriptorDetails.isHide || element.disabled}
                />
                <div className="gg-align-right text-right text-muted">
                  {element.value && element.value.length > 0 ? element.value.length : "0"}
                  /2000
                </div>
              </Col>
            ) : element.namespace.name === "number" ? (
              <Col className="ml-0 pl-0 mr-0 pr-0">
                <Form.Control
                  type="text"
                  name={element.name}
                  value={element.value || ""}
                  placeholder={element.example && `e.g., ${element.example}`}
                  onChange={e => {
                    if (element.namespace.name === "number") {
                      const _value = e.target.value;
                      if (_value && !/^[0-9]+$/.test(_value)) {
                        return;
                      }
                    }
                    props.handleChange(descriptorDetails, e, subGroupName, "");
                  }}
                  required={element.mandatory ? true : false}
                  disabled={descriptorDetails.isHide || element.disabled}
                  // maxLength={3}
                />
              </Col>
            ) : element.namespace.name === "label" || element.namespace.name === "dictionary" ? (
              <Form.Control
                type="text"
                name={element.name}
                value={element.value || ""}
                placeholder={element.example && `e.g., ${element.example}`}
                onChange={e => props.handleChange(descriptorDetails, e, subGroupName, "")}
                required={element.mandatory ? true : false}
                disabled={descriptorDetails.isHide || element.disabled}
              />
            ) : element.namespace.name === "selection" ? (
              <Form.Control
                as="select"
                name={element.name}
                value={element.value}
                onChange={e => props.handleChange(descriptorDetails, e, subGroupName, "")}
                required={true}
                disabled={descriptorDetails.isHide || element.disabled}
              >
                <option value="id">Select</option>
                {element.selectionList.map((li, index) => {
                  return (
                    <option value={li} key={index}>
                      {li}
                    </option>
                  );
                })}
              </Form.Control>
            ) : element.namespace.name === "date" ? (
              <Datetime
                inputProps={inputProps}
                timeFormat={false}
                name={element.name}
                value={element.value}
                closeOnSelect
                onChange={e => props.handleChange(descriptorDetails, e, subGroupName, element.id)}
                disabled={descriptorDetails.isHide || element.disabled}
              />
            ) : element.namespace.name === "boolean" ? (
              <FormControlLabel
                control={
                  <BlueCheckbox
                    name={element.name}
                    onChange={e => props.handleChange(descriptorDetails, e, subGroupName, element.id)}
                    size="large"
                    defaultChecked={element.notApplicable}
                    disabled={descriptorDetails.isHide || element.disabled}
                  />
                }
                label={element.name}
              />
            ) : (
              ""
            )}
            <Feedback message={`${element.name} is required`} />

            {element.units.length > 0 && (
              <Col className="pr-0 mr-0">
                <>
                  <Form.Control
                    as="select"
                    name="unitlevel"
                    value={element.unit}
                    onChange={e => props.handleUnitSelectionChange(descriptorDetails, e, subGroupName, "")}
                    required={element.mandatory ? true : false}
                    disabled={descriptorDetails.isHide || element.disabled}
                  >
                    <option value="">Select Unit</option>
                    {element.units.map((unit, index) => {
                      return (
                        <option key={index} value={unit} id={element.id} name={element.name}>
                          {unit}
                        </option>
                      );
                    })}
                  </Form.Control>
                  <Feedback message={`Unit is required`} />
                </>
              </Col>
            )}
          </Row>
        </Col>

        <Col xs={12} lg={3} className="mt-2 pt-2">
          {(element.allowNotApplicable || element.allowNotRecorded) && !simpleDescAndMandateGroup && (
            <>
              {element.allowNotApplicable && (
                <FormControlLabel
                  style={{ marginBottom: "-15px" }}
                  control={
                    <BlueCheckbox
                      key={Math.random()}
                      name="notApplicable"
                      checked={element.notApplicable}
                      onChange={e => props.handleChange(descriptorDetails, e, element.id, "checkBox")}
                      size="medium"
                      // defaultChecked={element.notApplicable}
                    />
                  }
                  label={
                    <>
                      {"Not Applicable"}
                      <sup>1</sup>
                    </>
                  }
                />
              )}

              {element.allowNotRecorded && (
                <div>
                  <FormControlLabel
                    style={{ marginBottom: "-8px" }}
                    control={
                      <BlueCheckbox
                        key={Math.random()}
                        name="notRecorded"
                        checked={element.notRecorded}
                        onChange={e => props.handleChange(descriptorDetails, e, element.id, "checkBox")}
                        size="large"
                        // defaultChecked={element.notRecorded}
                      />
                    }
                    label={
                      <>
                        {"Not Recorded"}
                        <sup>2</sup>
                      </>
                    }
                  />
                </div>
              )}
            </>
          )}

          {element && element.maxOccurrence > 1 && displayPlusIcon(element, descMetaData, true) && (
            <Button onClick={() => props.handleAddDescriptorGroups(descriptorDetails)}>
              <LineTooltip text="Add Descriptor">
                <Image src={plusIcon} alt="plus button" />
              </LineTooltip>
            </Button>
          )}
        </Col>
      </Form.Group>
    );
  };

  const getSubNonXorGroupDescBody = () => {
    let duplicateGroups;
    let CurrentGroup;

    duplicateGroups = subGroupAddElement.descriptors.filter(
      i => i.name === subGroupAddDescriptor.name && i.id.startsWith("newly")
    );

    if (duplicateGroups.length > 0) {
      CurrentGroup = duplicateGroups[duplicateGroups.length - 1];
    } else {
      CurrentGroup = subGroupAddDescriptor;
    }

    return CurrentGroup.descriptors.map(field => {
      return getNewField(field, CurrentGroup, subGroupAddElement.id);
    });
  };

  function handleConfirmAddSubNonXorGroups() {
    if (props.validateUserInput(subGroupAddElement, subGroupAddDescriptor)) {
      props.handleAddDescriptorSubGroups(subGroupAddElement, subGroupAddDescriptor);
      setModalInputValidateError(false);
      setEnableSubGroupAddModal(false);
    } else {
      setModalInputValidateError(true);
    }
  }

  return (
    <>
      {buildDescriptors()}

      {enableSubGroupAddModal && (
        <ConfirmationModal
          showModal={enableSubGroupAddModal}
          onCancel={() => {
            setModalInputValidateError(false);
            setEnableSubGroupAddModal(false);
            handleCancelModal(subGroupAddDescriptor, subGroupAddElement);
          }}
          onConfirm={() => handleConfirmAddSubNonXorGroups()}
          title={`Add ${subGroupAddDescriptor.name}`}
          body={
            <>
              <Alert variant={"danger"} show={modalInputValidateError} className="alert-message line-break-1">
                {"Enter all mandatory fields"}
              </Alert>

              {getSubNonXorGroupDescBody()}
            </>
          }
        />
      )}
    </>
  );
};

Descriptors.propTypes = {
  metaType: PropTypes.string,
  metaDataTemplate: PropTypes.string,
  descriptors: PropTypes.oneOfType([PropTypes.object.isRequired, PropTypes.array.isRequired]),
  handleChange: PropTypes.func,
  handleDelete: PropTypes.func,
  handleSubGroupDelete: PropTypes.func,
  descriptorSubGroup: PropTypes.func,
  // id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  isUpdate: PropTypes.bool,
  isCopySample: PropTypes.bool,
  setLoadDataOnFirstNextInUpdate: PropTypes.func,
  isAllExpanded: PropTypes.bool,
  handleUnitSelectionChange: PropTypes.func,
  isHide: PropTypes.bool
};

export { Descriptors };
