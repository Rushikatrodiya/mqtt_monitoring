import { useDevices } from '../hooks/useDevices';
import { useFleetHistory } from '../hooks/useFleetHistory';
import DashboardHeader from './DashboardHeader';
import BrokerStatus from './BrokerStatus';
import FleetHealthChart from './FleetHealthChart';
import DeviceTable from './DeviceTable';

export default function Dashboard() {
  const { sortedDevices, onlineCount, totalCount } = useDevices();
  const { chartData } = useFleetHistory();

  return (
    <div className="min-h-screen bg-bg py-10 px-6">
      <div className="max-w-5xl mx-auto">
        <DashboardHeader onlineCount={onlineCount} totalCount={totalCount} />
        <BrokerStatus />
        <FleetHealthChart chartData={chartData} totalCount={totalCount} />
        <DeviceTable sortedDevices={sortedDevices} />
      </div>
    </div>
  );
}
