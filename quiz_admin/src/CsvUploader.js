import React, { useState } from "react";
import Papa from "papaparse";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TableSortLabel, Paper } from "@mui/material";
import { visuallyHidden } from "@mui/utils"; // Used for the sorting label for accessibility

const CsvUploader = () => {
  const [data, setData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [order, setOrder] = useState("asc"); // sorting order: 'asc' or 'desc'
  const [orderBy, setOrderBy] = useState("correct_count"); // column to sort by

  const handleFileUpload = (event) => {
    const file = event.target.files[0];

    if (file) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (result) => {
          setHeaders(Object.keys(result.data[0] || {})); // Extract headers
          setData(result.data); // Set parsed data
        },
        error: (error) => {
          console.error("Error parsing CSV:", error);
        },
      });
    }
  };

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const sortData = (array, comparator) => {
    const stabilizedArray = array.map((el, index) => [el, index]);
    stabilizedArray.sort((a, b) => {
      const order = comparator(a[0], b[0]);
      if (order !== 0) return order;
      return a[1] - b[1];
    });
    return stabilizedArray.map((el) => el[0]);
  };

  const descendingComparator = (a, b, orderBy) => {
    if (b[orderBy] < a[orderBy]) {
      return -1;
    }
    if (b[orderBy] > a[orderBy]) {
      return 1;
    }
    return 0;
  };

  const comparator = (order, orderBy) => {
    return order === "desc"
      ? (a, b) => descendingComparator(a, b, orderBy)
      : (a, b) => -descendingComparator(a, b, orderBy);
  };

  const sortedData = sortData(data, comparator(order, orderBy));

  return (
    <div className="csv-container">
      <h1 className="csv-heading">CSV Uploader</h1>
      <input
        type="file"
        accept=".csv"
        onChange={handleFileUpload}
        className="csv-file-input"
      />
      {data.length > 0 && (
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-labelledby="tableTitle" size="medium">
            <TableHead>
              <TableRow>
                {headers.map((header) => (
                  <TableCell key={header}>
                    <TableSortLabel
                      active={orderBy === header}
                      direction={orderBy === header ? order : "asc"}
                      onClick={(event) => handleRequestSort(event, header)}
                    >
                      {header}
                      {orderBy === header ? (
                        <span style={visuallyHidden}>
                          {order === "desc" ? "sorted descending" : "sorted ascending"}
                        </span>
                      ) : null}
                    </TableSortLabel>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedData.map((row, rowIndex) => (
                <TableRow hover key={rowIndex}>
                  {headers.map((header, colIndex) => (
                    <TableCell key={colIndex}>{row[header]}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </div>
  );
};

export default CsvUploader;
