import React, { useState, useEffect, useReducer } from "react";
import Helmet from "react-helmet";
import { head, getMeta } from "../utils/head";
import { useParams } from "react-router-dom";
import Container from "@material-ui/core/Container";
import { wsCall } from "../utils/wsUtils";
import { ErrorSummary } from "../components/ErrorSummary";
import { Card } from "react-bootstrap";
import { Title } from "../components/FormControls";
import { Loading } from "../components/Loading";
import { DatasetTable } from "../components/DatasetTable";
import FeedbackWidget from "../components/FeedbackWidget";

const UserDatasets = (props) => {
    const { username } = useParams();

    const [searchId, setSearchId] = useState();
    const [userData, setUserData] = useState(null);
    const [showLoading, setShowLoading] = useState(false);
    const [showErrorSummary, setShowErrorSummary] = useState(false);
    const [pageErrorsJson, setPageErrorsJson] = useState({});
    const [pageErrorMessage, setPageErrorMessage] = useState();

    useEffect(() => {
        setShowLoading(true);

        wsCall(
            "getuserdetails",
            "GET",
            [username],
            true,
            null,
            userSearchSuccess,
            userSearchFailure
        );

    }, []);

    useEffect(() => {
        setShowLoading(true);
        wsCall(
            "searchdatasetsbyuser",
            "POST",
            null,
            false,
            {
                username
            },
            datasetSearchSuccess,
            datasetSearchFailure
        );
    }, [username]);

    const datasetSearchSuccess = (response) => {
        setShowLoading(false);
        response.text().then((searchId) => {
            setSearchId(searchId);
        });
    };

    const datasetSearchFailure = (response) => {
        response.json().then((resp) => {
            console.log(resp);
            if (resp.statusCode === 404) {
                setPageErrorsJson(null);
                setPageErrorMessage("No search result found.");
                setShowErrorSummary(true);
                return;
            }
            setPageErrorsJson(resp);
            setShowErrorSummary(true);
        });
    };

    const userSearchSuccess = (response) => {
        setShowLoading(false);
        response.json().then((data) => setUserData(data));
    };

    const userSearchFailure = (response) => {
        response.json().then((resp) => {
            console.log(resp);
            setPageErrorsJson(resp);
            setShowErrorSummary(true);
            setPageErrorMessage("");
        });
    };

    return (
        <>
            <Helmet>
                <title>{head.userdatasets.title}</title>
                {getMeta(head.userdatasets)}
            </Helmet>
            <FeedbackWidget />
            <Container maxWidth="lg" className="gg-container">
                <Loading show={showLoading} />

                {showErrorSummary === true && (
                    <ErrorSummary
                        show={showErrorSummary}
                        form="getglycanpublic"
                        errorJson={pageErrorsJson}
                        errorMessage={pageErrorMessage}
                    />
                )}
                <div style={{ margin: "30px" }}>
                    <Card style={{
                            width: "100%",
                            margin: "2%",
                    }} className=" summary-panel">
                        <Card.Body>
                            <Title title="User" />
                            {/* userName */}
                            {userData && userData.userName && (
                                <div>
                                    <strong>User Name: </strong>
                                    {userData.userName}
                                </div>
                            )}
                            {/* firstname */}
                            {userData && userData.firstName && (
                                <div>
                                    <strong>First Name: </strong>
                                    {userData.firstName}
                                </div>
                            )}
                            {/* lastName */}
                            {userData && userData.lastName && (
                                <div>
                                    <strong>Last Name: </strong>
                                    {userData.lastName}
                                </div>
                            )}
                            {/* affiliation */}
                            {userData && userData.affiliation && (
                                <div>
                                    <strong>Organization/Institution: </strong>
                                    {userData.affiliation}
                                </div>
                            )}
                            {/* department */}
                            {userData && userData.department && (
                                <div>
                                    <strong>Department: </strong>
                                    {userData.department}
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                    <Card
                        style={{
                            width: "95%",
                            margin: "2%",
                        }}
                    >
                        {searchId && (
                            <DatasetTable wsName="listdatasetsforsearch" qsParams={{ searchId: searchId }} />
                        )}
                    </Card>
                </div>
            </Container>
        </>
    );
};

export { UserDatasets };