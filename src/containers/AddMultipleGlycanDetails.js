/* eslint-disable react-hooks/exhaustive-deps */
import React from "react";
import ReactTable from "react-table";
import { useHistory, Link } from "react-router-dom";
import { StructureImage } from "../components/StructureImage";
import { PageHeading } from "../components/FormControls";
import Container from "@material-ui/core/Container";
import { Card, Button } from "react-bootstrap";
import { addCommas } from "../utils/commonUtils";
import { LineTooltip } from "../components/tooltip/LineTooltip";

const AddMultipleGlycanDetails = props => {
  const history = useHistory();

  let uploadResponse = history.location && history.location.state && history.location.state.uploadResponse;
  let addedGlycans = uploadResponse.addedGlycans;
  let wrongSequences = uploadResponse.wrongSequences;
  let duplicateSequences = uploadResponse.duplicateSequences;

  const getTableForGlycans = (data, columns, sectionTitle) => {
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
                      // Header: "Internal ID",
                      Header: row => (
                        <LineTooltip text="Internal ID">
                          <span>Internal ID</span>
                        </LineTooltip>
                      ),
                      accessor: "internalId"
                    },
                    {
                      // Header: "GlyTouCan ID",
                      Header: row => (
                        <LineTooltip text="GlyTouCan ID">
                          <span>GlyTouCan ID</span>
                        </LineTooltip>
                      ),
                      accessor: "glytoucanId"
                    },
                    {
                      // Header: "Glycan Name",
                      Header: row => (
                        <LineTooltip text="Glycan Name">
                          <span>Glycan Name</span>
                        </LineTooltip>
                      ),
                      accessor: "name"
                    },
                    {
                      // Header: "Structure Image",
                      Header: row => (
                        <LineTooltip text="Structure Image">
                          <span>Structure Image</span>
                        </LineTooltip>
                      ),
                      accessor: "cartoon",
                      sortable: false,
                      // eslint-disable-next-line react/prop-types
                      Cell: row => row.value && <StructureImage base64={row.value} />,
                      minWidth: 200
                    },
                    {
                      // Header: "Monoisotopic Mass (Da)",
                      Header: row => (
                        <LineTooltip text="Monoisotopic Mass (Da)">
                          <span>Monoisotopic Mass (Da)</span>
                        </LineTooltip>
                      ),
                      accessor: "mass",
                      headerStyle: { whiteSpace: "pre-wrap" },

                      // eslint-disable-next-line react/prop-types
                      Cell: row => (row.value ? addCommas(parseFloat(row.value).toFixed(2)) : "")
                    }
                  ]
            }
            pageSizeOptions={[5, 10, 25]}
            defaultPageSize={5}
            pageSize={5}
            minRows={0}
            className="MyReactTableClass"
            NoDataComponent={({ state, ...rest }) =>
              !state?.loading ? (
                <p className="pt-2 text-center">
                  <strong>No data available</strong>
                </p>
              ) : null
            }
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
        {addedGlycans && (
          <div>{getTableForGlycans(addedGlycans ? addedGlycans : [], "", "Glycans Were Unable To Be Uploaded")}</div>
        )}

        {duplicateSequences && (
          <div>
            {getTableForGlycans(
              duplicateSequences ? duplicateSequences : [],
              "",
              "Glycans Are Already Exist In The Library"
            )}
          </div>
        )}

        {wrongSequences &&
          getTableForGlycans(
            wrongSequences ? wrongSequences : [],
            [
              {
                Header: "ID",
                accessor: "id",
                minWidth: 80,
                Cell: row => {
                  return row.original.glycan && row.original.glycan.id;
                }
              },
              {
                Header: "Sequence",
                accessor: "sequence",
                minWidth: 130,
                getProps: (state, rowInfo, column) => {
                  return {
                    style: {
                      whiteSpace: "initial"
                    }
                  };
                },
                Cell: row => {
                  return row.original.glycan && row.original.glycan.sequence;
                }
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
            "Glycans Were Unable To Be Uploaded"
          )}
      </>
    );
  };

  const getSummary = () => {
    let summaryLinks = [
      {
        tableLink: (addedGlycans && addedGlycans.length) || 0,
        descriptioin: "glycans have been successfully uploaded.",
        scrollto: 100
      },
      {
        tableLink: (duplicateSequences && duplicateSequences.length) || 0,
        descriptioin: "glycans are already exist in the library.",
        scrollto: 550
      },
      {
        tableLink: `${(wrongSequences && wrongSequences.length) || 0} `,
        descriptioin: "glycans were unable to be uploaded.",
        scrollto: 2500
      }
    ];

    return (
      <>
        <h4>Summary Of Glycan Tables</h4>

        <ul>
          {summaryLinks.map((linkGlycans, index) => {
            return (
              <div className="summar-links" key={index}>
                <li onClick={() => window.scrollTo(0, linkGlycans.scrollto)}>
                  <span style={{ fontSize: "20px" }}>
                    <strong>{linkGlycans.tableLink}</strong>
                  </span>{" "}
                  {linkGlycans.descriptioin}
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
          <PageHeading title={"Glycan File Upload Details"} />
          <div className="text-center mb-4">
            <Link to="/glycans">
              <Button className="gg-btn-blue mt-2 gg-mr-20"> Back to Glycans</Button>
            </Link>
          </div>
          <Card>
            <Card.Body>
              {(duplicateSequences || addedGlycans || wrongSequences) && getSummary()}
              {details()}
            </Card.Body>
          </Card>
          <div className="text-center mt-4 mb-4">
            <Link to="/glycans">
              <Button className="gg-btn-blue mt-2 gg-mr-20"> Back to Glycans</Button>
            </Link>
          </div>
        </div>
      </Container>
    </>
  );
};

export { AddMultipleGlycanDetails };
