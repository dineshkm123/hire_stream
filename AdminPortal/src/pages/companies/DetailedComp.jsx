import React from "react";
import { useEffect } from "react";
import { useState } from "react";
import { useParams, NavLink, Outlet } from "react-router-dom";
import configFn from "../../utils/configFn";
import { useSelector } from "react-redux";
import "./DetailedComp.css";

const slug = () => {
  const { name } = useParams();
  const [comp, setComp] = useState();
  const [questions, setQuestions] = useState([]);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const state = useSelector((s) => s.auth);
  const user = state.user;
  console.log(comp);
  useEffect(() => {
    configFn
      .getCompanyBYname(name)
      .then((d) => d.json())
      .then((d) => {
        setComp(d);
        return configFn.getQuestions(name);
      })
      .then((response) => response.json())
      .then((data) => {
        console.log("-----------", data);
        setQuestions(data);
      })
      .catch((e) => console.log("Error:", e.message))
      .finally(() => setLoading(false));
  }, [name]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!question.trim()) return;
    console.log(user.userData.usn);
    const newQuestion = {
      adminid: user.userData.adminid,
      companyname: name,
      question: question.trim(),
    };

    configFn
      .addQuestion(newQuestion)
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        setQuestions([
          ...questions,
          {
            questionid: data.insertId,
            name: user.userData.name,
            ...newQuestion,
          },
        ]);
        setQuestion("");
      })
      .catch((e) => console.log("Error:", e.message));
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="detailed-comp-container">
      {comp && (
        <div className="company-info">
          <h2 className="company-name">{comp.name}</h2>
          <p className="company-descr">{comp.descr}</p>
        </div>
      )}
      <form onSubmit={handleSubmit} className="question-form">
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Add your question"
          required
          className="question-input"
        ></textarea>
        <button type="submit" className="submit-button">
          Submit
        </button>
      </form>

      <h3 className="questions-title">Questions</h3>
      <ul className="questions-list">
        {questions &&
          questions.map((q) => (
            <li key={q.questionid} className="question-item">
              {q.studentid ? (
                <NavLink
                  to={"/student/" + q.studentid}
                  className="student-link"
                >
                  <img src={q.userimg} alt="Student" className="student-img" />
                  <strong>{q.name}:</strong>
                </NavLink>
              ) : (
                <div className="student-link">
                  <img src="/admin.png" alt="Admin" className="admin-img" />
                  <strong>{q.name}(ADMIN)</strong>
                </div>
              )}
              <p className="question-text">{q.question}</p>
            </li>
          ))}
      </ul>
    </div>
  );
};

export default slug;
