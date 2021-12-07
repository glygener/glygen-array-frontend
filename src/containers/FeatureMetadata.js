import React from "react";
import "../containers/MetaData.css";
import { Row, Col, Form } from "react-bootstrap";
import { FormLabel, Feedback, BlueCheckbox } from "../components/FormControls";
import { FormControlLabel } from "@material-ui/core";

const FeatureMetadata = props => {
  const NameandId = () => {
    return (
      <>
        <div className="line-break-2">
          <Form.Group as={Row} className="gg-align-center mb-3" controlId="name">
            <Col xs={10} lg={7}>
              <FormLabel label="Name" className={"required-asterik"} />
              <Form.Control
                type="text"
                name="name"
                placeholder="Name"
                value={props.featureMetaData.name}
                onChange={e => {
                  props.setFeatureMetaData({ name: e.target.value });
                  props.setFeatureMetaData({ invalidName: false });
                }}
                isInvalid={props.featureMetaData.invalidName}
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
                value={props.featureMetaData.featureId}
                onChange={e => {
                  props.setFeatureMetaData({ featureId: e.target.value });
                  props.setFeatureMetaData({ validateFeatureId: false });
                }}
                isInvalid={props.featureMetaData.validateFeatureId}
                maxLength={30}
                required
              />
              <Feedback message="Feature Id is required" />
            </Col>
          </Form.Group>
        </div>
      </>
    );
  };

  const getDisableCheck = (purityField, validate) => {
    let purityDetails = props.featureMetaData.purity;
    return (
      <>
        <Col>
          <Form.Group className="mb-3" controlId={`${purityField}`}>
            <Form.Check
              type="checkbox"
              label={"not reported"}
              onChange={() => {
                purityDetails[purityField] = !purityDetails[purityField];
                props.setFeatureMetaData({ [props.featureMetaData.purity]: purityDetails });
                props.setFeatureMetaData({ [validate]: false });
              }}
              defaultChecked={purityDetails[purityField]}
            />
          </Form.Group>
        </Col>
      </>
    );
  };

  const reference = (ref, changehandler) => {
    debugger;
    return (
      <>
        <Form.Label column xs={3} sm={4} className="text-xs-left text-sm-left text-md-right">
          Reference
        </Form.Label>

        <Form.Group as={Row} className="gg-align-center mb-3" controlId="type">
          <Col xs={10} lg={7}>
            <FormLabel label="Type" />

            <Form.Control
              as="select"
              name={"reference"}
              value={ref.type}
              onChange={changehandler}
              // required={true}
            >
              <option value="id">select</option>
              <option value="url">URL</option>
              <option value="PMID">PMID</option>
              <option value="doi">DOI </option>
            </Form.Control>
          </Col>
        </Form.Group>

        <Form.Group as={Row} className="gg-align-center mb-3" controlId="value">
          <Col xs={10} lg={7}>
            <FormLabel label="Value" />
            <Form.Control
              type="text"
              name={"refValue"}
              value={ref.value}
              onChange={changehandler}
              // required={true}
            />
          </Col>
        </Form.Group>
      </>
    );
  };

  const getPurity = () => {
    return (
      <>
        <div className={'line-break-2"'}>
          <Form.Group as={Row} className="gg-align-center mb-3" controlId="value">
            <Col xs={10} lg={7}>
              <FormLabel label={"Value"} className={"required-asterik"} />
              <Form.Control
                name={"value"}
                type={"text"}
                placeholder={"value"}
                value={props.featureMetaData.purity && props.featureMetaData.purity.value}
                isInvalid={props.featureMetaData.validateValue}
                onChange={purityInfoChange}
                disabled={props.featureMetaData.purity.valueNotRecorded}
                required
              />
              <Feedback message={"Value is required"} />
            </Col>
            {getDisableCheck("valueNotRecorded", "validateValue")}
          </Form.Group>

          <Form.Group as={Row} className="gg-align-center mb-3" controlId="method">
            <Col xs={10} lg={7}>
              <FormLabel label={"Method"} className={"required-asterik"} />
              <Form.Control
                name={"method"}
                type={"text"}
                placeholder={"method"}
                value={props.featureMetaData.purity && props.featureMetaData.purity.method}
                isInvalid={props.featureMetaData.validateMethod}
                onChange={purityInfoChange}
                disabled={props.featureMetaData.purity.methodNotRecorded}
                required
              />
              <Feedback message={"Method is required"} />
            </Col>
            {getDisableCheck("methodNotRecorded", "validateMethod")}
          </Form.Group>

          {reference(props.featureMetaData.purity.ref, purityInfoChange)}
        </div>
      </>
    );
  };

  const purityInfoChange = e => {
    debugger;
    const name = e.target.name;
    const newValue = e.target.value;
    let purityDetails = props.featureMetaData.purity;
    let ref = purityDetails.ref;

    if (name === "" && (newValue === "specify" || newValue === "notSpecified")) {
      purityDetails.purityNotSpecified = newValue;

      props.setFeatureMetaData({ validateMethod: false });
      props.setFeatureMetaData({ validateValue: false });
    } else {
      if (name === "method") {
        props.setFeatureMetaData({ validateMethod: false });
        purityDetails[name] = newValue;
      } else if (name === "value") {
        props.setFeatureMetaData({ validateValue: false });
        purityDetails[name] = newValue;
      } else {
        if (name === "refValue") {
          ref.value = newValue;
        } else if (name === "reference") {
          ref.type = newValue;
        }
        purityDetails.ref = ref;
      }
    }

    props.setFeatureMetaData({ [props.featureMetaData.purity]: purityDetails });
  };

  const handleSourceChange = (e, glycanId) => {
    const newValue = e.target.value;

    if (newValue === "commercial") {
      let commercial = props.featureMetaData.commercial;
      commercial["vendorNotRecorded"] = false;
      props.setFeatureMetaData({ [props.featureMetaData.commercial]: commercial });
    } else if (newValue === "nonCommercial") {
      let nonCommercial = props.featureMetaData.nonCommercial;
      nonCommercial["providerLabNotRecorded"] = false;
      props.setFeatureMetaData({ [props.featureMetaData.nonCommercial]: nonCommercial });
    }

    props.setFeatureMetaData({ source: newValue });
    props.setFeatureMetaData({ validatedCommNonComm: false });
  };

  const getSource = () => {
    return (
      <>
        <Row
          style={{
            marginTop: "1em"
          }}
        >
          <FormLabel label="Source" className={"featureMetaData-descriptor-title "} />

          <Col md={{ span: 6 }} style={{ marginLeft: "30px" }}>
            <Form.Check.Label>
              <Form.Check.Input
                type="radio"
                value={"commercial"}
                label={"Commercial"}
                onChange={handleSourceChange}
                checked={props.featureMetaData.source === "commercial"}
              />
              {"Commercial"}&nbsp;&nbsp;&nbsp;&nbsp;
            </Form.Check.Label>
            &nbsp;&nbsp; &nbsp;&nbsp;
            <Form.Check.Label>
              <Form.Check.Input
                type="radio"
                label={"Non Commercial"}
                value={"nonCommercial"}
                onChange={handleSourceChange}
                checked={props.featureMetaData.source === "nonCommercial"}
              />
              {"Non Commercial"}&nbsp;&nbsp;&nbsp;&nbsp;
            </Form.Check.Label>
            &nbsp;&nbsp;&nbsp;&nbsp;
            <Form.Check.Label>
              <Form.Check.Input
                type="radio"
                value={"notSpecified"}
                label={"Not Specified"}
                onChange={handleSourceChange}
                checked={props.featureMetaData.source === "notSpecified"}
              />
              {"Not Specified"}
            </Form.Check.Label>
          </Col>
        </Row>
        &nbsp;&nbsp;&nbsp;
      </>
    );
  };

  const getCommercial = () => {
    return (
      <>
        <Form.Group as={Row} className="gg-align-center mb-3" controlId="vendor">
          <Col xs={10} lg={7}>
            <FormLabel label="Vendor" className="required-asterik" />
            <Form.Control
              name="vendor"
              type="text"
              placeholder="Enter Vendor name"
              value={props.featureMetaData.commercial.vendor}
              isInvalid={props.validate}
              onChange={e => sourceInfoChangeForMetadata(e)}
              disabled={props.featureMetaData.commercial.vendorNotRecorded}
              required
            />
            <Feedback message="Vendor is required" />
          </Col>
          {props.isMetadata && (
            <Col>
              <Form.Group className="mb-3" controlId={"vendorCheckBox"}>
                <FormControlLabel
                  control={
                    <BlueCheckbox
                      name="vendorNotRecorded"
                      onChange={commercialNotRecordedChange}
                      checked={props.featureMetaData.commercial["vendorNotRecorded"]}
                      size="large"
                    />
                  }
                  label="Not Reported"
                />
              </Form.Group>
            </Col>
          )}
        </Form.Group>

        <Form.Group as={Row} className="gg-align-center mb-3" controlId="catalogueNumber">
          <Col xs={10} lg={7}>
            <FormLabel label="Catalogue Number" />
            <Form.Control
              name="catalogueNumber"
              type="text"
              placeholder="Enter Catalogue Number"
              value={props.featureMetaData.commercial.catalogueNumber}
              onChange={e => sourceInfoChangeForMetadata(e)}
            />
          </Col>
        </Form.Group>

        <Form.Group as={Row} className="gg-align-center mb-3" controlId="batchId">
          <Col xs={10} lg={7}>
            <FormLabel label="Batch ID" />
            <Form.Control
              name="batchId"
              type="text"
              placeholder="Enter Batch ID"
              value={props.featureMetaData.commercial.batchId}
              onChange={e => sourceInfoChangeForMetadata(e)}
            />
          </Col>
        </Form.Group>
      </>
    );
  };

  const getNonCommecial = () => {
    return (
      <>
        <Form.Group as={Row} className="gg-align-center mb-3" controlId="providerLab">
          <Col xs={10} lg={7}>
            <FormLabel label="Provider Lab" className="required-asterik" />
            <Form.Control
              name="providerLab"
              type="text"
              placeholder="Enter Provider Lab name"
              value={props.featureMetaData.nonCommercial.providerLab}
              isInvalid={props.validate}
              onChange={e => sourceInfoChangeForMetadata(e)}
              disabled={props.featureMetaData.nonCommercial.providerLabNotRecorded}
              required
            />
            <Feedback message="Provider Lab is required" />
          </Col>
          {props.isMetadata && (
            <Col>
              <Form.Group className="mb-3" controlId="providerLabCheckBox">
                <FormControlLabel
                  control={
                    <BlueCheckbox
                      name="providerLabNotRecorded"
                      onChange={nonCommercialNotRecordedChange}
                      checked={props.featureMetaData.nonCommercial["providerLabNotRecorded"]}
                      size="large"
                    />
                  }
                  label="Not Reported"
                />
              </Form.Group>
            </Col>
          )}
        </Form.Group>

        <Form.Group as={Row} className="gg-align-center mb-3" controlId="batchId">
          <Col xs={10} lg={7}>
            <FormLabel label="Batch ID" />
            <Form.Control
              name="batchId"
              type="text"
              placeholder="Enter Batch ID"
              onChange={e => sourceInfoChangeForMetadata(e)}
              value={props.featureMetaData.nonCommercial.batchId}
            />
          </Col>
        </Form.Group>

        <Form.Group as={Row} className="gg-align-center mb-3" controlId="method">
          <Col xs={10} lg={7}>
            <FormLabel label="Method" />
            <Form.Control
              name="method"
              type="text"
              placeholder="Enter Method"
              value={props.featureMetaData.nonCommercial.method}
              onChange={e => sourceInfoChangeForMetadata(e)}
            />
          </Col>
        </Form.Group>

        {reference(props.featureMetaData.nonCommercial.ref, sourceInfoChangeForMetadata)}
      </>
    );
  };

  const getComment = () => {
    return (
      <>
        <Form.Group as={Row} className="gg-align-center mb-3" controlId="comment">
          <Col xs={10} lg={7}>
            <FormLabel label="Comment" />
            <Form.Control
              as="textarea"
              rows={4}
              name="comment"
              placeholder="Enter  Comment"
              value={props.comment}
              onChange={e => sourceInfoChangeForMetadata(e)}
              maxLength={2000}
            />
            <div className="text-right text-muted">
              {props.comment && props.comment.length > 0 ? props.comment.length : "0"}
              /2000
            </div>
          </Col>
        </Form.Group>
      </>
    );
  };

  const sourceInfoChangeForMetadata = e => {
    const name = e.target.name;
    const newValue = e.target.value;

    if (props.featureMetaData.source === "commercial") {
      if (name === "vendor") {
        props.setFeatureMetaData({ validatedCommNonComm: false });
      }

      let comm = props.featureMetaData.commercial;
      comm[name] = newValue;

      props.setFeatureMetaData({ [props.featureMetaData.commercial]: comm });
    } else {
      let nonComm = props.featureMetaData.nonCommercial;
      let ref = nonComm.ref;

      if (name === "providerLab") {
        props.setFeatureMetaData({ validatedCommNonComm: false });
        nonComm[name] = newValue;
      } else {
        if (name === "refValue") {
          ref.value = newValue;
        } else if (name === "reference") {
          ref.type = newValue;
        }
        nonComm.ref = ref;
      }

      props.setFeatureMetaData({ [props.featureMetaData.nonCommercial]: nonComm });
    }
  };

  const commercialNotRecordedChange = () => {
    let commercial = props.featureMetaData.commercial;
    commercial["vendorNotRecorded"] = !commercial["vendorNotRecorded"];

    props.setFeatureMetaData({ validatedCommNonComm: false });
    props.setFeatureMetaData({ [props.featureMetaData.commercial]: commercial });
  };

  const nonCommercialNotRecordedChange = () => {
    let nonCommercial = props.featureMetaData.nonCommercial;
    nonCommercial["providerLabNotRecorded"] = !nonCommercial["providerLabNotRecorded"];

    props.setFeatureMetaData({ validatedCommNonComm: false });
    props.setFeatureMetaData({ [props.featureMetaData.nonCommercial]: nonCommercial });
  };

  return (
    <>
      {NameandId()}
      <Row
        style={{
          marginTop: "1em"
        }}
      >
        <FormLabel label="Purity" className={"featureMetaData-descriptor-title "} />

        <Col md={{ span: 6 }} style={{ marginLeft: "30px" }}>
          <Form.Check.Label>
            <Form.Check.Input
              type="radio"
              value={"specify"}
              label={"Specify"}
              onChange={purityInfoChange}
              checked={props.featureMetaData.purity.purityNotSpecified === "specify"}
            />
            {"Specify"}&nbsp;&nbsp;&nbsp;&nbsp;
          </Form.Check.Label>
          &nbsp;&nbsp; &nbsp;&nbsp;
          <Form.Check.Label>
            <Form.Check.Input
              type="radio"
              value={"notSpecified"}
              label={"Not Specified"}
              onChange={purityInfoChange}
              checked={props.featureMetaData.purity.purityNotSpecified === "notSpecified"}
            />
            {"Not Specified"}
          </Form.Check.Label>
        </Col>
      </Row>

      {/* purity options */}

      {props.featureMetaData.purity.purityNotSpecified === "specify" && getPurity()}

      {/* Source options */}
      {getSource()}
      {props.featureMetaData.source === "commercial" && getCommercial()}
      {props.featureMetaData.source === "nonCommercial" && getNonCommecial()}

      {getComment()}
    </>
  );
};

const updateMetadataTemplate = (template, featureMetadata, setMetadataTemplate) => {
  template[0].descriptors.forEach(mainDesc => {
    mainDesc.descriptors &&
      mainDesc.descriptors.forEach(desc => {
        if (mainDesc.name === "Purity") {
          if (desc.group) {
          } else {
            if (desc.name === "Value") {
              if (featureMetadata.purity.valueNotRecorded) {
                desc.notRecorded = featureMetadata.purity.valueNotRecorded;
              } else {
                desc.value = featureMetadata.purity.value;
              }
            } else if (desc.name === "Method") {
              if (featureMetadata.purity.methodNotRecorded) {
                desc.notRecorded = featureMetadata.purity.methodNotRecorded;
              } else {
                desc.value = featureMetadata.purity.method;
              }
            } else if (desc.name === "Reference") {
              if (featureMetadata.purity.comment !== "") {
                desc.value = featureMetadata.purity.comment;
              }
            }
          }
        } else if (mainDesc.name === "Commercial source") {
          if (desc.name === "Vendor") {
            if (featureMetadata.commercial.vendorNotRecorded) {
              desc.notRecorded = featureMetadata.commercial.vendorNotRecorded;
            } else {
              desc.value = featureMetadata.commercial.vendor;
            }
          } else if (desc.name === "Catalogue number") {
            if (featureMetadata.commercial.catalogueNumber !== "") {
              desc.value = featureMetadata.commercial.catalogueNumber;
            }
          } else if (desc.name === "Batch ID") {
            if (featureMetadata.commercial.batchId !== "") {
              desc.value = featureMetadata.commercial.batchId;
            }
          }
        } else if (mainDesc.name === "Non-commercial") {
          if (desc.name === "Provider lab") {
            if (featureMetadata.nonCommercial.providerLabNotRecorded) {
              desc.notRecorded = featureMetadata.nonCommercial.providerLabNotRecorded;
            } else {
              desc.value = featureMetadata.nonCommercial.providerLab;
            }
          } else if (desc.name === "Method") {
            if (featureMetadata.nonCommercial.method !== "") {
              desc.value = featureMetadata.nonCommercial.method;
            }
          } else if (desc.name === "Batch ID") {
            if (featureMetadata.nonCommercial.batchId !== "") {
              desc.value = featureMetadata.nonCommercial.batchId;
            }
          } else if (desc.name === "Comment") {
            if (featureMetadata.nonCommercial.sourceComment !== "") {
              desc.value = featureMetadata.nonCommercial.sourceComment;
            }
          }
        }
      });
  });

  setMetadataTemplate(template);
};

function getMetadataSubmitData(template) {
  var selectedItemByType;

  selectedItemByType = template[0];

  var dArray = [];
  var dgArray = [];
  var sgdArray = [];

  selectedItemByType.descriptors.forEach(d => {
    var dgDescriptors;
    if (d.descriptors) {
      dgDescriptors = d.descriptors;
    }

    dgArray = [];
    dgDescriptors &&
      dgDescriptors.forEach(dg => {
        //   var dDescriptors = dg.descriptors;
        sgdArray = [];
        if (dg.group) {
          dg.descriptors.forEach(sgd => {
            if (sgd.value || sgd.notRecorded) {
              sgdArray.push({
                name: sgd.name,
                ...getNotRecordedOrValue(sgd),
                //   value: sgd.value,
                unit: sgd.unit ? dg.unit : "",
                key: {
                  "@type": "descriptortemplate",
                  ...getkey(sgd)
                },
                "@type": "descriptor"
              });
            }
          });
        } else if (dg.value || dg.notRecorded) {
          dgArray.push({
            name: dg.name,
            ...getNotRecordedOrValue(dg),
            //   value: dg.value,
            unit: dg.unit ? dg.unit : "",
            key: {
              "@type": "descriptortemplate",
              ...getkey(dg)
            },
            "@type": "descriptor"
          });
        }

        if (sgdArray.length !== 0) {
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

  function getkey(descriptorGroup) {
    return descriptorGroup.id.startsWith("newly") ? { uri: descriptorGroup.uri } : { id: descriptorGroup.id };
  }

  function getNotRecordedOrValue(desc) {
    return desc.value ? { value: desc.value } : { notRecorded: desc.notRecorded };
  }
}

export { getMetadataSubmitData, updateMetadataTemplate, FeatureMetadata };
