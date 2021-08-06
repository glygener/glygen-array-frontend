/* eslint-disable react/display-name */
import React, { useEffect } from "react";
import { GlygenTable } from "../components/GlygenTable";
import "./Search.css";
import Helmet from "react-helmet";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { Col } from "react-bootstrap";
import { StructureImage } from "../components/StructureImage";
import { head, getMeta } from "../utils/head";
import { Title } from "../components/FormControls";
import { Tab, Tabs, Container } from "react-bootstrap";
import GlycanGeneralSearch from "../components/GlycanGeneralSearch";
const GlycanSearch = (props) => {
  useEffect(props.authCheckAgent, []);

  return (
    <>
      {/* <Helmet>
        <title>{head.glycans.title}</title>
        {getMeta(head.glycans)}
      </Helmet> */}

      {/* <div className="page-container5">
        <Title title="Glycan Search" />
        <p className={"page-description5"}>Is coming soon</p>
      </div> */}
      <div className="lander">
        <Container>
          {/* <PageLoader pageLoading={pageLoading} />
          <DialogAlert
            alertInput={alertDialogInput}
            setOpen={(input) => {
              setAlertDialogInput({ show: input });
            }}
          /> */}
          <Title title="Glycan Search" />
          <Tabs
            defaultActiveKey="General"
            transition={false}
            // activeKey={glyActTabKey}
            mountOnEnter={true}
            unmountOnExit={true}
            // onSelect={(key) => setGlyActTabKey(key)}
          >
            <Tab eventKey="General" className="tab-content-padding" title="General">
              {/* <TextAlert alertInput={alertTextInput} /> */}
              <div style={{ paddingBottom: "20px" }}></div>
              <Container className="tab-content-border">
                {/* {initData && ( */}
                <GlycanGeneralSearch />
                {/* searchGlycanAdvClick={searchGlycanAdvClick}
                  inputValue={glyAdvSearchData}
                  initData={initData}
                  setGlyAdvSearchData={setGlyAdvSearchData} */}

                {/* )} */}
              </Container>
            </Tab>
            <Tab
              eventKey="Structure-Search"
              className="tab-content-padding"
              title="Structure Search"
            >
              {/* <TextAlert alertInput={alertTextInput} /> */}
              <Container className="tab-content-border">
                <p>Structure Search is coming soon</p>
                {/* {initData && (
                  <GlycanAdvancedSearch
                    searchGlycanAdvClick={searchGlycanAdvClick}
                    inputValue={glyAdvSearchData}
                    initData={initData}
                    setGlyAdvSearchData={setGlyAdvSearchData}
                  />
                )} */}
              </Container>
            </Tab>
            <Tab
              eventKey="Substructure-Search"
              title="Substructure Search"
              className="tab-content-padding"
            >
              {/* <TextAlert alertInput={alertTextInput} /> */}
              <Container className="tab-content-border">
                <p>Substructure Search is coming soon</p>
                {/* {initData.composition && (
                  <CompositionSearchControl
                    compositionInitMap={initData.composition}
                    inputValue={glyCompData}
                    setInputValue={glyCompChange}
                    searchGlycanCompClick={searchGlycanCompClick}
                    getSelectionValue={getSelectionValue}
                    setCompSearchDisabled={setCompSearchDisabled}
                    compSearchDisabled={compSearchDisabled}
                    step={1}
                  />
                )} */}
              </Container>
            </Tab>
          </Tabs>
        </Container>
      </div>
    </>
  );
};

GlycanSearch.propTypes = {
  authCheckAgent: PropTypes.func,
};

export { GlycanSearch };
