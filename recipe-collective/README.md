# The Recipe Collective

A shared family recipe database built with Netlify + Airtable + Claude AI.

## Setup

### Environment Variables
Add these in Netlify → Site Settings → Environment Variables:

| Variable | Value |
|---|---|
| `ANTHROPIC_API_KEY` | Your Anthropic API key |
| `AIRTABLE_API_KEY` | Your Airtable personal access token |
| `AIRTABLE_BASE_ID` | Your Airtable base ID (starts with `app`) |
| `AIRTABLE_TABLE_ID` | Your Airtable table ID (starts with `tbl`) |

### Deploy to Netlify
1. Push this folder to a GitHub repository
2. Connect the repo to Netlify
3. Add environment variables above
4. Deploy

### Local Development
```bash
npm install
netlify dev
```
Requires Netlify CLI: `npm install -g netlify-cli`

## Features
- Browse and search all recipes
- Filter by tag
- Paste a URL → Claude extracts recipe automatically
- Manual review before saving
- Edit or delete any recipe
- Anyone with the link can contribute
