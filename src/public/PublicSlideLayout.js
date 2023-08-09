/* eslint-disable react/prop-types */
import React, { useState, useEffect, useReducer } from "react";
import "../css/Search.css";
import "./PublicDataset.css";
import { getBlockDimension } from "../components/SlideTable.js"
import { Row, Col, Button, Card, Form, Image } from "react-bootstrap";
import { wsCall } from "../utils/wsUtils";
import { ErrorSummary } from "../components/ErrorSummary";
import { useParams, useHistory } from "react-router-dom";
import Helmet from "react-helmet";
import { head, getMeta } from "../utils/head";
import { Title } from "../components/FormControls";
import { ViewDescriptor } from "../components/ViewDescriptor";
import { GlygenGrid } from "../components/GlygenGrid";
import { SelectedSpotsSlide, SpotInformationBlock } from "../components/SpotInformation";
import { ColorNotation } from "../components/ColorNotation";

const PublicSlideLayout = () => {
    let { slideId } = useParams();

    const history = useHistory();
    const [slide, setSlide] = useState();
    const [enableMetadata, setEnableMetadata] = useState(false);
    const [descOpen, setDescOpen] = useState(false);
    const [pageErrorsJson, setPageErrorsJson] = useState({});
    const [pageErrorMessage, setPageErrorMessage] = useState("");
    const [showErrorSummary, setShowErrorSummary] = useState(false);
    const [pageErrorsJsonData, setPageErrorsJsonData] = useState({});
    const [pageErrorMessageData, setPageErrorMessageData] = useState("");
    const [showErrorSummaryData, setShowErrorSummaryData] = useState(false);
    const [showloadingData, setShowloadingData] = useState(false);
    const [showPrinter, setShowPrinter] = useState(false);
    const [showPrintrun, setShowPrintrun] = useState(false);
    const [showSlideMetadata, setShowSlideMetadata] = useState(false);

    const [arraySelected, setArraySelected] = useState(new Map());
    const [spotsSelected, setSpotsSelected] = useState(new Map());
    const [blockCard, setBlockCard] = useState();

    const gridSize = {
        name: "",
        description: "",
        cols: "",
        rows: "",
    };

    const gridSizeUpdated = {
        name: "",
        description: "",
        cols: "",
        rows: "",
    };

    const [gridParams, setGridParams] = useReducer((state, newState) => ({ ...state, ...newState }), gridSize);

    const [updatedGridParams, setUpdatedGridParams] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        gridSizeUpdated
    );

    useEffect(() => {
        wsCall(
            "getpublicprintedslide",
            "GET",
            { qsParams: { loadAll: false }, urlParams: [slideId] },
            false,
            null,
            response =>
                response.json().then(responseJson => {
                    setSlide(responseJson);
                    setSlideLayoutData(responseJson.layout);
                }),
            errorWscall
        );
    }, [slideId]);

    function errorWscall(response) {
        response.json().then(responseJson => {
            setPageErrorsJson(responseJson);
            setPageErrorMessage("");
            setShowErrorSummary(true);
        });
    }

    function setSlideLayoutData(slidelayout) {
        setGridParams(updateBlockGridParams(slidelayout));
        setUpdatedGridParams(updateBlockGridParams(slidelayout));

        var spots = new Map();

        slidelayout.blocks.forEach(spotElement => {
            spots.set(spotElement.row + "," + spotElement.column, {
                selectedRow: spotElement.row,
                selectedCol: spotElement.column,
                blockSelected: {
                    name: spotElement.blockLayout.name,
                    id: spotElement.blockLayout.id,
                },
                selectCount: 0,
            });
        });

        setArraySelected(spots);
        setSpotsSelected(spots);
    }

    function updateBlockGridParams(slidelayout) {
        return {
            name: slidelayout.name,
            description: slidelayout.description,
            cols: slidelayout.width,
            rows: slidelayout.height
        };
    }


    const getDetails = () => {
        return (
            <>
                {showPrinter && <ViewDescriptor metadataId={slide.printer.id} showModal={showPrinter}
                    setShowModal={setShowPrinter}
                    wsCall={"getpublicprinter"} useToken={false} name={"Printer"} isSample={false} />}
                {showPrintrun && <ViewDescriptor metadataId={slide.printRun.id} showModal={showPrintrun}
                    setShowModal={setShowPrintrun}
                    wsCall={"getpublicprintrun"} useToken={false} name={"Printrun"} isSample={false} />}
                {showSlideMetadata && <ViewDescriptor metadataId={slide.metadata.id} showModal={showSlideMetadata}
                    setShowModal={setShowSlideMetadata}
                    wsCall={"getslidemetadata"} useToken={false} name={"Slide Metadata"} isSample={false} />}
                <div>
                    <strong>Name: </strong>
                    {slide.name}
                </div>
                <div>
                    <strong>Dimensions: </strong>
                    {getBlockDimension(slide.layout)}
                </div>
                <div>
                    <Button
                        className={"lnk-btn lnk-btn-left"}
                        variant="link"
                        onClick={() => {
                            setShowPrinter(true);
                        }}
                    >
                        {slide.printer.name}
                    </Button>
                </div>
                <div>
                    <Button
                        className={"lnk-btn lnk-btn-left"}
                        variant="link"
                        onClick={() => {
                            setShowPrintrun(true);
                        }}
                    >
                        {slide.printRun.name}
                    </Button>
                </div>
                <div>
                    <Button
                        className={"lnk-btn lnk-btn-left"}
                        variant="link"
                        onClick={() => {
                            setShowSlideMetadata(true);
                        }}
                    >
                        {slide.metadata.name}
                    </Button>
                </div>

                {slide.description && (
                    <div>
                        <strong>Description: </strong>
                        {getDescription(slide.description)}
                        <button className={"more-less"} onClick={() => setDescOpen(!descOpen)}>
                            {slide.description.length > 150 && !descOpen ? `more` : descOpen ? `less` : ``}
                        </button>
                    </div>
                )}
            </>
        );
    };

    const getDescription = desc => {
        return desc.length > 150 && !descOpen ? `${desc.substring(0, 100)}...` : descOpen ? `${desc}` : desc;
    };

    // Update the object with selected and deselected spots
    const updateSelectedArray = (row, col) => {
        var spots = new Map(arraySelected);
        var selectedSpot = spots.get(row + "," + col);
        return selectedSpot ? gridForUpdateSlide(spots, selectedSpot) : "";
    };

    const gridForUpdateSlide = (spots, selectedSpot) => {
        if (blockCard) {
            var itr = spots.entries();

            for (var pair of itr) {
                var value = pair[1];
                if (
                    value.selectCount === 1 &&
                    blockCard.selectedRow === selectedSpot.selectedRow &&
                    blockCard.selectedCol === selectedSpot.selectedCol
                ) {
                    selectedSpot.selectCount = 0;
                    setBlockCard();
                } else if (
                    value.selectCount === 0 &&
                    value.selectedRow === selectedSpot.selectedRow &&
                    value.selectedCol === selectedSpot.selectedCol
                ) {
                    selectedSpot.selectCount = 1;
                    setBlockCard(selectedSpot);
                } else {
                    value.selectCount = 0;
                }
            }
        } else {
            selectedSpot.selectCount = 1;
            setBlockCard(selectedSpot);
        }

        setSpotsSelected(spots);
        setArraySelected(spots);
    };

    const createGrid = () => {
        return (
            <>
                <GlygenGrid
                    gridParams={updatedGridParams}
                    selectedArray={updateSelectedArray}
                    setBackGroundColor={setBackGroundColor}
                    selectedColor={selectedColor}
                />
            </>
        );
    };

    // Update all spots bg color
    const setBackGroundColor = (row, col) => {
        var spots = new Map(arraySelected);
        var selectedSpot = spots.get(row + "," + col);
        var bgColor = "";

        if (selectedSpot) {
            if (Object.entries(selectedSpot.blockSelected).length > 0) {
                bgColor = "darkgreen";
            } else {
                bgColor = "#B1B4B2";
            }
        }
        return bgColor;
    };

    // Update selection x mark color
    const selectedColor = (row, col) => {
        // var markXColor = "white";
        var markXColor = "#f5f5f5"; // as we changed the bg color of the body for the app so we swtiched from white to this color to hide x
        var spots = new Map(arraySelected);
        var selectedSpot = spots.get(row + "," + col);

        if (
            selectedSpot &&
            Object.entries(selectedSpot.blockSelected).length > 1 &&
            // !selectedSpot.color &&
            selectedSpot.selectCount === 0
        ) {
            markXColor = "darkgreen";
        }
        return markXColor;
    };

    return (
        <>
            <Helmet>
                <title>{head.publicslidelist.title}</title>
                {getMeta(head.publicslidelist)}
            </Helmet>

            {showErrorSummary === true && (
                <ErrorSummary
                    show={showErrorSummary}
                    form="slides"
                    errorJson={pageErrorsJson}
                    errorMessage={pageErrorMessage}
                />
            )}

            <div style={{ margin: "30px" }}>
                {slide ? (
                    <>
                        <Row style={{ marginBottom: "30px" }}>
                            <Col md={12}>
                                <Card style={{ height: "100%" }} className="text-center summary-panel">
                                    <Card.Body>
                                        <Title title="Summary" />
                                        {getDetails()}
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>

                        { /* add slide grid */}
                        <>
                            <Row className="gg-align-center text-center">
                                <Col xs={12} md={12} lg={8} className="pb-3 pt-3" style={{ width: "800px" }}>
                                    <div
                                        className="grid-table"
                                        style={{
                                            height: gridParams.rows > 30 ? "600px" : "fit-content",
                                        }}
                                    >
                                        {createGrid()}
                                    </div>
                                </Col>

                                <Col xs={12} md={12} lg={3} className="ml-3 pl-3 pb-3 pt-3">
                                    <ColorNotation pageLabels={"slidelayout"} isUpdate={true} />
                                    {blockCard && (
                                        <div className="selected-spot-info">
                                            <SpotInformationBlock blockCard={blockCard} publicView={true} />
                                        </div>
                                    )}
                                </Col>
                            </Row>
                        </>
                        <div className="text-center">
                            <Button className="gg-btn-blue" onClick={() => history.push("/slideList")}>
                                Back
                            </Button>
                        </div>
                    </>
                ) : (
                    <div> </div>
                )}
            </div>
        </>
    );
};

PublicSlideLayout.propTypes = {};

export { PublicSlideLayout };