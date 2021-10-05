/* eslint-disable react/prop-types */
import React from "react";
import "../containers/Features.css";
import { Link } from "react-router-dom";
import { GlygenTable } from "../components/GlygenTable";
import displayNames from "../appData/displayNames";

const GlycoPeptides = props => {
  return (
    <>
      <GlygenTable
        columns={[
          {
            Header: "Name",
            accessor: "name",
            // eslint-disable-next-line react/display-name
            Cell: ({ row }, index) => <div key={index}>{row.name ? row.name : row.id}</div>
          },
          {
            Header: "Feature Id",
            accessor: "internalId"
          },
          {
            Header: "Type",
            accessor: "type",
            Cell: row => displayNames.feature[row.value]
          },
          {
            Header: "Linker",
            accessor: "linker",
            // eslint-disable-next-line react/display-name
            Cell: ({ value, index }) =>
              value && value.name ? (
                <Link key={index} to={"/linkers/editlinker/" + value.id} target="_blank">
                  {value.name}
                </Link>
              ) : (
                ""
              )
          },
          {
            Header: "Linker Type",
            accessor: "linker",
            // eslint-disable-next-line react/display-name
            Cell: ({ row, index }) => {
              return (
                <div key={index}>
                  {
                    row.linker.type
                    // && displayNames.linker[row.linker.type]
                  }
                </div>
              );
            }
          },
          {
            Header: "Glycans",
            accessor: "glycans",
            // eslint-disable-next-line react/display-name
            Cell: (row, index) => (
              <div key={index}>
                {row.value
                  ? row.value.map(
                      (glycans, i) =>
                        glycans.glycan && (
                          <div key={i}>
                            <Link to={"/glycans/editglycan/" + glycans.glycan.id} target="_blank">
                              {glycans.glycan.name}
                            </Link>
                            <br />
                          </div>
                        )
                    )
                  : ""}
              </div>
            )
          }
        ]}
        defaultPageSize={10}
        showSearchBox
        viewUrl="features/viewFeature"
        commentsRefColumn="name"
        fetchWS="featurelist"
        keyColumn="id"
        showRowsInfo
        infoRowsText="Glyco Peptides"
        paramTypeValue={"GLYCOPEPTIDE"}
      />
    </>
  );
};

export { GlycoPeptides };
