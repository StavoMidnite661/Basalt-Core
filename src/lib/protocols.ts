import { ClearingEvent } from './schemas';

/**
 * SOVR COR - Legacy Settlement Translation Protocols
 * 
 * These protocols translate our internal Stored Value Token (SVT) events into 
 * legacy financial messaging formats (ACH / SWIFT). This allows SOVR COR to act 
 * as its own sovereign clearinghouse while maintaining the ability to communicate 
 * with the outside world (TradFi) when necessary.
 */

export class ACHProtocol {
  /**
   * Generates a NACHA (ACH) formatted string for a given clearing event.
   * NACHA is a fixed-width text file format used by the Automated Clearing House network.
   * Each line must be exactly 94 characters long.
   */
  static generateNacha(event: ClearingEvent, receiverName: string): string {
    const amountCents = Math.round(event.instrument.value.amount * 100).toString().padStart(10, '0');
    const traceNumber = Math.floor(Math.random() * 999999999999999).toString().padStart(15, '0');
    const routingNumber = "121042882"; // Mock routing
    const accountId = event.eventId.replace(/[^0-9]/g, '').substring(0, 10).padStart(17, ' ');
    const companyName = "SOVR COR".padEnd(16, ' ');
    const formattedReceiver = receiverName.substring(0, 22).toUpperCase().padEnd(22, ' ');
    
    // 1 - File Header Record
    const fileHeader = `101 121042882 121042882 2604150113A094101${companyName}SOVR COR       094101`.padEnd(94, ' ');
    
    // 5 - Batch Header Record
    const batchHeader = `5220${companyName}                 SOVR COR       0000000000PPDTRANSACTION0000000`.padEnd(94, ' ');
    
    // 6 - Entry Detail Record
    const entryDetail = `622${routingNumber.substring(0,8)}${routingNumber.substring(8,9)}${accountId}${amountCents}${traceNumber} ${formattedReceiver}  0`.padEnd(94, ' ');
    
    // 8 - Batch Control Record
    const batchControl = `82200000100000000000000000000000000000000000000000000000000000000000000000000000000`.padEnd(94, ' ');
    
    // 9 - File Control Record
    const fileControl = `90000010000010000000100000000000000000000000000000000000000000000000000000000000000`.padEnd(94, ' ');

    return `${fileHeader}\n${batchHeader}\n${entryDetail}\n${batchControl}\n${fileControl}`;
  }
}

export class SWIFTProtocol {
  /**
   * Generates a SWIFT MT103 (Single Customer Credit Transfer) message.
   * This translates the internal SVT transfer into an international wire format.
   */
  static generateMT103(event: ClearingEvent, receiverName: string): string {
    const date = new Date(event.timestamp);
    const yy = date.getFullYear().toString().substring(2);
    const mm = (date.getMonth() + 1).toString().padStart(2, '0');
    const dd = date.getDate().toString().padStart(2, '0');
    const amount = event.instrument.value.amount.toFixed(2).replace('.', ',');
    const currency = event.instrument.value.currency || 'USD';
    const ref = event.eventId.substring(0, 16);
    const receiverBIC = receiverName.replace(/[^A-Z]/gi, '').substring(0, 8).toUpperCase().padEnd(8, 'X');

    return `{1:F01SOVRCORXXXX0000000000}{2:I103${receiverBIC}XXXXN}{3:{108:${ref}}}{4:
:20:${ref}
:23B:CRED
:32A:${yy}${mm}${dd}${currency}${amount}
:50K:/123456789
SOVR COR
STORED VALUE FACILITY
:59:/987654321
${receiverName.toUpperCase()}
:71A:SHA
-}`;
  }
}
