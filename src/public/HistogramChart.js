/* eslint-disable react/display-name */
import React from "react";
import PropTypes from "prop-types";

import Chart, {
  CommonSeriesSettings,
  Series,
  ValueErrorBar,
  Pane,
  ArgumentAxis,
  ValueAxis,
  Export,
  Legend,
  Label,
  Title,
  Tooltip,
  Grid,
  ZoomAndPan,
  ScrollBar
} from 'devextreme-react/chart';

const HistogramChart = props => {
  let { listIntensityChart } = props;

  const getIntensitiesChart = () => {
    return (
      <>
      <Chart
        id="chart"
        dataSource={listIntensityChart}
        defaultPane="bottom"
      >
        {/* <CommonSeriesSettings argumentField="featureId"/> */}
        <Series
          pane="bottom"
          valueField="rfuBarValue"
          type="bar"
          // barWidth={5}
          name="Glycans"
          argumentField="featureId"
        >
          <ValueErrorBar
            lowValueField="errLow"
            highValueField="errHigh"
            lineWidth={0.5}
            opacity={0.8}
          />
        </Series>
        <Pane name="bottom" />
        <ArgumentAxis
        discreteAxisDivisionMode="crossLabels"
         tick={{shift:3, visible:true}}
        >
          <Label visible={false}/>
        </ArgumentAxis>
        <ValueAxis
          tickInterval={50}
          pane="bottom"
        >
          <Grid visible={false} />
          <Title text="Intensity (RFU)" />
        </ValueAxis>
        <ScrollBar visible={true} />
        <ZoomAndPan argumentAxis="both" />

        <Legend
          // verticalAlignment="bottom"
          visible={false}
          // horizontalAlignment="center"
        />
        <Tooltip
          enabled={true}
          contentRender={imageTooltip}
          // contentComponent={ToolTipHistogramChart}
          interactive={true}
        />
        {/* <Title text="Weather in Los Angeles, California" /> */}
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
      {pointInfo.point.data.cartoon !== "" && <div>
        <img src={"data:image/png;base64," + pointInfo.point.data.cartoon} alt="Glycan img" />
      </div>}
    </div>
  );
}

HistogramChart.propTypes = {
  listIntensityChart: PropTypes.object,
};

export default HistogramChart;
