import React from "react";
import { useState } from "react";
import { useEffect } from "react";
import { NavLink, useParams } from "react-router-dom";
import { notifyErr, notify } from "../../utils/notify";
import { ToastContainer } from "react-toastify";
import configFn from "../../utils/configFn";

const Student = () => {
  const { studentid } = useParams();
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState();
  const [jobs, setJobs] = useState();
  console.log(student, jobs);
  useEffect(() => {
    configFn
      .getStudent(studentid)
      .then((d) => d.json())
      .then((d) => {
        setStudent(d[0]);
        return configFn.appliedBYstudent(d[0].usn);
      })
      .then((d) => d.json())
      .then((d) => setJobs(d))
      .catch((error) => console.log(error.message))
      .finally(() => setLoading(false));
  }, [studentid]);

  if (loading) return <div>Loading...</div>;
  if (student?.error) return <div className="error">{student.error}</div>;

  return (
    student && (
      <>
        <ToastContainer />

        <div className="auth">
          <div className="account-container">
            <img src={student.userimg} alt="User" className="userimg" />
            <h1>Student Information</h1>
            <div className="user-details">
              {Object.entries(student).map(([key, value]) => {
                if (key === "userimg") return null; // Skip user image field
                return (
                  <div key={key} className="usertab">
                    <div className="usertab-label">
                      <strong>{key.toLocaleUpperCase()}</strong>
                    </div>
                    <div className="usertab-value">
                      {value !== null ? (
                        key === "resume" ? (
                          <a
                            href={value}
                            target="_blank"
                            download={student.usn + "resume.pdf"}
                          >
                            Open Resume
                          </a>
                        ) : key === "linkedin" || key === "github" ? (
                          <a
                            href={value}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {value}
                          </a>
                        ) : (
                          value
                        )
                      ) : (
                        "null"
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        {jobs?.error && <div className="error">{jobs?.error}</div>}
        {jobs?.length !== 0 && (
          <div>
            <table className="applied-job-table">
              <thead>
                <tr>
                  <th>Sl.No</th>
                  <th>Title</th>
                  <th>Company Name</th>
                  <th>Current Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {jobs?.map((job, i) => (
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
                          const res = await configFn.changestatus(
                            job.jobid,
                            "rejected",
                            [student.usn]
                          );
                          console.log(res);
                          if (res.status === 200) {
                            notify("Application Rejected", undefined, true);
                            window.location.reload();
                            // setData((p)=> {return {name: p.name, descr: p.descr, jobs:[...job, job[i]]}})
                          } else notifyErr("Rejection failed", undefined, true);
                        }}
                      >
                        Reject
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </>
    )
  );
};

export default Student;
