import React from "react";
import configFn from "../../utils/configFn";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const DisplayStudents = () => {
  const [loading, setLoding] = useState(true);
  const [data, setData] = useState([]);
  useEffect(() => {
    async function fetchStudents() {
      const res = await configFn.getStudents();
      const data = await res.json();
      console.log(data);
      setData(data);
      setLoding(false);
    }
    fetchStudents();
  }, []);
  if (loading) return <div>Loading...</div>;
  if (data.error) return <div className="error">{data.error}</div>;
  return (
    <div>
      <div>
        <table className="applied-job-table">
          <thead>
            <tr>
              {data?.length !== 0 ? (
                <>
                  <th>Sl.No</th>
                  <th>USN</th>
                  <th>Name</th>
                  <th>Branch</th>
                  <th>CGPA</th>
                  <th>Email</th>
                  <th>Phone No</th>
                </>
              ) : (
                <th>NO STUDENTS FOUND</th>
              )}
            </tr>
          </thead>
          <tbody>
            {data.map((s, i) => (
              <tr key={s.usn}>
                <td>{i + 1}</td>
                <td>
                  <Link to={"/student/" + s.usn}>{s.usn}</Link>
                </td>
                <td>{s.name}</td>
                <td>{s.branch}</td>
                <td>{s.cgpa}</td>
                <td>
                  <a href={`mailto:${s.email}`}>{s.email}</a>
                </td>
                <td>{s.phoneno}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DisplayStudents;
