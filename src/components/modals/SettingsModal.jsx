import styled from 'styled-components'
import Modal from '../common/Modal'
import { TabBtn, SmInput } from '../common/Shared'

const SLabel  = styled.div`font-size:12px;font-weight:700;color:${({ theme }) => theme.t2};text-transform:uppercase;letter-spacing:.05em;margin-bottom:10px;`
const Hint    = styled.div`font-size:12px;color:${({ theme }) => theme.t3};line-height:1.5;margin-top:8px;`
const FlexRow = styled.div`display:flex;gap:8px;margin-bottom:${({ $mb }) => $mb || 0}px;`
const RelWrap = styled.div`position:relative;flex:1;`
const Suffix  = styled.span`position:absolute;right:9px;top:50%;transform:translateY(-50%);font-size:13px;color:${({ theme }) => theme.t3};`
const Unit    = styled.span`font-size:13px;color:${({ theme }) => theme.t2};align-self:center;padding-left:6px;`

const PRESETS = ['0.1', '0.5', '1.0']

const SettingsModal = ({ onClose, slip, setSlip, deadline, setDeadline }) => (
  <Modal onClose={onClose} title="Transaction Settings" maxW={380}>
    <div style={{ marginBottom: 24 }}>
      <SLabel>Slippage Tolerance</SLabel>
      <FlexRow $mb={10}>
        {PRESETS.map(p => (
          <TabBtn key={p} $active={slip === p} onClick={() => setSlip(p)} style={{ flex: 1 }}>{p}%</TabBtn>
        ))}
        <RelWrap>
          <SmInput value={slip} onChange={e => setSlip(e.target.value)} style={{ paddingRight: 24, textAlign: 'right', width: '100%' }} />
          <Suffix>%</Suffix>
        </RelWrap>
      </FlexRow>
      <Hint>Transaction reverts if the price moves more than this percentage unfavorably.</Hint>
    </div>
    <div>
      <SLabel>Transaction Deadline</SLabel>
      <FlexRow>
        <SmInput value={deadline} onChange={e => setDeadline(e.target.value)} style={{ width: 80, textAlign: 'center' }} />
        <Unit>minutes</Unit>
      </FlexRow>
    </div>
  </Modal>
)

export default SettingsModal
