import React from "react";
import "../components/PublicationCard.css";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { LineTooltip } from "../components/tooltip/LineTooltip";

const PublicationCard = (props) => {
  return (
    <>
      <table hover fluid="true" className="table-striped mb-3">
        <tbody className="table-body">
          <tr className="table-row p-3" key={props.pubIndex + "tr"}>
            <td key={props.pubIndex} className="pt-3 pb-3 pl-2">
              <div>
                <h5 style={{ marginBottom: "3px" }}>
                  <strong>{props.title}</strong>
                </h5>
              </div>

              <div style={{ textAlign: "left", paddingLeft: "35px" }}>
                <div>{props.authors}</div>
                <div>
                  {props.journal} <span>&nbsp;</span>({props.year})
                </div>
                <div>
                  <FontAwesomeIcon icon={["fas", "book-open"]} size="sm" title="Book" />

                  <span style={{ paddingLeft: "15px" }}>PMID:&nbsp;</span>
                  <a
                    href={`https://pubmed.ncbi.nlm.nih.gov/${props.pubmedId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {props.pubmedId}
                  </a>
                </div>
              </div>
            </td>
            {props.enableDelete && (
              <td>
                <LineTooltip text="Delete Publication">
                  <Link>
                    <FontAwesomeIcon
                      icon={["far", "trash-alt"]}
                      alt="Delete publication"
                      size="lg"
                      className="caution-color tbl-icon-btn"
                      onClick={() => props.deletePublication(props.id ? props.id : props.pubmedId, "deletePublication")}
                    />
                  </Link>
                </LineTooltip>
              </td>
            )}
          </tr>
        </tbody>
      </table>
    </>
  );
};

PublicationCard.propTypes = {
  pubmedId: PropTypes.number,
  id: PropTypes.number,
  pubIndex: PropTypes.number,
  title: PropTypes.string,
  authors: PropTypes.string,
  journal: PropTypes.string,
  year: PropTypes.number,
  number: PropTypes.string,
  volume: PropTypes.string,
  startPage: PropTypes.string,
  endPage: PropTypes.string,
  doiId: PropTypes.string,
  uri: PropTypes.string,
  enableDelete: PropTypes.bool,
  deletePublication: PropTypes.func,
};

export { PublicationCard };
