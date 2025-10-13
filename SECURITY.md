# Security Policy

## Supported Versions

We release patches for security vulnerabilities for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

The QuadraX team takes security vulnerabilities seriously. We appreciate your efforts to responsibly disclose your findings.

### How to Report

**Please do NOT report security vulnerabilities through public GitHub issues.**

Instead, please report them via email to:

📧 **ashishregmi2017@gmail.com**

Include the following information:

- Type of vulnerability
- Full paths of source file(s) related to the vulnerability
- Location of the affected source code (tag/branch/commit or direct URL)
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the vulnerability, including how an attacker might exploit it

### What to Expect

- **Acknowledgment**: We will acknowledge receipt of your vulnerability report within 48 hours
- **Assessment**: We will assess the vulnerability and determine its impact and severity
- **Fix**: We will work on a fix and keep you informed of our progress
- **Disclosure**: We will coordinate with you on the disclosure timeline
- **Credit**: If desired, we will publicly credit you for the discovery once the vulnerability is fixed

### Security Updates

Security updates will be released as soon as possible after a vulnerability is confirmed. Updates will be announced through:

- GitHub Security Advisories
- Release notes
- Email notifications to known users (if applicable)

## Smart Contract Security

Our smart contracts follow best practices:

- ✅ ReentrancyGuard protection
- ✅ SafeERC20 for token transfers
- ✅ Access control mechanisms
- ✅ Integer overflow/underflow protection (Solidity 0.8+)
- ✅ Comprehensive test coverage

### Audit Status

- [ ] Not yet audited
- [ ] Audit in progress
- [ ] Audit completed

We plan to conduct professional security audits before mainnet deployment.

## Known Issues

Currently, there are no known security vulnerabilities.

## Security Best Practices for Users

### For Developers

1. **Never commit private keys** or sensitive credentials
2. **Use environment variables** for all sensitive configuration
3. **Keep dependencies updated** regularly
4. **Review code changes** before deployment

### For Players

1. **Only use official contracts** - verify contract addresses
2. **Never share private keys** or seed phrases
3. **Start with testnet** before using mainnet
4. **Double-check transactions** before signing
5. **Use hardware wallets** for large amounts

## Bug Bounty Program

We are considering establishing a bug bounty program. Stay tuned for updates!

---

Thank you for helping keep QuadraX and our users safe! 🛡️
