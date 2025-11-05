package com.of.util;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.dataformat.xml.XmlMapper;
import com.fasterxml.jackson.databind.ObjectMapper;

public class XmlJsonConverter {

    private static final XmlMapper xmlMapper = new XmlMapper();
    private static final ObjectMapper jsonMapper = new ObjectMapper();

    public static String xmlStringToJsonString(String xml) {
        try {
            JsonNode node = xmlMapper.readTree(xml.getBytes());
            return jsonMapper.writerWithDefaultPrettyPrinter().writeValueAsString(node);
        } catch (Exception e) {
            // 실패 시 원문 일부 포함하여 디버깅 도움
            String safe = xml == null ? "" : xml.replace("\"", "\\\"");
            return "{\"error\":\"xml-parse-failed\",\"raw\":\"" + safe + "\"}";
        }
    }
}
