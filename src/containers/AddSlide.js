import Helmet from "react-helmet";
import PropTypes from "prop-types";
import { wsCall } from "../utils/wsUtils";
import { head, getMeta } from "../utils/head";
import { ErrorSummary } from "../components/ErrorSummary";
import { Form, Row, Col, Button } from "react-bootstrap";
import { useHistory, Prompt, useParams } from "react-router-dom";
import React, { useReducer, useState, useEffect } from "react";
import { FormLabel, Feedback } from "../components/FormControls";
import Container from "@material-ui/core/Container";
import { Card } from "react-bootstrap";
import { PageHeading } from "../components/FormControls";
import { Link } from "react-router-dom";
import { Loading } from "../components/Loading";
import { HelpToolTip } from "../components/tooltip/HelpToolTip";
import { Typography } from "@material-ui/core";
import wikiHelpTooltip from "../appData/wikiHelpTooltip";
import FeedbackWidget from "../components/FeedbackWidget";

const AddSlide = props => {
  let { slideId } = useParams();

  useEffect(() => {
    if (props.authCheckAgent) {
      props.authCheckAgent();
    }

    if (slideId) {
      setShowLoading(true);
      wsCall("getslide", "GET", [slideId], true, null, getSlideSuccess, wsCallFail);
      setTitle("Edit Slide");
      setSubTitle(
        "Update slide information. Name must be unique in your slide repository and cannot be used for more than one slide."
      );
    }
    fetchList("slidelayoutlist");
    fetchList("listprinters");
    fetchList("listslidemeta");
    fetchList("listprintrun");
  }, []);

  const [title, setTitle] = useState("Add Slide to Repository");
  const [subTitle, setSubTitle] = useState("Please provide the information and create the grid for the new slide.");

  const history = useHistory();
  const [validated, setValidated] = useState(false);
  const [listPrinters, setListPrinters] = useState([]);
  const [listPrintRun, setListPrintRun] = useState([]);
  const [enablePrompt, setEnablePrompt] = useState(false);
  const [pageErrorsJson, setPageErrorsJson] = useState({});
  const [listSlideMetas, setListSlideMetas] = useState([]);
  const [duplicateName, setDuplicateName] = useState(false);
  const [pageErrorMessage, setPageErrorMessage] = useState("");
  const [listSlideLayouts, setListSlideLayouts] = useState([]);
  const [showErrorSummary, setShowErrorSummary] = useState(false);
  const [showLoading, setShowLoading] = useState(false);

  const slideFormState = {
    id: "",
    name: "",
    description: "",
    layout: "",
    printer: "",
    printRun: "",
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
      label: "Printer Metadata",
      name: "printer",
      value: slide.printer,
      list: listPrinters,
      message: "Printer Metadata"
    },
    {
      label: "Print Run Metadata",
      name: "printRun",
      value: slide.printRun,
      list: listPrintRun,
      message: "Print Run Metadata"
    },
    {
      label: "Slide Metadata",
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
        let slLayouts = responseJson;
        if (responseJson && responseJson.rows) {
          slLayouts.rows = responseJson.rows.filter(obj => obj.status === "DONE");
        }
        setListSlideLayouts(slLayouts);
      } else if (fetch === "listslidemeta") {
        setListSlideMetas(responseJson);
      } else if (fetch === "listprinters") {
        setListPrinters(responseJson);
      } else if (fetch === "listprintrun") {
        setListPrintRun(responseJson);
      }
      setShowLoading(false);
    });
  }

  function getSlideSuccess(response) {
    response.json().then(responseJson => {
      setSlide({
        id: responseJson.id,
        name: responseJson.name,
        description: responseJson.description,
        layout: responseJson.layout.name,
        printer: responseJson.printer && responseJson.printer.name,
        printRun: responseJson.printRun && responseJson.printRun.name,
        metadata: responseJson.metadata.name
      });
    });
  }

  function wsCallFail(response) {
    response.json().then(responseJson => {
      setPageErrorsJson(responseJson);
      setShowErrorSummary(true);
      setShowLoading(false);
    });
  }

  function handleSubmit(e) {
    setValidated(true);

    setShowLoading(true);
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
          printer: { name: slide.printer, type: "PRINTER" },
          printRun: { name: slide.printRun, type: "PRINTRUN" },
          metadata: { name: slide.metadata, type: "SLIDE" }
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
    setEnablePrompt(false);
    setShowLoading(false);
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
      setShowLoading(false);
    });
  }

  const slideForm = () => {
    return (
      <>
        <Helmet>
          <title>{head.addSlideMeta.title}</title>
          {getMeta(head.addSlideMeta)}
        </Helmet>
        <FeedbackWidget />
        <Container maxWidth="xl">
          <div className="page-container">
            <PageHeading title={title} subTitle={subTitle} />

            <Typography className="text-right" gutterBottom>
              <HelpToolTip
                title={wikiHelpTooltip.slide.generic_information.title}
                text={wikiHelpTooltip.tooltip_text}
                url={wikiHelpTooltip.slide.generic_information.url}
              />
              {wikiHelpTooltip.help_text}
            </Typography>
            <Card>
              <Card.Body>
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
                  <Form.Group as={Row} controlId="name" className="gg-align-center mb-3">
                    <Col xs={12} lg={9}>
                      <FormLabel label="Name" className="required-asterik" />
                      <Form.Control
                        type="text"
                        name="name"
                        placeholder="Enter Name"
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

                  <Form.Group as={Row} controlId="description" className="gg-align-center mb-3">
                    <Col xs={12} lg={9}>
                      <FormLabel label="Description" />
                      <Form.Control
                        as="textarea"
                        rows={4}
                        name="description"
                        placeholder="Enter Description"
                        value={slide.description}
                        onChange={handleChange}
                        maxLength={2000}
                      />
                      <div className="text-right text-muted">
                        {slide.description && slide.description.length > 0 ? slide.description.length : "0"}
                        /2000
                      </div>
                    </Col>
                  </Form.Group>

                  {FormData.map((element, index) => {
                    return (
                      <div key={index}>
                        <Form.Group as={Row} controlId={index} className="gg-align-center mb-3">
                          <Col xs={12} lg={9}>
                            <FormLabel label={element.label} className="required-asterik" />
                            <Form.Control
                              as="select"
                              name={element.name}
                              value={element.value}
                              onChange={handleSelect}
                              required={true}
                            >
                              <option value="">Select {element.label}</option>
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
                  <div className="text-center mb-2">
                    <Link to="/slides">
                      <Button
                        className={`${slideId ? "gg-btn-outline mt-2 gg-mr-20" : "gg-btn-outline mt-2 gg-mr-20"}`}
                      >
                        {slideId ? "Cancel" : "Back to Slides"}
                      </Button>
                    </Link>
                    <Button type="submit" disabled={duplicateName} className="gg-btn-blue mt-2 gg-ml-20">
                      Submit
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </div>
        </Container>
        <Loading show={showLoading} />
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
