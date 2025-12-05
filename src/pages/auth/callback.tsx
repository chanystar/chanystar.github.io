import React, { useEffect } from "react";
import { message, Spin } from "antd";

/**
 * OAuth Callback Handler Page
 * 
 * Flow:
 * 1. Google redirects here with ?code=AUTH_CODE
 * 2. This page calls Vercel API (/api/auth?code=...)
 * 3. Vercel API exchanges code for ID token (server-side)
 * 4. Token is returned and stored
 * 5. Redirect to home
 */

const CallbackPage: React.FC = () => {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");

    if (!code) {
      message.error("Authorization code가 없습니다");
      setTimeout(() => {
        window.location.href = "/";
      }, 2000);
      return;
    }

    // Vercel API 호출 (CORS 지원)
    const redirectUri = process.env.REACT_APP_GOOGLE_REDIRECT_URI;

    if (!redirectUri) {
      message.error("API URL이 설정되지 않았습니다");
      setTimeout(() => {
        window.location.href = "/";
      }, 2000);
      return;
    }

    const apiUrl = `${redirectUri}?code=${encodeURIComponent(code)}`;

    fetch(apiUrl, {
      method: "GET",
      credentials: "omit",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("API 응답 실패");
        return res.json();
      })
      .then((data) => {
        if (data.success && data.id_token) {
          // 토큰 저장
          try {
            localStorage.setItem("sso_id_token", data.id_token);
            if (data.access_token) {
              localStorage.setItem("sso_access_token", data.access_token);
            }
          } catch (e) {}

          message.success("Google 로그인 성공!");
          setTimeout(() => {
            window.location.href = "/";
          }, 1500);
        } else {
          throw new Error(data.error || "토큰 획득 실패");
        }
      })
      .catch((error) => {
        console.error("OAuth callback error:", error);
        message.error(`로그인 실패: ${error.message}`);
        setTimeout(() => {
          window.location.href = "/";
        }, 2000);
      });
  }, []);

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
      <div style={{ textAlign: "center" }}>
        <Spin size="large" tip="Google 로그인 처리 중..." />
      </div>
    </div>
  );
};

export default CallbackPage;
