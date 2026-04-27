CREATE TABLE password_reset_tokens (
                                       id BIGINT IDENTITY(1,1) PRIMARY KEY,
                                       user_id BIGINT NOT NULL,
                                       token NVARCHAR(500) NOT NULL,
                                       expiry_date DATETIME2 NOT NULL,
                                       FOREIGN KEY (user_id) REFERENCES users(id)
);