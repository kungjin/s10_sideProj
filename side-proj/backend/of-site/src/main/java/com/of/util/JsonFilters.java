package com.of.util;

import org.json.JSONArray;
import org.json.JSONObject;

/**
 * 간단한 JSON 필터 유틸
 * - contains: 문자열 포함 여부
 * - equals: 정확히 일치 여부
 */
public class JsonFilters {

    /** 
     * 지정된 경로(path) 내의 배열에서 key 값이 value를 포함하는 객체만 남기기
     */
    public static String filterByContains(String json, String path, String key, String value) {
        if (value == null || value.isBlank()) return json;

        JSONObject root = new JSONObject(json);
        JSONArray arr = getArrayAtPath(root, path);
        JSONArray filtered = new JSONArray();

        for (int i = 0; i < arr.length(); i++) {
            JSONObject obj = arr.getJSONObject(i);
            String field = obj.optString(key, "");
            if (field.contains(value)) filtered.put(obj);
        }

        setArrayAtPath(root, path, filtered);
        return root.toString();
    }

    /** 
     * 지정된 경로(path) 내의 배열에서 key 값이 value와 일치하는 객체만 남기기
     */
    public static String filterByEquals(String json, String path, String key, String value) {
        if (value == null || value.isBlank()) return json;

        JSONObject root = new JSONObject(json);
        JSONArray arr = getArrayAtPath(root, path);
        JSONArray filtered = new JSONArray();

        for (int i = 0; i < arr.length(); i++) {
            JSONObject obj = arr.getJSONObject(i);
            String field = obj.optString(key, "");
            if (field.equals(value)) filtered.put(obj);
        }

        setArrayAtPath(root, path, filtered);
        return root.toString();
    }

    // 경로 예시: "response.body.items.item"
    private static JSONArray getArrayAtPath(JSONObject root, String path) {
        String[] keys = path.split("\\.");
        JSONObject current = root;
        for (int i = 0; i < keys.length - 1; i++) {
            current = current.optJSONObject(keys[i]);
            if (current == null) return new JSONArray();
        }
        Object last = current.opt(keys[keys.length - 1]);
        if (last instanceof JSONArray) return (JSONArray) last;
        else if (last instanceof JSONObject) {
            JSONArray single = new JSONArray();
            single.put(last);
            return single;
        }
        return new JSONArray();
    }

    private static void setArrayAtPath(JSONObject root, String path, JSONArray arr) {
        String[] keys = path.split("\\.");
        JSONObject current = root;
        for (int i = 0; i < keys.length - 1; i++) {
            current = current.getJSONObject(keys[i]);
        }
        current.put(keys[keys.length - 1], arr);
    }
}
