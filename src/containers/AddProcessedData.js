import Helmet from "react-helmet";
import PropTypes from "prop-types";
import { head, getMeta } from "../utils/head";
import { Form, Row, Col, Button } from "react-bootstrap";

import { getWsUrl, wsCall } from "../utils/wsUtils";
import { ErrorSummary } from "../components/ErrorSummary";
import React, { useEffect, useState, useReducer } from "react";
import { ResumableUploader } from "../components/ResumableUploader";
import { useHistory, Prompt, Link, useParams } from "react-router-dom";
import { FormLabel, Feedback, Title, FormButton } from "../components/FormControls";
import FeedbackWidget from "../components/FeedbackWidget";

const AddProcessedData = props => {
  let { experimentId, processedDataId } = useParams();
  var base = process.env.REACT_APP_BASENAME;

  useEffect(() => {
    if (props.authCheckAgent) {
      props.authCheckAgent();
    }

    const fetchList = fetch => {
      wsCall(
        fetch,
        "GET",
        processedDataId && fetch === "getprocesseddata" ? [processedDataId] : { offset: "0", loadAll: false },
        true,
        null,
        response => listSuccess(response, fetch),
        wsCallFail
      );
    };

    fetchList("statisticalmethods");
    fetchList("listdataprocessing");
    fetchList("supportedprocessedfileformats");

    if (processedDataId) {
      fetchList("getprocesseddata");
    }
  }, []);

  const history = useHistory();
  const [uploadedDF, setUploadedDF] = useState();
  const [validated, setValidated] = useState(false);
  const [enablePrompt, setEnablePrompt] = useState(false);
  const [pageErrorsJson, setPageErrorsJson] = useState({});
  const [pageErrorMessage, setPageErrorMessage] = useState("");
  const [showErrorSummary, setShowErrorSummary] = useState(false);
  const [listDataProcessing, setListDataProcessing] = useState([]);
  const [statisticalMethods, setStatisticalMethods] = useState([]);

  const [supportedProcessedFF, setSupportedProcessedFF] = useState([]);

  const defaultFileType = "*/*";

  const processDataState = {
    id: "",
    dataProcessing: "",
    statisticalMethod: "",
    supportedProcessedFF: "",
    fileType: defaultFileType
  };

  const [processData, setProcessData] = useReducer((state, newState) => ({ ...state, ...newState }), processDataState);

  const FormData = [
    {
      label: "Data Processing",
      name: "dataProcessing",
      value: processData.dataProcessing,
      list: listDataProcessing,
      message: "Data Processing"
    },
    {
      label: "Statistical Method",
      name: "statisticalMethod",
      value: processData.statisticalMethod,
      list: statisticalMethods,
      message: "Statistical Method"
    },
    {
      label: "Supported Processed File Format",
      name: "supportedProcessedFF",
      value: processData.supportedProcessedFF,
      list: supportedProcessedFF,
      message: "Supported Processed File Format"
    }
  ];

  const handleSelect = e => {
    const name = e.target.name;
    const selectedValue = e.target.options[e.target.selectedIndex].value;
    setProcessData({ [name]: selectedValue });
  };

  function listSuccess(response, fetch) {
    response.json().then(responseJson => {
      if (fetch === "listdataprocessing") {
        setListDataProcessing(responseJson);
      } else if (fetch === "statisticalmethods") {
        setStatisticalMethods(responseJson);
      } else if (fetch === "supportedprocessedfileformats") {
        setSupportedProcessedFF(responseJson);
      } else if (fetch === "getprocesseddata") {
        // const method = statisticalMethods.find(i => i.uri === responseJson.method.uri);
        setProcessData({
          statisticalMethod: responseJson.method.name,
          dataProcessing: responseJson.metadata.name,
          supportedProcessedFF: responseJson.file.fileFormat,
          id: responseJson.id
        });
      }
    });
  }

  function wsCallFail(response) {
    response.json().then(responseJson => {
      setPageErrorsJson(responseJson);
      setShowErrorSummary(true);
    });
  }

  function handleSubmit(e) {
    setValidated(true);

    if (e.currentTarget.checkValidity()) {
      if (uploadedDF) {
        uploadedDF.fileFormat = processData.supportedProcessedFF;

        setShowErrorSummary(false);
        wsCall(
          "addprocessdatafromexcel",
          "POST",
          {
            arraydatasetId: experimentId,
            methodName: processData.statisticalMethod,
            metadataId: getMetadataID()

            // processData.dataProcessing
          },
          true,
          {
            identifier: uploadedDF.identifier,
            originalName: uploadedDF.originalName,
            fileFolder: uploadedDF.fileFolder,
            fileFormat: uploadedDF.fileFormat
          },
          // eslint-disable-next-line no-unused-vars
          response => {
            setEnablePrompt(false);
            history.push("/experiments/editExperiment/" + experimentId);
          },
          addProcessDataFailure
        );
      } else {
        setValidated(false);
        setPageErrorMessage("File is required, Please choose.");
        setShowErrorSummary(true);
      }
    }

    e.preventDefault();
  }

  function getMetadataID() {
    const metaData = listDataProcessing.rows.find(i => i.name === processData.dataProcessing);
    return metaData.id;
  }

  function addProcessDataFailure(response) {
    if (response.status == "408") {
      history.push("/experiments/editExperiment/" + experimentId);
    } else {
      response.json().then(responseJson => {
        if (responseJson.errorCode === "INTERNAL_ERROR") {
          setPageErrorMessage("Cannot add the Process Data to repository. Please fix the file and upload again");
        } else {
          setPageErrorMessage("");
          setPageErrorsJson(responseJson);
        }
        setShowErrorSummary(true);
      });
    }
  }

  const getSelectionList = (list, format) => {
    if (list.rows && list.rows.length > 0) {
      return list.rows.map((element, index) => {
        return (
          <option key={index} value={element.name}>
            {element.name}
          </option>
        );
      });
    } else if (list.length > 0) {
      return list.map((element, index) => {
        if (format.length > 0) {
          return (
            <option key={index} value={element.name}>
              {element.name}
            </option>
          );
        } else {
          return (
            <option key={index} value={element}>
              {element}
            </option>
          );
        }
      });
    }
  };

  const processDataForm = () => {
    return (
      <>
        <Helmet>
          <title>{head.addProcessData.title}</title>
          {getMeta(head.addProcessData)}
        </Helmet>
        <FeedbackWidget />
        <div className="page-container">
          <Title title="Add Process Data" />

          {showErrorSummary === true && (
            <ErrorSummary
              show={showErrorSummary}
              form="processdata"
              errorJson={pageErrorsJson}
              errorMessage={pageErrorMessage}
            ></ErrorSummary>
          )}

          {enablePrompt && <Prompt message="If you leave you will lose this data!" />}

          <Form.Group as={Row} controlId="fileUploader2">
            <FormLabel label={" Data File"} className="required-asterik" />
            <Col md={{ offset: 5, span: 8 }}>
              <ResumableUploader
                history={history}
                headerObject={{
                  Authorization: window.localStorage.getItem(base ? base + "_token" : "token") || "",
                  Accept: "*/*",
                }}
                fileType={processData.fileType}
                uploadService={getWsUrl("upload")}
                maxFiles={1}
                setUploadedFile={setUploadedDF}
                onProcessFile={() => {}}
                // filetypes={["xlsx", "xls", "csv", "xltx", "xlt", "xlsm", "xlsb", "xltm", "xla", "xlam"]}
              />
            </Col>
          </Form.Group>

          <Form noValidate validated={validated} onSubmit={e => handleSubmit(e)}>
            {FormData.map((element, index) => {
              return (
                <div key={index}>
                  <Form.Group as={Row} controlId={index}>
                    <FormLabel label={element.label} className="required-asterik" />
                    <Col md={5}>
                      <Form.Control
                        as="select"
                        name={element.name}
                        value={element.value}
                        onChange={handleSelect}
                        required={true}
                      >
                        <option value="">select</option>
                        {element.name === "statisticalMethod"
                          ? getSelectionList(element.list, "statisticalMethod")
                          : getSelectionList(element.list, "")}
                      </Form.Control>
                      <Feedback message={`${element.message} is required`}></Feedback>
                    </Col>
                  </Form.Group>
                </div>
              );
            })}

            <div className="text-center mb-4 mt-4">
              <Link to={`/experiments/editExperiment/` + experimentId}>
                <Button className="gg-btn-outline mt-2 gg-mr-20">Cancel</Button>
              </Link>
              <Button className="line-break-2" type="gg-btn-blue mt-2 gg-ml-20">
                {processedDataId ? "Update" : "Submit"}
              </Button>
            </div>
          </Form>
        </div>
      </>
    );
  };

  return <>{processDataForm()}</>;
};

AddProcessedData.propTypes = {
  authCheckAgent: PropTypes.func,
  match: PropTypes.object
};

export { AddProcessedData };
