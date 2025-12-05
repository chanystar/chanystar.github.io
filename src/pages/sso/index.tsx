import React, { useEffect } from "react";
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
  // Google Identity Services (GIS) 버튼 초기화 및 콜백
  useEffect(() => {
    const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
    if (!clientId) return;

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    const handleLoad = () => {
      // @ts-ignore - window.google injected by GIS script
      if (!window.google || !window.google.accounts || !window.google.accounts.id) return;

      // @ts-ignore
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleGoogleResponse,
      });

      // render the button into the container div
      // @ts-ignore
      window.google.accounts.id.renderButton(
        document.getElementById("g_id_signin"),
        { theme: "outline", size: "large", width: "240" }
      );
    };

    script.addEventListener("load", handleLoad);
    return () => {
      script.removeEventListener("load", handleLoad);
      try {
        document.body.removeChild(script);
      } catch (e) {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleGoogleResponse = (response: any) => {
    // response.credential contains the ID token (JWT)
    const idToken = response?.credential;
    if (!idToken) {
      message.error("Google 로그인 실패");
      return;
    }
    try {
      localStorage.setItem("sso_id_token", idToken);
    } catch (e) {}
    message.success("Google 로그인 성공");
    setTimeout(() => onClose && onClose(), 600);
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

        <div id="g_id_signin" style={{ display: "flex", justifyContent: "center", marginTop: 12 }} />

        <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 12 }}>
          <Button type="primary" onClick={() => handleExternalRedirect("github")}>GitHub로 로그인</Button>
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
