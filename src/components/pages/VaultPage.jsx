import { useState } from 'react'
import styled from 'styled-components'
import { PageWrap, BtnGold, BtnGhost, StatMiniCard } from '../common/Shared'
import { TokenIcon } from '../common/TokenIcon'
import { IcoLock, IcoTrendUp } from '../icons/Icons'
import RiskTag from '../common/RiskTag'
import VaultModal from '../modals/VaultModal'
import { useWallet } from '../../hooks/useWallet'
import { useVaults } from '../../hooks/useVaults'
import { useFhevm } from '../../hooks/useFhevm'

/* ── Styled ── */
const PageTitle  = styled.h1`font-size:28px;font-weight:900;letter-spacing:-0.03em;margin-bottom:6px;color:${({ theme }) => theme.t1};`
const PageSub    = styled.p`color:${({ theme }) => theme.t2};font-size:13px;margin-bottom:28px;`
const StatsRow   = styled.div`display:flex;gap:10px;margin-bottom:28px;flex-wrap:wrap;`
const StatLbl    = styled.div`font-size:11px;color:${({ theme }) => theme.t3};margin-bottom:5px;`
const StatVal    = styled.div`font-size:20px;font-weight:800;color:${({ theme, $gold }) => $gold ? theme.goldt : theme.t1};`
const EncBal     = styled.div`display:flex;align-items:center;gap:6px;font-size:18px;font-weight:800;color:${({ theme }) => theme.goldt};`

const Grid      = styled.div`display:grid;grid-template-columns:repeat(auto-fill,minmax(360px,1fr));gap:16px;`
const VCard     = styled.div`background:${({ theme }) => theme.surface};border:1px solid ${({ theme }) => theme.border};border-radius:18px;padding:22px;transition:border-color .2s,transform .2s;&:hover{border-color:${({ theme }) => theme.goldbd};transform:translateY(-2px);}`
const VTop      = styled.div`display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:18px;`
const VLeft     = styled.div`display:flex;align-items:center;gap:12px;`
const VName     = styled.div`font-weight:800;font-size:17px;color:${({ theme }) => theme.t1};`
const VStrat    = styled.div`font-size:12px;color:${({ theme }) => theme.t3};`

const ApyBox    = styled.div`background:${({ theme }) => theme.goldbg};border:1px solid ${({ theme }) => theme.goldbd};border-radius:12px;padding:14px 18px;display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;`
const ApyLbl    = styled.div`font-size:10px;font-weight:700;color:${({ theme }) => theme.goldt};text-transform:uppercase;letter-spacing:.06em;margin-bottom:4px;`
const ApyNum    = styled.div`font-size:36px;font-weight:900;color:${({ theme }) => theme.goldt};letter-spacing:-0.03em;line-height:1;`
const ApyIco    = styled.div`color:${({ theme }) => theme.goldt};opacity:.5;`

const MetaRow   = styled.div`display:flex;justify-content:space-between;margin-bottom:18px;`
const MetaLbl   = styled.div`font-size:11px;color:${({ theme }) => theme.t3};margin-bottom:3px;`
const MetaVal   = styled.div`font-size:13px;font-weight:700;color:${({ theme }) => theme.t1};`
const EncMeta   = styled.div`display:flex;align-items:center;gap:4px;font-size:13px;font-weight:700;color:${({ theme }) => theme.goldt};`
const HasPos    = styled.div`display:flex;align-items:center;gap:4px;font-size:12px;font-weight:700;color:#22c55e;`

const BtnRow    = styled.div`display:flex;gap:10px;`
const DepBtn    = styled(BtnGold)`flex:1;padding:11px;border-radius:10px;font-size:13px;`
const WthBtn    = styled(BtnGhost)`flex:1;padding:11px;border-radius:10px;font-size:13px;`

const LoadingGrid = styled.div`padding:48px;text-align:center;color:${({ theme }) => theme.t3};font-size:13px;`
const DeployNote  = styled.div`background:${({ theme }) => theme.goldbg};border:1px solid ${({ theme }) => theme.goldbd};border-radius:12px;padding:16px 20px;margin-bottom:24px;font-size:13px;color:${({ theme }) => theme.goldt};line-height:1.6;`

const VaultPage = () => {
  const { isConnected } = useWallet()
  const { vaults, loading, refresh } = useVaults()
  const [vaultMod, setVaultMod] = useState(null)

     const { ready: fhevmReady } = useFhevm()
  

  const totalDepositors = vaults.reduce((s, v) => s + (v.depositors || 0), 0)
  const avgApy = vaults.length
    ? (vaults.reduce((s, v) => s + parseFloat(v.apy), 0) / vaults.length).toFixed(1)
    : '—'

  return (
    <PageWrap>
      {vaultMod && (
        <VaultModal
          onClose={() => { setVaultMod(null); refresh() }}
          vault={vaultMod}
                     fhevmReady={fhevmReady} 

        />
      )}

      <PageTitle>Private Vaults</PageTitle>
      <PageSub>
        Earn yield with fully encrypted deposits — only you can see your balance via Zama FHE
      </PageSub>

      {/* ── Stats ── */}
      <StatsRow>
        {[
          { l: 'Active Vaults',   v: String(vaults.length),    gold: false, enc: false },
          { l: 'Avg APY',         v: avgApy + '%',              gold: true,  enc: false },
          { l: 'Total Depositors',v: String(totalDepositors),   gold: false, enc: false },
          { l: 'Your Balance',    v: null,                       gold: true,  enc: true  },
        ].map(({ l, v, gold, enc }) => (
          <StatMiniCard key={l} style={{ minWidth: 120 }}>
            <StatLbl>{l}</StatLbl>
            {enc ? (
              <EncBal>
                <IcoLock size={16} color="currentColor" />
                {isConnected ? '••••••' : 'Connect wallet'}
              </EncBal>
            ) : (
              <StatVal $gold={gold}>{v}</StatVal>
            )}
          </StatMiniCard>
        ))}
      </StatsRow>

      {/* Deploy note shown if contracts not yet deployed */}
      {!loading && vaults.length === 0 && (
        <DeployNote>
          ⚠️  No vaults found on Sepolia. Deploy your contracts first:<br />
          <code style={{ fontSize: 12 }}>cd contracts &amp;&amp; npm install &amp;&amp; npx hardhat run scripts/deploy.js --network sepolia</code><br />
          Then paste the addresses into <code>src/config/contracts.js</code>
        </DeployNote>
      )}

      {/* ── Vault cards ── */}
      {loading ? (
        <LoadingGrid>Loading live vault data from Sepolia…</LoadingGrid>
      ) : (
        <Grid>
          {vaults.map(vault => (
            <VCard key={vault.id}>
              <VTop>
                <VLeft>
                  <TokenIcon sym={vault.asset} size={42} />
                  <div>
                    <VName>{vault.name}</VName>
                    <VStrat>{vault.strategy}</VStrat>
                  </div>
                </VLeft>
                <RiskTag risk={vault.risk} />
              </VTop>

              {/* APY from contract's apyBps */}
              <ApyBox>
                <div>
                  <ApyLbl>Current APY</ApyLbl>
                  <ApyNum>{vault.apy}%</ApyNum>
                </div>
                <ApyIco><IcoTrendUp size={30} /></ApyIco>
              </ApyBox>

              {/* Live metadata from contract */}
              <MetaRow>
                <div>
                  <MetaLbl>Depositors</MetaLbl>
                  <MetaVal>{vault.depositors > 0 ? vault.depositors : '—'}</MetaVal>
                </div>
                <div>
                  <MetaLbl>Min Deposit</MetaLbl>
                  <MetaVal>{vault.minDep}</MetaVal>
                </div>
                <div>
                  <MetaLbl>Your Balance</MetaLbl>
                  {vault.myBalance ? (
                    <HasPos>
                      <span style={{ fontSize: 9 }}>●</span> Active
                    </HasPos>
                  ) : (
                    <EncMeta>
                      <IcoLock size={11} color="currentColor" />
                      {isConnected ? 'None' : '—'}
                    </EncMeta>
                  )}
                </div>
              </MetaRow>

              <BtnRow>
                <DepBtn onClick={() => setVaultMod(vault)}>Deposit</DepBtn>
                <WthBtn onClick={() => setVaultMod({ ...vault, _tab: 'withdraw' })}>Withdraw</WthBtn>
              </BtnRow>
            </VCard>
          ))}
        </Grid>
      )}
    </PageWrap>
  )
}

export default VaultPage
