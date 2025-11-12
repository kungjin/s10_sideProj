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


mysqldump -u root -p

SELECT COUNT(*) FROM item_current;
SELECT COUNT(*) FROM staging_raw;
SELECT COUNT(*) FROM item_version;


-- DB 레벨(선택)
ALTER DATABASE ofdb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;


-- 테이블/컬럼 문자셋 일괄 정리
ALTER TABLE item_current CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE item_version CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE staging_raw  CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE asset        CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE asset_item_link CONVERT TO CHARACTER SET utf8mb4 COLLATE UTF8MB4_UNICODE_CI;

-- NULL → 0 기본값 채우기
UPDATE item_current SET failed_count = 0 WHERE failed_count IS NULL;
UPDATE item_current SET view_count   = 0 WHERE view_count   IS NULL;

-- DATETIME(6) 정규화
ALTER TABLE item_current
  MODIFY bid_start_at DATETIME(6) NULL,
  MODIFY bid_end_at   DATETIME(6) NULL,
  MODIFY updated_at   DATETIME(6) NOT NULL;

ALTER TABLE item_version
  MODIFY created_at   DATETIME(6) NOT NULL;

ALTER TABLE staging_raw
  MODIFY received_at  DATETIME(6) NOT NULL;

-- 카운터 기본값 부여
ALTER TABLE item_current
  MODIFY failed_count INT NOT NULL DEFAULT 0,
  MODIFY view_count   INT NOT NULL DEFAULT 0;
  
-- 예: 수집 시각 조회가 잦다면
ALTER TABLE staging_raw ADD KEY ix_staging_received (received_at);

-- 외래키에 ON UPDATE/DELETE CASCADE를 주고 싶다면 (재정의 필요)
ALTER TABLE item_version DROP FOREIGN KEY fk_item_ver;
ALTER TABLE item_version
  ADD CONSTRAINT fk_item_ver
  FOREIGN KEY (item_id) REFERENCES item_current(item_id)
  ON UPDATE CASCADE ON DELETE CASCADE;  
  
  
  -- 중복 확인
SELECT source, notice_no, item_no, COUNT(*) cnt
FROM item_current
GROUP BY source, notice_no, item_no
HAVING cnt > 1;

-- 트랜잭션으로 보호
START TRANSACTION;

-- (둘 중 하나 골라 실행)
-- A) 윈도우 함수 버전
-- B) NOT EXISTS 버전

-- 결과 확인
SELECT ROW_COUNT() AS deleted_rows;

-- 문제 없으면
COMMIT;
-- 취소하려면
-- ROLLBACK;
  
  