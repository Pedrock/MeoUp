CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
  username varchar(255) NOT NULL UNIQUE,
  password binary(20) NOT NULL,
  token varchar(40) DEFAULT NULL,
  token_secret varchar(40) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS downloads (
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id),
  url varchar(255) NOT NULL,
  filename varchar(255) NOT NULL,
  downloaded INTEGER NOT NULL DEFAULT 0,
	download_size INTEGER,
  status int(11) NOT NULL DEFAULT 1, -- 0=error, 1=Down, 2=Up, 3=Finished
  last_update timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  share_url varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS login_tokens (
  user_id INTEGER NOT NULL REFERENCES users(id),
	token VARCHAR(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

