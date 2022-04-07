/* eslint-disable react/display-name */
import React from "react";
// import { GlygenTable } from "../components/GlygenTable";
import PropTypes from "prop-types";
import ReactTable from "react-table";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { LineTooltip } from "../components/tooltip/LineTooltip";

const Collaborators = props => {
  return (
    <>
      <ReactTable
        data={props.listCollaborators}
        columns={[
          {
            Header: "Username",
            accessor: "name"
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
          },
          {
            Header: "Actions",
            Cell: (row, index) => (
              <div style={{ textAlign: "center" }}>
                <LineTooltip text="Delete Collaborator">
                  <span>
                    <FontAwesomeIcon
                      key={"delete" + index}
                      icon={["far", "trash-alt"]}
                      size="lg"
                      title="Delete"
                      className="caution-color table-btn"
                      onClick={() => props.delete(row.original.name, props.deleteWsCall)}
                    />
                  </span>
                </LineTooltip>
              </div>
            ),
            minWidth: 60
          }
        ]}
        className={"-striped -highlight"}
        defaultPageSize={5}
        // showPagination={false}
        minRows={0}
        NoDataComponent={({ state, ...rest }) =>
          !state?.loading ? (
            <p className="pt-2 text-center">
              <strong>No data available </strong>
            </p>
          ) : null
        }
        showPaginationTop
      />
    </>
  );
};

Collaborators.propTypes = {
  delete: PropTypes.func,
  collaborators: PropTypes.array,
  deleteWsCall: PropTypes.string
};

export { Collaborators };
