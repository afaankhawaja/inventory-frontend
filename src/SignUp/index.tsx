import { useEffect } from "react";
import SignUpForm from "./components/SignUpForm";
import styled from "styled-components";

const Container = styled.section``;

const SignUp = () => {
  useEffect(() => {
    document.title = "Create Account · Aurelia Vault";
  }, []);

  return (
    <Container>
      <SignUpForm />
    </Container>
  );
};

export default SignUp;
