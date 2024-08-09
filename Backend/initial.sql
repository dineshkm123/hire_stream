-- Table: Users
CREATE TABLE Users (
    email VARCHAR(255) PRIMARY KEY,
    password VARCHAR(255) NOT NULL,
    isadmin BOOLEAN
);

-- Table: Company
CREATE TABLE Company (
    name VARCHAR(255) PRIMARY KEY,
    descr TEXT
);

-- Table: Student
CREATE TABLE Student (
    usn VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    branch VARCHAR(50),
    email VARCHAR(255),
    phoneno VARCHAR(15),
    skills TEXT,
    cgpa FLOAT CHECK (cgpa <= 10),
    userimg VARCHAR(255),
    resume VARCHAR(255),
    github VARCHAR(255),
    linkedin VARCHAR(255),
    graduateyear INT,
    FOREIGN KEY (email) REFERENCES Users(email)
);

-- Table: Admins
CREATE TABLE Admins (
    adminid INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50)
);

-- Table: Job
CREATE TABLE Job (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255),
    descr TEXT,
    employmentType VARCHAR(50),
    package DECIMAL(10, 2),
    stipend DECIMAL(10, 2),
    location VARCHAR(255),
    skills TEXT,
    applicationdeadline DATE,
    eligiblebranches VARCHAR(255),
    companyname VARCHAR(255),
    FOREIGN KEY (companyname) REFERENCES Company(name)
);

-- Table: Applications
CREATE TABLE Applications (
    jobid INT,
    studentid VARCHAR(50),
    applicationdate DATE DEFAULT CURRENT_DATE,
    status VARCHAR(50) DEFAULT 'applied',
    PRIMARY KEY (jobid, studentid),
    FOREIGN KEY (jobid) REFERENCES Job(id),
    FOREIGN KEY (studentid) REFERENCES Student(usn)
);


-- Table: InterviewQuestions
CREATE TABLE InterviewQuestions (
    questionid INT AUTO_INCREMENT PRIMARY KEY,
    adminid INT,
    studentid VARCHAR(50),
    companyname VARCHAR(255),
    question TEXT,
    askedOn DATE,
    FOREIGN KEY (adminid) REFERENCES Admins(adminid),
    FOREIGN KEY (studentid) REFERENCES Student(usn),
    FOREIGN KEY (companyname) REFERENCES Company(name)
);
