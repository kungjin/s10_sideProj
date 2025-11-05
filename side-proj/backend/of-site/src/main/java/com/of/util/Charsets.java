// 예: com.of.util.Charsets.java
package com.of.util;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

import java.nio.charset.Charset;
import java.nio.charset.StandardCharsets;

public class Charsets {

    public static String smartDecode(byte[] bytes, HttpHeaders headers) {
        // 1) 헤더 선언 우선 시도
        Charset headerCs = null;
        MediaType ct = headers.getContentType();
        if (ct != null && ct.getCharset() != null) {
            headerCs = ct.getCharset();
        }

        // 2) 후보들: (1) 헤더, (2) UTF-8, (3) CP949(EUC-KR superset)
        Charset[] candidates = (headerCs != null)
                ? new Charset[]{ headerCs, StandardCharsets.UTF_8, Charset.forName("MS949") }
                : new Charset[]{ StandardCharsets.UTF_8, Charset.forName("MS949") };

        String best = null;
        int bestScore = -1;

        for (Charset cs : candidates) {
            String s = new String(bytes, cs);
            int score = scoreHangul(s);
            if (score > bestScore) {
                bestScore = score;
                best = s;
            }
            // 빠른 종료: 한글이 충분히 보이면 채택
            if (score >= 3) break;
        }
        return best;
    }

    // 문자열 내 한글(가-힣) 등장 횟수로 간단 점수화
    private static int scoreHangul(String s) {
        int cnt = 0;
        for (int i = 0; i < s.length(); i++) {
            char ch = s.charAt(i);
            if (ch >= 0xAC00 && ch <= 0xD7A3) cnt++;
        }
        return cnt;
    }
}
