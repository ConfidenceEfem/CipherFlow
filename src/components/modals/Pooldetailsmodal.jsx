import styled from 'styled-components'
import Modal from '../common/Modal'
import { Card, EncTag } from '../common/Shared'
import { DoubleTokIcon } from '../common/TokenIcon'
import { IcoLock } from '../icons/Icons'

/* ── Styled ── */
const Header     = styled.div`display:flex;align-items:center;gap:14px;margin-bottom:22px;`
const PoolName   = styled.div`font-size:20px;font-weight:900;color:${({ theme }) => theme.t1};`
const PoolSub    = styled.div`font-size:13px;color:${({ theme }) => theme.t3};margin-top:2px;`
const FeePill    = styled.span`font-size:11px;padding:2px 8px;border-radius:4px;background:${({ theme }) => theme.inp};color:${({ theme }) => theme.t3};font-weight:700;`

const Section    = styled.div`margin-bottom:16px;`
const SecTitle   = styled.div`font-size:11px;font-weight:700;color:${({ theme }) => theme.t3};text-transform:uppercase;letter-spacing:.06em;margin-bottom:10px;`
const StatsGrid  = styled.div`display:grid;grid-template-columns:1fr 1fr;gap:10px;`
const StatBox    = styled(Card)`padding:12px 14px;`
const StatLbl    = styled.div`font-size:11px;color:${({ theme }) => theme.t3};margin-bottom:5px;`
const StatVal    = styled.div`font-size:16px;font-weight:800;color:${({ theme, $gold }) => $gold ? theme.goldt : theme.t1};`

const InfoRow    = styled.div`display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid ${({ theme }) => theme.borderLight};font-size:13px;&:last-child{border-bottom:none;}`
const InfoKey    = styled.span`color:${({ theme }) => theme.t3};`
const InfoVal    = styled.span`font-weight:600;color:${({ theme }) => theme.t1};`

const PrivBadge  = styled.div`display:flex;align-items:center;gap:5px;font-size:12px;font-weight:700;color:${({ theme }) => theme.goldt};`
const AddrBox    = styled.div`background:${({ theme }) => theme.inp};border-radius:8px;padding:8px 12px;font-size:11px;font-family:monospace;color:${({ theme }) => theme.t3};word-break:break-all;margin-top:8px;`
const EthLink    = styled.a`color:${({ theme }) => theme.goldt};text-decoration:none;font-size:11px;margin-top:6px;display:inline-block;&:hover{text-decoration:underline;}`

const PoolDetailsModal = ({ pool, onClose }) => {
  if (!pool) return null

  return (
    <Modal onClose={onClose} title="Pool Details" maxW={460}>

      {/* Header */}
      <Header>
        <DoubleTokIcon t0={pool.t0} t1={pool.t1} size={36} />
        <div>
          <PoolName>{pool.t0}/{pool.t1}</PoolName>
          <PoolSub style={{ display:'flex', alignItems:'center', gap:6, marginTop:4 }}>
            <FeePill>{pool.fee}% fee</FeePill>
            <EncTag style={{ fontSize:10, padding:'2px 7px' }}>
              <IcoLock size={8} color="currentColor" /> FHE Encrypted
            </EncTag>
          </PoolSub>
        </div>
      </Header>

      {/* Live stats */}
      <Section>
        <SecTitle>Pool Stats</SecTitle>
        <StatsGrid>
          <StatBox>
            <StatLbl>APY</StatLbl>
            <StatVal $gold>{pool.apy}%</StatVal>
          </StatBox>
          <StatBox>
            <StatLbl>Depositors</StatLbl>
            <StatVal>{pool.depositors > 0 ? `${pool.depositors} LP${pool.depositors > 1 ? 's' : ''}` : 'Empty'}</StatVal>
          </StatBox>
          <StatBox>
            <StatLbl>TVL</StatLbl>
            <StatVal>
              <PrivBadge><IcoLock size={11} color="currentColor" /> Encrypted</PrivBadge>
            </StatVal>
          </StatBox>
          <StatBox>
            <StatLbl>Volume</StatLbl>
            <StatVal>
              <PrivBadge><IcoLock size={11} color="currentColor" /> Encrypted</PrivBadge>
            </StatVal>
          </StatBox>
        </StatsGrid>
      </Section>

      {/* Pool info */}
      <Section>
        <SecTitle>Pool Info</SecTitle>
        <Card style={{ padding:'4px 14px' }}>
          {[
            ['Token Pair',   `${pool.t0} / ${pool.t1}`],
            ['Fee Tier',     `${pool.fee}%`],
            ['Protocol',     'CipherFlow FHE DEX'],
            ['Network',      'Ethereum Sepolia'],
            ['Encryption',   'Zama FHEVM v0.9'],
            ['My Position',  pool.myPos ? '✅ Active' : '—'],
          ].map(([k, v]) => (
            <InfoRow key={k}>
              <InfoKey>{k}</InfoKey>
              <InfoVal>{v}</InfoVal>
            </InfoRow>
          ))}
        </Card>
      </Section>

      {/* Contract address */}
      {pool.address && (
        <Section>
          <SecTitle>Contract Address</SecTitle>
          <AddrBox>{pool.address}</AddrBox>
          <EthLink
            href={`https://sepolia.etherscan.io/address/${pool.address}`}
            target="_blank"
            rel="noreferrer"
          >
            View on Etherscan ↗
          </EthLink>
        </Section>
      )}

      {/* Privacy note */}
      <Card style={{ background:'rgba(247,203,8,.06)', border:'1px solid rgba(247,203,8,.2)', padding:'12px 14px' }}>
        <PrivBadge style={{ marginBottom:6 }}>
          <IcoLock size={12} color="currentColor" /> Privacy Guaranteed
        </PrivBadge>
        <div style={{ fontSize:12, color:'#999', lineHeight:1.6 }}>
          All balances, deposits, and trading volumes in this pool are encrypted
          on-chain via Zama FHE. Only you can read your own position.
        </div>
      </Card>

    </Modal>
  )
}

export default PoolDetailsModal