import React, { useState, useEffect } from "react";
import { TreeTable, TreeState, expandAll } from "cp-react-tree-table"
import { Form, Row, Col, Modal, Button } from "react-bootstrap";
import { ErrorSummary } from "../components/ErrorSummary";
import CardLoader from "../components/CardLoader";
import { wsCall } from "../utils/wsUtils";
import "./ViewDescriptor.css";

const MOCK_DATA = genData();
const ViewDescriptor = props =>  {

  const [treeValue, setTreeValue] = useState(TreeState.create(MOCK_DATA));
  const [metadata, setMetadata] = useState();
  const [showloading, setShowloading] = useState(true);
  const [pageErrorsJson, setPageErrorsJson] = useState({});
  const [pageErrorMessage, setPageErrorMessage] = useState("");
  const [showErrorSummary, setShowErrorSummary] = useState(false);


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
            let descObj = [];
            let descObjUniArr = [];

            for (let  i = 0; i < responseJson.descriptors.length; i++) {
              descObj.push(addDescriptor(responseJson.descriptors[i]));
            }

            for (let i = 0; i < responseJson.descriptorGroups.length; i++) {
              let temp = responseJson.descriptorGroups[i];
              let id = "";
              if ((temp.notRecorded ||  temp.notApplicable) &&  temp.key && temp.key.mandateGroup) {
                id = temp.key.mandateGroup.id;
              }
    
              if (id === "" || !descObjUniArr.includes(id)){
                descObjUniArr.push(id);
                descObj.push(addDescriptorGroup(temp));
              }
            }

            descObj.sort((obj1, obj2) => obj1.data.order - obj2.data.order);
            setTreeValue(TreeState.expandAll(TreeState.create(descObj)));
            props.setShowModal(true);
            setShowloading(false);
          }),
        errorWscall
      );
    }

    function errorWscall(response) {
      response.json().then(responseJson => {
        console.log(responseJson);
        setPageErrorsJson(responseJson);
        setPageErrorMessage("");
        setShowErrorSummary(true);
        setShowloading(false);
      });
    }

    function addDescriptor(descriptor) {
        let unit = descriptor.unit && descriptor.unit !== "" ? descriptor.unit : "";
        let value = descriptor.notRecorded ? "Not Recorded" : descriptor.notApplicable ? "Not Applicable" : descriptor.value === "" ? "Information Missing" : descriptor.value + " " + unit;
        let temp = {
          data: {
            name: descriptor.name,
            value: value,
            order: descriptor.order
          }
        };
      return temp;
    }

    function addDescriptorGroup(descGroup) {
      let descObjArr = [];
      let descObjUniArr = [];

      for (let  i = 0; i < descGroup.descriptors.length; i++) {
        if (descGroup.descriptors[i].group) {
          let temp = descGroup.descriptors[i];
          let id = "";
          if ((temp.notRecorded ||  temp.notApplicable) &&  temp.key && temp.key.mandateGroup) {
            id = temp.key.mandateGroup.id;
          }

          if (id === "" || !descObjUniArr.includes(id)) {
            descObjUniArr.push(id);
            descObjArr.push(addDescriptorGroup(temp));
          }
        } else {
          descObjArr.push(addDescriptor(descGroup.descriptors[i]));
        }
      }

      let name = descGroup.name;
      if ((descGroup.notRecorded ||  descGroup.notApplicable) &&  descGroup.key && descGroup.key.mandateGroup) {
        name = descGroup.key.mandateGroup.name;
      }
      let value = descGroup.notRecorded ? "Not Recorded" : descGroup.notApplicable ? "Not Applicable" : "";
      let temp = {
        data: {
          name: name,
          value: value,
          order: descGroup.order,
        },
        children: descObjArr.length === 0 ? undefined : descObjArr.sort((obj1, obj2) => obj1.data.order - obj2.data.order) 
      };
      return temp;
    }


  }, []);

  const handleOnChange = (newValue) => {
    setTreeValue(newValue);
  }

  const renderNameCell = (row) => {
    return (
      <div style={{ paddingLeft: (row.metadata.depth * 15) + 'px'}}
        className={row.metadata.hasChildren ? 'with-children' : 'without-children'}>
        
        {(row.metadata.hasChildren)
          ? (
              <button className={row.$state.isExpanded ? "toggle-button-ex" : "toggle-button"} onClick={row.toggleChildren}></button>
            )
          : ''
        }
        
        <span>{row.data.name}</span>
      </div>
    );
  }

  const renderValueCell = (row) => {
    return (
      <div className="value-cell">{row.data.value}</div>
    );
  } 
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
      <div>
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-vcenter">
            {props.name}: {metadata ? metadata.name : ""}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
        {showErrorSummary && (<ErrorSummary
          show={showErrorSummary}
          form="metadatakeypairs"
          errorJson={pageErrorsJson}
          errorMessage={pageErrorMessage}
        />)}
        {props.isSample && metadata && metadata.template && (<p>Template: <span className="text_modal">{metadata.template}</span></p>)}
        {metadata && (<p>Description: <span className="text_modal">{metadata.description}</span></p>)}
    	<TreeTable
          value={treeValue}
          onChange={handleOnChange}>
        <TreeTable.Column basis="220px" grow="0"
          renderCell={renderNameCell}
          renderHeaderCell={() => <span>Name</span>}/>
        <TreeTable.Column
          renderCell={renderValueCell}
          renderHeaderCell={() => <span clas1sName="t-right">Value</span>}/>
      </TreeTable>
      </Modal.Body>
      </div>

      <Modal.Footer>
        <Button className="gg-btn-blue-reg" onClick={() => props.setShowModal(false)}>
          OK
        </Button>
      </Modal.Footer>

      </Modal>

      </>
    );
  //}

}

function genData() {
	return [
    {
      data: { name: '', value: '' },
    },
  ];
}

export { ViewDescriptor };
