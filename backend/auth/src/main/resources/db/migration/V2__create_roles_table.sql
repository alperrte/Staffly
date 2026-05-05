CREATE TABLE roles (
                       id BIGINT IDENTITY(1,1) PRIMARY KEY,
                       name NVARCHAR(50) NOT NULL UNIQUE,
                       description NVARCHAR(255)
);

INSERT INTO roles (name, description) VALUES
                                          ('SYSTEM_ADMIN', 'Sistem yöneticisi - tüm sisteme erişebilir'),
                                          ('HR_MANAGER', 'İnsan kaynakları yöneticisi'),
                                          ('DEPARTMENT_MANAGER', 'Departman yöneticisi'),
                                          ('EMPLOYEE', 'Standart çalışan');