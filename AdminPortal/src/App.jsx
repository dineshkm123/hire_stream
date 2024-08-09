import { useState, useEffect } from "react";
import Form from "./components/profile/Form";
import { useDispatch } from "react-redux";
import { authActions } from "./store/authStore";
import NavBar from "./components/NavBar";
import { Home, About, Error } from "./pages";
import { RouterProvider, createBrowserRouter, Outlet } from "react-router-dom";
import JobRouter from "./pages/jobPosts/JobRouter";
import DetailedComp from "./pages/companies/DetailedComp";
import DisplayJobs from "./pages/jobPosts/DisplayJobs";
import PostJob from "./pages/jobPosts/PostJob";
import Verify from "./pages/Verify";
import authFn from "./utils/authFn";
import Companies from "./pages/companies/Companies";
import PostCompany from "./pages/companies/PostCompany";
import DisplayStudents from "./pages/students/DisplayStudents";
import Student from "./pages/students/Student";

function App() {
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();
  const router = createBrowserRouter([
    {
      path: "/",
      element: (
        <>
          <div style={{ height: "4rem" }}></div>
          <NavBar />
        </>
      ),
      errorElement: (
        <>
          <div style={{ height: "4rem" }}></div>
          <NavBar />
          <Error />
        </>
      ),
      children: [
        {
          index: true,
          element: <Home />,
        },
        { path: "/account", element: <Form loading={loading} /> },
        { path: "/about", element: <About /> },
        {
          path: "/companies",
          element: (
            <>
              <div style={{ height: "2rem" }}></div>
              <Outlet />
            </>
          ),
          children: [
            { index: true, element: <Companies /> },
            {
              path: "post",
              element: <PostCompany />,
            },
            {
              path: ":name",
              element: (
                <>
                  <div style={{ height: "4rem" }}></div>
                  <JobRouter />
                </>
              ),
              children: [
                {
                  index: true,
                  element: <DetailedComp />,
                },
                {
                  path: "jobs",
                  element: <DisplayJobs />,
                },
                {
                  path: "post",
                  element: <PostJob />,
                },
              ],
            },
          ],
        },
        {
          path: "/students",
          element: <DisplayStudents />,
        },
        {
          path: "/student/:studentid",
          element: <Student />,
        },
      ],
    },
    { path: "/verify", element: <Verify /> },
  ]);

  useEffect(() => {
    const userData = authFn.getCurrentUser();
    if (userData) {
      dispatch(authActions.login({ userData }));
    } else {
      dispatch(authActions.logout());
    }
    setLoading(false);
  }, []);

  return <RouterProvider router={router} />;
}

export default App;
