IF COL_LENGTH('dbo.employees', 'profile_image') IS NULL
BEGIN
    ALTER TABLE dbo.employees ADD profile_image NVARCHAR(500);
END;

IF COL_LENGTH('dbo.employee_personal_info', 'medeni_durum') IS NULL
BEGIN
    ALTER TABLE dbo.employee_personal_info ADD medeni_durum NVARCHAR(50);
END;

IF COL_LENGTH('dbo.employee_personal_info', 'tc') IS NULL
BEGIN
    ALTER TABLE dbo.employee_personal_info ADD tc NVARCHAR(20);
END;
