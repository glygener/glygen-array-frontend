import React from "react";
import { GlygenTable } from "../components/GlygenTable";
import PropTypes from "prop-types";
import { Title } from "../components/FormControls";

const CoOwnedExperiments = () => {
  return (
    <>
      <Title title="Co-Owned Experiments" />

      <GlygenTable
        columns={[
          {
            Header: "Id",
            accessor: "id"
          },
          {
            Header: "Name",
            accessor: "name"
          },
          {
            Header: "Date Created",
            // accessor: "dateCreated"
            Cell: row => new Intl.DateTimeFormat("en-US").format(new Date(row.original.dateCreated))
          },
          {
            Header: "Status",
            accessor: "status"
          }
        ]}
        defaultPageSize={7}
        defaultSortColumn="id"
        showDeleteButton
        showEditButton
        showMakePublic
        setShowDeleteModal
        commentsRefColumn="description"
        fetchWS="listarraydatasetcoowner"
        deleteWS="deletedatasetbycoowner"
        editUrl="experiments/editExperiment"
        keyColumn="id"
        infoRowsText="Co-Owned Experiments"
        form={"experiments"}
      />
    </>
  );
};

CoOwnedExperiments.propTypes = {
  authCheckAgent: PropTypes.func
};

export { CoOwnedExperiments };
