import { ClearingEvent } from "./schemas";

export function generateMockClearingEvent(): Partial<ClearingEvent> {
  const ids = ["HEX-8829", "HEX-1022", "HEX-4491", "HEX-0012"];
  const instruments = ["PROMISSORY_NOTE", "BILL_OF_EXCHANGE"] as const;

  return {
    timestamp: Date.now(),
    eventId: ids[Math.floor(Math.random() * ids.length)] + "-" + Math.floor(Math.random() * 1000000) + "-" + Date.now().toString().slice(-4),
    instrument: {
      instrumentId: `INST-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
      type: instruments[Math.floor(Math.random() * instruments.length)],
      iso_20022_type: "pain.001.001.03",
      value: {
        amount: Math.random() * 1000000,
        currency: "USD",
      },
      ucc9_status: "PERFECTED",
      hash_signature: `0x${Math.random().toString(16).slice(2, 42)}`, // Valid prefix
    },
    status: "CLEARED",
    authority_node: "SOVR-PRIMARY-01",
  };
}
