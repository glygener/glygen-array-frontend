/* eslint-disable react-hooks/exhaustive-deps */
import React from "react";
import ReactTable from "react-table";
import { useHistory, Link } from "react-router-dom";
import { StructureImage } from "../components/StructureImage";
import { PageHeading } from "../components/FormControls";
import Container from "@material-ui/core/Container";
import { Card, Button } from "react-bootstrap";
import displayNames from "../appData/displayNames";
import { getToolTip, getPath } from "../utils/commonUtils";

const UploadMoleculeDetails = props => {
  const history = useHistory();

  let uploadResponse = history.location && history.location.state && history.location.state.uploadResponse;
  let addedLinkers = uploadResponse.addedLinkers;
  let wrongLinkers = uploadResponse.wrongLinkers;
  let duplicateLinkers = uploadResponse.duplicateLinkers;

  const getTableForMolecules = (data, columns, sectionTitle) => {
    return (
      <>
        <h3 className="text-center content-box-sm">{sectionTitle}</h3>
        <div className="mb-4">
          <ReactTable
            data={data}
            columns={
              columns
                ? columns
                : [
                    {
                      Header: "Name",
                      accessor: "name",
                      Cell: row => getToolTip(row.original.name)
                      // minWidth: 50,
                    },
                    {
                      Header: displayNames.linker.PUBCHEM_ID,
                      accessor: "pubChemId",
                      Cell: row => getToolTip(row.original.pubChemId)
                      // minWidth: 70,
                    },
                    {
                      Header: displayNames.linker.STRUCTURE,
                      accessor: "imageURL",
                      // eslint-disable-next-line react/prop-types
                      Cell: row => <StructureImage imgUrl={row.value}></StructureImage>,
                      minWidth: 150
                    }
                  ]
            }
            pageSizeOptions={[5, 10, 25]}
            defaultPageSize={5}
            pageSize={5}
            //loading={loading}
            keyColumn="id"
            showPaginationTop
            sortable={true}
          />
        </div>
      </>
    );
  };

  const details = () => {
    return (
      <>
        {addedLinkers && (
          <div>
            {getTableForMolecules(addedLinkers ? addedLinkers : [], "", "Molecules Were Unable To Be Uploaded")}
          </div>
        )}

        {duplicateLinkers && (
          <div>
            {getTableForMolecules(
              duplicateLinkers ? duplicateLinkers : [],
              "",
              "Molecules Already Exist In The Library"
            )}
          </div>
        )}

        {wrongLinkers &&
          getTableForMolecules(
            wrongLinkers ? wrongLinkers : [],
            [
              {
                Header: "Name",
                accessor: "name",
                Cell: row => getToolTip(row.original.name)
                // minWidth: 50,
              },
              {
                Header: displayNames.linker.PUBCHEM_ID,
                accessor: "pubChemId",
                Cell: row => getToolTip(row.original.pubChemId)
                // minWidth: 70,
              },
              {
                Header: displayNames.linker.STRUCTURE,
                accessor: "imageURL",
                // eslint-disable-next-line react/prop-types
                Cell: row => <StructureImage imgUrl={row.value}></StructureImage>,
                minWidth: 150
              },
              {
                Header: "Error message",
                accessor: "errorMessage",
                minWidth: 80,
                Cell: row => {
                  return (
                    row.original.error &&
                    row.original.error.errors &&
                    row.original.error.errors.map(err => {
                      return <div style={{ textAlign: "center" }}>{err.defaultMessage}</div>;
                    })
                  );
                }
              }
            ],
            "Molecules Were Unable To Be Uploaded"
          )}
      </>
    );
  };

  const getSummary = () => {
    let summaryLinks = [
      {
        tableLink: (addedLinkers && addedLinkers.length) || 0,
        descriptioin: "Molecules have been successfully uploaded.",
        scrollto: 100
      },
      {
        tableLink: (duplicateLinkers && duplicateLinkers.length) || 0,
        descriptioin: "Molecules are already exist in the library.",
        scrollto: 550
      },
      {
        tableLink: `${(wrongLinkers && wrongLinkers.length) || 0} `,
        descriptioin: "Molecules were unable to be uploaded.",
        scrollto: 2500
      }
    ];

    return (
      <>
        <h4>Summary Of linker Tables</h4>

        <ul>
          {summaryLinks.map((linkMolecules, index) => {
            return (
              <div className="summar-links" key={index}>
                <li onClick={() => window.scrollTo(0, linkMolecules.scrollto)}>
                  <span style={{ fontSize: "20px" }}>
                    <strong>{linkMolecules.tableLink}</strong>
                  </span>{" "}
                  {linkMolecules.descriptioin}
                </li>
              </div>
            );
          })}
        </ul>
      </>
    );
  };

  return (
    <>
      <Container maxWidth="xl">
        <div className="page-container">
          <PageHeading title={"Molecule File Upload Details"} />
          <div className="text-center mt-4 mb-4">
            <Link to={`/${getPath(props.moleculeUploadType)}`}>
              <Button className="gg-btn-blue mt-2 gg-mr-20"> Back to Molecules</Button>
            </Link>
          </div>
          <Card>
            <Card.Body>
              {(duplicateLinkers || addedLinkers || wrongLinkers) && getSummary()}
              {details()}
            </Card.Body>
          </Card>
          <div className="text-center mt-4 mb-4">
            <Link to={`/${getPath(props.moleculeUploadType)}`}>
              <Button className="gg-btn-blue mt-2 gg-mr-20"> Back to Molecules</Button>
            </Link>
          </div>
        </div>
      </Container>
    </>
  );
};

export { UploadMoleculeDetails };
