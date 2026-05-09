import { RiskLow, RiskMed, RiskHigh } from './Shared'

const RiskTag = ({ risk }) => {
  if (risk === 'low') return <RiskLow>Low Risk</RiskLow>
  if (risk === 'med') return <RiskMed>Medium Risk</RiskMed>
  return <RiskHigh>High Risk</RiskHigh>
}

export default RiskTag
