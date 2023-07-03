// eslint-disable-next-line no-unused-vars
import React, {useState, useMemo} from "react";
import cloneDeep from "lodash/cloneDeep";
import throttle from "lodash/throttle";
import Pagination from "rc-pagination";
import "rc-pagination/assets/index.css";
import '../styles.css';
import { spaceData } from '../data/spaceList';
// eslint-disable-next-line no-unused-vars
import { isMatchWith } from "lodash";


const useSortableData = (items, config = null) => {
  const [sortConfig, setSortConfig] = useState(config);

  const sortedItems = useMemo(() => {
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
    console.log("*** requestSort", key, sortConfig);
    let direction = 'ascending';
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === 'ascending'
    ) {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  return { items: sortedItems, requestSort, sortConfig };
};
// eslint-disable-next-line no-unused-vars
const SortTable = (props) => {
  // eslint-disable-next-line no-unused-vars
  const { items, requestSort, sortConfig } = useSortableData(props.collectionData);

  const getClassNamesFor = (name) => {
    if (!sortConfig) {
      return;
    }
    return sortConfig.key === name ? sortConfig.direction : undefined;
  };

 return (
  <>
    <thead>
        <tr>
          <th>
            Mission Name
            <button type="button" onClick={() => requestSort('mission_name')} className={getClassNamesFor('mission_name')}>
            ↕
            </button> 
          </th>
          <th>
            Rocket Name
            <button type="button" onClick={() => requestSort('rocket_name')} className={getClassNamesFor('rocket_name')}>
            ↕
            </button>
          </th>
          <th>
            Rocket Type
            <button type="button" onClick={() => requestSort('rocket_type')} className={getClassNamesFor('rocket_type')}>
            ↕
            </button>
          </th>
          <th>
            Launch Date
            <button type="button" onClick={() => requestSort('launch_date_local')} className={getClassNamesFor('launch_date_local')}>
            ↕
            </button>
          </th>
        </tr>
      </thead>
      <tbody className="trhover">
        {items.map(item => {
          return (
            <tr key={item.id}>
              <td>{item.mission_name}</td>
              <td>{item.rocket.rocket_name}</td>
              <td>{item.rocket.rocket_type}</td>
              <td>{item.launch_date_local.substring(0,10)}</td>
          </tr>
          )
        })}
    </tbody>
  </>
 )
}

// eslint-disable-next-line no-unused-vars
const tableHead = {
  mission_name: "Mission Name",
  rocket_name: "Rocket Name",
  rocket_type: "Rocket Type",
  launch_date_local: "Launch Date",
};

const Table = () => {
  const countPerPage = 20;
  const [value, setValue] = React.useState("");
  const [currentPage, setCurrentPage] = React.useState(1);
  const [collection, setCollection] = React.useState(
    cloneDeep(spaceData.slice(0, countPerPage))
  );
  const searchData = React.useRef(
    throttle(val => {
      const query = val.toLowerCase();
      setCurrentPage(1);
      const data = cloneDeep(
        spaceData.filter(item => item.mission_name.toLowerCase().indexOf(query) > -1)
        .slice(0, countPerPage) 
      );
      setCollection(data);
    }, 400)
  );

  React.useEffect(() => {
    if (!value) {
      updatePage(1);
    } else {
      searchData.current(value);
    }
  }, [value]);

  const updatePage = p => {
    setCurrentPage(p);
    const to = countPerPage * p;
    const from = to - countPerPage;
    setCollection(cloneDeep(spaceData.slice(from, to)));
  };

  return (
    <>
      <div class="search">
        <input
          placeholder="Search for..."
          value={value}
          onChange={e => setValue(e.target.value)}
        />
      </div>
      <table>
        <SortTable collectionData={collection}/>
      </table>
      <Pagination
        pageSize={countPerPage}
        onChange={updatePage}
        current={currentPage}
        total={spaceData.length}
      />
    </>
  );
};

export default Table;
