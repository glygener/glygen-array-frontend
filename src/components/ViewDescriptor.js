import React, { useState, useEffect } from "react";
import { Form, Row, Col, Modal, Button } from "react-bootstrap";
import { ErrorSummary } from "../components/ErrorSummary";
import CardLoader from "../components/CardLoader";
import { wsCall } from "../utils/wsUtils";
import  DescriptorTreeTable  from "./DescriptorTreeTable";


const ViewDescriptor = props =>  {

  const [metadata, setMetadata] = useState();
  const [data, setData] = useState();
  const [showloading, setShowloading] = useState(true);
  const [pageErrorsJson, setPageErrorsJson] = useState({});
  const [pageErrorMessage, setPageErrorMessage] = useState("");
  const [showErrorSummary, setShowErrorSummary] = useState(false);
  const [descName, setDescName] = useState(props.name);


  useEffect(() => {
    if (props.metadataId) {
      wsCall(
        props.wsCall,
        "GET",
        [props.metadataId],
        props.useToken,
        null,
        response =>
          response.json().then(responseJson => {
            setMetadata(responseJson);

            let name = props.name;
            if (props.isSample) {
              let template = "";
              template = responseJson && responseJson.template ? responseJson.template.replace("Sample", "").trim() : ""
              if (template !== "") {
                name = name + " (" + template +")";
              }
            }
            setDescName(name);

            let descObj = [];
            let descObjUniArr = [];
            let result = {count: 0};

            for (let i = 0; i < responseJson.descriptors.length; i++) {
              descObj.push(addDescriptor(responseJson.descriptors[i]));
            }

            for (let i = 0; i < responseJson.descriptorGroups.length; i++) {
              let temp = responseJson.descriptorGroups[i];
              let id = "";
              if (
                (temp.notRecorded || temp.notApplicable) &&
                temp.key &&
                temp.key.mandateGroup
              ) {
                id = temp.key.mandateGroup.id;
              }

              if (id === "" || !descObjUniArr.includes(id)) {
                descObjUniArr.push(id);
                descObj.push(addDescriptorGroup(temp, result));
              }
            }

            if (descObj.length > 0) {
              result.count += descObj.length;
            }

            descObj.sort((obj1, obj2) => obj1.order - obj2.order);
            setData({data: descObj, rowCount: result.count});
            setShowloading(false);
          }),
        errorWscall
      );
    }

    function errorWscall(response) {
      response.json().then(responseJson => {
        setPageErrorsJson(responseJson);
        setPageErrorMessage("");
        setShowErrorSummary(true);
        setShowloading(false);
      });
    }

    
    function addDescriptor(descriptor) {
      let unit =
        descriptor.unit && descriptor.unit !== "" ? descriptor.unit : "";
      let value = descriptor.notRecorded
        ? "Not Recorded"
        : descriptor.notApplicable
        ? "Not Applicable"
        : descriptor.value === ""
        ? "Information Missing"
        : descriptor.value + " " + unit;
      let temp = {
          name: descriptor.name,
          value: value,
          order: descriptor.order,
      };
      return temp;
    }

    function addDescriptorGroup(descGroup, result) {
      let descObjArr = [];
      let descObjUniArr = [];

      for (let i = 0; i < descGroup.descriptors.length; i++) {
        if (descGroup.descriptors[i].group) {
          let temp = descGroup.descriptors[i];
          let id = "";
          if (
            (temp.notRecorded || temp.notApplicable) &&
            temp.key &&
            temp.key.mandateGroup
          ) {
            id = temp.key.mandateGroup.id;
          }

          if (id === "" || !descObjUniArr.includes(id)) {
            descObjUniArr.push(id);
            descObjArr.push(addDescriptorGroup(temp, result));
          }
        } else {
          descObjArr.push(addDescriptor(descGroup.descriptors[i]));
        }
      }

      if (descObjArr.length > 0) {
        result.count += descObjArr.length;
      }

      let name = descGroup.name;
      if (
        (descGroup.notRecorded || descGroup.notApplicable) &&
        descGroup.key &&
        descGroup.key.mandateGroup
      ) {
        name = descGroup.key.mandateGroup.name;
      }
      let value = descGroup.notRecorded
        ? "Not Recorded"
        : descGroup.notApplicable
        ? "Not Applicable"
        : "";
      let temp = {
          name: name,
          value: value,
          order: descGroup.order,
          children:
            descObjArr.length === 0
              ? undefined
              : descObjArr.sort(
                  (obj1, obj2) => obj1.order - obj2.order
                ),
      };
      return temp;
    }
  }, []);

    return (
        <>
        <Modal
          show={props.showModal}
          animation={false}
          size="xl"
          aria-labelledby="contained-modal-title-vcenter"
          centered
          onHide={() => props.setShowModal(false)}
        >
      <CardLoader pageLoading={showloading} />
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-vcenter">
            {descName}: {metadata ? metadata.name : ""}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
        {showErrorSummary && (<ErrorSummary
          show={showErrorSummary}
          form="metadatakeypairs"
          errorJson={pageErrorsJson}
          errorMessage={pageErrorMessage}
        />)}
        {metadata && metadata.description && (<div className="p-1 pb-2"><div className="text_desc">{metadata.description}</div></div>)}
        <div className="pt-1 pl-1" style={{maxHeight:"290px", overflow: "scroll"}}> 
          {data && data.data && <DescriptorTreeTable data={data.data} rowCount={data.rowCount}/>} 
        </div>
      </Modal.Body>

      <Modal.Footer>
        <Button className="gg-btn-blue-reg" onClick={() => props.setShowModal(false)}>
          OK
        </Button>
      </Modal.Footer>

      </Modal>

      </>
    );
}

function genData() {
	return [
    {
      data: { name: '', value: '' },
    },
  ];
}

export { ViewDescriptor };
