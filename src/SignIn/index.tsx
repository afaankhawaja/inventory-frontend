import { useEffect } from "react";
import SignInForm from "./components/SignInForm";
import styled from "styled-components";

const Container = styled.section`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const SignIn = () => {
  useEffect(() => {
    document.title = "Sign In · Aurelia Vault";
  }, []);

  return (
    <Container>
      <SignInForm />
    </Container>
  );
};

export default SignIn;
