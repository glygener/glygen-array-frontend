import Helmet from "react-helmet";
import PropTypes from "prop-types";
import { wsCall } from "../utils/wsUtils";
import { head, getMeta } from "../utils/head";
import { ErrorSummary } from "../components/ErrorSummary";
import { Form, Row, Col, Button } from "react-bootstrap";
import { useHistory, Prompt, useParams } from "react-router-dom";
import React, { useReducer, useState, useEffect } from "react";
import { FormLabel, Feedback, Title } from "../components/FormControls";

const AddSlide = props => {
  let { slideId } = useParams();

  useEffect(() => {
    if (props.authCheckAgent) {
      props.authCheckAgent();
    }

    if (slideId) {
      wsCall("getslide", "GET", [slideId], true, null, getSlideSuccess, wsCallFail);
    }
    fetchList("slidelayoutlist");
    fetchList("listprinters");
    fetchList("listslidemeta");
  }, []);

  const history = useHistory();
  const [validated, setValidated] = useState(false);
  const [listPrinters, setListPrinters] = useState([]);
  const [enablePrompt, setEnablePrompt] = useState(false);
  const [pageErrorsJson, setPageErrorsJson] = useState({});
  const [listSlideMetas, setListSlideMetas] = useState([]);
  const [duplicateName, setDuplicateName] = useState(false);
  const [pageErrorMessage, setPageErrorMessage] = useState("");
  const [listSlideLayouts, setListSlideLayouts] = useState([]);
  const [showErrorSummary, setShowErrorSummary] = useState(false);

  const slideFormState = {
    id: "",
    name: "",
    description: "",
    layout: "",
    printer: "",
    metadata: ""
  };

  const [slide, setSlide] = useReducer((state, newState) => ({ ...state, ...newState }), slideFormState);

  const FormData = [
    {
      label: "Slide Layout",
      name: "layout",
      value: slide.layout,
      list: listSlideLayouts,
      message: "Slide Layout"
    },
    {
      label: "Printer Meta",
      name: "printer",
      value: slide.printer,
      list: listPrinters,
      message: "Printer Metadata"
    },
    {
      label: "Slide Meta",
      name: "metadata",
      value: slide.metadata,
      list: listSlideMetas,
      message: "Slide Metadata"
    }
  ];

  const handleChange = e => {
    const name = e.target.name;
    const value = e.target.value;

    if (name === "name") {
      setDuplicateName(false);
    }
    setSlide({ [name]: value });
  };

  const handleSelect = e => {
    const name = e.target.name;
    const selected = e.target.options[e.target.selectedIndex].value;
    setSlide({ [name]: selected });
  };

  function fetchList(fetch) {
    wsCall(
      fetch,
      "GET",
      { offset: "0", loadAll: false },
      true,
      null,
      response => listSuccess(response, fetch),
      wsCallFail
    );
  }

  function listSuccess(response, fetch) {
    response.json().then(responseJson => {
      if (fetch === "slidelayoutlist") {
        setListSlideLayouts(responseJson);
      } else if (fetch === "listslidemeta") {
        setListSlideMetas(responseJson);
      } else if (fetch === "listprinters") {
        setListPrinters(responseJson);
      }
    });
  }

  function getSlideSuccess(response) {
    response.json().then(responseJson => {
      setSlide({
        id: responseJson.id,
        name: responseJson.name,
        description: responseJson.description,
        layout: responseJson.layout.name,
        printer: responseJson.printer.name,
        metadata: responseJson.metadata.name
      });
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
      wsCall(
        slideId ? "updateprintedslide" : "addprintedslide",
        "POST",
        null,
        true,
        {
          id: getIdForUpdatePrintedSlide(),
          name: slide.name,
          description: slide.description,
          layout: { name: slide.layout },
          printer: { name: slide.printer },
          metadata: { name: slide.metadata }
        },
        addSlideSuccess,
        addSlideFailure
      );
    }

    e.preventDefault();
  }

  function getIdForUpdatePrintedSlide() {
    return slideId ? slide.id : "";
  }

  function addSlideSuccess(response) {
    console.log(response);
    setEnablePrompt(false);
    history.push("/slides");
  }

  function addSlideFailure(response) {
    var formError = false;

    response.json().then(responseJson => {
      responseJson.errors &&
        responseJson.errors.forEach(element => {
          if (element.objectName === "name") {
            formError = true;
            setValidated(false);
            setDuplicateName(true);
          }
        });

      if (!formError) {
        setPageErrorsJson(responseJson);
        setShowErrorSummary(true);
        setPageErrorMessage("");
      }
    });
  }

  const slideForm = () => {
    return (
      <>
        <Helmet>
          <title>{head.addSlideMeta.title}</title>
          {getMeta(head.addSlideMeta)}
        </Helmet>

        <div className="page-container">
          <Title title="Create Slide" />

          {showErrorSummary === true && (
            <ErrorSummary
              show={showErrorSummary}
              form="slides"
              errorJson={pageErrorsJson}
              errorMessage={pageErrorMessage}
            ></ErrorSummary>
          )}

          {enablePrompt && <Prompt message="If you leave you will lose this data!" />}

          <Form noValidate validated={validated} onSubmit={e => handleSubmit(e)}>
            <Form.Group as={Row} controlId="name">
              <FormLabel label="Name" className="required-asterik" />
              <Col md={5}>
                <Form.Control
                  type="text"
                  name="name"
                  placeholder="name"
                  value={slide.name}
                  onChange={handleChange}
                  required
                  isInvalid={duplicateName}
                />
                <Feedback
                  message={
                    duplicateName
                      ? "Another slide  has the same Name. Please use a different Name."
                      : "Name is required"
                  }
                />
              </Col>
            </Form.Group>

            <Form.Group as={Row} controlId="description">
              <FormLabel label="Description" />
              <Col md={5}>
                <Form.Control
                  as="textarea"
                  rows={4}
                  name="description"
                  placeholder="description"
                  value={slide.description}
                  onChange={handleChange}
                  maxLength={2000}
                />
                <span className="character-counter">
                  {slide.description && slide.description.length > 0 ? slide.description.length : ""}
                  /2000
                </span>
              </Col>
            </Form.Group>

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
                        {element.list.rows &&
                          element.list.rows.map((element, index) => {
                            return (
                              <option key={index} value={element.name}>
                                {element.name}
                              </option>
                            );
                          })}
                      </Form.Control>
                      <Feedback message={`${element.message} is required`}></Feedback>
                    </Col>
                  </Form.Group>
                </div>
              );
            })}

            <Button type="submit" disabled={duplicateName}>
              {slideId ? "Update" : "Submit"}
            </Button>
          </Form>
        </div>
      </>
    );
  };

  return <>{slideForm()}</>;
};

AddSlide.propTypes = {
  authCheckAgent: PropTypes.func,
  match: PropTypes.object
};

export { AddSlide };
