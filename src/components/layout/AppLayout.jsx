import styled, { createGlobalStyle } from 'styled-components'
import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'

const GlobalStyle = createGlobalStyle`
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: 'Outfit', sans-serif;
    background: ${({ theme }) => theme.bg};
    color: ${({ theme }) => theme.t1};
    min-height: 100vh;
    transition: background 0.3s, color 0.3s;
    overflow-x: hidden;
  }
`
const Root = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.bg};
  position: relative;
  &::before {
    content: '';
    position: fixed; inset: 0;
    background-image: radial-gradient(
      circle at 1px 1px,
      ${({ theme }) => theme.gridDot} 1px,
      transparent 0
    );
    background-size: 28px 28px;
    pointer-events: none; z-index: 0;
  }
`
const Content = styled.div`position: relative; z-index: 1;`

const AppLayout = () => (
  <Root>
    <GlobalStyle />
    <Content>
      <Navbar />
      <Outlet />
    </Content>
  </Root>
)

export default AppLayout
