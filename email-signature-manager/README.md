# CVFO Email Signature Manager

Apps Script web app for previewing and pushing Collective VFO Gmail signatures through the Gmail API.

## Files

- `Code.gs` - Apps Script backend, user registry, generated signature HTML, Gmail API push/verify logic.
- `Index.html` - Apps Script web app UI for previewing, pushing, verifying, and copying activation instructions.

## Security notes

Do not commit service account keys or private keys to GitHub.

The service account credentials are read from Apps Script Script Properties:

- `SERVICE_ACCOUNT_EMAIL`
- `SERVICE_ACCOUNT_PRIVATE_KEY`

If a real private key was ever pasted into a public repo or shared broadly, rotate it in Google Cloud.

## Apps Script setup

1. Create or open the Apps Script project.
2. Add the OAuth2 library: `1B7FSrk5Zi6L1rSxxTDgDEUsPzlukDsi4KGuTMorsTQHhGBzBkMun4iDF`
3. Paste `Code.gs` into the Apps Script `Code.gs` file.
4. Create an HTML file named `Index` and paste `Index.html` into it.
5. Open Project Settings > Script Properties and add:
   - `SERVICE_ACCOUNT_EMAIL`
   - `SERVICE_ACCOUNT_PRIVATE_KEY`
6. Run `checkCredentialSetup()`.
7. Run `testConnection()` against Harvey first.
8. Deploy as a Web App:
   - Execute as: Me
   - Access: your preferred Google account access level

## Operating model

The UI lets you:

- Select a user.
- Select a signature variant.
- Preview the rendered signature.
- Push one selected variant.
- Push all active variants.
- Verify the live Gmail signature.
- Copy one-time activation instructions for users.

## Gmail caveat

The Gmail API can write the signature HTML to the account. It does not control the Gmail UI dropdowns for which signature is used for new emails and replies. Some users may need to select the pushed signature once under Gmail Settings > Signature defaults.

## Current people included

- Harvey Rustman
- Sterling Hirsch
- Anna-Marie Lovell
- Wyatt Dursteler
- Carmen Hirsch
- Phil Castro
- Henry Rodriguez
- Briell Huddleston

Book promo variants are included for Sterling, Anna-Marie, and Wyatt.

## Source-of-truth workflow

- GitHub is the canonical source for `Code.gs`, `Index.html`, and `appsscript.json`.
- Use `clasp pull` only to reconcile intentional Apps Script editor changes; do not treat an unreviewed pull as canonical.
- Use `clasp push` after review to synchronize approved repository code to Apps Script.
- Test signature changes against Harvey before pushing to another user or using **Push All Active**.
- Run `testFreshHarveyConnection` after rotating the service-account key; it clears Harvey's cached OAuth token before verifying that the replacement key can mint a fresh token.
- The credential loader accepts normal PEM, escaped-newline PEM, or the single-line PEM format produced when the Apps Script property editor strips line breaks.
- Create a numbered Apps Script version before updating the production web-app deployment.
- Do not edit production code directly in the Apps Script editor after this workflow is established.

Briell uses the top-aligned square crop `BriellH_2026_square_v2.png` and the main office number at extension 105. The original portrait remains in the repository as `BriellH_2026_1.png`.

## Operational record — August 4, 2026

- GitHub `main` is the canonical source and is synchronized to the Apps Script `@HEAD` editor deployment.
- The production web-app deployment remains a separate versioned deployment; source synchronization does not update it.
- The exposed service-account key was rotated. The replacement email and private key live only in the `SERVICE_ACCOUNT_EMAIL` and `SERVICE_ACCOUNT_PRIVATE_KEY` Script Properties, and the old key was removed.
- The credential loader reconstructs a valid PEM when the Apps Script property editor stores the private key on one line.
- Properties named `oauth2.cvfo_sig_<user_email>` are OAuth2 library token caches for delegated Gmail access. They are sensitive, automatically refreshed, and should not be edited manually. Deleting one forces a fresh token for that mailbox.
- Briell's regular signature was pushed by Harvey and then read back successfully through **Verify Live** with a stored length of 4,725 characters and no OAuth error.
- The generated Briell source is 5,138 characters. Gmail sanitizes stored signature HTML, so the manager currently treats a successful live read longer than 100 characters as verification rather than requiring byte-for-byte equality.
- Briell's hosted headshot is `BriellH_2026_square_v2.png`, a pixel-preserving 1086×1086 top-aligned crop of the approved original. The versioned filename prevents stale browser and Gmail image caches from retaining the rejected crop.
