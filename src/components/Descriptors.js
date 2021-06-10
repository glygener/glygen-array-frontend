import React from "react";
import PropTypes from "prop-types";
import "../components/Descriptors.css";
import { Feedback } from "./FormControls";
import { HelpToolTip } from "./HelpToolTip";
import { Form, Col, Row, Accordion, Card } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { ScrollTo } from "react-scroll-to";
import { ContextAwareToggle } from "../utils/commonUtils";
import Datetime from "react-datetime";
import "react-datetime/css/react-datetime.css";
import { Droppable, Draggable } from "react-beautiful-dnd";

const Descriptors = props => {
  const {
    descriptors,
    metaDataTemplate,
    metaType,
    handleDelete,
    handleSubGroupDelete,
    descriptorSubGroup,
    isUpdate,
    isCopySample,
    setLoadDataOnFirstNextInUpdate,
    isAllExpanded
  } = props;

  let descriptorForm = [];
  const simpleDescriptorTitle = "General Descriptors";

  let inputProps = {
    id: "dateField",
    required: true,
    placeholder: "Select Date",
    readOnly: true
  };

  const buildDescriptors = () => {
    let descriptorsByMetaType;

    isUpdate || isCopySample
      ? (descriptorsByMetaType = descriptors)
      : (descriptorsByMetaType = descriptors.find(e => e.name === metaDataTemplate));

    var subGroupKeyIndex = 900;
    let descMetaData = descriptorsByMetaType.descriptors;
    const accorSimpleDesc = descMetaData.filter(i => i.group !== true);

    //General Descriptors
    if (accorSimpleDesc.length > 0) {
      descriptorForm.push(getSimpleDescriptors(accorSimpleDesc));
    }

    //sorting for general descriptors
    descMetaData.sort((a, b) => b.group - a.group);

    let accorGroup;

    if (isUpdate || isCopySample) {
      accorGroup =
        metaType === "Assay"
          ? getAssayDroppableUpdateOrCopy(descMetaData)
          : descMetaData.map((descriptor, index) => {
              if (
                descriptor.group &&
                (descriptor.descriptors.find(i => i.value) || descriptor.isNewlyAddedNonMandatory)
              ) {
                return <>{getDescriptorGroups(descriptor, index)}</>;
              }

              return <></>;
            });
    } else {
      accorGroup =
        metaType === "Assay"
          ? getAssayDroppable(descMetaData, subGroupKeyIndex)
          : descMetaData.map((descriptor, index) => {
              if (descriptor.group && (descriptor.mandatory || descriptor.isNewlyAddedNonMandatory)) {
                return <>{getDescriptorGroups(descriptor, index)}</>;
              }

              return <></>;
            });
    }

    descriptorForm.push(accorGroup);

    setLoadDataOnFirstNextInUpdate(true);

    return descriptorForm;
  };

  const getAssayDroppable = descMetaData => {
    return (
      <>
        <Droppable droppableId={"descriptors"}>
          {provided => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              {descMetaData.map((descriptor, index) => {
                if (descriptor.group && (descriptor.mandatory || descriptor.isNewlyAddedNonMandatory)) {
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
            <div {...provided.droppableProps} key={subGroupKeyIndex++} ref={provided.inneref}>
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

  const getCardBody = (descriptor, index, groupElement) => {
    return (
      <>
        <Row>
          <Col>{descriptor.group && <p style={{ textAlign: "left", fontWeight: "bold" }}>{descriptor.name}</p>}</Col>
          <Col
            style={{
              textAlign: "right"
            }}
          >
            {descriptor.id.startsWith("newly") && (
              <FontAwesomeIcon
                key={"delete" + index}
                icon={["far", "trash-alt"]}
                size="xs"
                title="Delete Descriptor"
                className="delete-icon table-btn"
                style={{ marginRight: "10px", marginBottom: "4px" }}
                onClick={() => handleSubGroupDelete(groupElement, descriptor.id)}
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
            <span>
              <HelpToolTip
                name={simpleDescriptorTitle}
                text={"Add Some text Here"}
                helpIcon="gg-helpicon-detail"
              ></HelpToolTip>
            </span>
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
          return (
            <div
              style={{
                paddingLeft: "10px",
                backgroundColor: element.id.startsWith("newly") ? "#f3f3f3" : ""
              }}
              key={index + element.id}
            >
              {getCardBody(element, 0, generalDescriptors)}
              {getNewField(element, element, "")}
            </div>
          );
        })}
      </Card.Body>
    );

    return (
      <div
        key={keyIndex++}
        style={{
          padding: "10px"
        }}
      >
        <Accordion defaultActiveKey={isAllExpanded ? generalDescriptors.id : 0}>
          <Card>
            {cardHeader}
            <Accordion.Collapse eventKey={isAllExpanded ? generalDescriptors.id : 0}>{cardBody}</Accordion.Collapse>
          </Card>
        </Accordion>
      </div>
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
            return (
              <div
                style={{
                  backgroundColor: "#f3f3f3",
                  paddingLeft: "10px"
                }}
                key={descriptor.id.toString()}
              >
                {getCardBody(descriptor, index, groupElement)}

                {descriptor.descriptors.map(field => {
                  return getNewField(field, groupElement, descriptor.id);
                })}
                {descriptor.id.startsWith("newly") ? <p> &nbsp;</p> : <p> &nbsp;&nbsp;</p>}
              </div>
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
      <Accordion.Collapse eventKey={isAllExpanded ? 0 : groupElement.id}>{cardBody}</Accordion.Collapse>
    );

    const accToggle = (
      <ContextAwareToggle eventKey={isAllExpanded ? 0 : groupElement.id} classname={"font-awesome-color"} />
    );

    var card = (
      <Card>
        <Card.Header style={{ height: "65px" }}>
          <span className="font-awesome-color " style={{ float: "left" }}>
            <span>
              <HelpToolTip
                name={groupElement.name}
                url={groupElement.wikiLink}
                text={"Add Some text Here"}
                helpIcon="gg-helpicon-detail"
              ></HelpToolTip>
            </span>

            <span className="descriptor-header">{" " + groupElement.name}</span>
          </span>

          <div style={{ float: "right" }} key={groupElement.id}>
            {groupElement.isNewlyAddedNonMandatory && addSubGroupValidation(groupElement) && (
              <span>{descriptorSubGroup(groupElement)}</span>
            )}
            {(groupElement.isNewlyAdded || groupElement.isNewlyAddedNonMandatory) && (
              <FontAwesomeIcon
                key={"delete" + index}
                icon={["far", "trash-alt"]}
                size="xs"
                title="Delete Descriptor"
                className="delete-icon table-btn"
                style={{
                  marginRight: "10px",
                  marginBottom: "4px"
                }}
                onClick={() => handleDelete(groupElement.id)}
              />
            )}

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
          defaultActiveKey={isAllExpanded ? 0 : groupElement.id}
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

  const getNewField = (element, descriptorDetails, subGroupName) => {
    if (!element.namespace) {
      element = { ...element, namespace: { name: "label" } };
    } else if (element.namespace && !element.namespace.name) {
      element.namespace = { ...element.namespace, name: "label" };
    }
    return (
      <Form.Group as={Row} controlId={element.id} key={element.id.toString()}>
        <Form.Label column md={{ span: 3 }} className={element.mandatory ? "required-asterik" : ""}>
          {element.name}
        </Form.Label>

        <Col md={7}>
          {element.namespace.name === "text" ? (
            <Form.Control
              as="textarea"
              name={element.name}
              value={element.value}
              placeholder={element.description.toLowerCase()}
              onChange={e => props.handleChange(descriptorDetails, e, subGroupName, "")}
              required={element.mandatory ? true : false}
              maxLength={2000}
              rows={4}
            ></Form.Control>
          ) : element.namespace.name === "label" ||
            element.namespace.name === "dictionary" ||
            element.namespace.name === "selection" ? (
            <Form.Control
              type="text"
              name={element.name}
              value={element.value}
              placeholder={element.description.toLowerCase()}
              onChange={e => props.handleChange(descriptorDetails, e, subGroupName, "")}
              required={element.mandatory ? true : false}
            ></Form.Control>
          ) : element.namespace.name === "number" ? (
            <Form.Control
              type="number"
              name={element.name}
              value={element.value}
              placeholder={element.description.toLowerCase()}
              onChange={e => props.handleChange(descriptorDetails, e, subGroupName, "")}
              required={element.mandatory ? true : false}
            ></Form.Control>
          ) : element.namespace.name === "date" ? (
            <Datetime
              inputProps={inputProps}
              timeFormat={false}
              name={element.name}
              value={element.value}
              closeOnSelect
              onChange={e => props.handleChange(descriptorDetails, e, subGroupName, element.id)}
            />
          ) : (
            ""
          )}
          <Feedback message={`${element.name} is required`} />
        </Col>
        {element.units.length > 0 && (
          <Col md={2}>
            <Form.Control
              as="select"
              name="unitlevel"
              value={element.unit}
              onChange={e => props.handleUnitSelectionChange(descriptorDetails, e, subGroupName, "")}
              required
            >
              <option value="">select</option>
              {element.units.map((unit, index) => {
                return (
                  <option key={index} value={unit} id={element.id} name={element.name}>
                    {unit}
                  </option>
                );
              })}
            </Form.Control>
            <Feedback message={`Unit is required`} />
          </Col>
        )}
      </Form.Group>
    );
  };

  return <>{buildDescriptors()}</>;
};

const addSubGroupValidation = groupElement => {
  var flag = false;

  if (groupElement.descriptors.filter(i => i.maxOccurance > 1).length > 0) {
    flag = true;
  }
  return flag;
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
  handleUnitSelectionChange: PropTypes.func
};

export { Descriptors };
