import React, { useState, useRef } from "react";
import { AsyncTypeahead } from "react-bootstrap-typeahead";
import { wsCall } from "../utils/wsUtils";
import { Button, Row, Col } from "react-bootstrap";
import PropTypes from "prop-types";

const AddCoOwnerandCollab = props => {
  let experimentId = props.experimentId;

  const [isLoading, setIsLoading] = useState(false);
  const [userSelected, setUserSelected] = useState();
  const [users, setUsers] = useState();
  let ref = useRef();

  const handleSearch = value => {
    setIsLoading(true);

    wsCall(
      "gettypeahead",
      "GET",
      {
        namespace: "username",
        value: encodeURIComponent(value),
        limit: "10"
      },
      true,
      null,
      response =>
        response.json().then(responseJson => {
          console.log(users);
          setUsers(responseJson);
        }),
      response =>
        response.json().then(responseJson => {
          console.log(responseJson);
        })
    );
    setIsLoading(false);
  };

  // Bypass client-side filtering by returning `true`. Results are already
  // filtered by the search endpoint, so no need to do it again.
  const filterBy = () => true;

  const handleChange = userSelected => {
    if (userSelected === "") {
      setUsers();
    }
    setUserSelected(userSelected);
  };

  const addCoOwner = () => {
    wsCall(
      props.addWsCall,
      "POST",
      { arraydatasetId: experimentId },
      true,
      { userName: userSelected[0] },
      response =>
        response.json().then(responseJson => {
          console.log(responseJson);
          ref && ref.current && ref.current.clear();
          setUserSelected("");
          setUsers("");

          if (props.addWsCall && props.addWsCall === "addcollaborator") {
            props.getExperiment();
          }
        }),
      response =>
        response.json().then(responseJson => {
          console.log(responseJson);
        })
    );
  };

  return (
    <>
      <Row className="mb-2">
        <Col md={4}>
          <AsyncTypeahead
            filterBy={filterBy}
            id="async-example"
            isLoading={isLoading}
            minLength={1}
            onSearch={query => {
              handleSearch(query);
            }}
            options={users}
            placeholder="Search for a User..."
            selected={userSelected}
            onChange={handleChange}
            // renderMenuItemChildren={option => (
            //   <Fragment>
            //     <span>{option}</span>
            //   </Fragment>
            // )}
            useCache={false}
            // labelKey={"option"}
            ref={ref}
          />
        </Col>

        <Button className="gg-btn-blue-reg" disabled={!userSelected || userSelected.length < 1} onClick={addCoOwner}>
          Add
        </Button>
      </Row>
    </>
  );
};

AddCoOwnerandCollab.propTypes = {
  experimentId: PropTypes.string,
  addWsCall: PropTypes.string,
  setRefreshListCoOwners: PropTypes.func,
  getExperiment: PropTypes.func
};

export { AddCoOwnerandCollab };
