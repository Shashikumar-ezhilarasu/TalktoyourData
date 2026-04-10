export interface ScrubResult {
  cleanData: Record<string, any>[];
  piiColumnsFound: string[];
  redactionCount: number;
}

export class PIIScrubber {
  private static PII_COLUMN_PATTERNS = [
    /^(email|e_mail|email_address)$/i,
    /^(phone|mobile|cell|telephone|phone_number)$/i,
    /^(ssn|social_security|national_id|aadhaar|pan)$/i,
    /^(password|passwd|pwd|secret|token|api_key)$/i,
    /^(dob|date_of_birth|birthdate|birth_date)$/i,
    /^(ip|ip_address|ipv4|ipv6)$/i,
    /^(address|street|zip|postal_code|pincode)$/i,
    /^(credit_card|card_number|cvv|card_no)$/i,
    /^(passport|license_number|driving_license)$/i,
  ];

  private static VALUE_PATTERNS = {
    email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/,
    phone: /^\+?[0-9]{10,15}$/,
    creditCard: /\b(?:\d[ -]*?){13,16}\b/,
  };

  async scrub(data: Record<string, any>[]): Promise<ScrubResult> {
    if (data.length === 0) return { cleanData: [], piiColumnsFound: [], redactionCount: 0 };

    const columns = Object.keys(data[0]);
    const piiColumnsFound = new Set<string>();
    let redactionCount = 0;

    // Layer 1: Column name check
    for (const col of columns) {
      if (PIIScrubber.PII_COLUMN_PATTERNS.some(pattern => pattern.test(col))) {
        piiColumnsFound.add(col);
      }
    }

    // Layer 2: Value sampling check (on first 20 rows)
    const sampleSize = Math.min(data.length, 20);
    for (let i = 0; i < sampleSize; i++) {
        for (const col of columns) {
            if (piiColumnsFound.has(col)) continue;
            const val = String(data[i][col]);
            if (PIIScrubber.VALUE_PATTERNS.email.test(val) || PIIScrubber.VALUE_PATTERNS.creditCard.test(val)) {
                piiColumnsFound.add(col);
            }
        }
    }

    // Layer 3: Redaction
    const cleanData = data.map(row => {
      const newRow = { ...row };
      for (const col of piiColumnsFound) {
        if (newRow[col] !== null && newRow[col] !== undefined) {
          newRow[col] = '[REDACTED]';
          redactionCount++;
        }
      }
      return newRow;
    });

    return {
      cleanData,
      piiColumnsFound: Array.from(piiColumnsFound),
      redactionCount
    };
  }
}
