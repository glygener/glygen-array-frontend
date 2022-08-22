import React, { useState, useEffect } from "react";
import { ErrorSummary } from "./ErrorSummary";
import CardLoader from "./CardLoader";
import { wsCall } from "../utils/wsUtils";
import  DescriptorTreeTable  from "./DescriptorTreeTable";

const CardDescriptor = (props) => {
  const [metadata, setMetadata] = useState();
  const [data, setData] = useState();
  const [showloading, setShowloading] = useState(false);
  const [pageErrorsJson, setPageErrorsJson] = useState({});
  const [pageErrorMessage, setPageErrorMessage] = useState("");
  const [showErrorSummary, setShowErrorSummary] = useState(false);
  const [descName, setDescName] = useState(props.name);

  useEffect(() => {
    if (props.metadataId) {
      setShowloading(true);
      wsCall(
        props.wsCall,
        "GET",
        [props.metadataId],
        props.useToken,
        null,
        (response) =>
          response.json().then((responseJson) => {
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
      response.json().then((responseJson) => {
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
      <div>
        <CardLoader pageLoading={showloading} />

        {showErrorSummary && (
          <ErrorSummary
            show={showErrorSummary}
            form="metadatakeypairs"
            errorJson={pageErrorsJson}
            errorMessage={pageErrorMessage}
          />
        )}

        <div className="p-1">
          {descName}:{" "}
          <span className="text_modal">{metadata && metadata.name ? metadata.name : ""}</span>
        </div>

        {metadata && metadata.description && (
          <div className="p-1">
            <span className="text_modal">{metadata.description}</span>
          </div>
        )}

        {metadata && (
          <div className="p-1">
          </div>
        )}

        {props.metadataId && data ? <DescriptorTreeTable data={data.data} rowCount={data.rowCount}/> : <span className="p-1">{"No data available"}</span>}
      </div>
    </>
  );
};

export { CardDescriptor };
