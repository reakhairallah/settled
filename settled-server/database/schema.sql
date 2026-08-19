CREATE TABLE users (
    id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    username        VARCHAR(50)  NOT NULL UNIQUE,
    email           VARCHAR(255) NOT NULL UNIQUE,
    password_hash   TEXT         NOT NULL,
    created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE trips (
    id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    created_by      INT UNSIGNED NOT NULL,
    name            VARCHAR(100) NOT NULL,
    destination     VARCHAR(100) NOT NULL,
    start_date      DATE NOT NULL,
    end_date        DATE NOT NULL,
    budget_tier     TINYINT UNSIGNED NOT NULL,
    invite_code     VARCHAR(12)  NOT NULL UNIQUE,
    created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_trips_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT chk_trips_budget_tier CHECK (budget_tier BETWEEN 1 AND 3),
    CONSTRAINT chk_trips_dates CHECK (end_date >= start_date)
) ENGINE=InnoDB;

CREATE INDEX idx_trips_created_by ON trips(created_by);

CREATE TABLE trip_members (
    id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    trip_id         INT UNSIGNED NOT NULL,
    user_id         INT UNSIGNED NOT NULL,
    energy_level    TINYINT UNSIGNED NOT NULL,
    interests       TEXT NULL,
    joined_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_members_trip FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
    CONSTRAINT fk_members_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT chk_members_energy CHECK (energy_level BETWEEN 1 AND 3),
    CONSTRAINT uq_members_trip_user UNIQUE (trip_id, user_id)
) ENGINE=InnoDB;

CREATE INDEX idx_members_trip_id ON trip_members(trip_id);
CREATE INDEX idx_members_user_id ON trip_members(user_id);

CREATE TABLE activities (
    id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(150) NOT NULL,
    category        VARCHAR(50)  NOT NULL,
    energy_level    TINYINT UNSIGNED NOT NULL,
    time_of_day     ENUM('morning','afternoon','evening') NOT NULL,
    cost_tier       TINYINT UNSIGNED NOT NULL,
    description     VARCHAR(500) NULL,

    CONSTRAINT chk_activities_energy CHECK (energy_level BETWEEN 1 AND 3),
    CONSTRAINT chk_activities_cost CHECK (cost_tier BETWEEN 1 AND 3)
) ENGINE=InnoDB;

CREATE INDEX idx_activities_category ON activities(category);
CREATE INDEX idx_activities_time_of_day ON activities(time_of_day);

CREATE TABLE itinerary_slots (
    id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    trip_id         INT UNSIGNED NOT NULL,
    day_number      TINYINT UNSIGNED NOT NULL,
    time_of_day     ENUM('morning','afternoon','evening') NOT NULL,
    activity_id     INT UNSIGNED NULL,
    status          ENUM('proposed','locked','open') NOT NULL DEFAULT 'proposed',

    CONSTRAINT fk_slots_trip FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
    CONSTRAINT fk_slots_activity FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE SET NULL,
    CONSTRAINT uq_slots_trip_day_time UNIQUE (trip_id, day_number, time_of_day)
) ENGINE=InnoDB;

CREATE INDEX idx_slots_trip_id ON itinerary_slots(trip_id);
CREATE INDEX idx_slots_activity_id ON itinerary_slots(activity_id);

CREATE TABLE slot_rejections (
    id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    slot_id         INT UNSIGNED NOT NULL,
    activity_id     INT UNSIGNED NOT NULL,

    CONSTRAINT fk_rejections_slot FOREIGN KEY (slot_id) REFERENCES itinerary_slots(id) ON DELETE CASCADE,
    CONSTRAINT fk_rejections_activity FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE,
    CONSTRAINT uq_rejections_slot_activity UNIQUE (slot_id, activity_id)
) ENGINE=InnoDB;

CREATE INDEX idx_rejections_slot_id ON slot_rejections(slot_id);

CREATE TABLE votes (
    id                INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    slot_id           INT UNSIGNED NOT NULL,
    trip_member_id    INT UNSIGNED NOT NULL,
    vote              ENUM('up','down') NOT NULL,
    voted_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_votes_slot FOREIGN KEY (slot_id) REFERENCES itinerary_slots(id) ON DELETE CASCADE,
    CONSTRAINT fk_votes_member FOREIGN KEY (trip_member_id) REFERENCES trip_members(id) ON DELETE CASCADE,
    CONSTRAINT uq_votes_slot_member UNIQUE (slot_id, trip_member_id)
) ENGINE=InnoDB;

CREATE INDEX idx_votes_slot_id ON votes(slot_id);
CREATE INDEX idx_votes_member_id ON votes(trip_member_id);

CREATE TABLE expenses (
    id                      INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    trip_id                 INT UNSIGNED NOT NULL,
    payer_trip_member_id    INT UNSIGNED NOT NULL,
    amount                  DECIMAL(10,2) NOT NULL,
    description             VARCHAR(255) NULL,
    created_at              TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_expenses_trip FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
    CONSTRAINT fk_expenses_payer FOREIGN KEY (payer_trip_member_id) REFERENCES trip_members(id) ON DELETE CASCADE,
    CONSTRAINT chk_expenses_amount CHECK (amount > 0)
) ENGINE=InnoDB;

CREATE INDEX idx_expenses_trip_id ON expenses(trip_id);
CREATE INDEX idx_expenses_payer_id ON expenses(payer_trip_member_id);

CREATE TABLE expense_splits (
    id                INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    expense_id        INT UNSIGNED NOT NULL,
    trip_member_id    INT UNSIGNED NOT NULL,
    share_amount      DECIMAL(10,2) NOT NULL,

    CONSTRAINT fk_splits_expense FOREIGN KEY (expense_id) REFERENCES expenses(id) ON DELETE CASCADE,
    CONSTRAINT fk_splits_member FOREIGN KEY (trip_member_id) REFERENCES trip_members(id) ON DELETE CASCADE,
    CONSTRAINT uq_splits_expense_member UNIQUE (expense_id, trip_member_id),
    CONSTRAINT chk_splits_amount CHECK (share_amount >= 0)
) ENGINE=InnoDB;

CREATE INDEX idx_splits_expense_id ON expense_splits(expense_id);
CREATE INDEX idx_splits_member_id ON expense_splits(trip_member_id);
