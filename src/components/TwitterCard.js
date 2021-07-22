import React, { useState } from "react";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
// import CardActionArea from '@material-ui/core/CardActionArea';
import CardContent from "@material-ui/core/CardContent";
import { TwitterTimelineEmbed } from "react-twitter-embed";
import { Card } from "react-bootstrap";
import CardLoader from "./CardLoader";

const useStyles = makeStyles(() => ({
  cardAction: {
    display: "inline-flex",
    backgroundColor: "transperent",
  },
  cardTitle: {
    textAlign: "center",
  },
  cardDetails: {
    flex: 1,
  },
}));

export default function TwitterCard() {
  const [showLoading, setShowLoading] = useState(true);
  const classes = useStyles();
  // const { post } = props;

  return (
    <Grid item xs={12} sm={6} md={12}>
      <Card className="gg-card-hover">
        <CardLoader pageLoading={showLoading} />
        <div className={classes.cardDetails}>
          <CardContent>
            <h4
              // gutterBottom
              // variant='h5'
              // component='h2'
              className={classes.cardTitle}
            >
              News
            </h4>
            <section className="twitterContainer">
              <div className="twitter-embed">
                <TwitterTimelineEmbed
                  sourceType="profile"
                  screenName="gly_gen"
                  options={{
                    // tweetLimit: '3',
                    width: "100%",
                    height: 500,
                    fontSize: "16px !important",
                  }}
                  // theme="dark"
                  noHeader={true}
                  noBorders={true}
                  noFooter={true}
                  onLoad={() => setShowLoading(false)}
                />
              </div>
            </section>
          </CardContent>
        </div>
      </Card>
    </Grid>
  );
}

TwitterCard.propTypes = {
  post: PropTypes.object,
};
