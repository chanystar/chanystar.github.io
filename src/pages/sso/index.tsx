import React from "react";
import styled from "styled-components";
import { Card, Button, Typography, message } from "antd";

const { Title, Paragraph } = Typography;

const Container = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.45);
  z-index: 9999;
`;

const StyledCard = styled(Card)`
  width: 420px;
  border-radius: 8px;
  text-align: center;
`;

type Props = {
  onClose?: () => void;
};

const SSOPage: React.FC<Props> = ({ onClose }) => {
  // Google OAuth Authorization Code Flow
  const handleGoogleLogin = () => {
    const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
    const redirectUri = process.env.REACT_APP_GOOGLE_REDIRECT_URI;

    if (!clientId || !redirectUri) {
      message.error("Google OAuth 설정이 누락되었습니다");
      return;
    }

    const scope = "openid email profile";
    const responseType = "code";
    const state = Math.random().toString(36).substring(7);

    // 상태값을 sessionStorage에 저장 (보안)
    try {
      sessionStorage.setItem("oauth_state", state);
    } catch (e) {}

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=${responseType}&scope=${encodeURIComponent(scope)}&state=${state}`;
    
    // Google으로 리다이렉트 (콜백은 Vercel API에서 처리 후 프런트로 반환)
    window.location.href = authUrl;
  };

  const handleMockSignIn = () => {
    const token = `mock-token-${Date.now()}`;
    try {
      localStorage.setItem("sso_token", token);
    } catch (e) {}
    message.success("로그인 성공: mock SSO");
    setTimeout(() => onClose && onClose(), 600);
  };

  const handleExternalRedirect = (provider: string) => {
    const url = `https://example.com/oauth2/authorize?provider=${encodeURIComponent(provider)}`;
    window.open(url, "_blank");
  };

  return (
    <Container>
      <StyledCard>
        <Title level={3}>SSO 로그인</Title>
        <Paragraph>원하시는 SSO 제공자를 선택해 로그인하세요.</Paragraph>

        <div style={{ display: "flex", justifyContent: "center", marginTop: 12 }}>
          <Button type="primary" size="large" onClick={handleGoogleLogin}>
            Google로 로그인
          </Button>
        </div>

        <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 12 }}>
          <Button onClick={() => handleExternalRedirect("github")}>GitHub로 로그인</Button>
        </div>

        <div style={{ marginTop: 16 }}>
          <Button type="dashed" onClick={handleMockSignIn}>Mock SSO로 로그인</Button>
        </div>

        <div style={{ marginTop: 18 }}>
          <Button onClick={() => onClose && onClose()}>닫기</Button>
        </div>
      </StyledCard>
    </Container>
  );
};

export default SSOPage;
