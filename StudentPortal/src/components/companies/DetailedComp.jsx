import React, { useState, useEffect } from "react";
import { generatePath, NavLink, useParams } from "react-router-dom";
import configFn from "../../utils/configFn";
import { useSelector } from "react-redux";
import "./DetailedComp.css";
import { askAi } from "../../utils/fn";

function refacterResponce(response) {
  let responseArray = response.split("**");
  let newResponse = "";
  for (let i = 0; i < responseArray.length; i++) {
    if (i === 0 || i % 2 !== 1) {
      newResponse += responseArray[i];
    } else {
      newResponse += "</br><b>" + responseArray[i] + "</b>";
    }
  }
  return newResponse.split("*").join("</br>");
}

const DetailedComp = () => {
  const { name } = useParams();
  const [comp, setComp] = useState();
  const [questions, setQuestions] = useState([]);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [aiQuestions, setAiQuestions] = useState([]);
  const [aiQuestion, setAiQuestion] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [aiButton, setAiButton] = useState(null);
  const [aiError, setAiError] = useState(null);
  const [showAiSection, setShowAiSection] = useState(false);
  const state = useSelector((s) => s.auth);
  const user = state.user;

  useEffect(() => {
    configFn
      .getCompanyBYname(name)
      .then((response) => response.json())
      .then((data) => {
        setComp(data);
        return configFn.getQuestions(name);
      })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        setQuestions(data);
      })
      .catch((e) => {
        setError(e.message);
        setLoading(false);
      })
      .finally(() => setLoading(false));
  }, [name]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!question.trim()) return;
    const newQuestion = {
      studentid: user.userData.usn,
      companyname: name,
      question: question.trim(),
    };

    configFn
      .addQuestion(newQuestion)
      .then((response) => response.json())
      .then((data) => {
        setQuestions([
          ...questions,
          {
            questionid: data.insertId,
            name: user.userData.name,
            userimg: user.userData.userimg,
            ...newQuestion,
          },
        ]);
        setQuestion("");
      })
      .catch((e) => console.log("Error:", e.message));
  };

  const delayPara = (index, nextWord, length) => {
    setTimeout(function () {
      setAiResponse((prev) => prev + nextWord);
      if (length - 1 === index) setAiButton(null);
    }, 75 * index);
  };

  const handleAiSubmit = (e) => {
    e.preventDefault();
    setAiError(null);
    generateAnswer();
  };

  const generateAnswer = () => {
    if (!aiQuestion.trim()) return;
    setAiQuestions((p) => [{ question: "", response: "" }, ...p]);
    setAiResponse("loading");
    setAiButton("loading");

    askAi(user.userData.name, aiQuestion, name)
      // .then((response) => response.json())
      .then((response) => {
        let code = response.split("```");
        console.log(code, code[1]);
        let newResponse2 = "";
        let newResponseArray;
        if (code[1]) {
          let res0 = refacterResponce(code[0]);
          let res2 = refacterResponce(code[2]);
          newResponse2 = res0 + code[1] + res2;
          newResponseArray = res0.split(" ");
          newResponseArray.push(code[1]);
          newResponseArray.push(...res2.split(" "));
        } else {
          newResponse2 = refacterResponce(response);
          newResponseArray = newResponse2.split(" ");
        }

        setAiQuestions((p) => [
          { question: aiQuestion, response: newResponse2 },
          ...p.slice(1),
        ]);
        setAiResponse("");
        for (let i = 0; i < newResponseArray.length; i++) {
          const nextWord = newResponseArray[i];
          delayPara(i, nextWord + " ", newResponseArray.length);
        }
        // setAiResponse(data.response);
      })
      .catch((e) => {
        setAiError(e.message);
        setAiButton(null);
        console.log("Error:", e.message);
      });
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;
  return (
    <>
      <div className="detailed-comp-container">
        {comp && (
          <div className="company-info">
            <h2 className="company-name">{comp.name}</h2>
            <p className="company-descr">{comp.descr}</p>
          </div>
        )}
        <h3 className="questions-title">Questions asked in Campus Interview</h3>
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

        <ul className="questions-list">
          {questions &&
            questions?.map((q) => (
              <li key={q.questionid} className="question-item">
                {q.studentid ? (
                  <NavLink
                    // to={"/student/" + q.studentid} //askMam: can student be able to see other student details
                    className="student-link"
                  >
                    <img
                      src={q.userimg}
                      alt="Student"
                      className="student-img"
                    />
                    <strong>{q.name}:</strong>
                  </NavLink>
                ) : (
                  <div className="student-link">
                    <img src="/admin.png" alt="Admin" className="admin-img" />
                    <strong>{q.name}(ADMIN)</strong>
                  </div>
                )}
                <p className="question-text">{q.question}</p>
                <br />
                <button
                  onClick={() => {
                    setShowAiSection(true);
                    setAiQuestion(q.question);
                    // generateAnswer();
                  }}
                >
                  Get Answer from AI
                </button>
              </li>
            ))}
        </ul>

        <button
          className="toggle-ai-button"
          onClick={() => setShowAiSection(!showAiSection)}
        >
          {showAiSection ? "Hide Ask AI" : "Ask AI"}
        </button>
      </div>
      <div className={`ai-section ${showAiSection ? "visible" : "hidden"}`}>
        <form onSubmit={handleAiSubmit} className="ai-form">
          <textarea
            value={aiQuestion}
            onChange={(e) => setAiQuestion(e.target.value)}
            placeholder="Ask AI about this company"
            required
            className="ai-input"
          ></textarea>
          <button
            type="submit"
            disabled={aiButton}
            className="ai-submit-button"
          >
            {aiButton ? "Generating Answer..." : "Ask AI"}
          </button>
        </form>
        {aiError && <div className="error">{aiError}</div>}
        {aiResponse && (
          <div className="ai-response result">
            <div className="result-title">
              <img src={user.userData.userimg} alt="YOU" />
              {aiResponse === "loading" ? (
                <p>{aiQuestion}</p>
              ) : (
                <p>{aiQuestions[0]?.question}</p>
              )}
            </div>
            <div className="result-data">
              <img src="/bit.png" alt="BIT" />
              {aiResponse === "loading" ? (
                <div className="loader">
                  <hr />
                  <hr />
                  <hr />
                </div>
              ) : (
                <p dangerouslySetInnerHTML={{ __html: aiResponse }}></p>
              )}
            </div>
          </div>
        )}
        {aiQuestions.length > 1 &&
          aiQuestions.slice(1).map((q) => (
            <div className="ai-response result" key={q.q}>
              <div className="result-title">
                <img src={user.userData.userimg} alt="YOU" />
                <p>{q.question}</p>
              </div>
              <div className="result-data">
                <img src="/bit.png" alt="BIT" />
                <p dangerouslySetInnerHTML={{ __html: q.response }}></p>
              </div>
            </div>
          ))}
      </div>
    </>
  );
};

export default DetailedComp;
