import { useState } from 'react'
import styled from 'styled-components'
import { PageWrap, BtnGold, BtnGhost, TabBtn, EncTag, StatMiniCard } from '../common/Shared'
import { DoubleTokIcon } from '../common/TokenIcon'
import { IcoLock, IcoPlus } from '../icons/Icons'
import AddLiquidityModal from '../modals/AddLiquidityModal'
import PoolDetailsModal from '../modals/Pooldetailsmodal'
import { useWallet } from '../../hooks/useWallet'
import { usePools } from '../../hooks/usePools'
import { useFhevm } from '../../hooks/useFhevm'

/* ── Styled ── */
const PageHeader  = styled.div`display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:28px;flex-wrap:wrap;gap:12px;`
const PageTitle   = styled.h1`font-size:28px;font-weight:900;letter-spacing:-0.03em;margin-bottom:6px;color:${({ theme }) => theme.t1};`
const PageSub     = styled.p`color:${({ theme }) => theme.t2};font-size:13px;`
const AddBtn      = styled(BtnGold)`padding:10px 18px;border-radius:10px;font-size:13px;`
const StatsRow    = styled.div`display:flex;gap:10px;margin-bottom:24px;flex-wrap:wrap;`
const StatLbl     = styled.div`font-size:11px;color:${({ theme }) => theme.t3};margin-bottom:5px;`
const StatVal     = styled.div`font-size:20px;font-weight:800;color:${({ theme, $gold }) => $gold ? theme.goldt : theme.t1};`
const TabsRow     = styled.div`display:flex;gap:8px;margin-bottom:16px;`
const Table       = styled.div`background:${({ theme }) => theme.surface};border:1px solid ${({ theme }) => theme.border};border-radius:16px;overflow:hidden;`
const THead       = styled.div`display:grid;grid-template-columns:2fr 1.4fr 1fr 1fr 1.4fr 130px;padding:11px 20px;border-bottom:1px solid ${({ theme }) => theme.border};font-size:11px;font-weight:700;color:${({ theme }) => theme.t3};text-transform:uppercase;letter-spacing:.06em;`
const TRow        = styled.div`display:grid;grid-template-columns:2fr 1.4fr 1fr 1fr 1.4fr 130px;padding:15px 20px;align-items:center;border-bottom:1px solid ${({ theme }) => theme.borderLight};transition:background .15s;&:hover{background:${({ theme }) => theme.hov};}&:last-child{border-bottom:none;}`
const PoolName    = styled.div`font-weight:700;font-size:14px;color:${({ theme }) => theme.t1};`
const FeePill     = styled.span`font-size:10px;padding:1px 6px;border-radius:3px;background:${({ theme }) => theme.inp};color:${({ theme }) => theme.t3};font-weight:700;`
const PoolMeta    = styled.div`display:flex;align-items:center;gap:6px;margin-top:3px;`
const TVal        = styled.div`font-weight:600;font-size:14px;color:${({ theme }) => theme.t1};`
const ApyVal      = styled.div`font-weight:800;font-size:14px;color:${({ theme }) => theme.goldt};`
const PrivRow     = styled.div`display:flex;align-items:center;gap:4px;color:${({ theme }) => theme.t3};font-size:12px;`
const BtnGroup    = styled.div`display:flex;gap:6px;`
const SmAdd       = styled(BtnGold)`padding:6px 12px;border-radius:7px;font-size:12px;`
const SmDetail    = styled(BtnGhost)`padding:6px 10px;border-radius:7px;font-size:12px;`
const Empty       = styled.div`padding:52px;text-align:center;`
const EmptyTitle  = styled.div`font-size:15px;font-weight:600;margin-bottom:6px;color:${({ theme }) => theme.t2};`
const EmptySub    = styled.div`font-size:13px;color:${({ theme }) => theme.t3};`
const MyPosPill   = styled.span`background:rgba(34,197,94,.1);color:#22c55e;border:1px solid rgba(34,197,94,.25);border-radius:4px;padding:2px 7px;font-size:11px;font-weight:700;`
const LoadingRow  = styled.div`padding:40px;text-align:center;color:${({ theme }) => theme.t3};font-size:13px;`
const ConnectNote = styled.div`padding:16px 20px;background:${({ theme }) => theme.goldbg};border-top:1px solid ${({ theme }) => theme.goldbd};font-size:12px;color:${({ theme }) => theme.goldt};display:flex;align-items:center;gap:8px;`

const LiquidityPage = () => {
  const { isConnected } = useWallet()
  const { pools, loading, refresh } = usePools()
  const [tab,    setTab]    = useState('pools')
  const [addMod, setAddMod] = useState(null)
  const [detailMod, setDetailMod] = useState(null)

   const { ready: fhevmReady } = useFhevm()

  const shown = tab === 'positions'
    ? pools.filter(p => p.myPos)
    : pools

  const totalDepositors = pools.reduce((s, p) => s + (p.depositors || 0), 0)

  return (
    <PageWrap>
      {addMod !== null && (
        <AddLiquidityModal
          onClose={() => { setAddMod(null); refresh() }}
          pool={addMod}
           fhevmReady={fhevmReady} 
        />
      )}

      {detailMod && (
  <PoolDetailsModal
    pool={detailMod}
    onClose={() => setDetailMod(null)}
  />
)}

      <PageHeader>
        <div>
          <PageTitle>Liquidity Pools</PageTitle>
          <PageSub>
            Provide encrypted liquidity and earn private trading fees on Sepolia
          </PageSub>
        </div>
        <AddBtn
  onClick={() => pools.length > 0 ? setAddMod(pools[0]) : setAddMod(null)}
  disabled={pools.length === 0 || loading}
>
          <IcoPlus size={14} /> Add Liquidity
        </AddBtn>
      </PageHeader>

      {/* ── Stats ── */}
      <StatsRow>
        {[
          { l: 'Total Pools',    v: String(pools.length),      gold: false },
          { l: 'Total LPs',      v: String(totalDepositors),   gold: false },
          { l: 'Fees',           v: '🔒 Private',              gold: false },
          { l: 'TVL',            v: '🔒 Encrypted',            gold: true  },
        ].map(({ l, v, gold }) => (
          <StatMiniCard key={l} style={{ minWidth: 120 }}>
            <StatLbl>{l}</StatLbl>
            <StatVal $gold={gold}>{v}</StatVal>
          </StatMiniCard>
        ))}
      </StatsRow>

      {/* ── Tabs ── */}
      <TabsRow>
        {[['pools','All Pools'],['positions','My Positions']].map(([k, lbl]) => (
          <TabBtn key={k} $active={tab === k} onClick={() => setTab(k)}>{lbl}</TabBtn>
        ))}
      </TabsRow>

      {/* ── Table ── */}
      <Table>
        <THead>
          <div>Pool</div>
          <div>Depositors</div>
          <div>APY</div>
          <div>Fees</div>
          <div>Volume</div>
          <div></div>
        </THead>

        {loading ? (
          <LoadingRow>Loading live pool data from Sepolia…</LoadingRow>
        ) : shown.length === 0 ? (
          <Empty>
            <EmptyTitle>
              {tab === 'positions' ? 'No positions yet' : 'No pools deployed yet'}
            </EmptyTitle>
            <EmptySub>
              {tab === 'positions'
                ? 'Add liquidity to a pool to get started'
                : 'Deploy contracts first — see README for instructions'}
            </EmptySub>
          </Empty>
        ) : (
          shown.map(pool => (
            <TRow key={pool.id}>
              {/* Pool identity */}
              <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                <DoubleTokIcon t0={pool.t0} t1={pool.t1} size={26} />
                <div>
                  <PoolName>{pool.t0}/{pool.t1}</PoolName>
                  <PoolMeta>
                    <FeePill>{pool.fee}%</FeePill>
                    <EncTag style={{ fontSize:9, padding:'1px 6px' }}>
                      <IcoLock size={7} color="currentColor" /> FHE
                    </EncTag>
                    {pool.myPos && <MyPosPill>My Position</MyPosPill>}
                  </PoolMeta>
                </div>
              </div>

              {/* Live depositor count (TVL is encrypted) */}
              <TVal>
                {pool.depositors > 0
                  ? `${pool.depositors} LP${pool.depositors > 1 ? 's' : ''}`
                  : 'Empty'}
              </TVal>

              {/* Simulated APY (based on fee tier) */}
              <ApyVal>{pool.apy}%</ApyVal>

              {/* Fees are private */}
              <PrivRow>
                <IcoLock size={11} color="currentColor" />
                <span>Private</span>
              </PrivRow>

              {/* Volume is encrypted */}
              <PrivRow>
                <IcoLock size={11} color="currentColor" />
                <span>Encrypted</span>
              </PrivRow>

              <BtnGroup>
                <SmAdd onClick={() => setAddMod(pool)}>Add</SmAdd>
                <SmDetail onClick={() => setDetailMod(pool)}>Details</SmDetail>
              </BtnGroup>
            </TRow>
          ))
        )}

        {!isConnected && (
          <ConnectNote>
            <IcoLock size={12} color="currentColor" />
            Connect your wallet to see your own liquidity positions
          </ConnectNote>
        )}
      </Table>
    </PageWrap>
  )
}

export default LiquidityPage
