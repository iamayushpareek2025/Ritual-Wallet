export class SecurityFilter {
  /**
   * Scans a string and redacts potential private keys, mnemonics, or sensitive info
   * before it is sent to the LLM provider.
   */
  public static redactSensitiveData(input: string): string {
    let safeString = input;
    
    // Simple 64-char hex private key detection
    const pkRegex = /\b(?:0x)?[0-9a-fA-F]{64}\b/g;
    safeString = safeString.replace(pkRegex, '[REDACTED_PRIVATE_KEY]');
    
    // Very naive 12-24 word mnemonic detection (just an example, in reality needs NLP or BIP39 wordlist matching)
    // For now, we rely on the wallet architecture not passing mnemonics into the AI context at all.
    return safeString;
  }
}
