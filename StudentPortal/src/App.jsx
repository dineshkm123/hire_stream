import { useState, useEffect } from "react";
import Form from "./components/profile/Form";
import { useDispatch } from "react-redux";
import { authActions } from "./store/authStore";
import NavBar from "./components/NavBar";
import { Home, About, Error } from "./pages";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import JobRouter from "./pages/jobPosts/JobRouter";
import Slug from "./pages/jobPosts/Slug";
import DisplayJobs from "./pages/jobPosts/DisplayJobs";
import PostJob from "./pages/jobPosts/PostJob";
import Verify from "./pages/Verify";
import authFn from "./utils/authFn";
import Companies from "./components/companies/Companies";
import DetailedComp from "./components/companies/DetailedComp";
import Onboard from "./components/profile/Onboard";

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
          path: "/jobs",
          id: "jobs",
          element: (
            <>
              <div style={{ height: "4rem" }}></div>
              <JobRouter />
            </>
          ),
          children: [
            {
              index: true,
              element: <DisplayJobs />,
            },
            {
              path: "me",
              element: <DisplayJobs me={true} />,
            },
            {
              path: ":id",
              element: <Slug />,
            },
          ],
        },
        {
          path: "/companies",
          id: "companies",
          children: [
            {
              index: true,
              element: <Companies />,
            },
            {
              path: ":name",
              element: <DetailedComp />,
            },
          ],
        },
        { path: "/onboard", element: <Onboard /> },
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
