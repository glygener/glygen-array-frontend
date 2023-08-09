import React from "react";
import Helmet from "react-helmet";
import { head, getMeta } from "../utils/head";
import { Card } from "react-bootstrap";
import { SlideTable } from "../components/SlideTable";
const PublicSlide = () => {
    return (
        <>
            <Helmet>
                <title>{head.publicslidelist.title}</title>
                {getMeta(head.publicslidelist)}
            </Helmet>
            <Card
                style={{
                    // marginLeft: "5%",
                    // marginRight: "5%",
                    width: "95%",
                    margin: "2%",
                    // marginTop: window.innerHeight / 8
                }}
            >
                <SlideTable wsName="listpublicslide" showSearchBox="true" />
                {/* public slides /> */}
            </Card>
        </>
    );
};

PublicSlide.propTypes = {};

export { PublicSlide };