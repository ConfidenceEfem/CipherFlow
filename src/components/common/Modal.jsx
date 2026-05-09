import styled, { keyframes } from 'styled-components'
import { IcoX } from '../icons/Icons'

const bgFade  = keyframes`from{opacity:0}to{opacity:1}`
const slideUp = keyframes`from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}`

const Overlay = styled.div`
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.65);
  backdrop-filter: blur(7px);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000; padding: 16px;
  animation: ${bgFade} 0.15s ease;
`
const Box = styled.div`
  background: ${({ theme }) => theme.surface};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 20px; width: 100%;
  max-width: ${({ $maxW }) => $maxW || 440}px;
  max-height: 90vh;
  display: flex; flex-direction: column;
  overflow: hidden;
  box-shadow: 0 28px 64px rgba(0,0,0,0.45);
  animation: ${slideUp} 0.22s ease;
`
const Head = styled.div`
  display: flex; align-items: center; justify-content: space-between;
  padding: 18px 22px;
  border-bottom: 1px solid ${({ theme }) => theme.border};
  flex-shrink: 0;
`
const Title = styled.h3`
  font-weight: 700; font-size: 15px; color: ${({ theme }) => theme.t1};
`
const CloseBtn = styled.button`
  background: ${({ theme }) => theme.inp};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 7px; width: 30px; height: 30px;
  cursor: pointer; color: ${({ theme }) => theme.t2};
  display: flex; align-items: center; justify-content: center;
  transition: border-color 0.15s, color 0.15s;
  &:hover { border-color: ${({ theme }) => theme.goldbd}; color: ${({ theme }) => theme.goldt}; }
`
const Body = styled.div`
  overflow-y: auto; flex: 1; padding: 20px 22px;
`

const Modal = ({ onClose, title, children, maxW }) => (
  <Overlay onClick={onClose}>
    <Box $maxW={maxW} onClick={e => e.stopPropagation()}>
      <Head>
        <Title>{title}</Title>
        <CloseBtn onClick={onClose}><IcoX /></CloseBtn>
      </Head>
      <Body>{children}</Body>
    </Box>
  </Overlay>
)

export default Modal
