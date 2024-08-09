import React, { useEffect, useState } from "react";
import { useNavigate, useParams, NavLink } from "react-router-dom";
import configFn from "../../utils/configFn";
import "../jobs.css";
import { useDispatch, useSelector } from "react-redux";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { MdOutlineDeleteOutline, MdEdit } from "react-icons/md";
import { configActions } from "../../store/configStore";
import { notifyErr, notify } from "../../utils/notify";
import { saveAs } from "file-saver";
import XlsxPopulate from "xlsx-populate";
import { Buffer } from "buffer";
import { getDate } from "../../utils/fn";
import PosterGenerater from "../../components/PosterGenerater";
window.Buffer = Buffer;

function getSheetData(data, header) {
  var fields = Object.keys(data[0]);
  var sheetData = data.map(function (row) {
    return fields.map(function (fieldName) {
      return row[fieldName] ? row[fieldName] : "";
    });
  });
  sheetData.unshift(header);
  return sheetData;
}

async function saveAsExcel(data) {
  data = data.map((d) => {
    const { userimg, ...data } = d.student;
    return { applicationdate: d.applicationdate, ...data };
  });
  // let header = Object.keys(data[0]).map((header) => header.toLocaleUpperCase());
  let header = Object.keys(data[0]);

  XlsxPopulate.fromBlankAsync().then(async (workbook) => {
    const sheet1 = workbook.sheet(0);
    const sheetData = getSheetData(data, header);
    const totalColumns = sheetData[0].length;

    sheet1.cell("A1").value(sheetData);
    const range = sheet1.usedRange();
    const endColumn = String.fromCharCode(64 + totalColumns);
    sheet1.row(1).style("bold", true);
    sheet1.range("A1:" + endColumn + "1").style("fill", "BFBFBF");
    range.style("border", true);
    return workbook.outputAsync().then((res) => {
      saveAs(res, "file.xlsx");
    });
  });
}

const DisplayJobs = () => {
  const { name } = useParams();
  const navigate = useNavigate();
  const state = useSelector((s) => s.auth);
  const dispatch = useDispatch();
  const [data, setData] = useState(null);
  const [del, setDelete] = useState(null);
  const [loading, setLoding] = useState(true);
  console.log(data);
  useEffect(() => {
    dispatch(configActions.startEditingPost(null));
  }, []);
  useEffect(() => {
    setDelete(null);
    async function fetchJob() {
      configFn
        .getCompanyBYname(name)
        .then((d) => d.json())
        .then((d) => setData(d))
        .catch((e) => console.log("Error:", e.message));
      setLoding(false);
    }
    if (state.status && state.status !== "check") {
      fetchJob();
    }
  }, [del]);
  if (!state.status) {
    return (
      <div className="message">
        Unauthorized -{" "}
        <button className="navbar-btn" onClick={() => navigate("/account")}>
          Sign Up / Log In
        </button>{" "}
        to see Jobs available
      </div>
    );
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <ToastContainer />
      <h2>
        <NavLink to={"/companies/" + name}>{name}</NavLink>
      </h2>
      {data?.jobs ? (
        data.jobs.map((job) => {
          return (
            <div className="job-card" key={job.id}>
              <span
                className="delete"
                onClick={() => {
                  configFn.deleteDB(job.id);
                  console.log(job.id);
                  setDelete(true);
                  notify("Job Deleted Sucessfully", undefined, true);
                }}
              >
                <MdOutlineDeleteOutline className="icon" />
              </span>
              <span
                className="edit"
                onClick={() => {
                  dispatch(configActions.startEditingPost(job.id));
                  navigate("../post");
                }}
              >
                <MdEdit className="icon" />
              </span>
              <h2>{job.title}</h2>
              <p>{job.descr}</p>
              <p>
                Application Deadline: <b>{getDate(job.applicationdeadline)}</b>
              </p>
              <div className="techs">
                <div>Location:</div>{" "}
                <div>
                  {job.location.split(",").map((tech, idx) => (
                    <span key={idx}>{tech}</span>
                  ))}
                </div>
              </div>
              <div className="techs">
                <div>Skills:</div>{" "}
                <div>
                  {job.skills.split(",").map((tech, idx) => (
                    <span key={idx}>{tech}</span>
                  ))}
                </div>
              </div>
              <div className="techs">
                <div>Eligible Branches:</div>{" "}
                <div>
                  {job.eligiblebranches.split(",").map((tech, idx) => (
                    <span key={idx}>{tech}</span>
                  ))}
                </div>
              </div>
              <div className="techs">
                <div>Employment Type:</div>{" "}
                <div>
                  {job.employmentType.split(",").map((tech, idx) => (
                    <span key={idx}>{tech}</span>
                  ))}
                </div>
              </div>
              <br />
              <div>Package: ₹{job.package}</div>
              <div>Stipend: ₹{job.stipend}</div>
              {job.applications && (
                <>
                  <div className=" alterwidth">
                    <table className="applied-job-table">
                      <thead>
                        <tr>
                          {job.applications.length !== 0 ? (
                            <>
                              <th>Sl.No</th>
                              <th>Job Seeker</th>
                              <th>Current Status</th>
                              <th></th>
                              <th></th>
                            </>
                          ) : (
                            <th>NO APPLICANTS</th>
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {job.applications.map((j, i) => (
                          <tr key={i}>
                            <td>{i + 1}</td>
                            <td>
                              <NavLink to={"/student/" + j.student.usn}>
                                {j.student.name}
                              </NavLink>
                            </td>
                            <td
                              className={
                                j.status === "rejected"
                                  ? "red-text"
                                  : j.status === "selected"
                                  ? "green-text"
                                  : ""
                              }
                            >
                              {j.status.toUpperCase()}
                            </td>
                            <td>
                              <button
                                className="details-button red"
                                disabled={j.status !== "applied"}
                                onClick={async () => {
                                  console.log(j);
                                  const res = await configFn.changestatus(
                                    job.id,
                                    "rejected",
                                    [j.student.usn]
                                  );
                                  console.log(res);
                                  if (res.status === 200) {
                                    notify(
                                      "Application Rejected",
                                      undefined,
                                      true
                                    );
                                    window.location.reload();
                                    // setData((p)=> {return {name: p.name, descr: p.descr, jobs:[...job, job[i]]}})
                                  } else
                                    notifyErr(
                                      "Rejection failed",
                                      undefined,
                                      true
                                    );
                                }}
                              >
                                Reject
                              </button>
                            </td>
                            <td>
                              <button
                                className="details-button"
                                disabled={j.status !== "applied"}
                                onClick={async () => {
                                  // console.log(j);
                                  const res = await configFn.changestatus(
                                    job.id,
                                    "selected",
                                    [j.student.usn]
                                  );
                                  console.log(res);
                                  if (res.status === 200) {
                                    notify(
                                      "Application Accepted",
                                      undefined,
                                      true
                                    );
                                    window.location.reload();
                                    // setData((p)=> {return {name: p.name, descr: p.descr, jobs:[...job, job[i]]}})
                                  } else
                                    notifyErr(
                                      "Acception failed",
                                      undefined,
                                      true
                                    );
                                }}
                              >
                                Accept
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div>
                    {job.applications.length !== 0 && (
                      <button onClick={() => saveAsExcel(job.applications)}>
                        Download Student List
                      </button>
                    )}
                  </div>
                  <br />
                  <div>
                    {job.applications.filter((app) => app.status === "selected")
                      .length !== 0 && (
                      <PosterGenerater
                        list={job.applications
                          .filter((app) => app.status === "selected")
                          .map((j) => {
                            return {
                              name: j.student.name,
                              usn: j.student.usn,
                              userimg: j.student.userimg,
                            };
                          })}
                        company={{ name }}
                        job={{ title: job.title }}
                      />
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })
      ) : (
        <div>No jobs available </div>
      )}
    </div>
  );
};

export default DisplayJobs;
