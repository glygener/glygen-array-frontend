/* eslint-disable react/prop-types */
import React from "react";
import "../containers/Features.css";
import { Link } from "react-router-dom";
import { GlygenTable } from "../components/GlygenTable";
import displayNames from "../appData/displayNames";
import { getToolTip } from "../utils/commonUtils";

const GlycoPeptides = props => {
  return (
    <>
      <GlygenTable
        columns={[
          {
            Header: "Name",
            accessor: "name",
            // eslint-disable-next-line react/display-name
            Cell: ({ row }, index) => <div key={index}>{row.name ? getToolTip(row.name) : row.id}</div>
          },
          {
            Header: "Feature Id",
            accessor: "internalId"
          },
          {
            Header: "Type",
            accessor: "type",
            Cell: row => getToolTip(displayNames.feature[row.value])
          },
          {
            Header: "Linker",
            accessor: "linker",
            // eslint-disable-next-line react/display-name
            Cell: ({ value, index }) =>
              value && value.name ? (
                <Link key={index} to={"/linkers/editlinker/" + value.id} target="_blank">
                  {getToolTip(value.name)}
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
              return <div key={index}>{getToolTip(row.linker.type)}</div>;
            }
          }
        ]}
        defaultPageSize={10}
        showSearchBox
        viewUrl="features/viewFeature"
        commentsRefColumn="description"
        fetchWS="featurelistbytype"
        keyColumn="id"
        showRowsInfo
        infoRowsText="Glyco Peptides"
        paramTypeValue={"GLYCOPEPTIDE"}
        selectButtonHeader={props.selectButtonHeader}
        showSelectButton={props.showSelectButton}
        selectButtonHandler={props.selectButtonHandler}
      />
    </>
  );
};

export { GlycoPeptides };
