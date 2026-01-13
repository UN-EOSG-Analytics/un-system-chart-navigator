# Entity Link Verification

Automated verification of entity website URLs to ensure they are accessible and working correctly.

## Overview

This tool verifies all entity links in the UN System Chart Navigator by:
- Checking HTTP status codes
- Detecting redirects
- Identifying Cloudflare-protected sites
- Validating content quality
- Optionally capturing screenshots

## Usage

### Basic Verification (No Screenshots)

```bash
uv run python python/verification/verify_links.py
```

### With Screenshots

```bash
uv run python python/verification/verify_links.py --screenshots
```

**Note:** Screenshots require Playwright browsers to be installed:
```bash
uv run playwright install chromium
```

## Automated Runs

The verification runs automatically via GitHub Actions:

- **Schedule:** Weekly on Mondays at 10 AM UTC
- **Manual:** Can be triggered manually via GitHub Actions UI
- **Workflow:** `.github/workflows/verify_entity_links.yml`

## Output Files

### `data/output/entity_link_verification_results.csv`
Detailed CSV with all verification results for data analysis.

### `public/entity_link_verification_results.json`
JSON format consumed by the dev dashboard at `/dev/entity_link`

## Verification Results

Each entity link is checked for:

| Field | Description |
|-------|-------------|
| `accessible` | Boolean indicating if the site is reachable (2xx/3xx status) |
| `status_code` | HTTP status code (200, 403, 404, etc.) |
| `status_name` | Human-readable status name |
| `content_length` | Page size in bytes |
| `content_valid` | Whether content appears to be valid (not an error page) |
| `cloudflare_protected` | Whether site uses Cloudflare bot protection |
| `redirect_url` | Final URL after redirects (if different) |
| `error` | Error message if verification failed |

## Cloudflare Protection

### The Problem

Many UN entity websites use Cloudflare's bot protection, which blocks automated requests with `403 Forbidden` responses. This is a security feature to prevent DDoS attacks and scraping.

### Detection

Sites are flagged as Cloudflare-protected if:
- Status code is `403 Forbidden`
- Response contains Cloudflare-specific markers:
  - "cloudflare"
  - "cf-ray"
  - "checking your browser"
  - "ddos protection"

### Current Strategy

**Accept and Document:** We identify and flag these sites rather than trying to bypass protection. This approach:
- Respects the security measures in place
- Avoids violating terms of service
- Documents which sites require manual verification

### Alternatives Considered

| Approach | Status | Notes |
|----------|--------|-------|
| Browser automation (Playwright) | ❌ Limited | Works locally but fails in CI without human interaction |
| Proxy rotation | ❌ Not pursued | Against ToS, unreliable |
| Manual allowlist | ✅ Future option | Could request entity sites to allowlist GitHub Actions IPs |
| Human verification | ✅ Current | Manual spot-checks via dashboard |

## Dashboard

View verification results at: `/dev/entity_link`

The dashboard provides:
- Real-time filtering (All, Accessible, Failed, Cloudflare)
- Search by entity name or URL
- Sortable columns
- Statistics overview
- Links to original and redirected URLs

## Troubleshooting

### High failure rate
Check if new Cloudflare protections have been deployed. Review the dashboard for patterns.

### Timeout errors
Some sites may be slow to respond. The timeout is set to 10 seconds per request.

### Connection errors
May indicate DNS issues, server downtime, or network problems.

## Contributing

When adding new entities:
1. Ensure `entity_link` field contains valid URLs
2. Run verification locally before committing
3. Check dashboard for any issues
4. Document any known Cloudflare-protected sites

## Future Improvements

- [ ] Track changes over time (link degradation)
- [ ] Email notifications for newly broken links
- [ ] Integration with entity data update workflow
- [ ] API endpoint health checks
- [ ] SSL certificate expiration monitoring
