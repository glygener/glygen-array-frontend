import React, { useState } from "react";
import PropTypes from "prop-types";
import "../components/Descriptors.css";
import { Feedback, BlueCheckbox, FormLabel, BlueRadio } from "./FormControls";
import { HelpToolTip } from "./tooltip/HelpToolTip";
import { Form, Col, Row, Accordion, Card, Image, Alert } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { ScrollTo } from "react-scroll-to";
import { ContextAwareToggle, isValidNumber } from "../utils/commonUtils";
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
    isAllExpanded
  } = props;

  const [enableModal, setEnableModal] = useState(false);
  const [mandateGroupNewValue, setMandateGroupNewValue] = useState();
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
    if (accorSimpleDesc.length > 0) {
      descriptorForm.push(getSimpleDescriptors(accorSimpleDesc));
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
      // : descMetaData.map((descriptor, index) => {
      //     if (
      //       descriptor.group &&
      //       (descriptor.descriptors.find(i => i.value) || descriptor.isNewlyAddedNonMandatory)
      //     ) {
      //       return <>{getDescriptorGroups(descriptor, index)}</>;
      //     }

      //     return <></>;
      //   });
    } else {
      accorGroup =
        metaType === "Assay" ? getAssayDroppable(descMetaData, subGroupKeyIndex) : loadDescGroups(descMetaData);
    }

    descriptorForm.push(accorGroup);

    setLoadDataOnFirstNextInUpdate && setLoadDataOnFirstNextInUpdate(true);

    return descriptorForm;
  };

  const loadDescGroups = (descMetaData, isUpdate, isCopySample) => {
    return descMetaData.map((descriptor, index) => {
      if (
        (descriptor.group && descriptor.mandatory) ||
        (descriptor.group && !descriptor.mandatory && !descriptor.isDeleted)
      ) {
        if (!descriptor.mandateGroup) {
          if (isUpdate || isCopySample) {
            return descriptor.descriptors.find(i => i.value) && getDescriptorGroups(descriptor, index);
          } else {
            return <>{getDescriptorGroups(descriptor, index)}</>;
          }
        } else {
          if (
            descriptor.mandateGroup &&
            (descriptor.mandateGroup.defaultSelection ||
              descriptor.mandateGroup.notApplicable ||
              descriptor.mandateGroup.notRecorded)
          ) {
            let listTraversed = descMetaData.slice(0, index);

            //skipping the radio button display for mandategroup if there is one for current group
            let alreadyDisplayedXorGroupWiz = listTraversed.filter(
              i =>
                i.mandateGroup &&
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

  const getXorMandateHeader = (descriptor, descMetaData) => {
    let sameXorGroup = descMetaData.filter(i => i.mandateGroup && i.mandateGroup.id === descriptor.mandateGroup.id);

    return (
      <>
        <Row
          className={"xorHeaderBox"}
          style={{
            border: descriptor.group ? "" : "none",
            padding: descriptor.group ? "1em" : "none"
          }}
        >
          <Col md={12}>
            <FormLabel label={descriptor.mandateGroup && descriptor.mandateGroup.name} className={"xorGroupHeader"} />
            {sameXorGroup.map((grp, index) => {
              return !grp.id.startsWith("newly") ? (
                <>
                  <FormControlLabel
                    control={<BlueRadio />}
                    name={grp.name}
                    value={grp.name}
                    label={grp.name}
                    onChange={() => {
                      if (
                        sameXorGroup.filter(e => {
                          return e.value !== undefined;
                        }).length > 0
                      ) {
                        setEnableModal(true);
                      } else {
                        setMandateGroupNewValue(grp);
                        props.defaultSelectionChange(grp);
                      }
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
                          props.defaultSelectionChange(grp, "notApplicable");
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
                          props.defaultSelectionChange(grp, "notRecorded");
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
                if (metaType === "Feature" && descriptor.group) {
                  return <>{getDescriptorGroups(descriptor, index)}</>;
                } else if (descriptor.group) {
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

  const getCardBody = (descriptor, index, groupElement, isSubGroup) => {
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
                <FontAwesomeIcon
                  icon={["fas", "plus"]}
                  size="lg"
                  title="Add Descriptor Group"
                  style={{
                    marginRight: "10px",
                    marginBottom: "6px"
                  }}
                  // onClick={() => props.handleAddDescriptorSubGroups(groupElement, descriptor)}
                  onClick={() => {
                    setEnableSubGroupAddModal(true);
                    setSubGroupAddElement(groupElement);
                    setSubGroupAddDescriptor(descriptor);
                  }}
                />
              )}

            {descriptor.id.startsWith("newly") && !isSubGroup && metaType !== "Feature" && (
              <FontAwesomeIcon
                key={"delete" + index}
                icon={["far", "trash-alt"]}
                size="1x"
                title="Delete Descriptor"
                className="delete-icon table-btn"
                style={{ marginRight: "10px", marginBottom: "4px" }}
                onClick={() => handleSubGroupDelete(descriptor.id)}
              />
            )}
          </Col>
        </Row>
      </>
    );
  };

  const getSimpleDescriptors = generalDescriptors => {
    let keyIndex = 0;
    const cardHeader = (
      <Card.Header style={{ height: "65px" }}>
        <Row>
          <Col md={6} className="font-awesome-color " style={{ textAlign: "left" }}>
            <span className="descriptor-header"> {" " + simpleDescriptorTitle}</span>
          </Col>
          <Col md={6} style={{ textAlign: "right" }}>
            <ContextAwareToggle eventKey={isAllExpanded ? generalDescriptors.id : 0} classname={"font-awesome-color"} />
          </Col>
        </Row>
      </Card.Header>
    );

    const cardBody = (
      <Card.Body>
        {generalDescriptors.map((element, index) => {
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
              (element.mandateGroup.defaultSelection ||
                element.mandateGroup.notApplicable ||
                element.mandateGroup.notRecorded) && (
                <div
                  style={{
                    // paddingLeft: "10px",
                    backgroundColor: "#f3f3f3",
                    borderRadius: "0.4em"
                  }}
                  key={index + element.id}
                >
                  {getMandateGroupsforSimpleDescriptors(element, index)}
                </div>
              )
          );
        })}
      </Card.Body>
    );

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

  const getMandateGroupsforSimpleDescriptors = (element, index) => {
    let listTraversed = descMetaData.slice(0, index);

    //skipping the radio button display for mandategroup if there is one for current group
    let alreadyDisplayedXorGroupWiz = listTraversed.filter(
      i => i.mandateGroup && i.mandateGroup.id === element.mandateGroup.id && i.mandateGroup.defaultSelection
    );

    let notRecordedorApp = false;
    if (element.mandateGroup.notApplicable || element.mandateGroup.notRecorded) {
      notRecordedorApp = true;
    }

    return (
      <>
        {alreadyDisplayedXorGroupWiz.length < 1 && getXorMandateHeader(element, descMetaData)}
        {!notRecordedorApp && getNewField(element, element, "", true)}
      </>
    );
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
        {groupElement.descriptors.map(descriptor => {
          if (descriptor.group) {
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
                  {getCardBody(descriptor, index, groupElement, true)}

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
                                <FontAwesomeIcon
                                  key={"delete" + index}
                                  icon={["far", "trash-alt"]}
                                  size="1x"
                                  title="Delete Descriptor"
                                  className="delete-icon table-btn"
                                  style={{ marginRight: "10px", marginBottom: "4px" }}
                                  onClick={() => handleSubGroupDelete(desc.id, desc)}
                                />
                              </td>
                            );
                          }
                          return <tr>{rowData}</tr>;
                        })}
                      </tbody>
                    </table>
                  )}

                  {/* {descriptor.descriptors.map(field => {
                  return getNewField(field, groupElement, descriptor.id);
                })} */}

                  {/* {descriptor.id.startsWith("newly") ? <p> &nbsp;</p> : <p> &nbsp;&nbsp;</p>} */}
                </div>
              </>
            );
          } else {
            return (
              <div
                style={{
                  textAlign: "left",
                  paddingLeft: "10px"
                  // backgroundColor: "#f3f3f3"
                }}
                key={descriptor.id.toString()}
              >
                {getNewField(descriptor, groupElement, "")}
              </div>
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
          <span className="font-awesome-color " style={{ float: "left" }}>
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
            {/* {groupElement.isNewlyAddedNonMandatory && addSubGroupValidation(groupElement) && (
              <span>{descriptorSubGroup(groupElement)}</span>
            )} */}

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

            {(groupElement.isNewlyAdded || groupElement.isNewlyAddedNonMandatory || !groupElement.mandatory) &&
              !groupElement.mandateGroup &&
              createDeleteIcon(groupElement, index)}
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
        <Accordion
          // {...(isAllExpanded && metaType !== "Assay"
          //   ? `defaultActiveKey = ${isAllExpanded} ? 0 : ${groupElement.id}`
          //   : null)}
          defaultActiveKey={isAllExpanded ? groupElement.id : 0}
        >
          {card}
        </Accordion>
      </div>
    ) : (
      <Draggable key={groupElement.id} draggableId={groupElement.id} index={index}>
        {provided => (
          <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
            <Accordion
              style={{ padding: "10px", paddingBottom: "20px" }}
              // style={{ ...provided.draggableProps.style }}
              // className="alert alert-primary"
              // defaultActiveKey={isAllExpanded ? 0 : groupElement.id}
            >
              {card}
            </Accordion>
          </div>
        )}
      </Draggable>
    );
  };

  const createDeleteIcon = (groupElement, index) => {
    return (
      <>
        <FontAwesomeIcon
          key={"delete" + index}
          icon={["far", "trash-alt"]}
          size="1x"
          title="Delete Descriptor"
          className="delete-icon table-btn"
          style={{
            marginRight: "10px",
            marginBottom: "4px"
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
        <Col xs={10} lg={7}>
          <span className="font-awesome-color " style={{ float: "left" }}>
            <span>
              <HelpToolTip url={element.wikiLink} text={element.description} helpIcon="gg-helpicon-detail" />
            </span>
          </span>

          <FormLabel label={element.name} className={element.mandatory ? "required-asterik" : ""} />

          {element.namespace.name === "text" ? (
            <>
              <Form.Control
                as="textarea"
                name={element.name}
                value={element.value || ""}
                placeholder={`e.g., ${element.example}`}
                onChange={e => props.handleChange(descriptorDetails, e, subGroupName, "")}
                required={element.mandatory ? true : false}
                maxLength={2000}
                rows={4}
                disabled={descriptorDetails.isHide || element.disabled}
              />
              <div className="text-right text-muted">
                {element.value && element.value.length > 0 ? element.value.length : "0"}
                /2000
              </div>
            </>
          ) : element.namespace.name === "label" ||
            element.namespace.name === "dictionary" ||
            element.namespace.name === "number" ? (
            <Form.Control
              type="text"
              name={element.name}
              value={element.value || ""}
              placeholder={`e.g., ${element.example}`}
              onChange={e => props.handleChange(descriptorDetails, e, subGroupName, "")}
              required={element.mandatory ? true : false}
              disabled={descriptorDetails.isHide || element.disabled}
              onKeyDown={e => {
                return element.namespace.name === "number" ? isValidNumber(e) : "";
              }}
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
              <option value="id">select</option>
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
                  size="small"
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
          {/* </Col> */}

          {element.units.length > 0 && (
            // <Col md={2}>
            <>
              <Form.Control
                as="select"
                name="unitlevel"
                value={element.unit}
                onChange={e => props.handleUnitSelectionChange(descriptorDetails, e, subGroupName, "")}
                required={element.mandatory ? true : false}
                disabled={descriptorDetails.isHide || element.disabled}
              >
                <option value="">select Unit</option>
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
            // {/* // </Col> */}
          )}

          {(element.allowNotApplicable || element.allowNotRecorded) && !simpleDescAndMandateGroup && (
            <>
              {/* // <Col style={{ marginTop: "-11px" }} md={2}> */}
              {element.allowNotApplicable && (
                <FormControlLabel
                  control={
                    <BlueCheckbox
                      key={Math.random()}
                      name="notApplicable"
                      checked={element.notApplicable}
                      onChange={e => props.handleChange(descriptorDetails, e, element.id, "checkBox")}
                      size="small"
                      defaultChecked={element.notApplicable}
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
              <br />
              {element.allowNotRecorded && (
                <>
                  <FormControlLabel
                    style={{ marginTop: "-25px" }}
                    control={
                      <BlueCheckbox
                        key={Math.random()}
                        name="notRecorded"
                        checked={element.notRecorded}
                        onChange={e => props.handleChange(descriptorDetails, e, element.id, "checkBox")}
                        size="small"
                        defaultChecked={element.notRecorded}
                      />
                    }
                    label={
                      <>
                        {"Not Recorded"}
                        <sup>2</sup>
                      </>
                    }
                  />
                </>
              )}
            </>
            // {/* </Col> */}
          )}

          {element && element.maxOccurrence > 1 && displayPlusIcon(element, descMetaData, true) && (
            // <Col md={1}>
            <Button onClick={() => props.handleAddDescriptorGroups(descriptorDetails)}>
              <LineTooltip text="Add descriptor">
                <Image src={plusIcon} alt="plus button" />
              </LineTooltip>
            </Button>
            // </Col>
          )}
        </Col>
      </Form.Group>
    );
  };

  const getSubGroupDescriptorBody = () => {
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

  function handleConfirmAddSubGroups() {
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
      {enableModal && (
        <ConfirmationModal
          showModal={enableModal}
          onCancel={() => setEnableModal(false)}
          onConfirm={() => (
            <>
              {props.defaultSelectionChange(mandateGroupNewValue)}
              {setEnableModal(false)}
            </>
          )}
          title="Mandate Group Change"
          body="You will loose the Current Data if you change the group. Do you wish to proceed ?"
        />
      )}

      {enableSubGroupAddModal && (
        <ConfirmationModal
          showModal={enableSubGroupAddModal}
          onCancel={() => {
            setModalInputValidateError(false);
            setEnableSubGroupAddModal(false);
            handleCancelModal(subGroupAddDescriptor, subGroupAddElement);
          }}
          onConfirm={() => handleConfirmAddSubGroups()}
          title={`Add ${subGroupAddDescriptor.name}`}
          body={
            <>
              <Alert variant={"danger"} show={modalInputValidateError} className="alert-message line-break-1">
                {"Enter all mandatory fields"}
              </Alert>

              {getSubGroupDescriptorBody()}
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
