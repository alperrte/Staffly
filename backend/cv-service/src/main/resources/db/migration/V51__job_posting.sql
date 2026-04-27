CREATE TABLE job_postings (
                              id BIGINT IDENTITY(1,1) PRIMARY KEY,

                              title NVARCHAR(150) NOT NULL,
                              description NVARCHAR(MAX) NOT NULL,

                              department_id BIGINT NOT NULL,
                              sub_department_id BIGINT NOT NULL,
                              position_id BIGINT NOT NULL,

                              department_name NVARCHAR(100) NOT NULL,
                              sub_department_name NVARCHAR(100) NOT NULL,
                              position_name NVARCHAR(100) NOT NULL,

                              experience_level NVARCHAR(100) NULL,
                              employment_type NVARCHAR(50) NULL,
                              work_model NVARCHAR(50) NULL,
                              location NVARCHAR(150) NULL,

                              requirements NVARCHAR(MAX) NULL,
                              responsibilities NVARCHAR(MAX) NULL,
                              benefits NVARCHAR(MAX) NULL,
                              team_info NVARCHAR(MAX) NULL,

                              status NVARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
                              application_deadline DATE NULL,

                              is_deleted BIT NOT NULL DEFAULT 0,

                              created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
                              updated_at DATETIME2 NULL,
                              closed_at DATETIME2 NULL

);

ALTER TABLE job_postings
    ADD CONSTRAINT CHK_job_postings_status
        CHECK (status IN ('ACTIVE', 'CLOSED', 'DRAFT'));

ALTER TABLE job_postings
    ADD CONSTRAINT CHK_job_postings_employment_type
        CHECK (employment_type IS NULL OR employment_type IN ('FULL_TIME', 'PART_TIME', 'INTERNSHIP', 'CONTRACT'));

ALTER TABLE job_postings
    ADD CONSTRAINT CHK_job_postings_work_model
        CHECK (work_model IS NULL OR work_model IN ('ON_SITE', 'REMOTE', 'HYBRID'));