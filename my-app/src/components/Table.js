import React, { useState, useEffect, useMemo } from "react";
import cloneDeep from "lodash/cloneDeep";
import throttle from "lodash/throttle";
import Pagination from "rc-pagination";
import "rc-pagination/assets/index.css";
import '../styles.css';

const API_URL = "https://api.jsonbin.io/v3/b/67fc913e8561e97a50ff04b0";

const useSortableData = (items, config = null) => {
  const [sortConfig, setSortConfig] = useState(config);

  const sortedItems = useMemo(() => {
    if (!Array.isArray(items)) return [];
    let sortableItems = [...items];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [items, sortConfig]);

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  return { items: sortedItems, requestSort, sortConfig };
};

const SortTable = ({ collectionData }) => {
  const { items, requestSort, sortConfig } = useSortableData(collectionData);

  return (
    <>
      <thead>
        <tr>
          <th>Mission Name <button onClick={() => requestSort('mission_name')}>↕</button></th>
          <th>Rocket Name <button onClick={() => requestSort('rocket_name')}>↕</button></th>
          <th>Rocket Type <button onClick={() => requestSort('rocket_type')}>↕</button></th>
          <th>Launch Date <button onClick={() => requestSort('launch_date_local')}>↕</button></th>
        </tr>
      </thead>
      <tbody>
        {items.map((item, index) => (
          <tr key={index}>
            <td>{item.mission_name}</td>
            <td>{item.rocket?.rocket_name || 'N/A'}</td>
            <td>{item.rocket?.rocket_type || 'N/A'}</td>
            <td>{item.launch_date_local ? item.launch_date_local.substring(0,10) : 'N/A'}</td>
          </tr>
        ))}
      </tbody>
    </>
  );
};

const Table = () => {
  const countPerPage = 20;
  const [value, setValue] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [collection, setCollection] = useState([]);
  const [allData, setAllData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(API_URL)
      .then(response => response.json())
      .then(data => {
        console.log("Fetched data:", JSON.stringify(data, null, 2));
        const launches = data.record?.data?.launches;
        if (Array.isArray(launches)) {
          setAllData(launches);
          setCollection(cloneDeep(launches.slice(0, countPerPage)));
        } else {
          setError("Fetched data does not contain a 'record.data.launches' array");
          setAllData([]);
          setCollection([]);
        }
      })
      .catch(error => {
        console.error("Error fetching data:", error);
        setError("Error fetching data");
        setAllData([]);
        setCollection([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const searchData = useMemo(() => throttle((val) => {
    const query = val.toLowerCase();
    setCurrentPage(1);
    const filteredData = allData.filter(item =>
      item.mission_name?.toLowerCase().includes(query)
    );
    setCollection(cloneDeep(filteredData.slice(0, countPerPage)));
  }, 400), [allData]);

  useEffect(() => {
    if (!value) {
      updatePage(1);
    } else {
      searchData(value);
    }
  }, [value, searchData]);

  const updatePage = (p) => {
    setCurrentPage(p);
    const to = countPerPage * p;
    const from = to - countPerPage;
    setCollection(cloneDeep(allData.slice(from, to)));
  };

  if (loading) return <p>Loading data...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <>
      <div className="search">
        <input
          placeholder="Search for..."
          value={value}
          onChange={e => setValue(e.target.value)}
        />
      </div>
      <table>
        <SortTable collectionData={collection} />
      </table>
      <Pagination
        pageSize={countPerPage}
        onChange={updatePage}
        current={currentPage}
        total={allData.length}
      />
    </>
  );
};

export default Table;

