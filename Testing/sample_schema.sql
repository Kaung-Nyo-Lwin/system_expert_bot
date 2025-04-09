-- Note: Table creation order adjusted to resolve foreign key dependencies.
-- 'Group' is a reserved keyword in SQL; consider renaming to 'ResearchGroup' or using backticks.

CREATE TABLE Location (
  zip_code varchar(10) PRIMARY KEY,
  country varchar(100) NOT NULL,
  createdAt datetime NOT NULL DEFAULT now(),
  updatedAt datetime
);

CREATE TABLE User (
  id bigint PRIMARY KEY AUTO_INCREMENT,
  full_name varchar(100) NOT NULL,
  email varchar(100) NOT NULL UNIQUE,
  phone_numer varchar(20) NOT NULL UNIQUE,
  dob date NOT NULL,
  zip_code varchar(10) NOT NULL,
  createdAt datetime NOT NULL DEFAULT now(),
  updatedAt datetime,
  FOREIGN KEY (zip_code) REFERENCES Location (zip_code) ON UPDATE CASCADE
);

CREATE TABLE Skill (
  id bigint PRIMARY KEY AUTO_INCREMENT,
  name varchar(100) NOT NULL,
  description varchar(255) NULL,
  createdAt datetime NOT NULL DEFAULT now(),
  updatedAt datetime
);

CREATE TABLE User_Skill (
  user_id bigint,
  skill_id bigint,
  proficiency_level enum('Basic', 'Intermediate', 'Expert') DEFAULT 'Basic' NOT NULL,
  createdAt datetime NOT NULL DEFAULT now(), 
  updatedAt datetime,
  PRIMARY KEY (user_id, skill_id),
  FOREIGN KEY (user_id) REFERENCES User (id) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (skill_id) REFERENCES Skill (id) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE Education (
  id bigint PRIMARY KEY AUTO_INCREMENT,
  university_name varchar(100),
  createdAt datetime NOT NULL DEFAULT now(),
  updatedAt datetime
);

-- Corrected foreign key: education_id instead of user_id referencing Education
CREATE TABLE User_Education (
  user_id bigint,
  education_id bigint,
  graduation_date date NOT NULL,
  degree enum('Associate', 'Bachelor', 'Master', 'PhD', 'Diploma') NOT NULL,
  specialization varchar(100) NOT NULL,
  createdAt datetime NOT NULL DEFAULT now(),
  updatedAt datetime,
  FOREIGN KEY (user_id) REFERENCES User (id) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (education_id) REFERENCES Education (id) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE Domain (
  id bigint PRIMARY KEY AUTO_INCREMENT,
  name varchar(100) NOT NULL,
  description varchar(255),
  createdAt datetime NOT NULL DEFAULT now(),
  updatedAt datetime
);

CREATE TABLE Patent (
  id bigint PRIMARY KEY AUTO_INCREMENT,
  title varchar(100) NOT NULL,
  summary varchar(255) NULL,
  status enum('Approved', 'Expired') DEFAULT 'Pending' NOT NULL,
  domain_id bigint NOT NULL,
  patent_no varchar(100) NOT NULL UNIQUE,
  registration_date date NOT NULL,
  expire_date date,
  createdAt datetime NOT NULL DEFAULT now(),
  updatedAt datetime,
  FOREIGN KEY (domain_id) REFERENCES Domain (id) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE User_Patent (
  user_id bigint DEFAULT 0, -- 0 indicates deleted user
  patent_id bigint,
  createdAt datetime NOT NULL DEFAULT now(),
  updatedAt datetime,
  PRIMARY KEY (user_id, patent_id),
  FOREIGN KEY (user_id) REFERENCES User (id) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (patent_id) REFERENCES Patent (id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE Publisher (
  id bigint PRIMARY KEY AUTO_INCREMENT,
  title varchar(100) NOT NULL,
  description varchar(255),
  createdAt datetime NOT NULL DEFAULT now(),
  updatedAt datetime
);

CREATE TABLE `Group` ( -- Enclosed in backticks to avoid reserved keyword conflict
  id bigint PRIMARY KEY AUTO_INCREMENT,
  title varchar(100),
  createdAt datetime NOT NULL DEFAULT now(),
  updatedAt datetime
);

CREATE TABLE Publication (
  id bigint PRIMARY KEY AUTO_INCREMENT,
  title varchar(255) NOT NULL,
  domain_id bigint,
  publisher_id bigint,
  publication_date date,
  abstract varchar(255) NULL,
  keywords varchar(255) NOT NULL,
  doi varchar(255) NOT NULL UNIQUE,
  status enum('Draft', 'Submitted', 'Under Review', 'Published', 'Rejected') DEFAULT 'Draft' NOT NULL,
  group_id bigint NULL,
  createdAt datetime NOT NULL DEFAULT now(),
  updatedAt datetime,
  FOREIGN KEY (domain_id) REFERENCES Domain (id) ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (publisher_id) REFERENCES Publisher (id) ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (group_id) REFERENCES `Group` (id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE User_Publication (
  user_id bigint,
  publication_id bigint,
  user_role enum('Lead Author', 'Corresponding Author') DEFAULT 'Lead Author' NOT NULL,
  createdAt datetime NOT NULL DEFAULT now(),
  updatedAt datetime,
  PRIMARY KEY (user_id, publication_id),
  FOREIGN KEY (user_id) REFERENCES User (id) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (publication_id) REFERENCES Publication (id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE User_Group (
  user_id bigint,
  group_id bigint,
  createdAt datetime NOT NULL DEFAULT now(),
  updatedAt datetime,
  PRIMARY KEY (user_id, group_id),
  FOREIGN KEY (user_id) REFERENCES User (id) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (group_id) REFERENCES `Group` (id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE Organization (
  id bigint PRIMARY KEY AUTO_INCREMENT,
  name varchar(100),
  type varchar(100),
  createdAt datetime NOT NULL DEFAULT now(),
  updatedAt datetime
);

CREATE TABLE Position (
  id bigint PRIMARY KEY AUTO_INCREMENT,
  title varchar(100) NOT NULL,
  description varchar(255),
  createdAt datetime NOT NULL DEFAULT now(),
  updatedAt datetime
);

CREATE TABLE Experience (
  id bigint PRIMARY KEY AUTO_INCREMENT,
  user_id bigint NOT NULL,
  position_id bigint NOT NULL,
  organization_id bigint NOT NULL,
  domain_id bigint NOT NULL,
  start_date date NOT NULL,
  end_date date,
  createdAt datetime NOT NULL DEFAULT now(),
  updatedAt datetime,
  FOREIGN KEY (domain_id) REFERENCES Domain (id) ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (position_id) REFERENCES Position (id) ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (user_id) REFERENCES User (id) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (organization_id) REFERENCES Organization (id) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE Communication (
  id bigint PRIMARY KEY AUTO_INCREMENT,
  user_id bigint NULL,
  group_id bigint NOT NULL,
  message varchar(255) NOT NULL,
  createdAt datetime NOT NULL DEFAULT now(),
  updatedAt datetime,
  FOREIGN KEY (user_id) REFERENCES User (id) ON DELETE SET NULL ON UPDATE CASCADE,
  FOREIGN KEY (group_id) REFERENCES `Group` (id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE Project (
  id bigint PRIMARY KEY AUTO_INCREMENT,
  group_id bigint NULL,
  domain_id bigint NOT NULL,
  name varchar(100) NOT NULL,
  description varchar(255),
  status enum('Not Started', 'In Progress', 'Completed', 'Cancelled'),
  start_date date NOT NULL,
  end_date date,
  createdAt datetime NOT NULL DEFAULT now(),
  updatedAt datetime,
  FOREIGN KEY (domain_id) REFERENCES Domain (id) ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (group_id) REFERENCES `Group` (id) ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE User_Project (
  project_id bigint,
  user_id bigint,
  hours int NOT NULL,
  user_role enum('Lead', 'Member') NOT NULL DEFAULT 'Member',
  user_contribution varchar(255),
  createdAt datetime NOT NULL DEFAULT now(),
  updatedAt datetime,
  FOREIGN KEY (project_id) REFERENCES Project (id) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (user_id) REFERENCES User (id) ON DELETE CASCADE ON UPDATE CASCADE
);