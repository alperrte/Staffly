ALTER TABLE applications
    ADD CONSTRAINT CHK_applications_status
        CHECK (status IN ('PENDING', 'IN_REVIEW', 'ACCEPTED', 'REJECTED'));

ALTER TABLE applications
    ADD CONSTRAINT CHK_applications_cv_content_type
        CHECK (cv_content_type = 'application/pdf');

ALTER TABLE applications
    ADD CONSTRAINT CHK_applications_cv_file_size
        CHECK (cv_file_size > 0 AND cv_file_size <= 5242880);

ALTER TABLE applications
    ADD CONSTRAINT CHK_applications_email
        CHECK (email LIKE '%_@_%._%');