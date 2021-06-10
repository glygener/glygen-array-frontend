/* eslint-disable react/display-name */
import React from "react";
import PropTypes from "prop-types";
import { Home } from "./containers/Home";
import { Login } from "./containers/Login";
import { Signup } from "./containers/Signup";
import { Profile } from "./containers/Profile";
import { ChangePassword } from "./containers/ChangePassword";
import { ChangeEmail } from "./containers/ChangeEmail";
import { VerifyToken } from "./containers/VerifyToken";
import { ForgotPassword } from "./containers/ForgotPassword";
import { ForgotUsername } from "./containers/ForgotUsername";
import { EmailConfirmation } from "./components/EmailConfirmation";
import { Contribute } from "./containers/Contribute";
import { Glycans } from "./containers/Glycans";
import { EditGlycan } from "./containers/EditGlycan";
import { Linkers } from "./containers/Linkers";
import { AddGlycan } from "./containers/AddGlycan";
import { AddLinker } from "./containers/AddLinker";
import { EditLinker } from "./containers/EditLinker";
import { BlockLayouts } from "./containers/BlockLayouts";
import { SlideLayouts } from "./containers/SlideLayouts";
import { AddBlockLayout } from "./containers/AddBlockLayout";
import { Features } from "./containers/Features";
import { AddFeature } from "./containers/AddFeature";
import { EditFeature } from "./containers/EditFeature";
import { SideMenu } from "./components/SideMenu";
import { AddSlideLayout } from "./containers/AddSlideLayout";
import { AddMultiSlideLayout } from "./containers/AddMultiSlideLayout";
import { Samples } from "./containers/Samples";
import { AddSample } from "./containers/AddSample";
import { Printers } from "./containers/Printers";
import { ImageAnalysis } from "./containers/ImageAnalysis";
import { Scanners } from "./containers/Scanners";
import { DataProcessing } from "./containers/DataProcessing";
import { SlideMeta } from "./containers/SlideMeta";
import { AddPrinter } from "./containers/AddPrinter";
import { AddScanner } from "./containers/AddScanner";
import { AddImageAnalysis } from "./containers/AddImageAnalysis";
import { AddDataProcessing } from "./containers/AddDataProcessing";
import { AddSlideMeta } from "./containers/AddSlideMeta";
import { AddSlide } from "./containers/AddSlide";
import { Slides } from "./containers/Slides";
import { Experiments } from "./containers/Experiments";
import { AddExperiment } from "./containers/AddExperiment";
import { RawData } from "./containers/RawData";
import { AddRawData } from "./containers/AddRawData";
import { AddProcessedData } from "./containers/AddProcessedData";
import { Assay } from "./containers/Assay";
import { AddAssay } from "./containers/AddAssay";
import { AddSpot } from "./containers/AddSpot";
import { Spots } from "./containers/Spots";
import { ErrorPage } from "./components/ErrorPage";
import { Switch, Route } from "react-router-dom";
import { PublicData } from "./public/PublicData";
import { PublicDataset } from "./public/PublicDataset";
import { AddGrant } from "./containers/AddGrant";

const Routes = props => {
  const routes = [
    {
      path: "/",
      exact: true,
      sidebar: () => "",
      main: () => <Home />
    },
    {
      path: "/data/dataset/:datasetId",
      main: () => <PublicDataset {...props} />,
      sidebar: () => ""
    },
    {
      path: "/data",
      exact: true,
      main: () => <PublicData />,
      sidebar: () => ""
    },
    {
      path: "/login",

      sidebar: () => "",
      main: () => <Login updateLogin={props.updateLogin} authCheckAgent={props.authCheckAgent} />
    },
    {
      path: "/signup",
      exact: true,
      main: () => <Signup />,
      sidebar: () => ""
    },
    {
      path: "/verifyToken",
      exact: true,
      main: () => <VerifyToken />,
      sidebar: () => ""
    },
    {
      path: "/emailConfirmation/:token",
      main: () => <EmailConfirmation />,
      sidebar: () => ""
    },
    {
      path: "/profile",
      exact: true,
      main: () => <Profile authCheckAgent={props.authCheckAgent} />,
      sidebar: () => ""
    },
    {
      path: "/changePassword",
      exact: true,
      main: () => <ChangePassword />,
      sidebar: () => ""
    },
    {
      path: "/changeEmail",
      exact: true,
      main: () => <ChangeEmail />,
      sidebar: () => ""
    },
    {
      path: "/forgotPassword",
      exact: true,
      main: () => <ForgotPassword />,
      sidebar: () => ""
    },
    {
      path: "/forgotUsername",
      exact: true,
      main: () => <ForgotUsername />,
      sidebar: () => ""
    },
    {
      path: "/contribute",
      exact: true,
      main: () => <Contribute authCheckAgent={props.authCheckAgent} />,
      sidebar: () => getSidemenu("")
    },

    /*  glycans */
    {
      path: "/glycans/editglycan/:glycanId",
      main: props => <EditGlycan {...props} authCheckAgent={props.authCheckAgent} />,
      sidebar: () => getSidemenu("slide")
    },
    {
      path: "/glycans/addglycan",
      main: () => <AddGlycan authCheckAgent={props.authCheckAgent} />,
      sidebar: () => getSidemenu("slide")
    },
    {
      path: "/glycans",
      main: () => <Glycans authCheckAgent={props.authCheckAgent} />,
      sidebar: () => getSidemenu("slide")
    },

    /*  linkers */
    {
      path: "/linkers/editlinker/:linkerId",
      main: props => <EditLinker {...props} authCheckAgent={props.authCheckAgent} />,
      sidebar: () => getSidemenu("slide")
    },
    {
      path: "/linkers/addlinker",
      main: () => <AddLinker authCheckAgent={props.authCheckAgent} />,
      sidebar: () => getSidemenu("slide")
    },
    {
      path: "/linkers",
      main: () => <Linkers authCheckAgent={props.authCheckAgent} />,
      sidebar: () => getSidemenu("slide")
    },

    /*  features */
    {
      path: "/features/editfeature/:featureId",
      main: props => <EditFeature {...props} authCheckAgent={props.authCheckAgent} />,
      sidebar: () => getSidemenu("slide")
    },
    {
      path: "/features/addfeature",
      main: () => <AddFeature authCheckAgent={props.authCheckAgent} />,
      sidebar: () => getSidemenu("slide")
    },
    {
      path: "/features",
      main: () => <Features authCheckAgent={props.authCheckAgent} />,
      sidebar: () => getSidemenu("slide")
    },

    /* Block layouts */

    {
      path: "/blocklayouts/editBlock/:blockLayoutId?",
      main: props => <AddBlockLayout {...props} authCheckAgent={props.authCheckAgent} />,
      sidebar: () => getSidemenu("slide")
    },
    {
      path: "/blocklayouts/addBlock",
      main: () => <AddBlockLayout authCheckAgent={props.authCheckAgent} />,
      sidebar: () => getSidemenu("slide")
    },
    {
      path: "/blocklayouts",
      exact: true,
      main: () => <BlockLayouts authCheckAgent={props.authCheckAgent} />,
      sidebar: () => getSidemenu("slide")
    },

    /* Slide layouts */

    {
      path: "/slidelayouts/editSlide/:slideLayoutId?",
      main: props => <AddSlideLayout {...props} authCheckAgent={props.authCheckAgent} />,
      sidebar: () => getSidemenu("slide")
    },
    {
      path: "/slidelayouts/addSlide",
      main: () => <AddSlideLayout authCheckAgent={props.authCheckAgent} />,
      sidebar: () => getSidemenu("slide")
    },
    {
      path: "/slidelayouts/addMultiple",
      exact: true,
      main: () => <AddMultiSlideLayout authCheckAgent={props.authCheckAgent} />,
      sidebar: () => getSidemenu("slide")
    },
    {
      path: "/slidelayouts",
      exact: true,
      main: () => <SlideLayouts authCheckAgent={props.authCheckAgent} />,
      sidebar: () => getSidemenu("slide")
    },

    /* Slide */

    {
      path: "/slide/editSlide/:slideId?",
      main: props => <AddSlide {...props} authCheckAgent={props.authCheckAgent} />,
      sidebar: () => getSidemenu("slide")
    },
    {
      path: "/slides/addSlide",
      main: () => <AddSlide authCheckAgent={props.authCheckAgent} />,
      sidebar: () => getSidemenu("slide")
    },
    {
      path: "/slides",
      exact: true,
      main: () => <Slides authCheckAgent={props.authCheckAgent} />,
      sidebar: () => getSidemenu("slide")
    },

    /* Sample */
    {
      path: "/samples/editSample/:sampleId?",
      main: props => <AddSample {...props} authCheckAgent={props.authCheckAgent} />,
      sidebar: () => getSidemenu("meta")
    },
    {
      path: "/samples/copySample/:sampleId?",
      main: props => <AddSample {...props} authCheckAgent={props.authCheckAgent} />,
      sidebar: () => getSidemenu("meta")
    },
    {
      path: "/samples/addSample",
      main: () => <AddSample authCheckAgent={props.authCheckAgent} />,
      sidebar: () => getSidemenu("meta")
    },
    {
      path: "/samples",
      exact: true,
      main: () => <Samples authCheckAgent={props.authCheckAgent} />,
      sidebar: () => getSidemenu("meta")
    },

    /* Printer */

    {
      path: "/printers/editPrinter/:printerId?",
      main: props => <AddPrinter {...props} authCheckAgent={props.authCheckAgent} />,
      sidebar: () => getSidemenu("meta")
    },
    {
      path: "/printers/copyPrinter/:printerId?",
      main: props => <AddPrinter {...props} authCheckAgent={props.authCheckAgent} />,
      sidebar: () => getSidemenu("meta")
    },
    {
      path: "/printers/addPrinter",
      main: () => <AddPrinter authCheckAgent={props.authCheckAgent} />,
      sidebar: () => getSidemenu("meta")
    },
    {
      path: "/printers",
      exact: true,
      main: () => <Printers authCheckAgent={props.authCheckAgent} />,
      sidebar: () => getSidemenu("meta")
    },

    /* Image Processing */

    {
      path: "/imageanalysis/editImageAnalysisMetadata/:imageAnalysisId?",
      main: props => <AddImageAnalysis {...props} authCheckAgent={props.authCheckAgent} />,
      sidebar: () => getSidemenu("meta")
    },
    {
      path: "/imageanalysis/copyImageAnalysisMetadata/:imageAnalysisId?",
      main: props => <AddImageAnalysis {...props} authCheckAgent={props.authCheckAgent} />,
      sidebar: () => getSidemenu("meta")
    },
    {
      path: "/imageanalysis/addImageMetadata",
      main: () => <AddImageAnalysis authCheckAgent={props.authCheckAgent} />,
      sidebar: () => getSidemenu("meta")
    },
    {
      path: "/imageanalysis",
      exact: true,
      main: () => <ImageAnalysis authCheckAgent={props.authCheckAgent} />,
      sidebar: () => getSidemenu("meta")
    },

    /* Scanner */
    {
      path: "/scanners/editScanner/:scannerId?",
      main: props => <AddScanner {...props} authCheckAgent={props.authCheckAgent} />,
      sidebar: () => getSidemenu("meta")
    },
    {
      path: "/scanners/copyScanner/:scannerId?",
      main: props => <AddScanner {...props} authCheckAgent={props.authCheckAgent} />,
      sidebar: () => getSidemenu("meta")
    },
    {
      path: "/scanners/addScanner",
      main: () => <AddScanner authCheckAgent={props.authCheckAgent} />,
      sidebar: () => getSidemenu("meta")
    },
    {
      path: "/scanners",
      exact: true,
      main: () => <Scanners authCheckAgent={props.authCheckAgent} />,
      sidebar: () => getSidemenu("meta")
    },

    /* Data Processing */
    {
      path: "/dataprocessing/editDataProcessing/:dataProcessingId?",
      main: props => <AddDataProcessing {...props} authCheckAgent={props.authCheckAgent} />,
      sidebar: () => getSidemenu("meta")
    },
    {
      path: "/dataprocessing/copyDataProcessing/:dataProcessingId?",
      main: props => <AddDataProcessing {...props} authCheckAgent={props.authCheckAgent} />,
      sidebar: () => getSidemenu("meta")
    },
    {
      path: "/dataprocessing/addDataProcessing",
      main: () => <AddDataProcessing authCheckAgent={props.authCheckAgent} />,
      sidebar: () => getSidemenu("meta")
    },
    {
      path: "/dataprocessing",
      exact: true,
      main: () => <DataProcessing authCheckAgent={props.authCheckAgent} />,
      sidebar: () => getSidemenu("meta")
    },

    /* slideMeta */

    {
      path: "/listslidemeta/editSlideMeta/:slideMetaId?",
      main: props => <AddSlideMeta {...props} authCheckAgent={props.authCheckAgent} />,
      sidebar: () => getSidemenu("meta")
    },
    {
      path: "/listslidemeta/copySlideMeta/:slideMetaId?",
      main: props => <AddSlideMeta {...props} authCheckAgent={props.authCheckAgent} />,
      sidebar: () => getSidemenu("meta")
    },
    {
      path: "/listslidemeta/addSlideMeta",
      main: () => <AddSlideMeta authCheckAgent={props.authCheckAgent} />,
      sidebar: () => getSidemenu("meta")
    },
    {
      path: "/listslidemeta",
      exact: true,
      main: () => <SlideMeta authCheckAgent={props.authCheckAgent} />,
      sidebar: () => getSidemenu("meta")
    },
    /* Assay */
    {
      path: "/assays/editAssay/:assayId?",
      main: props => <AddAssay {...props} authCheckAgent={props.authCheckAgent} />,
      sidebar: () => getSidemenu("meta")
    },
    {
      path: "/assays/copyAssay/:assayId?",
      main: props => <AddAssay {...props} authCheckAgent={props.authCheckAgent} />,
      sidebar: () => getSidemenu("meta")
    },
    {
      path: "/assays/addAssay",
      main: () => <AddAssay authCheckAgent={props.authCheckAgent} />,
      sidebar: () => getSidemenu("meta")
    },
    {
      path: "/assays",
      main: () => <Assay authCheckAgent={props.authCheckAgent} />,
      sidebar: () => getSidemenu("meta")
    },

    /* Spots */
    {
      path: "/spots/editSpot/:spotId?",
      main: props => <AddSpot {...props} authCheckAgent={props.authCheckAgent} />,
      sidebar: () => getSidemenu("meta")
    },
    {
      path: "/spots/copySpot/:spotId?",
      main: props => <AddSpot {...props} authCheckAgent={props.authCheckAgent} />,
      sidebar: () => getSidemenu("meta")
    },
    {
      path: "/spots/addSpot",
      main: () => <AddSpot authCheckAgent={props.authCheckAgent} />,
      sidebar: () => getSidemenu("meta")
    },
    {
      path: "/spots",
      main: () => <Spots authCheckAgent={props.authCheckAgent} />,
      sidebar: () => getSidemenu("meta")
    },

    /* experiment */
    {
      path: "/experiments/addExperiment/addGrant/:experimentId?",
      main: props => <AddGrant {...props} authCheckAgent={props.authCheckAgent} />,
      sidebar: () => getSidemenu("experiment")
    },
    {
      path: "/experiments/addRawData/:experimentId?",
      main: props => <AddRawData {...props} authCheckAgent={props.authCheckAgent} />,
      sidebar: () => getSidemenu("experiment")
    },
    {
      path: "/experiments/editExperiment/:experimentId?",
      main: props => <AddExperiment {...props} authCheckAgent={props.authCheckAgent} />,
      sidebar: () => getSidemenu("experiment")
    },
    {
      path: "/experiments/editExperiment/:experimentId?",
      main: props => <AddExperiment {...props} authCheckAgent={props.authCheckAgent} />,
      sidebar: () => getSidemenu("experiment")
    },
    {
      path: "/experiments/addExperiment",
      main: () => <AddExperiment authCheckAgent={props.authCheckAgent} />,
      sidebar: () => getSidemenu("experiment")
    },
    {
      path: "/experiments",
      main: () => <Experiments authCheckAgent={props.authCheckAgent} />,
      sidebar: () => getSidemenu("experiment")
    },

    /* rawdata */

    {
      path: "/rawdata",
      main: () => <RawData authCheckAgent={props.authCheckAgent} />,
      sidebar: () => getSidemenu("experiment")
    },

    /* Process Data */
    {
      path: "/uploadProcessedData/editProcessedData/:experimentId/:processedDataId",
      main: props => <AddProcessedData {...props} authCheckAgent={props.authCheckAgent} />,
      sidebar: () => getSidemenu("experiment")
    },
    {
      path: "/uploadProcessedData/addUploadProcessedData/:experimentId?",
      main: props => <AddProcessedData {...props} authCheckAgent={props.authCheckAgent} />,
      sidebar: () => getSidemenu("experiment")
    },
    // {
    //   path: "/addPublication/:experimentId?",
    //   main: props => <AddPublication {...props} authCheckAgent={props.authCheckAgent} />,
    //   sidebar: () => (
    //     <div className="sidenav">
    //       <SideMenu openMenu={"experiment"} />
    //     </div>
    //   )
    // },

    /* Error Process Data */
    {
      path: "/errorProcessdata",
      main: props => <ErrorPage {...props} authCheckAgent={props.authCheckAgent} />,
      sidebar: () => getSidemenu("experiment")
    }
  ];

  const getSidemenu = menu => {
    return (
      <div className="sidenav">
        <SideMenu openMenu={menu} />
      </div>
    );
  };

  return (
    <>
      <Switch>
        {routes.map((element, index) => {
          // eslint-disable-next-line react/no-children-prop
          return <Route key={index} path={element.path} exact={element.exact} children={<element.sidebar />} />;
        })}
      </Switch>

      <Switch>
        {routes.map((element, index) => {
          // eslint-disable-next-line react/no-children-prop
          return <Route key={index} path={element.path} exact={element.exact} children={<element.main />} />;
        })}
      </Switch>
    </>
  );
};

Routes.propTypes = {
  authCheckAgent: PropTypes.func,
  updateLogin: PropTypes.func
};

export { Routes };
