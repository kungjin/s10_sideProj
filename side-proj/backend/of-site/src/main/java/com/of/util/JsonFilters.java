// src/main/java/com/of/util/JsonFilters.java
package com.of.util;

import org.json.JSONArray;
import org.json.JSONObject;

import java.util.Locale;

/**
 * JSON 필터 유틸(안전판)
 * - contains(단일/다중 키): 부분일치(대소문자 무시)
 * - equals: 정확 일치
 * - 경로가 배열/객체 혼재여도 동작
 * - 경로가 없으면 원본 유지(예외 X)
 */
public class JsonFilters {

    /** 배열 길이 세기(경로 없으면 0) */
    public static int countAtPath(String json, String path) {
        if (json == null || json.isBlank() || path == null || path.isBlank()) return 0;
        try {
            JSONObject root = new JSONObject(json);
            JSONArray arr = getArrayAtPath(root, path);
            return (arr == null) ? 0 : arr.length();
        } catch (Exception ignore) {
            return 0;
        }
    }

    /** 단일 key contains (대소문자 무시) */
    public static String filterByContains(String json, String path, String key, String value) {
        if (json == null || json.isBlank()) return json;
        if (value == null || value.isBlank()) return json;

        JSONObject root = new JSONObject(json);
        JSONArray arr = getArrayAtPath(root, path);
        if (arr == null) return json;

        int before = arr.length();
        JSONArray filtered = new JSONArray();

        final String needle = value.toLowerCase(Locale.ROOT);
        for (int i = 0; i < arr.length(); i++) {
            JSONObject obj = arr.optJSONObject(i);
            if (obj == null) continue;
            String field = obj.optString(key, "");
            if (field.toLowerCase(Locale.ROOT).contains(needle)) {
                filtered.put(obj);
            }
        }

        setArrayAtPath(root, path, filtered);
        System.out.println("[JsonFilters] contains key=" + key + " before=" + before + " after=" + filtered.length());
        return root.toString();
    }

    /** 다중 keys contains (키 중 하나라도 매치되면 포함, 대소문자 무시) */
    public static String filterByContains(String json, String path, String[] keys, String value) {
        if (json == null || json.isBlank()) return json;
        if (value == null || value.isBlank()) return json;
        if (keys == null || keys.length == 0) return json;

        JSONObject root = new JSONObject(json);
        JSONArray arr = getArrayAtPath(root, path);
        if (arr == null) return json;

        int before = arr.length();
        JSONArray filtered = new JSONArray();

        final String needle = value.toLowerCase(Locale.ROOT);
        for (int i = 0; i < arr.length(); i++) {
            JSONObject obj = arr.optJSONObject(i);
            if (obj == null) continue;

            boolean keep = false;
            for (String k : keys) {
                String field = obj.optString(k, "");
                if (!field.isEmpty() && field.toLowerCase(Locale.ROOT).contains(needle)) {
                    keep = true; break;
                }
            }
            if (keep) filtered.put(obj);
        }

        setArrayAtPath(root, path, filtered);
        System.out.println("[JsonFilters] contains keys=" + String.join(",", keys)
                + " before=" + before + " after=" + filtered.length());
        return root.toString();
    }

    /** key equals (정확 일치, 대소문자 구분) */
    public static String filterByEquals(String json, String path, String key, String value) {
        if (json == null || json.isBlank()) return json;
        if (value == null || value.isBlank()) return json;

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

    /* ---------- 내부 헬퍼 ---------- */

    /**
     * 경로에서 배열을 구함.
     * - 마지막 노드가 JSONArray면 그대로
     * - 마지막 노드가 JSONObject면 단일 요소 배열로 감싸서 반환
     * - 마지막 노드가 없으면 빈 배열
     * - 중간 노드가 없으면 null (원본 유지)
     *
     * 예) "response.body.items.item"
     */
    private static JSONArray getArrayAtPath(JSONObject root, String path) {
        if (root == null || path == null || path.isBlank()) return null;

        String[] keys = path.split("\\.");
        JSONObject cur = root;

        for (int i = 0; i < keys.length - 1; i++) {
            JSONObject next = cur.optJSONObject(keys[i]);
            if (next == null) {
                return null; // 경로 없음 → 호출부에서 원본 유지
            }
            cur = next;
        }
        Object last = cur.opt(keys[keys.length - 1]);
        if (last instanceof JSONArray) return (JSONArray) last;
        if (last instanceof JSONObject) {
            JSONArray single = new JSONArray();
            single.put(last);
            return single;
        }
        return new JSONArray();
    }

    /** 경로에 배열 세팅(중간 노드 없으면 생성) */
    private static void setArrayAtPath(JSONObject root, String path, JSONArray arr) {
        if (root == null || path == null || path.isBlank()) return;

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
}
