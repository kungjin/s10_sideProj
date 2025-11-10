CREATE DATABASE IF NOT EXISTS ofdb
CHARACTER SET utf8mb4
COLLATE utf8mb4_0900_ai_ci;

-- 최신 스냅샷 테이블: item_current
USE ofdb;
CREATE TABLE IF NOT EXISTS item_current (
item_id BIGINT AUTO_INCREMENT PRIMARY KEY,


source VARCHAR(20) NOT NULL DEFAULT 'ONBID',
notice_no BIGINT NOT NULL, -- PLNM_NO
item_no BIGINT NOT NULL, -- CLTR_NO


title VARCHAR(500) NULL, -- CLTR_NM
addr_lot VARCHAR(500) NULL, -- LDNM_ADRS
addr_road VARCHAR(500) NULL, -- NMRD_ADRS
usage_name VARCHAR(120) NULL, -- CTGR_FULL_NM


sale_type ENUM('SALE','RENT') NULL, -- DPSL_MTD_CD 매핑 결과
min_bid_price DECIMAL(18,2) NULL, -- MIN_BID_PRC
appraisal_amt DECIMAL(18,2) NULL, -- APSL_ASES_AVG_AMT


bid_start_at DATETIME NULL, -- PBCT_BEGN_DTM
bid_end_at DATETIME NULL, -- PBCT_CLS_DTM
status_name VARCHAR(100) NULL, -- PBCT_CLTR_STAT_NM


failed_count INT NULL, -- USCBD_CNT (해시 제외 추천)
view_count INT NULL, -- IQRY_CNT (해시 제외 추천)


content_hash CHAR(64) NOT NULL,
updated_at DATETIME(6) NOT NULL,
missing_count INT NOT NULL DEFAULT 0,


UNIQUE KEY uq_src_notice_item (source, notice_no, item_no),
KEY ix_source (source),
KEY ix_end_time (bid_end_at),
KEY ix_usage (usage_name),
KEY ix_sale_type (sale_type),
KEY ix_price (min_bid_price)
);

SELECT *FROM item_current;

-- 변경 이력(버전) 테이블
CREATE TABLE IF NOT EXISTS item_version (
version_id BIGINT AUTO_INCREMENT PRIMARY KEY,
item_id BIGINT NOT NULL,
version_no INT NOT NULL,
snapshot_json JSON NOT NULL,
content_hash CHAR(64) NOT NULL,
created_at DATETIME(6) NOT NULL,
UNIQUE KEY uq_item_ver (item_id, version_no),
KEY ix_item_hash (item_id, content_hash),
CONSTRAINT fk_item_ver FOREIGN KEY (item_id) REFERENCES item_current(item_id)
);

SELECT *FROM item_version;

-- 원본 스테이징(감사/재처리용)
CREATE TABLE IF NOT EXISTS staging_raw (
raw_id BIGINT AUTO_INCREMENT PRIMARY KEY,
source VARCHAR(20) NOT NULL,
notice_no BIGINT NOT NULL,
item_no BIGINT NOT NULL,
payload_json JSON NOT NULL,
content_hash CHAR(64) NOT NULL,
received_at DATETIME(6) NOT NULL,
UNIQUE KEY uq_staging (source, notice_no, item_no, content_hash)
);

SELECT *FROM staging_raw;

-- (선택) 실물 자산 매핑: 같은 자산이 재공고될 때 묶고 싶다면 사용
CREATE TABLE IF NOT EXISTS asset (
asset_id BIGINT AUTO_INCREMENT PRIMARY KEY,
asset_key VARCHAR(120) UNIQUE, -- 예: 관리번호(CLTR_MNMT_NO)가 있을 경우
addr_road VARCHAR(500) NULL,
created_at DATETIME(6) NOT NULL
);


CREATE TABLE IF NOT EXISTS asset_item_link (
asset_id BIGINT NOT NULL,
item_id BIGINT NOT NULL,
PRIMARY KEY (asset_id, item_id),
CONSTRAINT fk_asset_link_asset FOREIGN KEY (asset_id) REFERENCES asset(asset_id),
CONSTRAINT fk_asset_link_item FOREIGN KEY (item_id) REFERENCES item_current(item_id)
);

SELECT *FROM asset;
