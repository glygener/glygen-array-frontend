/* eslint-disable react/display-name */
import React, { useState } from "react";
import PropTypes from "prop-types";
import { GlygenTable } from "../components/GlygenTable";
import { AddCoOwnerandCollab } from "./AddCoOwnerandCollab";

const CoOwners = props => {
  const [refreshTable, setRefreshTable] = useState(false);

  return (
    <>
      <AddCoOwnerandCollab
        addWsCall={props.addWsCall}
        experimentId={props.experimentId}
        setRefreshTable={setRefreshTable}
      />

      <GlygenTable
        columns={[
          {
            Header: "Username",
            accessor: "userName"
          },
          {
            Header: "FirstName",
            accessor: "firstName"
          },
          {
            Header: "LastName",
            accessor: "lastName"
          },
          {
            Header: "Organization",
            accessor: "affiliation"
          }
        ]}
        defaultPageSize={10}
        defaultSortColumn="userName"
        defaultSortOrder={1}
        showDeleteButton
        fetchWS="listcoowners"
        queryParamDelete={props.experimentId}
        qsParams={{ arraydatasetId: props.experimentId }}
        deleteWS={props.deleteWsCall}
        keyColumn="userName"
        minRows={0}
        refreshTable={refreshTable}
        NoDataComponent={({ state, ...rest }) =>
          !state?.loading ? (
            <p className="pt-2 text-center">
              <strong>No data available </strong>
            </p>
          ) : null
        }
      />
    </>
  );
};

CoOwners.propTypes = {
  experimentId: PropTypes.string,
  deleteWsCall: PropTypes.string
};

export { CoOwners };
