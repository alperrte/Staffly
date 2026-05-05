CREATE TABLE password_reset_tokens (
                                       id BIGINT IDENTITY(1,1) PRIMARY KEY,
                                       user_id BIGINT NOT NULL,
                                       token NVARCHAR(500) NOT NULL,
                                       expiry_date DATETIME2 NOT NULL,
                                       used BIT NOT NULL DEFAULT 0,
                                       FOREIGN KEY (user_id) REFERENCES users(id)
);