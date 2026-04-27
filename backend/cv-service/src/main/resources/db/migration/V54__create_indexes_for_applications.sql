CREATE INDEX IX_applications_email
    ON applications(email);

CREATE INDEX IX_applications_status
    ON applications(status);

CREATE INDEX IX_applications_applied_at
    ON applications(applied_at);

CREATE INDEX IX_applications_job_posting_id
    ON applications(job_posting_id);