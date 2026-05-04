CREATE TABLE company_holidays (
                                  id BIGINT IDENTITY(1,1) PRIMARY KEY,

                                  name NVARCHAR(150) NOT NULL,
                                  holiday_date DATE NOT NULL,

                                  description NVARCHAR(500) NULL,

                                  is_active BIT NOT NULL DEFAULT 1,

                                  created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
                                  updated_at DATETIME2 NULL,

                                  CONSTRAINT UQ_holiday_date UNIQUE (holiday_date)
);