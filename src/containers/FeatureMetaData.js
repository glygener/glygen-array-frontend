/* eslint-disable no-loop-func */
/* eslint-disable array-callback-return */
import React, { useState, useEffect, useReducer } from "react";
import { ErrorSummary } from "../components/ErrorSummary";
import { wsCall } from "../utils/wsUtils";
import PropTypes from "prop-types";
import { Descriptors } from "../components/Descriptors";
import "../containers/MetaData.css";
import { Loading } from "../components/Loading";
import { Form, Row, Col, Button, Alert } from "react-bootstrap";

const FeatureMetaData = props => {
  // useEffect(props.authCheckAgent, []);

  const [validated, setValidated] = useState(false);
  const [sampleModel, setSampleModel] = useState([]);
  const [pageErrorsJson, setPageErrorsJson] = useState({});
  const [pageErrorMessage, setPageErrorMessage] = useState("");
  const [showErrorSummary, setShowErrorSummary] = useState(false);
  const [mandateGroupLimitDeceed, setMandateGroupLimitDeceed] = useState(new Map());
  const [mandateGroupLimitExceed, setMandateGroupLimitExceed] = useState(new Map());

  useEffect(() => {
    wsCall("listtemplates", "GET", { type: "FEATURE" }, true, null, getListTemplatesSuccess, getListTemplatesFailure);
  }, [props]);

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

    sampleModelUpdated = [...sampleModel];
    selectedSample = sampleModelUpdated.find(i => i.name === metaDataDetails.selectedtemplate);
    selectedSampleIndex = sampleModelUpdated.indexOf(selectedSample);

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

    sampleModelUpdated[selectedSampleIndex] = selectedSample;
    setSampleModel(sampleModelUpdated);
    // props.importedInAPage && props.setMetadataforImportedPage(sampleModel);
  };

  const handleDelete = id => {
    var sampleModelDelete;
    var itemByType;
    var itemByTypeIndex;

    sampleModelDelete = [...sampleModel];
    itemByType = sampleModelDelete.find(i => i.name === metaDataDetails.selectedtemplate);
    itemByTypeIndex = sampleModelDelete.indexOf(itemByType);

    var itemDescriptors = itemByType.descriptors;
    var itemToBeDeleted = itemDescriptors.find(i => i.id === id);
    let itemToBeDeletedIndex = itemDescriptors.indexOf(itemToBeDeleted);

    if (!itemToBeDeleted.isHide) {
      const itemSubDescriptors = itemToBeDeleted.descriptors;

      itemSubDescriptors.forEach(d => {
        if (d.group) {
          var dg = d.descriptors;
          dg.forEach(sgd => {
            sgd.value = undefined;
          });
        } else {
          d.value = undefined;
        }
      });

      const elementUpdate = JSON.parse(JSON.stringify(itemToBeDeleted));
      elementUpdate.isHide = true;

      itemDescriptors[itemToBeDeletedIndex] = elementUpdate;
    } else if (itemToBeDeleted.isHide) {
      itemToBeDeleted.isHide = false;
    }

    itemByType.descriptors = itemDescriptors;

    sampleModelDelete[itemByTypeIndex] = itemByType;
    setSampleModel(sampleModelDelete);

    props.importedInAPage && props.setMetadataforImportedPage(sampleModel);
  };

  const loadDescriptorsAndGroups = () => {
    return (
      <>
        <Descriptors
          metaDataTemplate={metaDataDetails.selectedtemplate}
          metaType={"Feature"}
          descriptors={sampleModel}
          handleChange={handleChangeMetaForm}
          handleDelete={handleDelete}
          // descriptorSubGroup={getDescriptorSubGroup}
          handleUnitSelectionChange={handleChangeMetaForm}
        />
      </>
    );
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

  function handleSubmit(e) {
    setValidated(true);
    if (!isGroupMandate()) {
      if (validateNonXorGroups()) {
        e.currentTarget.checkValidity();
      } else {
        props.handleNext(e);
        props.setImportedPageDataToSubmit(metadataToSubmit());
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
      id: ""
    };
    return props.importedPageData ? objectToBeSaved : JSON.stringify(objectToBeSaved);
  }

  function isGroupMandate() {
    let flag = false;
    var selectedItemByType;

    selectedItemByType = sampleModel.find(i => i.name === metaDataDetails.selectedtemplate);

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
        mandateGroupDeceed.set(e.mandateGroup, deceedGroup);
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

  function validateNonXorGroups() {
    var selectedItemByType = sampleModel.find(i => i.name === metaDataDetails.selectedtemplate);

    const nonXORgroups = selectedItemByType.descriptors.filter(i => i.group === true && !i.mandateGroup);

    nonXORgroups.map(desc => {
      desc.descriptors.map(element => {
        if (!element.group && !element.value) {
          return false;
        } else if (element.group) {
          element.descriptors.map(ele => {
            if (!ele.value) {
              return false;
            }
          });
        }
      });
    });
  }

  function getDescriptors() {
    var descriptors = [];
    var selectedItemByType;

    selectedItemByType = sampleModel.find(i => i.name === metaDataDetails.selectedtemplate);

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

    selectedItemByType = sampleModel.find(i => i.name === metaDataDetails.selectedtemplate);

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

      props.importedPageData.length < 1
        ? setMetaDataDetails({ sample: responseJson[0] })
        : setMetaDataDetails({ sample: props.importedPageData[0] });

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

  function setUpdateMetaDataForFeatureMetadata() {
    metaDataDetails.sample.descriptors.forEach(generalDsc => {
      const simpleDescs = sampleModel[0].descriptors.find(i => i.id === generalDsc.id && i.group === false);

      if (simpleDescs) {
        simpleDescs.value = generalDsc.value;
        simpleDescs.unit = generalDsc.unit ? generalDsc.unit : "";
      }
    });

    metaDataDetails.sample.descriptors.forEach(group => {
      const templateDescriptorGroup = sampleModel[0].descriptors.find(i => i.id === group.id && i.group === true);

      if (templateDescriptorGroup.descriptors) {
        if (!templateDescriptorGroup.mandatory) {
          templateDescriptorGroup.id = "newlyAddedItems" + templateDescriptorGroup.id;
          templateDescriptorGroup.isNewlyAdded = true;
        }
        group.descriptors.forEach(descriptor => {
          const subdescriptor =
            templateDescriptorGroup && templateDescriptorGroup.descriptors.find(i => i.id === descriptor.id);
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
                const subGrp = subdescriptor.descriptors.find(i => i.id === subGroupDesc.id);
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

  if (sampleModel.length < 1) {
    return <Loading show={true} />;
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

      <Form noValidate validated={validated} onSubmit={e => handleSubmit(e)}>
        <>
          {getButtonsForImportedPage()}
          <Row>
            <Col md={10}>
              {props.importedPageData.length > 0 && setUpdateMetaDataForFeatureMetadata()}

              {props.importPageContent && props.importPageContent()}

              {loadDescriptorsAndGroups()}
            </Col>
            <Col md={2} style={{ marginLeft: "-35px" }}></Col>
          </Row>
          {getButtonsForImportedPage()}
        </>
      </Form>
    </>
  );
};

FeatureMetaData.propTypes = {
  search: PropTypes.string,
  metaID: PropTypes.string,
  isCopy: PropTypes.bool,
  type: PropTypes.string,
  addMeta: PropTypes.string,
  updateMeta: PropTypes.string,
  redirectTo: PropTypes.string,
  importedInAPage: PropTypes.bool,
  setMetadataforImportedPage: PropTypes.func,
  importedPageData: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  setImportedPageDataToSubmit: PropTypes.func,
  handleBack: PropTypes.func,
  handleNext: PropTypes.func,
  idChange: PropTypes.bool,
  importPageContent: PropTypes.func
};

export { FeatureMetaData };
