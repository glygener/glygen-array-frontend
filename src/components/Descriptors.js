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

const subgroupRendermap = new Map();

const Descriptors = props => {

  const {
    descriptors,   // metadata instance - metadataModel from Metadata.js
    metaDataTemplate,   // metadata template - selected metadata template from Metadata.js
    metaType,    // FEATURE/SAMPLE/ASSAY etc.
    handleDelete,
    handleSubGroupDelete,
    handleCancelModal,
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
  let descMetaData;   // holds all descriptors from the template
  const simpleDescriptorTitle = "General Descriptors";

  let inputProps = {
    id: "dateField",
    required: true,
    placeholder: "Select Date",
    readOnly: true
  };

  const buildDescriptors = () => {
    descMetaData = metaDataTemplate.descriptors;
    const accorSimpleDesc = descriptors.descriptors;
    const accorDescGroups = descriptors.descriptorGroups;

    const allDescriptors = [];
    accorSimpleDesc.forEach(element => {
      allDescriptors.push(element);
    });
    accorDescGroups.forEach(element => {
      allDescriptors.push(element);
    });

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
      allDescriptors.sort((a, b) => a.order - b.order);
    } else {
      accorDescGroups.sort((a, b) => b.group - a.group);
    }

    let accorGroup;

    accorGroup = metaType === "Assay" ? getAssayDroppable(allDescriptors) : loadDescGroups(accorDescGroups);

    descriptorForm.push(accorGroup);

    //General Descriptors for FeatureMetadata
    if (metaType === "Feature") {
      if (accorSimpleDesc.length > 0) {
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
      let firstIndex = generalDescriptors.findIndex(e => e.name === element.name);
      return !element.key.mandateGroup ? (
        <div
          style={{
            paddingLeft: "10px",
            backgroundColor: index > firstIndex ? "#f3f3f3" : ""
          }}
          key={index + element.id}
        >
          {getCardBody(element, index, generalDescriptors, false)}
          {getNewField(element, index, generalDescriptors, "")}
        </div>
      ) : (
          element.key.mandateGroup &&
          element.key.mandateGroup.xOrMandate &&
          (element.key.mandateGroup.defaultSelection ||
            element.notApplicable ||
            element.notRecorded) && (
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
        i.key.mandateGroup &&
        i.key.mandateGroup.xOrMandate &&
        i.key.mandateGroup.id === element.key.mandateGroup.id &&
        (i.key.mandateGroup.defaultSelection || i.notApplicable || i.notRecorded)
    );

    let notRecordedorApp = false;
    if (element.notApplicable || element.notRecorded) {
      notRecordedorApp = true;
    }

    return element.key.mandateGroup.xOrMandate ? (
      <>
        {alreadyDisplayedXorGroupWiz.length < 1 && subGroupSimpleDescriptors
          ? getXorMandateHeader(element, generalDescriptors, subGroupSimpleDescriptors)
          : alreadyDisplayedXorGroupWiz.length < 1 && getXorMandateHeader(element, generalDescriptors)}

        {!notRecordedorApp && getNewField(element, index, generalDescriptors, "", true)}
      </>
    ) : (
        getNewField(element, index, generalDescriptors, "", true)
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
              name={`notApplicable${descriptor.name}`}
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

  const loadDescGroups = (descGroups, isUpdate, isCopySample) => {
    return descGroups.map((descriptor, index) => {
      if (
        (descriptor.group && descriptor.key.mandatory) ||
        (descriptor.group && !descriptor.key.mandatory)
      ) {
        if (!descriptor.key.mandateGroup) {
          if (descriptor.key.allowNotApplicable || descriptor.key.allowNotRecorded) {
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
            return <>{getDescriptorGroups(descriptor, index)}</>;
          }
        } else {
          if (
            descriptor.key.mandateGroup &&
            descriptor.key.mandateGroup.xOrMandate &&
            (descriptor.key.mandateGroup.defaultSelection ||
              descriptor.notApplicable ||
              descriptor.notRecorded)
          ) {
            let listTraversed = descGroups.slice(0, index);

            //skipping the radio button display for mandategroup if there is one for current group
            let alreadyDisplayedXorGroupWiz = listTraversed.filter(
              i =>
                i.key.mandateGroup &&
                i.key.mandateGroup.xOrMandate &&
                i.key.mandateGroup.id === descriptor.key.mandateGroup.id &&
                (i.key.mandateGroup.defaultSelection || i.notApplicable || i.notRecorded)
            );

            let notRecordedorApp = false;
            if (descriptor.notApplicable || descriptor.notRecorded) {
              notRecordedorApp = true;
            }

            return (
              <>
                {alreadyDisplayedXorGroupWiz.length < 1 && getXorMandateHeader(descriptor, descGroups)}

                {!notRecordedorApp && getDescriptorGroups(descriptor, index)}
              </>
            );
          }
        }
      }

      return <></>;
    });
  };

  const getXorMandateHeader = (descriptor, descriptors, superGroup) => {
    let sameXorGroup = descriptors.filter(
      e =>
        e.key.mandateGroup &&
        e.key.mandateGroup.xOrMandate &&
        e.key.mandateGroup.id === descriptor.key.mandateGroup.id
    );

    return (
      <>
        <Row
          className="xorHeaderBox gg-align-center"
          style={{
            border: descriptor.group ? "" : "none",
            padding: descriptor.group ? "1em" : "none",
            paddingLeft: descriptor.group ? "1em" : "1.5em"
          }}
        >
          <Col md={12} lg={descriptor.group ? 12 : 11}>
            <FormLabel
              label={descriptor.key.mandateGroup && descriptor.key.mandateGroup.xOrMandate && descriptor.key.mandateGroup.name}
              className="xorGroupHeader"
            />
            {sameXorGroup.map((grp, index) => {
              return (
                <>
                  <FormControlLabel
                    control={<BlueRadio />}
                    name={grp.name}
                    value={grp.name}
                    label={grp.name}
                    onChange={() => {
                      superGroup
                        ? props.defaultSelectionChangeSuperGroup(grp, undefined, superGroup)
                        : props.defaultSelectionChangeSuperGroup(grp, undefined, descriptors);
                    }}
                    checked={grp.key.mandateGroup.defaultSelection === true ? true : false}
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
                            ? props.defaultSelectionChangeSuperGroup(grp, "notApplicable", superGroup)
                            : props.defaultSelectionChangeSuperGroup(grp, "notApplicable", descriptors);
                        }}
                        checked={grp.notApplicable === true ? true : false}
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
                            ? props.defaultSelectionChangeSuperGroup(grp, "notRecorded", superGroup)
                            : props.defaultSelectionChangeSuperGroup(grp, "notRecorded", descriptors);
                        }}
                        checked={grp.notRecorded === true ? true : false}
                      />
                    </>
                  )}
                </>
              )
            })}
          </Col>
        </Row>
      </>
    );
  };

  const getAssayDroppable = (descGroups) => {
    return (
      <>
        <Droppable droppableId={"descriptors"}>
          {provided => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              {descGroups.map((descriptor, index) => {
                if (assayCurrentStep === 2 && descriptor.name === "Reference") {
                  return <>{getDescriptorGroups(descriptor, index)}</>;
                } else if (assayCurrentStep === 1 && descriptor.name !== "Reference") {
                  if (descriptor.group) {
                    return <>{getDescriptorGroups(descriptor, index)}</>;
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

  function checkRenderMap(groupElement, descriptor, index, firstIndex, isSubGroup) {
    let key = groupElement.id + descriptor.name + index;
    if (index === firstIndex && isSubGroup && !subgroupRendermap.get(key)) {
      subgroupRendermap.set(key, true);
      return true;
    }
    return false;
  }

  const getCardBody = (descriptor, index, groupElement, isSubGroup) => {
    let firstIndex = 0;
    if (isSubGroup) {
      firstIndex = groupElement.descriptors.findIndex(e => e.name === descriptor.name);
    } else {
      firstIndex = groupElement.findIndex(e => e.name === descriptor.name);
    }

    return (
      <>
        <div
          style={{
            textAlign: "left",
            paddingLeft: "10px"
          }}
          key={descriptor.id.toString()}
        >
          <Form.Group as={Row} controlId={descriptor.id} key={descriptor.id.toString()} className="gg-align-center mb-3">
            <Col xs={12} lg={7}>
              {index === firstIndex && isSubGroup && checkRenderMap(groupElement, descriptor, index, firstIndex, isSubGroup) && (   // first copy, display the header
                <span className="font-awesome-color " style={{ float: "left" }}>
                  <span>
                    <HelpToolTip
                      title={descriptor.name}
                      url={descriptor.wikiLink}
                      text={descriptor.description}
                      helpIcon="gg-helpicon-detail"
                    />
                  </span>
                </span>
              )}

              {index === firstIndex && descriptor.group && (
                <p
                  style={{ textAlign: "left", fontWeight: "bold" }}
                  className={descriptor.key.mandatory ? "required-asterik" : ""}
                >
                  {descriptor.name}
                </p>
              )}

            </Col>
            <Col xs={12} lg={3} className="mt-2 pt-2">
              {index <= firstIndex &&
                (descriptor.key.maxOccurrence > 1 ||
                  (descriptor.key.maxOccurrence === 1 &&
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
                          setSubGroupAddDescriptor(props.handleAddDescriptorSubGroups(groupElement, descriptor));
                          setSubGroupAddElement(groupElement);
                        }}
                      />
                    </span>
                  </LineTooltip>
                )}

              {index > firstIndex && !isSubGroup && metaType !== "Feature" && (
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
                      onClick={() => handleSubGroupDelete(descriptor, groupElement)}
                    />
                  </span>
                </LineTooltip>
              )}
            </Col>
          </Form.Group>
        </div>
      </>
    );
  };

  const getSubGroupXorMandateGroup = (descriptor, groupElement, index) => {
    if (
      descriptor.key.mandateGroup &&
      descriptor.key.mandateGroup.xOrMandate &&
      (descriptor.key.mandateGroup.defaultSelection ||
        descriptor.notApplicable ||
        descriptor.notRecorded)
    ) {
      let listTraversed = groupElement.descriptors.slice(0, index);

      //skipping the radio button display for mandategroup if there is one for current group
      let alreadyDisplayedXorGroupWiz = listTraversed.filter(
        i =>
          i.key.mandateGroup &&
          i.key.mandateGroup.xOrMandate &&
          i.key.mandateGroup.id === descriptor.key.mandateGroup.id &&
          (i.key.mandateGroup.defaultSelection || i.notApplicable || i.notRecorded)
      );

      let notRecordedorApp = false;

      if (descriptor.notApplicable || descriptor.notRecorded) {
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

  function checkRenderTableMap(subgroupTableRendermap, groupElement, descriptor) {
    let key = groupElement.id + descriptor.name;
    if (!subgroupTableRendermap.get(key)) {
      subgroupTableRendermap.set(key, true);
      return true;
    }
    return false;
  }

  const getDescriptorGroups = (groupElement, index) => {
    const descriptorWithSubGroups = groupElement.descriptors.filter(i => i.group === true);

    if (descriptorWithSubGroups.length > 0 && !groupElement.descriptors[groupElement.descriptors.length - 1].group) {
      groupElement.descriptors.sort((a, b) => b.group - a.group).reverse();
    } else if (descriptorWithSubGroups.length > 0) {
      groupElement.descriptors.sort((a, b) => a.group - b.group);
    }

    let firstIndex = descriptors.descriptorGroups.findIndex(e => e.name === groupElement.name);
    let lastIndex = descriptors.descriptorGroups.findLastIndex(e => e.name === groupElement.name);
    let count = descriptors.descriptorGroups.filter(e => e.name === groupElement.name).length;

    const subgroupTableRendermap = new Map();

    const cardBody = (
      <Card.Body>
        {groupElement.descriptors.map((descriptor, index) => {
          if (descriptor.group && descriptor.key.mandateGroup) {
            return getSubGroupXorMandateGroup(descriptor, groupElement, index);
          } else if (descriptor.group) {
            let commonGroups = groupElement.descriptors.filter(i => i.name === descriptor.name);

            let rowExists = false;
            commonGroups.map(desc => {
              let filledDescriptors = desc.descriptors.filter(i => i.value && i.value !== "");

              if (filledDescriptors.length > 0) {
                rowExists = true;
              }
            });

            return (
              <>
                {getCardBody(descriptor, index, groupElement, true)}

                {rowExists && checkRenderTableMap(subgroupTableRendermap, groupElement, descriptor) && (
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
                              return field.value && field.value !== "" ? <td>{field.value}</td> : <td></td>;
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
                                    onClick={() => handleSubGroupDelete(desc, groupElement)}
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
              </>
            );
          } else {
            return descriptor.key.mandateGroup &&
              descriptor.key.mandateGroup.xOrMandate &&
              (descriptor.key.mandateGroup.defaultSelection ||
                descriptor.notApplicable ||
                descriptor.notRecorded) ? (
              <div key={index + descriptor.id}>
                {getXorGroupsforSimpleDescs(groupElement.descriptors, descriptor, index, groupElement)}
              </div>
            ) : (
                (!descriptor.key.mandateGroup || (descriptor.key.mandateGroup && !descriptor.key.mandateGroup.xOrMandate)) && (
                <div
                  style={{
                    textAlign: "left",
                    paddingLeft: "10px"
                  }}
                  key={descriptor.id.toString()}
                >
                    {getNewField(descriptor, index, groupElement, "")}
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
                url={groupElement.key.wikiLink}
                text={groupElement.description}
                helpIcon="gg-helpicon-detail"
              />
            </span>

            <span
              className={`descriptor-header ${groupElement.key.mandatory && index <= firstIndex ? "required-asterik" : ""
                }`}
            >
              {" " + groupElement.name}
            </span>
          </span>

          <div style={{ float: "right" }} key={groupElement.id}>
            {groupElement.key.maxOccurrence > 1 && ((count > 0 && index === lastIndex) || (count === 1 && index === firstIndex)) && (
              <FontAwesomeIcon
                icon={["fas", "plus"]}
                size="lg"
                title="Add Descriptor Group"
                style={{
                  marginRight: "10px",
                  marginBottom: "6px"
                }}
                onClick={() => props.handleAddDescriptorGroups(groupElement.name)}
              />
            )}

            {((groupElement.key.mandatory && groupElement.key.maxOccurrence > 1 && index > firstIndex) ||
              (!groupElement.key.mandatory && !groupElement.key.mandateGroup) ||
              (groupElement.key.mandateGroup && groupElement.key.maxOccurrence > 1 && index > firstIndex)) &&
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

  /**
   * create components for the given descriptor based on it namespace: text/label/textarea/checkbox/date/selection etc.
   * 
   * @param {object} element descriptor to display
   * @param {int} index index of the element in the list
   * @param {string} parentGroup name of the parent descriptor group of the descriptor. if this is a subgroup
   * @param {boolean} simpleDescAndMandateGroup is this part of a simple descriptor mandate group?
   * @returns 
   */
  const getNewField = (element, index, parentGroup, simpleDescAndMandateGroup) => {
    if (!element.key.namespace) {
      element = { ...element, namespace: { name: "label" } };
    } else if (element.key.namespace && !element.key.namespace.name) {
      element.key.namespace = { ...element.key.namespace, name: "label" };
    }
    if (element.key.name === "Cell free expression system") return;

    let firstIndex = 0;
    let count = 0;
    if (!parentGroup.group) {
      firstIndex = parentGroup.findIndex(e => e.name === element.name);
      count = parentGroup.filter(e => e.name === element.name).length;
    } else {
      firstIndex = parentGroup.descriptors.findIndex(e => e.name === element.name);
      count = parentGroup.descriptors.filter(e => e.name === element.name).length;
    }

    return (
      <Form.Group as={Row} controlId={element.id} key={element.id.toString()} className="gg-align-center mb-3">
        <Col xs={12} lg={7}>
          <span className="font-awesome-color" style={{ float: "left" }}>
            <span>
              <HelpToolTip url={element.key.wikiLink} text={element.description} helpIcon="gg-helpicon-detail" />
            </span>
          </span>

          <FormLabel label={element.name} className={element.key.mandatory ? "required-asterik" : ""} />
          <Row>
            {element.key.namespace.name === "text" ? (
              <Col>
                <Form.Control
                  as="textarea"
                  name={element.name}
                  value={element.value || ""}
                  placeholder={element.key.example && `e.g., ${element.key.example}`}
                  onChange={e => props.handleChange(element, e, "")}
                  required={element.key.mandatory ? true : false}
                  maxLength={2000}
                  rows={4}
                  disabled={element.disabled}
                />
                <div className="gg-align-right text-right text-muted">
                  {element.value && element.value.length > 0 ? element.value.length : "0"}
                  /2000
                </div>
              </Col>
            ) : element.key.namespace.name === "number" ? (
              <Col>
                <Form.Control
                  type="text"
                  name={element.name}
                  value={element.value || ""}
                    placeholder={element.key.example && `e.g., ${element.key.example}`}
                  onChange={e => {
                    if (element.key.namespace.name === "number") {
                      const _value = e.target.value;
                      if (_value && !/^[0-9]+$/.test(_value)) {
                        return;
                      }
                    }
                    props.handleChange(element, e, "");
                  }}
                    required={element.key.mandatory ? true : false}
                    disabled={element.disabled}
                // maxLength={3}
                />
              </Col>
              ) : element.key.namespace.name === "label" || element.key.namespace.name === "dictionary" ? (
              <Form.Control
                type="text"
                name={element.name}
                value={element.value || ""}
                    placeholder={element.key.example && `e.g., ${element.key.example}`}
                    onChange={e => props.handleChange(element, e, "")}
                    required={element.key.mandatory ? true : false}
                    disabled={element.disabled}
              />
                ) : element.key.namespace.name === "selection" ? (
              <Form.Control
                as="select"
                name={element.name}
                value={element.value}
                      onChange={e => props.handleChange(element, e, "")}
                required={true}
                      disabled={element.disabled}
              >
                <option value="id">Select</option>
                      {element.key.selectionList.map((li, index) => {
                  return (
                    <option value={li} key={index}>
                      {li}
                    </option>
                  );
                })}
              </Form.Control>
                  ) : element.key.namespace.name === "date" ? (
              <Datetime
                inputProps={inputProps}
                timeFormat={false}
                name={element.name}
                value={element.value}
                closeOnSelect
                        onChange={e => props.handleChange(element, e, "date")}
                        disabled={element.disabled}
              />
                    ) : element.key.namespace.name === "boolean" ? (
              <FormControlLabel
                control={
                  <BlueCheckbox
                    name={element.name}
                              onChange={e => props.handleChange(element, e, "checkBox")}
                    size="large"
                              checked={element.value}
                              disabled={element.disabled}
                  />
                }
                label={element.name}
              />
            ) : (
              ""
            )}
            <Feedback message={`${element.name} is required`} />

            {element.key.units.length > 0 && (
              <Col className="pr-0 mr-0">
                <>
                  <Form.Control
                    as="select"
                    name="unitlevel"
                    value={element.unit}
                    onChange={e => props.handleUnitSelectionChange(element, e, "")}
                    required={element.key.mandatory ? true : false}
                    disabled={element.disabled}
                  >
                    <option value="">Select Unit</option>
                    {element.key.units.map((unit, index) => {
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
          {(element.key.allowNotApplicable || element.key.allowNotRecorded) && !simpleDescAndMandateGroup && (
            <>
              {element.key.allowNotApplicable && (
                <FormControlLabel
                  style={{ marginBottom: "-15px" }}
                  control={
                    <BlueCheckbox
                      key={Math.random()}
                      name="notApplicable"
                      checked={element.notApplicable}
                      onChange={e => props.handleChange(element, e, "checkBox")}
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

              {element.key.allowNotRecorded && (
                <div>
                  <FormControlLabel
                    style={{ marginBottom: "-8px" }}
                    control={
                      <BlueCheckbox
                        key={Math.random()}
                        name="notRecorded"
                        checked={element.notRecorded}
                        onChange={e => props.handleChange(element, e, "checkBox")}
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

          {element && element.key.maxOccurrence > 1 && ((count > 0 && index > firstIndex) || (count === 1 && index === firstIndex)) && (
            <Button onClick={() => props.handleAddDescriptorGroups(element.name)}>
              <LineTooltip text="Add Descriptor">
                <Image src={plusIcon} alt="plus button" />
              </LineTooltip>
            </Button>
          )}
        </Col>
      </Form.Group>
    );
  };

  /**
   * update the metadata model with the changes from the Modal dialog (for subgroups)
   */
  function handleConfirmAddSubNonXorGroups() {
    if (props.validateUserInput(subGroupAddElement, subGroupAddDescriptor)) {
      setModalInputValidateError(false);
      setEnableSubGroupAddModal(false);
    } else {
      setModalInputValidateError(true);
    }
  }

  /**
   * 
   * handle subgroup (subGroupAddDesscriptor) that are not part of XOR mandate groups, like "Reference", "Reagent (in Protein Sample, Chemical Label)"
   * it will return the components to be displayed in a modal dialog (ConfirmationModal)
   * 
   * @returns the components to display for all descriptors of the given group 
   */
  const getSubNonXorGroupDescBody = () => {
    return subGroupAddDescriptor.descriptors.map((field, index) => {
      return getNewField(field, index, subGroupAddDescriptor);
    });
  };

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
  setLoadDataOnFirstNextInUpdate: PropTypes.func,
  isAllExpanded: PropTypes.bool,
  handleUnitSelectionChange: PropTypes.func,
  validateUserInput: PropTypes.func,
  handleCancelModal: PropTypes.func,
  handleAddDescriptorGroups: PropTypes.func,
  handleAddDescriptorSubGroups: PropTypes.func,
  defaultSelectionChangeSuperGroup: PropTypes.func,
  defaultSelectionChangeSubGroup: PropTypes.func,
  nonXorGroupApporRec: PropTypes.func,
  setAssayCurrentStep: PropTypes.func,
  assayCurrentStep: PropTypes.number,
  loadDataOnFirstNextInUpdate: PropTypes.bool
};

export { Descriptors };
