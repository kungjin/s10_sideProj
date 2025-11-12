// src/main/java/com/of/util/JsonFilters.java
package com.of.util;

import org.json.JSONArray;
import org.json.JSONObject;

import java.text.Normalizer;
import java.util.Arrays;
import java.util.Locale;
import java.util.Objects;

/**
 * JSON 필터 유틸(안전판 확장)
 * - contains(단일/다중 키): 부분일치(대소문·한글 정규화·연속 공백 정리)
 * - equals / equalsInsensitive: 정확 일치(옵션으로 대소문 무시)
 * - 경로가 배열/객체 혼재여도 동작, 경로 없으면 원본 유지(예외 X)
 * - 멀티 경로 지원(앞에서부터 존재하는 경로를 선택)
 * - AND/OR 모드 제공(다중 키 contains 시)
 */
public class JsonFilters {

    /* ========= 공개 API ========= */

    /** 배열 길이 세기(경로 없으면 0) */
    public static int countAtPath(String json, String path) {
        if (isBlank(json) || isBlank(path)) return 0;
        try {
            JSONObject root = new JSONObject(json);
            JSONArray arr = getArrayAtPath(root, path);
            return (arr == null) ? 0 : arr.length();
        } catch (Exception ignore) {
            return 0;
        }
    }

    /** 배열 길이 세기 — 멀티 경로(첫 번째로 유효한 경로 사용) */
    public static int countAtAnyPath(String json, String... paths) {
        if (isBlank(json) || paths == null || paths.length == 0) return 0;
        try {
            JSONObject root = new JSONObject(json);
            JSONArray arr = getArrayAtAnyPath(root, paths);
            return (arr == null) ? 0 : arr.length();
        } catch (Exception ignore) {
            return 0;
        }
    }

    /** 단일 key contains (대소문자/한글 정규화, 연속 공백 축소) */
    public static String filterByContains(String json, String path, String key, String value) {
        if (isBlank(json) || isBlank(value)) return json;
        JSONObject root = new JSONObject(json);
        JSONArray arr = getArrayAtPath(root, path);
        if (arr == null) return json;

        int before = arr.length();
        JSONArray filtered = new JSONArray();
        final String needle = norm(value);

        for (int i = 0; i < arr.length(); i++) {
            JSONObject obj = arr.optJSONObject(i);
            if (obj == null) continue;
            String field = obj.optString(key, "");
            if (norm(field).contains(needle)) {
                filtered.put(obj);
            }
        }

        setArrayAtPath(root, path, filtered);
        System.out.println("[JsonFilters] contains key=" + key + " before=" + before + " after=" + filtered.length());
        return root.toString();
    }

    /** 다중 keys contains(OR: 하나라도 매치되면 포함) */
    public static String filterByContains(String json, String path, String[] keys, String value) {
        return filterByContains(json, path, keys, value, MatchMode.OR);
    }

    /** 다중 keys contains — AND/OR 모드 선택 */
    public static String filterByContains(String json, String path, String[] keys, String value, MatchMode mode) {
        if (isBlank(json) || isBlank(value) || keys == null || keys.length == 0) return json;

        JSONObject root = new JSONObject(json);
        JSONArray arr = getArrayAtPath(root, path);
        if (arr == null) return json;

        int before = arr.length();
        JSONArray filtered = new JSONArray();
        final String needle = norm(value);

        for (int i = 0; i < arr.length(); i++) {
            JSONObject obj = arr.optJSONObject(i);
            if (obj == null) continue;

            int hit = 0;
            for (String k : keys) {
                String field = obj.optString(k, "");
                if (!isBlank(field) && norm(field).contains(needle)) {
                    hit++;
                    if (mode == MatchMode.OR) break;
                }
            }
            boolean keep = (mode == MatchMode.OR) ? (hit > 0) : (hit == keys.length);
            if (keep) filtered.put(obj);
        }

        setArrayAtPath(root, path, filtered);
        System.out.println("[JsonFilters] contains(" + mode + ") keys=" + String.join(",", keys)
                + " before=" + before + " after=" + filtered.length());
        return root.toString();
    }

    /** 다중 keys contains — 멀티 경로 버전(첫 유효 경로 선택) */
    public static String filterByContainsAnyPath(String json, String[] paths, String[] keys, String value, MatchMode mode) {
        if (isBlank(json) || isBlank(value) || keys == null || keys.length == 0 || paths == null || paths.length == 0)
            return json;

        JSONObject root = new JSONObject(json);
        String chosen = chooseExistingPath(root, paths);
        if (chosen == null) return json;

        return filterByContains(root.toString(), chosen, keys, value, mode);
    }

    /** key equals(정확 일치, 대소문자 구분) */
    public static String filterByEquals(String json, String path, String key, String value) {
        if (isBlank(json) || isBlank(value)) return json;

        JSONObject root = new JSONObject(json);
        JSONArray arr = getArrayAtPath(root, path);
        if (arr == null) return json;

        int before = arr.length();
        JSONArray filtered = new JSONArray();

        for (int i = 0; i < arr.length(); i++) {
            JSONObject obj = arr.optJSONObject(i);
            if (obj == null) continue;
            if (value.equals(obj.optString(key, ""))) {
                filtered.put(obj);
            }
        }

        setArrayAtPath(root, path, filtered);
        System.out.println("[JsonFilters] equals key=" + key + " before=" + before + " after=" + filtered.length());
        return root.toString();
    }

    /** key equals(대소문 무시) */
    public static String filterByEqualsInsensitive(String json, String path, String key, String value) {
        if (isBlank(json) || isBlank(value)) return json;

        JSONObject root = new JSONObject(json);
        JSONArray arr = getArrayAtPath(root, path);
        if (arr == null) return json;

        int before = arr.length();
        JSONArray filtered = new JSONArray();
        String needle = value.toLowerCase(Locale.ROOT);

        for (int i = 0; i < arr.length(); i++) {
            JSONObject obj = arr.optJSONObject(i);
            if (obj == null) continue;
            if (needle.equals(obj.optString(key, "").toLowerCase(Locale.ROOT))) {
                filtered.put(obj);
            }
        }

        setArrayAtPath(root, path, filtered);
        System.out.println("[JsonFilters] equalsInsensitive key=" + key + " before=" + before + " after=" + filtered.length());
        return root.toString();
    }

    /** key equals — 멀티 경로(정확 일치) */
    public static String filterByEqualsAnyPath(String json, String[] paths, String key, String value) {
        if (isBlank(json) || isBlank(value) || paths == null || paths.length == 0) return json;

        JSONObject root = new JSONObject(json);
        String chosen = chooseExistingPath(root, paths);
        if (chosen == null) return json;

        return filterByEquals(root.toString(), chosen, key, value);
    }

    /* ========= 내부 헬퍼 ========= */

    public enum MatchMode { OR, AND }

    private static boolean isBlank(String s) {
        return s == null || s.trim().isEmpty();
    }

    /** 비교용 정규화: NFC → 소문자 → 연속 공백 축소 */
    private static String norm(String s) {
        if (s == null) return "";
        String n = Normalizer.normalize(s, Normalizer.Form.NFC)
                .toLowerCase(Locale.ROOT)
                .replaceAll("\\s+", " ")
                .trim();
        return n;
    }

    /** 경로에서 배열을 구함(혼재/누락 안전) */
    private static JSONArray getArrayAtPath(JSONObject root, String path) {
        if (root == null || isBlank(path)) return null;

        String[] keys = path.split("\\.");
        JSONObject cur = root;

        for (int i = 0; i < keys.length - 1; i++) {
            JSONObject next = cur.optJSONObject(keys[i]);
            if (next == null) return null; // 중간 경로 없음 → 원본 유지
            cur = next;
        }
        Object last = cur.opt(keys[keys.length - 1]);
        if (last instanceof JSONArray) return (JSONArray) last;
        if (last instanceof JSONObject) {
            JSONArray single = new JSONArray();
            single.put(last);
            return single;
        }
        return new JSONArray(); // 마지막 노드 없음 → 빈 배열
    }

    /** 여러 후보 경로 중 먼저 존재하는 배열을 반환 */
    private static JSONArray getArrayAtAnyPath(JSONObject root, String... paths) {
        for (String p : paths) {
            JSONArray arr = getArrayAtPath(root, p);
            if (arr != null) return arr;
        }
        return null;
    }

    /** 경로에 배열 세팅(중간 노드 없으면 생성) */
    private static void setArrayAtPath(JSONObject root, String path, JSONArray arr) {
        if (root == null || isBlank(path)) return;

        String[] keys = path.split("\\.");
        JSONObject cur = root;

        for (int i = 0; i < keys.length - 1; i++) {
            JSONObject next = cur.optJSONObject(keys[i]);
            if (next == null) {
                next = new JSONObject();
                cur.put(keys[i], next);
            }
            cur = next;
        }
        cur.put(keys[keys.length - 1], (arr != null ? arr : new JSONArray()));
    }

    /** 루트에서 사용 가능한 첫 번째 경로를 고른다 */
    private static String chooseExistingPath(JSONObject root, String... paths) {
        if (root == null || paths == null) return null;
        return Arrays.stream(paths)
                .filter(Objects::nonNull)
                .filter(p -> getArrayAtPath(root, p) != null)
                .findFirst().orElse(null);
    }
}

