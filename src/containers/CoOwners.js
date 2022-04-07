/* eslint-disable react/display-name */
import React from "react";
import PropTypes from "prop-types";
import { GlygenTable } from "../components/GlygenTable";

const CoOwners = props => {
  return (
    <>
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
        showDeleteButton
        fetchWS="listcoowners"
        queryParamDelete={props.experimentId}
        qsParams={{ arraydatasetId: props.experimentId }}
        deleteWS={props.deleteWsCall}
        keyColumn="userName"
      />

      {/* <ReactTable
        data={data}
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
          },
          {
            Header: "Actions",
            Cell: (row, index) => (
              <div style={{ textAlign: "center" }}>
                <LineTooltip text="Delete Co-Owner">
                  <span>
                    <FontAwesomeIcon
                      key={"delete" + index}
                      icon={["far", "trash-alt"]}
                      size="lg"
                      title="Delete"
                      className="caution-color table-btn"
                      onClick={() => props.delete(row.original.userName, props.deleteWsCall)}
                    />
                  </span>
                </LineTooltip>
              </div>
            ),
            minWidth: 60
          }
        ]}
        className={"-striped -highlight"}
        defaultPageSize={data && data.length > 10 ? data.length : 5}
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
      /> */}
    </>
  );
};

CoOwners.propTypes = {
  delete: PropTypes.func,
  experimentId: PropTypes.string,
  deleteWsCall: PropTypes.string
};

export { CoOwners };
