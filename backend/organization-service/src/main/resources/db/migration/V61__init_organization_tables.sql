CREATE TABLE organizations (
                               id BIGINT IDENTITY(1,1) PRIMARY KEY,
                               name NVARCHAR(255) NOT NULL,
                               description NVARCHAR(500),
                               created_at DATETIME2 DEFAULT GETDATE(),
                               updated_at DATETIME2,
                               deleted BIT DEFAULT 0
);

CREATE TABLE positions (
                           id BIGINT IDENTITY(1,1) PRIMARY KEY,
                           name NVARCHAR(255) NOT NULL,
                           description NVARCHAR(500),
                           created_at DATETIME2 DEFAULT GETDATE(),
                           updated_at DATETIME2,
                           deleted BIT DEFAULT 0
);

CREATE TABLE titles (
                        id BIGINT IDENTITY(1,1) PRIMARY KEY,
                        name NVARCHAR(255) NOT NULL,
                        description NVARCHAR(500),
                        created_at DATETIME2 DEFAULT GETDATE(),
                        updated_at DATETIME2,
                        deleted BIT DEFAULT 0
);

CREATE TABLE organization_positions (
                                        id BIGINT IDENTITY(1,1) PRIMARY KEY,
                                        organization_id BIGINT NOT NULL,
                                        position_id BIGINT NOT NULL,
                                        created_at DATETIME2 DEFAULT GETDATE(),

                                        CONSTRAINT fk_org FOREIGN KEY (organization_id) REFERENCES organizations(id),
                                        CONSTRAINT fk_pos FOREIGN KEY (position_id) REFERENCES positions(id)
);

CREATE TABLE position_titles (
                                 id BIGINT IDENTITY(1,1) PRIMARY KEY,
                                 position_id BIGINT NOT NULL,
                                 title_id BIGINT NOT NULL,
                                 created_at DATETIME2 DEFAULT GETDATE(),

                                 CONSTRAINT fk_position FOREIGN KEY (position_id) REFERENCES positions(id),
                                 CONSTRAINT fk_title FOREIGN KEY (title_id) REFERENCES titles(id)
);