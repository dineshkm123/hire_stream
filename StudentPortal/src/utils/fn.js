import runChat from "./gemini";

export function getDate(sqlDate) {
  return new Date(new Date(sqlDate).getTime() + 5.5 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];
}

export function askAi(userName, aiQuestion, companyName) {
  return runChat(
    `Im Students named ${userName} of Banglore Institue of Technology, I have question ${aiQuestion} with recpective to the company ${companyName} as company is visting our campus`
  );
}
