import React, { useState } from 'react';
import Paper from "@material-ui/core/Paper";
import {
  TreeDataState,
  CustomTreeData,
} from '@devexpress/dx-react-grid';
import {
  Grid,
  Table,
  TableHeaderRow,
  TableTreeColumn,
} from '@devexpress/dx-react-grid-material-ui';


const getChildRows = (row, rootRows) => (row ? row.children : rootRows);

const DescriptorTreeTable  = props => {
  const [columns] = useState([
    { name: 'name', title: 'Name'},
    { name: 'value', title: 'Value', wordWrapEnabled: true },
  ]);

  const [data] = useState(props.data);


  const [tableColumnExtensions] = useState([
    { columnName: 'name', width: 300 },
    { columnName: 'value', wordWrapEnabled: true },
  ]);

  return (
    <Paper cla1ssName="border mb-0" s1tyle={{p1adding:"50px", borde1rStyle: "solid"}}>
      <Grid
        rows={data}
        columns={columns}
      >
        <TreeDataState defaultExpandedRowIds={[...Array(props.rowCount).keys()]}/>
        <CustomTreeData
          getChildRows={getChildRows}
        />
        <Table
          columnExtensions={tableColumnExtensions}
        />
        <TableHeaderRow resizingEnabled={true}/>
        <TableTreeColumn
          for="name"
        />
      </Grid>
    </Paper>
  );
};

export default DescriptorTreeTable;
