import React from "react";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FaUserPlus } from "react-icons/fa";
import { BiLogIn } from "react-icons/bi";

const useStyles = makeStyles((theme) => ({
  mainFeaturedCard: {
    position: "relative",
    backgroundColor: theme.palette.grey[800],
    color: theme.palette.common.white,
    marginBottom: theme.spacing(4),
    // backgroundImage: 'url(https://source.unsplash.com/random)',
    backgroundSize: "cover",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center",
  },
  overlay: {
    position: "absolute",
    top: 0,
    bottom: 0,
    right: 0,
    left: 0,
    backgroundColor: "rgba(0,0,0,.4)",
  },
  mainFeaturedCardContent: {
    position: "relative",
    textAlign: "center",
    padding: theme.spacing(2),
    [theme.breakpoints.up("md")]: {
      padding: theme.spacing(3, 4),
      textAlign: "left",
    },
  },
  mainFeaturedCardButtons: {
    position: "relative",
    textAlign: "center",
    padding: theme.spacing(2),
    [theme.breakpoints.up("md")]: {
      padding: theme.spacing(3, 4),
      textAlign: "right",
    },
  },
}));
export default function MainFeaturedCard(props) {
  const classes = useStyles();
  const { post } = props;

  return (
    <Paper className={classes.mainFeaturedCard} style={{ backgroundImage: `url(${post.image})` }}>
      {<img style={{ display: "none" }} src={post.image} alt={post.imageText} />}
      <div className={classes.overlay} />
      <Grid container>
        <Grid item sm={12} md={8} lg={6}>
          <div
            className={classes.mainFeaturedCardContent}
            style={{ letterSpacing: "1px", paddingTop: "35px" }}
          >
            <Typography
              component="h5"
              style={{
                fontSize: "1.25rem",
              }}
              variant="h5"
              color="inherit"
              gutterBottom
            >
              {post.title}
            </Typography>
            <Typography
              // component="h6"
              color="inherit"
              variant="h6"
              paragraph
              style={{
                textAlign: "justify",
                lineHeight: "1.5",
                fontSize: "1rem",
              }}
            >
              {post.description}
            </Typography>
          </div>
        </Grid>

        <Grid item sm={12} md={4} lg={6} className="btn-outline-white-col">
          <div className={classes.mainFeaturedCardButtons}>
            <div className="btn-outline-white text-left">
              <Link to={"/signup"} className="gg-btn-outline-blue">
                <span
                  style={{
                    paddingRight: "10px",
                  }}
                >
                  <FaUserPlus key={"signup"} size="22px" title="signup" />
                </span>
                Sign up
              </Link>
            </div>
            <div className="btn-outline-white text-left">
              <Link to={"/login"} className="gg-btn-outline-white">
                <span style={{ paddingRight: "10px" }}>
                  <BiLogIn key={"login"} size="22px" title="login" />
                </span>
                Log In
              </Link>
            </div>
            <div className="btn-outline-white text-left">
              <Link to={"/data"} className="gg-btn-outline-white">
                <span
                  style={{
                    paddingRight: "10px",
                  }}
                >
                  <FontAwesomeIcon key={"data"} icon={["fas", "table"]} size="1x" title="data" />
                </span>
                Datasets
              </Link>
            </div>
          </div>
        </Grid>
      </Grid>
    </Paper>
  );
}

MainFeaturedCard.propTypes = {
  post: PropTypes.object,
};
