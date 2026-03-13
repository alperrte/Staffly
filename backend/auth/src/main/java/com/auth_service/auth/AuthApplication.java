package com.auth_service.auth;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class AuthApplication {

	public static void main(String[] args) {

		Dotenv dotenv = Dotenv.configure()
				.ignoreIfMissing()
				.load();

		System.setProperty("SERVER_PORT_AUTH", dotenv.get("SERVER_PORT_AUTH"));
		System.setProperty("DB_HOST", dotenv.get("DB_HOST"));
		System.setProperty("DB_PORT", dotenv.get("DB_PORT"));
		System.setProperty("DB_NAME", dotenv.get("DB_NAME"));
		System.setProperty("DB_USER", dotenv.get("DB_USER"));
		System.setProperty("DB_PASSWORD", dotenv.get("DB_PASSWORD"));

		System.setProperty("JWT_SECRET", dotenv.get("JWT_SECRET"));
		System.setProperty("JWT_EXPIRATION", dotenv.get("JWT_EXPIRATION"));
		System.setProperty("REFRESH_TOKEN_EXPIRATION", dotenv.get("REFRESH_TOKEN_EXPIRATION"));

		SpringApplication.run(AuthApplication.class, args);
	}
}