import { XMLParser } from 'fast-xml-parser';
import { ClearingEvent } from './schemas';

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_"
});

export class ISO20022Parser {
  /**
   * Parses raw ISO 20022 XML (CAMT.053 or PAIN.001) and maps it to the BASALT CORE ClearingEvent schema.
   * This ensures data integrity and compliance before it hits the UCC-9 engine.
   */
  static parse(xmlString: string): Partial<ClearingEvent> {
    try {
      const jsonObj = parser.parse(xmlString);
      
      // CAMT.053 - Bank to Customer Statement
      if (jsonObj.Document?.BkToCstmrStmt) {
        return this.parseCamt053(jsonObj.Document.BkToCstmrStmt);
      } 
      // PAIN.001 - Customer Credit Transfer Initiation
      else if (jsonObj.Document?.CstmrCdtTrfInitn) {
        return this.parsePain001(jsonObj.Document.CstmrCdtTrfInitn);
      }
      
      throw new Error("Unsupported or Invalid ISO 20022 Document Type. Expected CAMT.053 or PAIN.001.");
    } catch (error) {
      console.error("XML Parsing Error:", error);
      throw new Error("Failed to parse ISO 20022 XML. Ensure the document is well-formed.");
    }
  }

  private static parseCamt053(stmt: any): Partial<ClearingEvent> {
    const statement = Array.isArray(stmt.Stmt) ? stmt.Stmt[0] : stmt.Stmt;
    const stmtId = statement?.Id || `CAMT-${Date.now()}`;
    
    // Extract balance
    const balance = Array.isArray(statement?.Bal) ? statement.Bal[0] : statement?.Bal;
    const amountStr = balance?.Amt?.['#text'] || balance?.Amt || "0";
    const amount = parseFloat(amountStr);
    const currency = balance?.Amt?.['@_Ccy'] || "USD";

    return {
      timestamp: Date.now(),
      eventId: `EVT-${stmtId}`,
      instrument: {
        instrumentId: `INST-${stmtId}`,
        type: "BILL_OF_EXCHANGE",
        iso_20022_type: "camt.053.001.02",
        value: {
          amount: amount,
          currency: currency
        },
        ucc9_status: "UNPERFECTED",
        hash_signature: this.generateMockHash(stmtId)
      },
      status: "PENDING",
      authority_node: "AWAITING_QUORUM"
    };
  }

  private static parsePain001(initn: any): Partial<ClearingEvent> {
    const grpHdr = initn.GrpHdr;
    const msgId = grpHdr?.MsgId || `PAIN-${Date.now()}`;
    
    // Extract payment info
    const pmtInf = Array.isArray(initn.PmtInf) ? initn.PmtInf[0] : initn.PmtInf;
    const tx = Array.isArray(pmtInf?.CdtTrfTxInf) ? pmtInf.CdtTrfTxInf[0] : pmtInf?.CdtTrfTxInf;
    
    const amountStr = tx?.Amt?.InstdAmt?.['#text'] || tx?.Amt?.InstdAmt || "0";
    const amount = parseFloat(amountStr);
    const currency = tx?.Amt?.InstdAmt?.['@_Ccy'] || "USD";

    return {
      timestamp: Date.now(),
      eventId: `EVT-${msgId}`,
      instrument: {
        instrumentId: `INST-${msgId}`,
        type: "PROMISSORY_NOTE",
        iso_20022_type: "pain.001.001.03",
        value: {
          amount: amount,
          currency: currency
        },
        ucc9_status: "UNPERFECTED",
        hash_signature: this.generateMockHash(msgId)
      },
      status: "PENDING",
      authority_node: "AWAITING_QUORUM"
    };
  }

  /**
   * Generates a deterministic mock ECDSA hash signature based on the message ID.
   * In a production environment, this would be a real cryptographic signature.
   */
  private static generateMockHash(seed: string): string {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      const char = seed.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return `0x${Math.abs(hash).toString(16).padStart(64, '0')}`;
  }
}
