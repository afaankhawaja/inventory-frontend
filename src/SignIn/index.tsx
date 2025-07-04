import SignInForm from './components/SignInForm'
import styled from 'styled-components'

const Container = styled.section`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;


const index = () => {
  return (
    <Container>
      <SignInForm />
    </Container>
  );
}

export default index