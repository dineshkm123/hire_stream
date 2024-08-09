import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import configFn from "../../utils/configFn";
import "../jobs.css";
import { useDispatch, useSelector } from "react-redux";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { MdOutlineDeleteOutline, MdEdit } from "react-icons/md";
import { configActions } from "../../store/configStore";
import { getDate } from "../../utils/fn";
const DisplayJobs = ({ me }) => {
  const navigate = useNavigate();
  const state = useSelector((s) => s.auth);
  const user = state.user;
  const [applied, setApplied] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoding] = useState(true);
  const notifyErr = (message, theme, hideProgressBar) => {
    toast.error(message, {
      position: "top-right",
      autoClose: 1000,
      hideProgressBar,
      closeOnClick: true,
      pauseOnHover: false,
      draggable: true,
      progress: undefined,
      theme,
    });
  };
  const notify = (message, theme, hideProgressBar) => {
    toast.success(message, {
      position: "top-right",
      autoClose: 1000,
      hideProgressBar,
      closeOnClick: true,
      pauseOnHover: false,
      draggable: true,
      progress: undefined,
      theme,
    });
  };
  useEffect(() => {
    async function fetchJob() {
      const res = await configFn.getAllDBs();
      const data = await res.json();
      setData(data);
      console.log(data);
      setLoding(false);
    }
    async function fetchAppliedJob() {
      const res = await configFn.appliedBYstudent(user.userData.usn);
      const data = await res.json();
      console.log(data);
      setApplied(data);
      setLoding(false);
    }
    if (state.status && state.status !== "check") {
      fetchAppliedJob();
      fetchJob();
    }
  }, [me]);
  console.log(applied, data);
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
      {me && applied && (
        <div className=" alterwidth">
          <table className="applied-job-table">
            <thead>
              <tr>
                <th>Sl.No</th>
                <th>Title</th>
                <th>Company Name</th>
                <th>Application Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {applied.map((job, i) => (
                <tr key={i}>
                  <td>{i + 1}</td>
                  <td>{job.job_title}</td>
                  <td>
                    <NavLink to={"/companies/" + job.company_name}>
                      {job.company_name}
                    </NavLink>
                  </td>
                  <td
                    className={
                      job.status === "rejected"
                        ? "red-text"
                        : job.status === "selected"
                        ? "green-text"
                        : ""
                    }
                  >
                    {job.status.toUpperCase()}
                  </td>
                  <td>
                    <button
                      className="details-button red"
                      disabled={job.status !== "applied"}
                      onClick={async () => {
                        const res = await configFn.removeApplied(
                          job.jobid,
                          user.userData.usn
                        );
                        console.log(res);
                        if (res.status === 200) {
                          notify("Withdrawal completed", undefined, true);
                          window.location.reload();
                        } else notifyErr("Withdrawal failed", undefined, true);
                      }}
                    >
                      Withdraw Application
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>{" "}
        </div>
      )}
      {!me && data
        ? data.map((job) => {
            return (
              <>
                <div className="job-card" key={job.ID}>
                  <h2>{job.title}</h2>
                  <p>{job.descr}</p>
                  <p>
                    Application Deadline:{" "}
                    <b>{getDate(job.applicationdeadline)}</b>
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
                  <button
                    className="details-button"
                    onClick={async () => {
                      const res = await configFn.apply(
                        job.id,
                        user.userData.usn
                      );
                      console.log(res);
                      const result = await res.json();
                      if (res.status === 200)
                        notify("Job Applied Sucessfully", undefined, true);
                      else notifyErr(result.error, undefined, true);
                    }}
                  >
                    Apply Job
                  </button>
                  <div>
                    Job posted by{" "}
                    <NavLink to={"/companies/" + job.companyname}>
                      {job.companyname}{" "}
                    </NavLink>
                  </div>
                </div>
              </>
            );
          })
        : !me && <div>No jobs available </div>}
    </div>
  );
};

export default DisplayJobs;
