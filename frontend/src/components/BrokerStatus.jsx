export default function BrokerStatus() {
  return (
    <div className="flex items-center gap-2 mb-6 text-sm text-muted">
      <span className="w-2 h-2 rounded-full bg-online shadow-[0_0_6px_#3fb950] inline-block" />
      connected to broker at mqtt://localhost:1883
    </div>
  );
}
