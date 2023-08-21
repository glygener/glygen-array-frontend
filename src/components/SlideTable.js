import React, { useEffect, useState, useReducer } from "react";
import { wsCall } from "../utils/wsUtils";
import { Link } from "react-router-dom";
//import "../public/PublicListDataset.css";
import "react-table/react-table.css";
import ReactTable from "react-table";
import { getDateCreated } from "../utils/commonUtils";
import "./GlygenTable.css";
import { Row, Form, Col } from "react-bootstrap";
import { ErrorSummary } from "../components/ErrorSummary";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import CardLoader from "../components/CardLoader";
import { getToolTip } from "../utils/commonUtils";
import PropTypes from "prop-types";
import { GlygenTableRowsInfo } from "./GlygenTableRowsInfo";

const SlideTable = props => {
    const [pageErrorsJson, setPageErrorsJson] = useState({});
    const [pageErrorMessage, setPageErrorMessage] = useState("");
    const [showErrorSummary, setShowErrorSummary] = useState(false);
    const [orderBy, setOrderBy] = useState(1);
    const [showLoading, setShowLoading] = useState(true);
    const [rows, setRows] = useState(0);
    const [data, setData] = useState([]);
    const [pages, setPages] = useState(0);
    const [customOffset, setCustomOffset] = useState(false);
    const [curPage, setCurPage] = useState(0);
    const [tableElement, setTableElement] = useState({});
    const [searchFilter, setSearchFilter] = useState("");

    const slide = {
        pages: "",
        sortBy: "name"
    };
    const [publicData, setPublicData] = useReducer((state, newState) => ({ ...state, ...newState }), slide);
    useEffect(() => {
        tableElement.state && tableElement.fireFetchData();
    }, [searchFilter, props, orderBy, publicData.sortBy]);

    function errorWscall(response) {
        response.json().then(responseJson => {
            setPageErrorsJson(responseJson);
            setPageErrorMessage("");
        });
        setShowErrorSummary(true);
        setShowLoading(false);
    }

    const handleSelectSortBy = e => {
        const name = e.target.name;
        const selected = e.target.options[e.target.selectedIndex].value;
        setCurPage(0);
        setPublicData({ [name]: selected });
    };

    const handleFilterChange = e => {
        setCurPage(0);
        setSearchFilter(e.target.value);
    };

    const getSortByOptions = () => {
        return (
            <>
                <Form>
                    <Form.Group as={Row} className="mb-3" controlId={0}>
                        <Form.Label column xs={3} sm={4} className="text-xs-left text-sm-left text-md-right">
                            Sort by
                        </Form.Label>
                        <Col xs={9} sm={8}>
                            <Form.Control
                                as="select"
                                name={"sortBy"}
                                value={publicData.sortBy}
                                onChange={handleSelectSortBy}
                                required={true}
                            >
                                <option value="name">Slide Name</option>
                                <option value="dateCreated">Publication Date</option>
                                <option value="user">Submitter</option>
                            </Form.Control>
                        </Col>
                    </Form.Group>
                </Form>
            </>
        );
    };

    const getTableDetails = () => {
        return (
            <>
                <div className="m-3">
                    {props.showHeading ? (
                    <Row>
                        <Col className="pt-2 mb-3">
                            {" "}
                            List&nbsp;of&nbsp;Slides&nbsp;{"("}
                            {rows}
                            {")"}
                        </Col>
                        <Col className="pt-2 mb-3">
                            <span>Order&nbsp;by&nbsp;&nbsp;</span>
                            <FontAwesomeIcon
                                key={"view"}
                                icon={["fas", orderBy ? "caret-up" : "caret-down"]}
                                title="Order by"
                                alt="Caret Icon"
                                onClick={() => setOrderBy(!orderBy)}
                            />
                        </Col>
                        <Col md={4}>{getSortByOptions()}</Col>
                        {props.showSearchBox && (
                            <Col md={2}>
                                <Form.Control
                                    type="text"
                                    name="search"
                                    placeholder="Search Table"
                                    value={searchFilter}
                                    onChange={handleFilterChange}
                                />
                            </Col>
                        )}
                        </Row>) : (
                        <Row>
                            <Col>
                                <GlygenTableRowsInfo
                                    currentPage={tableElement.state ? tableElement.state.page : 0}
                                    pageSize={tableElement.state ? tableElement.state.pageSize : 0}
                                    currentRows={data && data.length}
                                    totalRows={rows}
                                    infoRowsText="Slides"
                                    show={true}
                                />
                            </Col>
                            </Row>
                    )}

                    <ReactTable
                        columns={[
                            {
                                Header: "Name",
                                accessor: "name",
                                Cell: row => <Link to={`/slideList/slidelayout/${row.original.id}`}>{row.original.name}</Link>,
                                style: {
                                    textAlign: "left"
                                }
                            },
                            {
                                Header: "Submitter",
                                accessor: "user",
                                Cell: row => row.original.user ? getToolTip(row.original.user.name) :
                                    row.original.layout.user ? getToolTip(row.original.layout.user.name) : "",
                                style: {
                                    textAlign: "left"
                                }
                            },
                            {
                                Header: "Block dimension",
                                sortable: false,
                                Cell: row => getBlockDimension(row.original.layout)
                            },
                            {
                                Header: "Publication Date",
                                accessor: "createdDate",
                                Cell: row => getDateCreated(row.original.dateCreated)
                            }

                        ]}

                        data={props.data ? props.data : data}
                        pageSizeOptions={[5, 10, 25, 50]}
                        defaultPageSize={data.length < 5 ? 5 : 1}
                        minRows={0}
                        NoDataComponent={({ state, ...rest }) =>
                            !state?.loading ? (
                                <p className="pt-2 text-center">
                                    <strong>No data available </strong>
                                </p>
                            ) : null
                        }
                        showPaginationTop
                        className="MyReactTableClass"
                        pages={pages}
                        page={curPage}
                        onPageChange={(pageNo) => setCurPage(pageNo)}
                        loading={showLoading}
                        loadingText={<CardLoader pageLoading={showLoading} />}
                        multiSort={false}
                        sortable={false}
                        //resizable={false}
                        manual
                        ref={element => setTableElement(element)}
                        onFetchData={state => {
                            setShowLoading(true);

                            wsCall(
                                props.wsName,
                                "GET",
                                {
                                    urlParams: props.urlParams || [],
                                    qsParams: {
                                        offset: customOffset ? 0 : curPage * state.pageSize,
                                        limit: state.pageSize,
                                        sortBy: publicData.sortBy,
                                        order: orderBy ? 1 : 0,
                                        loadAll: false, //only useful for features, blocks and slides
                                        filter: searchFilter !== "" ? encodeURIComponent(searchFilter) : "",
                                        ...props.qsParams,
                                    },
                                },
                                false,
                                null,
                                response =>
                                    response.json().then(responseJson => {
                                        if (searchFilter !== "" && responseJson.total < 5 && !customOffset) {
                                            setCustomOffset(true);
                                            tableElement.fireFetchData();
                                        } else {
                                            setCustomOffset(false);
                                            if (responseJson.rows) {
                                                setData(responseJson.rows);
                                                setRows(responseJson.total);
                                            } else {
                                                setData(responseJson);
                                                setRows(responseJson.length);
                                            }
                                            setPages(Math.ceil(responseJson.total / state.pageSize));
                                            setShowLoading(false);
                                        }
                                    }),
                                errorWscall
                            );
                        }}
                    />
                    {!props.showHeading && (
                    <Row>
                        <Col>
                            <GlygenTableRowsInfo
                                currentPage={tableElement.state ? tableElement.state.page : 0}
                                pageSize={tableElement.state ? tableElement.state.pageSize : 0}
                                currentRows={data && data.length}
                                totalRows={rows}
                                infoRowsText="Slides"
                                show={true}
                            />
                        </Col>
                    </Row>
                    )}
                </div>
            </>
        );
    };

    return (
        <>
            {showErrorSummary === true && (
                <ErrorSummary
                    show={showErrorSummary}
                    form="slides"
                    errorJson={pageErrorsJson}
                    errorMessage={pageErrorMessage}
                />
            )}
            {showLoading ? <CardLoader pageLoading={showLoading} /> : ""}
            {getTableDetails()}
        </>
    );
};

export function getBlockDimension(layout) {
    return layout.width + "x" + layout.height;
}

SlideTable.propTypes = {
    showSearchBox: PropTypes.bool,
    showHeading: PropTypes.bool,
    qsParams: PropTypes.object
};

export { SlideTable };