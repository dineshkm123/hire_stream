const express = require("express");
const mysql = require("mysql2");
const path = require("path");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const multer = require("multer");
const cloudinary = require("cloudinary");
const bodyParser = require("body-parser");
const fs = require("fs");
require("dotenv").config();

const app = express();

// Body parser middleware
app.use(bodyParser.json());

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp");
  },
  filename: function (req, file, cb) {
    cb(null, req.query.studentid + "_-_" + file.originalname);
  },
});

const upload = multer({ storage });

cloudinary.v2.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

function cloudinaryUpload(localPath, resource_type = "auto") {
  console.log("-------------", localPath, resource_type);
  // if (resource_type === " image")
  return cloudinary.v2.uploader.upload(localPath, {
    resource_type,
    // publicId: `pdfs/${path.basename(localPath, path.extname(localPath))}`, // Optional: specify a custom public ID
  });
  // else return cloudinary.v2.api.resource(localPath, { pages: true });
}

function cloudinaryDestroy(publicId) {
  // return cloudinary.v2.uploader.destroy("sample", {
  //   type: "upload",
  //   resource_type: "image",
  // });
  return cloudinary.v2.uploader.destroy(publicId);
}

// app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname + "/html")));

const pool = mysql
  .createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
  })
  .promise();

app.use(
  cors({
    origin: [process.env.FRONTEND_URL, process.env.ADMIN_FRONTEND_URL],
  })
);

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Methods",
    "GET,HEAD,OPTIONS,POST,PUT,DELETE"
  );
  // Use this granting all persmissions ("Access-Control-Allow-Methods", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  next();
});

app.post("/user/signup", async (req, res) => {
  try {
    const [user] = await pool.query(
      "SELECT * FROM Users WHERE email=?",
      req.body.email
    );
    if (user.length) {
      return res.status(401).json({ error: "User Exists with this email" });
    } else {
      const [result] = await pool.query(
        `
      INSERT INTO Users (email, password, isadmin)
      VALUES (?, ?, ?)
      `,
        [
          req.body.email,
          bcrypt.hashSync(req.body.password, 10),
          req.body.isadmin,
        ]
      );
      if (req.body.isadmin) {
        const [compresult] = await pool.query(
          `
      INSERT INTO Admins (email, name, role)
      VALUES (?, ?, ?)
      `,
          [req.body.email, req.body.name, req.body.role]
        );
      } else {
        const [seekerresult] = await pool.query(
          `
      INSERT INTO Student (usn, name, branch, email, phoneno, skills, cgpa)
      VALUES (?,?,?,?,?,?,?)
      `,
          [
            req.body.usn,
            req.body.name,
            req.body.branch,
            req.body.email,
            req.body.phoneno,
            req.body.skills,
            req.body.cgpa,
          ]
        );
      }
      return res.json({
        sucess: "user added sucessfully",
      });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal server error: " + error.message });
  }
});

// app.post(
//   "/test",
//   upload.fields([{ name: "userimg" }, { name: "resume" }]),
//   async (req, res) => {
//     const usn = "1BI21IS023";
//     console.log(req.body, usn, req.files);
//     if (!usn) {
//       return res.status(410).json({ error: "Student ID is required" });
//     }
//     try {
//       // const olddata =
//       let imageUrl = null;
//       let resumeUrl = null;

//       if (req.files.userimg) {
//         const imageResponse = await cloudinaryUpload(
//           req.files.userimg[0].path,
//           "image"
//         );
//         imageUrl = imageResponse.url;
//         console.log("========erigho==========", imageUrl);
//       }

//       if (req.files.resume) {
//         const resumeResponse = await cloudinaryUpload(req.files.resume[0].path);
//         resumeUrl = resumeResponse.url;
//         console.log(resumeUrl);
//       }

//       // const [result] = await pool.query(
//       //   `
//       // UPDATE Student
//       // SET, resume = IFNULL(?, resume), github = ?, linkedin = ?, graduateyear = ?, userimg = IFNULL(?, userimg)
//       // WHERE usn = ?
//       // `,
//       //   [resumeUrl, github, linkedin, graduateyear, imageUrl, usn]
//       // );

//       // if (result.affectedRows === 0) {
//       //   return res.status(405).json({ error: "Student not found" });
//       // }

//       // const [updatedRows] = await pool.query(
//       //   "SELECT * FROM Student WHERE usn = ?",
//       //   [usn]
//       // );
//       // const token = jwt.sign(updatedRows[0], process.env.JWT_PRIVATEKEY);
//       // return res
//       //   .status(201)
//       //   .cookie("auth", token)
//       //   .json({ token, isadmin: false });
//     } catch (error) {
//       console.log(error);
//       res
//         .status(500)
//         .json({ error: "Internal server error: " + error.message });
//     }
//   }
// );

app.post(
  "/user/onboard",
  upload.fields([{ name: "userimg" }]),
  async (req, res) => {
    const usn = req.query.studentid;
    console.log(req.body, usn, req.files);
    if (!usn) {
      return res.status(410).json({ error: "Student ID is required" });
    }
    const { github, linkedin, graduateyear, resume } = req.body;
    try {
      const [student] = await pool.query(
        "SELECT * FROM Student WHERE usn=?",
        usn
      );
      console.log(student[0]);

      let imageUrl = null;
      // let resumeUrl = null;

      if (req.files.userimg) {
        const imageResponse = await cloudinaryUpload(
          req.files.userimg[0].path,
          "image"
        );
        imageUrl = imageResponse.url;
        console.log(
          "========erigho==========",
          imageUrl,
          req.files.userimg[0].path
        );
        fs.unlinkSync(req.files.userimg[0].path);
      }

      // if (req.files.resume) {
      //   const resumeResponse = await cloudinaryUpload(
      //     req.files.resume[0].path,
      //     "raw"
      //   );
      //   resumeUrl = resumeResponse.url;
      //   console.log(resumeUrl);
      // }

      const [result] = await pool.query(
        `
      UPDATE Student
      SET resume = ?, github = ?, linkedin = ?, graduateyear = ?, userimg = IFNULL(?, userimg)
      WHERE usn = ?
      `,
        [resume, github, linkedin, graduateyear, imageUrl, usn]
      );

      if (result.affectedRows === 0) {
        return res.status(405).json({ error: "Student not found" });
      }

      const [updatedRows] = await pool.query(
        "SELECT * FROM Student WHERE usn = ?",
        [usn]
      );
      const token = jwt.sign(updatedRows[0], process.env.JWT_PRIVATEKEY);
      return res
        .status(201)
        .cookie("auth", token)
        .json({ token, isadmin: false });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ error: "Internal server error: " + error.message });
    }
  }
);

// app.post("/user/onboard", async (req, res) => {
//   const usn = req.query.studentid;
//   if (!usn) {
//     return res.status(410).json({ error: "Student ID is required" });
//   }
//   const { github, linkedin, graduateyear, resume } = req.body;
//   try {
//     const [result] = await pool.query(
//       `
//       UPDATE Student
//       SET resume = ?, github = ?, linkedin = ?, graduateyear = ?
//       WHERE usn = ?
//       `,
//       [resume, github, linkedin, graduateyear, usn]
//     );

//     if (result.affectedRows === 0) {
//       return res.status(405).json({ error: "Student not found" });
//     }

//     const [updatedRows] = await pool.query(
//       "SELECT * FROM Student WHERE usn = ?",
//       [usn]
//     );
//     const token = jwt.sign(updatedRows[0], process.env.JWT_PRIVATEKEY);
//     return res
//       .status(201)
//       .cookie("auth", token)
//       .json({ token, isadmin: false });
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ error: "Internal server error: " + error.message });
//   }
// });

app.post("/user/login", async (req, res) => {
  try {
    const [user] = await pool.query(
      "SELECT * FROM Users WHERE email=?",
      req.body.email
    );
    if (user.length === 0) {
      return res.status(404).json({ error: "User does't Exists" });
    }
    if (bcrypt.compareSync(req.body.password, user[0].password)) {
      if (user[0].isadmin) {
        const [compresult] = await pool.query(
          "SELECT * FROM Admins WHERE email=?",
          req.body.email
        );
        const token = jwt.sign(compresult[0], process.env.JWT_PRIVATEKEY);
        return res
          .status(201)
          .cookie("auth", token)
          .json({ token, isadmin: true });
        // return res.status(201).json(compresult[0]);
      } else {
        const [seekerresult] = await pool.query(
          "SELECT * FROM Student WHERE email=?",
          req.body.email
        );
        const token = jwt.sign(seekerresult[0], process.env.JWT_PRIVATEKEY);
        return res
          .status(201)
          .cookie("auth", token)
          .json({ token, isadmin: false });
        // return res.status(201).json(seekerresult[0]);
      }
    } else {
      return res.status(401).json({ error: "Incorrect password" });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal server error: " + error.message });
  }
});

app.get("/get", async (req, res) => {
  const jobid = req.query.id; // New parameter for companyId
  const currentDate = new Date().toISOString().split("T")[0]; // Current date in YYYY-MM-DD format
  try {
    let query;
    let params = [];

    if (jobid) {
      // Fetch jobs for the specific company regardless of the deadline
      query = "SELECT * FROM Job WHERE id = ?";
      params = [jobid];
    } else {
      // Fetch jobs where the application deadline is still valid
      query = "SELECT * FROM Job WHERE applicationDeadline >= ?";
      params = [currentDate];
    }

    const [jobs] = await pool.query(query, params);
    return res.json(jobs);
  } catch (error) {
    res.status(500).json({ error: "Internal server error: " + error.message });
  }
});

app.post("/post", async (req, res) => {
  const {
    title,
    descr,
    employmentType,
    package,
    stipend,
    location,
    skills,
    applicationdeadline,
    eligiblebranches,
    companyname,
  } = req.body;

  try {
    const [result] = await pool.query(
      `
      INSERT INTO Job (
        title,
        descr,
        employmentType,
        package,
        stipend,
        location,
        skills,
        applicationdeadline,
        eligiblebranches,
        companyname
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        title,
        descr,
        employmentType,
        package,
        stipend,
        location,
        skills,
        applicationdeadline,
        eligiblebranches,
        companyname,
      ]
    );

    return res.json({
      success: "Job added successfully",
      jobId: result.insertId,
    });
  } catch (error) {
    res.status(500).json({ error: "Internal server error: " + error.message });
  }
});

app.put("/put", async (req, res) => {
  const jobid = req.query.id;

  if (!jobid) {
    return res.status(400).json({ error: "Job ID is required" });
  }

  const {
    title,
    descr,
    employmentType,
    package,
    stipend,
    location,
    skills,
    applicationdeadline,
    eligiblebranches,
    companyname,
  } = req.body;

  try {
    const [result] = await pool.query(
      `
      UPDATE Job
      SET title = ?,
          descr = ?,
          employmentType = ?,
          package = ?,
          stipend = ?,
          location = ?,
          skills = ?,
          applicationdeadline = ?,
          eligiblebranches = ?,
          companyname = ?
      WHERE id = ?
      `,
      [
        title,
        descr,
        employmentType,
        package,
        stipend,
        location,
        skills,
        applicationdeadline,
        eligiblebranches,
        companyname,
        jobid,
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: `No job found with ID ${jobid}` });
    }

    return res.json({
      success: `Job with ID ${jobid} successfully updated`,
    });
  } catch (error) {
    res.status(500).json({ error: "Internal server error: " + error.message });
  }
});

app.delete("/delete", async (req, res) => {
  const jobid = req.query.id;
  try {
    const [result1] = await pool.query(
      `
    DELETE FROM Applications
    WHERE jobid = ?
  `,
      jobid
    );
    const [result2] = await pool.query(
      `
    DELETE FROM Job
    WHERE id = ?
  `,
      jobid
    );
    return res.json({
      sucess: `job at id ${jobid} sucessfully deleted`,
    });
  } catch (error) {
    res.status(500).json({ error: "Internal server error: " + error.message });
  }
});

app.get("/get/:q", async (req, res) => {
  const q = req.params.q;
  try {
    const [result] = await pool.query(
      `
    SELECT *
    FROM Job
    WHERE descr LIKE '%${q}%'
      OR title LIKE '%${q}%'
      OR employmentType LIKE '%${q}%'
      OR skills LIKE '%${q}%'
    ORDER BY id ASC;
    `
    );
    res.send(result);
  } catch (error) {
    res.status(500).json({ error: "Internal server error: " + error.message });
  }
});

app.get("/getstudents", async (req, res) => {
  const studentid = req.query.studentid; // New parameter for companyId
  try {
    let query;
    let params = [];
    if (studentid) {
      query = "SELECT * FROM Student WHERE usn = ?";
      params = [studentid];
    } else {
      query = "SELECT * FROM Student";
    }
    const [students] = await pool.query(query, params);
    return res.json(students);
  } catch (error) {
    res.status(500).json({ error: "Internal server error: " + error.message });
  }
});

app.get("/getcomp", async (req, res) => {
  const companyName = req.query.name;
  try {
    if (companyName) {
      const [results] = await pool.query(
        `
        SELECT 
          c.name AS company_name,
          c.descr AS company_descr,
          j.id AS job_id,
          j.title AS job_title,
          j.descr AS job_descr,
          j.employmentType,
          j.package,
          j.stipend,
          j.location,
          j.skills AS job_skills,
          j.applicationdeadline,
          j.eligiblebranches,
          a.applicationdate,
          a.status,
          s.usn AS student_usn,
          s.name AS student_name,
          s.branch AS student_branch,
          s.email AS student_email,
          s.phoneno AS student_phoneno,
          s.skills AS student_skills,
          s.cgpa AS student_cgpa,
          s.resume AS student_resume,
          s.userimg AS student_userimg
        FROM Company c
        LEFT JOIN Job j ON c.name = j.companyname
        LEFT JOIN Applications a ON j.id = a.jobid
        LEFT JOIN Student s ON a.studentid = s.usn
        WHERE c.name = ?
        ORDER BY j.id ASC;
        `,
        [companyName]
      );
      if (!results.length) {
        return res.status(404).json({ error: "Company not found" });
      }
      // Restructure the result to group jobs and their respective applications
      const companyData = {
        name: results[0].company_name,
        descr: results[0].company_descr,
        jobs: [],
      };
      if (results[0].job_id) {
        results.forEach((row) => {
          let job = companyData.jobs.find((job) => job.id === row.job_id);
          if (!job) {
            job = {
              id: row.job_id,
              title: row.job_title,
              descr: row.job_descr,
              employmentType: row.employmentType,
              package: row.package,
              stipend: row.stipend,
              location: row.location,
              skills: row.job_skills,
              applicationdeadline: row.applicationdeadline,
              eligiblebranches: row.eligiblebranches,
              applications: [],
            };
            companyData.jobs.push(job);
          }
          if (row.applicationdate) {
            job.applications.push({
              applicationdate: row.applicationdate,
              status: row.status,
              student: {
                usn: row.student_usn,
                name: row.student_name,
                branch: row.student_branch,
                email: row.student_email,
                phoneno: row.student_phoneno,
                skills: row.student_skills,
                resume: row.student_resume,
                userimg: row.student_userimg,
                cgpa: row.student_cgpa,
              },
            });
          }
        });
      }
      return res.json(companyData);
    }
    const query = "SELECT * FROM Company";
    const [companies] = await pool.query(query);
    res.json(companies);
  } catch (error) {
    console.error("Error fetching companies:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/postcomp", async (req, res) => {
  const { name, descr } = req.body;

  try {
    const query = `
      INSERT INTO Company (name, descr)
      VALUES (?, ?)
    `;
    await pool.query(query, [name, descr]);

    res
      .status(201)
      .json({ success: true, message: "Company created successfully" });
  } catch (error) {
    console.error("Error creating company:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.put("/putcomp", async (req, res) => {
  const companyId = req.query.id;
  const { name, descr } = req.body;

  try {
    const query = `
      UPDATE Company
      SET name = ?, descr = ?
      WHERE id = ?
    `;
    await pool.query(query, [name, descr, companyId]);

    res.json({
      success: true,
      message: `Company ${companyId} updated successfully`,
    });
  } catch (error) {
    console.error(`Error updating company ${companyId}:`, error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/apply", async (req, res) => {
  try {
    const [result] = await pool.query(
      `
  INSERT INTO Applications ( jobid ,studentid)
  VALUES (?, ?)
  `,
      [req.body.jobid, req.body.studentid]
    );
    return res.json({ sucess: "Your Application is submited sucessfully" });
  } catch (error) {
    console.log(error);
    if (error.message.includes("Duplicate"))
      return res.status(500).json({ error: "Job Already Applied" });
    else return res.status(500).json({ error: error.message });
  }
});

app.get("/getapplied", async (req, res) => {
  const studentid = req.query.studentid;
  const jobid = req.query.jobid;
  const admin = req.query.admin; //bool

  try {
    if (admin) {
      if (!jobid) {
        return res.status(400).json({ error: "jobid parameter is required" });
      }
      const [result] = await pool.query(
        `
        SELECT C.name AS company_name, J.title AS job_title, A.applicationdate
        FROM Applications A
        JOIN Job J ON A.jobid = J.id
        JOIN Company C ON J.companyname = C.name
        WHERE A.status = 'applied' AND A.jobid = ?;;
        `,
        jobid
      );
      res.json(result);
    } else {
      if (!studentid) {
        return res.status(400).json({ error: "Email parameter is required" });
      }
      const [result] = await pool.query(
        `
        SELECT C.name AS company_name, J.title AS job_title, A.applicationdate, A.status, J.id as jobid 
        FROM  Applications A 
        JOIN Job J ON A.jobid = J.id 
        JOIN Company C ON J.companyname = C.name 
        WHERE  A.studentid = ?;
        `,
        studentid
      );
      res.json(result);
    }
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

app.put("/removeapplied", async (req, res) => {
  const { jobid, studentid } = req.query;
  console.log(req.query);
  if (!jobid || !studentid) {
    return res.status(400).json({ error: "Email parameter is required" });
  }

  try {
    const [result] = await pool.query(
      `
      DELETE FROM Applications
      WHERE jobid = ? AND studentid = ?;;
      `,
      [jobid, studentid]
    );
    console.log(result);
    return res.json({
      sucess: `job at id ${jobid} for ${studentid} sucessfully removed`,
    });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/changestatus", async (req, res) => {
  console.log(req.body);
  const { jobid, status } = req.query;
  const studentidArray = req.body;

  if (!jobid || !status || !studentidArray || !Array.isArray(studentidArray)) {
    console.log(true);
    return res.status(400).json({ error: "Invalid input" });
  }

  try {
    // Construct a string of placeholders for the IN clause
    const placeholders = studentidArray.map(() => "?").join(",");
    console.log(placeholders);
    // Flatten the studentidArray and add the jobid and status to the parameters array
    const params = [status, jobid, ...studentidArray];
    console.log(params);

    const query = `
      UPDATE Applications
      SET status = ?
      WHERE jobid = ? AND studentid IN (${placeholders});
    `;

    const [result] = await pool.query(query, params);

    res.json({
      success: `Updated status for job at id ${jobid} for ${result.affectedRows} applications.`,
    });
  } catch (error) {
    res.status(500).json({ error: "Internal server error: " + error.message });
  }
});

app.post("/addquestion", async (req, res) => {
  const { studentid, companyname, question, adminid } = req.body;
  const askedOn = new Date().toISOString().slice(0, 10); // Get current date
  try {
    let query;
    let id;
    if (studentid) {
      query =
        "INSERT INTO InterviewQuestions (studentid, companyname, question, askedOn) VALUES (?, ?, ?, ?)";
      id = studentid;
    } else if (adminid) {
      query =
        "INSERT INTO InterviewQuestions (adminid, companyname, question, askedOn) VALUES (?, ?, ?, ?)";
      id = adminid;
    }
    const [result] = await pool.query(query, [
      id,
      companyname,
      question,
      askedOn,
    ]);

    res.json({
      success: "Question added successfully",
      questionId: result.insertId,
    });
  } catch (error) {
    console.error("Error adding question:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/getquestions", async (req, res) => {
  const companyName = req.query.companyname;

  try {
    const query = `
      SELECT iq.*, 
       COALESCE(s.name, a.name) AS name, 
       s.userimg 
      FROM InterviewQuestions iq
      LEFT JOIN Student s ON iq.studentid = s.usn AND iq.adminid IS NULL
      LEFT JOIN Admins a ON iq.adminid = a.adminid AND iq.adminid IS NOT NULL
      WHERE iq.companyname = ?;
    `;
    const [questions] = await pool.query(query, [companyName]);
    res.json(questions);
  } catch (error) {
    console.error("Error fetching questions:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(8080, (err) => {
  console.log("running on 8080");
});
