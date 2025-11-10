package com.of;

import javax.sql.DataSource;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import jakarta.annotation.PostConstruct;

@SpringBootApplication
@MapperScan("com.of.mapper")
public class OfSiteApplication {
    @Autowired private DataSource dataSource;
    public static void main(String[] args) {
        SpringApplication.run(OfSiteApplication.class, args);
    }
    @PostConstruct
    public void logDB() throws Exception {
        System.out.println("[Connected DB URL] " + dataSource.getConnection().getMetaData().getURL());
    }
}