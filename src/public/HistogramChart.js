/* eslint-disable react/display-name */
import React from "react";
import PropTypes from "prop-types";

import Chart, {
  Series,
  ValueErrorBar,
  ArgumentAxis,
  ValueAxis,
  Export,
  Legend,
  Label,
  Title,
  Tooltip,
  Grid,
  ZoomAndPan,
  ScrollBar,
} from 'devextreme-react/chart';

const HistogramChart = props => {
  let { listIntensityChart } = props;

  const getIntensitiesChart = () => {
    return (
      <>
        <Chart
          id="histogram"
          dataSource={listIntensityChart}
          adjustOnZoom={false}
          stickyHovering={false}
        >
          <Series
            valueField="rfuBarValue"
            type="bar"
            name="Glycans"
            argumentField="featureId"
            hoverStyle={{color:"#fac29a"}}
            barWidth={10}
          >
            <ValueErrorBar
              lowValueField="errLow"
              highValueField="errHigh"
              lineWidth={0.5}
              opacity={0.8}
            />
          </Series>
          <ArgumentAxis
            discreteAxisDivisionMode="crossLabels"
          >
            <Label visible={false}/>
          </ArgumentAxis>
          <ValueAxis
             showZero={true}
          >
            <Grid visible={false}/>
            <Title text="Intensity (RFU)"/>
          </ValueAxis>
          <ScrollBar visible={true}/>
          <ZoomAndPan argumentAxis="both"/>
          <Legend visible={false}/>
          <Export enabled={true}/>
          <Tooltip
            enabled={true}
            contentRender={imageTooltip}
            interactive={true}
            location="edge"
          />
        </Chart>
      </>
    );
  };

  return (
    <>
      {listIntensityChart && getIntensitiesChart()}
    </>
  );
};

function imageTooltip(pointInfo) {

  return (
    
    <div style={{ height: "auto", width: "auto", minHeight: "100%", minWidth: "100%", overflow:"visible" }}>
      <div>
      <strong>Glycan ID: </strong>{pointInfo.point.data.glycanId}&nbsp;
      </div>
      <div>
        <strong>Linker Name: </strong>{pointInfo.point.data.linkerName}&nbsp;
        </div>
        <div>
        <strong>RFU: </strong>{pointInfo.point.data.rfu}&nbsp;
        </div>
        <div>
        <strong>Std Dev: </strong>{pointInfo.point.data.stDev}&nbsp;
        </div>
        {pointInfo.point.data.cartoon !== "" && <div style={{ height:  pointInfo.point.data.height + "px", width:  pointInfo.point.data.width + "px"}}>
          <img src={"data:image/png;base64," + pointInfo.point.data.cartoon} alt="Glycan img" />
        </div>}
    </div>
  );
}

HistogramChart.propTypes = {
  listIntensityChart: PropTypes.object,
};

export default HistogramChart;
