CREATE TABLE applications (
                              id BIGINT IDENTITY(1,1) PRIMARY KEY,

                              first_name NVARCHAR(100) NOT NULL,
                              last_name NVARCHAR(100) NOT NULL,
                              email NVARCHAR(150) NOT NULL,
                              phone NVARCHAR(30) NOT NULL,
                              job_posting_id BIGINT NOT NULL,
                              department_id BIGINT NOT NULL,
                              sub_department_id BIGINT NOT NULL,
                              position_id BIGINT NOT NULL,

                              department_name NVARCHAR(100) NOT NULL,
                              sub_department_name NVARCHAR(100) NOT NULL,
                              position_name NVARCHAR(100) NOT NULL,

                              cv_original_file_name NVARCHAR(255) NOT NULL,
                              cv_stored_file_name NVARCHAR(255) NOT NULL,
                              cv_file_path NVARCHAR(500) NOT NULL,
                              cv_content_type NVARCHAR(100) NOT NULL,
                              cv_file_size BIGINT NOT NULL,

                              status NVARCHAR(30) NOT NULL DEFAULT 'PENDING',
                              is_reviewed BIT NOT NULL DEFAULT 0,

                              applied_at DATETIME2 NOT NULL DEFAULT GETDATE(),
                              reviewed_at DATETIME2 NULL,
                              created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
                              updated_at DATETIME2 NULL
);