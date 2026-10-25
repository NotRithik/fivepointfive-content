# Edit the 5.5 Records website

This is the **content cupboard** for [fivepointfiverecords.com](https://www.fivepointfiverecords.com). Edit the files here to change artists, records, artwork, products, prices and public contact details. You do not need to edit the website code or deploy it again.

**The order of rows is the order on the website.** First row means first item. Move a whole row up or down to change the order. The website does not re-sort your names alphabetically or your records by date.

This is a **public** repository. Put only information and images that may appear on the public website here. Never upload passwords, API keys, customer messages, subscriber addresses, private agreements or payment details.

## Where to make each change

| Change on the website | File to edit |
| --- | --- |
| Current artists, in the room and Index | [content/current-artists.csv](content/current-artists.csv) |
| Alumni artists, in the room and Index | [content/alumni-artists.csv](content/alumni-artists.csv) |
| Complete release catalogue: titles, artist credits, covers and links | [content/releases.csv](content/releases.csv) |
| Front-page record sleeves, New Releases in the Index, and playable music selection | [content/new-releases.csv](content/new-releases.csv) |
| The record covers on the wall shelf | [content/shelf.csv](content/shelf.csv) |
| CRT shop and Index shop: products, prices, buy links and photos | [content/shop.csv](content/shop.csv) |
| Social accounts, links and their order | [content/socials.csv](content/socials.csv) |
| Email address, logos, wall artwork and public form settings | [content/settings.json](content/settings.json) |
| Uploaded covers, product pictures and branding | [images/](images/) |

The repo starts with the content from the approved website. There are 5 current artists, 62 alumni, 65 visible catalogue entries, 7 homepage records, 5 shelf picks and 2 products. These are starting counts, not fixed catalogue/shop counts.

## Make a normal edit in GitHub

1. Open the file from the table above. Click the **pencil / Edit this file** button. You must be signed into an account with write access. If you cannot see Edit, ask the repository owner to give you access.
2. Change the relevant row. Keep the first/header row unchanged. Add a new item by copying the shape of another row; remove an item by deleting its whole row.
3. Click **Commit changes**, add a short description such as “Add new single”, and commit to **main**.
4. Open the repo's **Actions** tab. The newest **Check and publish content** run must have a green tick. Red means something needs fixing; click the failed run to see the filename and reason.
5. Refresh the website. The publish job and GitHub's raw-file cache can introduce a delay of a few minutes. An already-open website keeps its current content until reloaded so records do not disappear halfway through playback.

**A red check does not replace the live content.** Fix the error and commit again. For a change touching several files, use a branch and pull request so all the edits are checked and published together. The green check on the pull request checks the content; merging it into main publishes it.

## Artists: add, remove or move a name

The two artist files have the same columns:

```csv
name,genre,link
ARTIST NAME,Hip-Hop,https://open.spotify.com/artist/EXACT_ARTIST_ID
```

`name` is the displayed name. `genre` is optional. `link` is the artist's exact Spotify page; paste the link copied from Spotify. Use one artist per row. No artist portraits are needed.

To move an artist from Current to Alumni, move their whole row between the two files. For a clean single publication, make both edits on one branch and merge them together. Names keep the order in each file. The physical roster currently supports up to 20 Current and 200 Alumni names; the print automatically fits the list, so very large lists use smaller type.

## Catalogue: add a release once

Open `content/releases.csv`. Each release has a permanent `id`, such as `5.5-067`. Choose a new unused ID and do not change the ID later; the homepage and shelf refer to it.

| Column | What goes here |
| --- | --- |
| `id` | Unique permanent ID, using letters, numbers, hyphens or dots. |
| `title` | The record/track title. |
| `artist` | The artist credit. Put quotes around credits containing commas. |
| `project` | The album/EP name, or `SINGLE`. |
| `year` | Four digits, such as `2026`. |
| `link` | The public destination for the record, usually its Spotify track or album. |
| `cover` | Image path such as `images/covers/new-single.jpg`. |
| `in_catalogue` | `yes` shows it in the catalogue. `no` keeps the row available for homepage/shelf selection but hides it from the catalogue. |
| `catalogue_title` | Optional: a different catalogue title. Leave blank to use `title`. |
| `catalogue_link` | Optional: a different catalogue destination, e.g. the whole album. |
| `catalogue_cover` | Optional: different artwork specifically for the catalogue. |
| `hue` | Optional fallback sleeve colour: 0 red, 1 white, 2 dark, 3 grey. Keep the existing value, or leave blank for a new record. Real cover artwork takes precedence. |
| `hue` | Optional fallback sleeve colour: 0 red, 1 white, 2 dark, 3 grey. Keep the existing value, or leave blank for a new record. Real cover artwork takes precedence. |

Example shape — replace these example values with your real release and uploaded image:

```csv
5.5-NEW,NEW SINGLE,"ARTIST ONE, ARTIST TWO",SINGLE,2026,https://open.spotify.com/track/REPLACE_ME,images/covers/new-single.jpg,yes,,,,,
```

Move the row to where the cover should appear. The All view follows the file from top to bottom. Year/search filters only hide non-matching items; they do not change the order. To get a clean year section, keep rows for the same year together. Moving a row between years does not silently change its `year` value.

To remove a release completely, first remove any references to its ID from `new-releases.csv` and `shelf.csv`, then remove its `releases.csv` row. Otherwise the checker will tell you which reference is broken. To hide only its catalogue entry, use `in_catalogue=no` instead.

## Front-page sleeves and music

`content/new-releases.csv` chooses the front crate and Index's New Releases. It has **up to 7 physical slots**. Replace an existing row when all seven are occupied; the complete catalogue can keep growing independently.

```csv
release_id,youtube,playback_title
5.5-061,https://music.youtube.com/watch?v=lU36RsYI23I,
```

Use an ID already in `releases.csv`. Its title, artist, link and cover come from that release. The row order is the sleeve order and the player's previous/next order. The catalogue row can be anywhere; it does not control this display.

`youtube` is the exact official audio/YouTube Music URL for in-site playback. Use the same edition/track as the sleeve. `playback_title` is optional and useful when an EP cover plays one representative song. The existing selected audio editions have been preserved. A blank YouTube value makes the selection link out to the release instead of claiming in-site playback. The checker validates the URL format, not availability, licensing or provider permission. Check a new track in the actual player; some videos cannot be embedded.

Removing a row takes it out of the front crate and playback queue, not out of the full catalogue. Leaving only the header makes the crate/queue empty; the site must not silently restore old selections.

## Shelf covers

`content/shelf.csv` has **up to 5 physical slots**:

```csv
release_id,title,cover,link
5.5-050,SUPERSTAR,,
```

Use an existing release ID. `title`, `cover` and `link` are optional display overrides; blank means use the release's value. For example, a shelf can show a different cover without changing the catalogue. Rows run left-to-right on the shelf. Removing a row removes that shelf cover, not the underlying release.

## Shop products and photo order

```csv
id,name,price,link,images
TEE-NEW,NEW T-SHIRT,899,https://YOUR_CHECKOUT_LINK,images/merch/tee-front.jpg|images/merch/tee-back.jpg
```

`id` is unique to that product. `name` is the visible name. `price` is in Indian rupees: use `899` or `899.50`, not a currency symbol or thousands separator. `link` is the exact HTTPS purchase/checkout destination. **The website does not process payments itself.**

Put one or more images in `images`, separated with `|`. Their order controls the photo rotation; the first photo is shown first. Up to 12 photos per product are supported. Both the CRT and Index read the same product rows, two items per page, in file order. Add more rows to create more shop pages. Delete a row to stop displaying a product. An empty file with just its header means an empty shop, not the old default products.

## Upload pictures

Open `images/covers/`, `images/merch/` or `images/branding/` and choose **Add file → Upload files**. Use JPG, PNG or WebP. Simple names such as `new-single-cover.jpg` are easiest. Keep artwork square for record covers; product pictures may be rectangular.

Commit the image **before** referencing it from a content file, or put both changes in one branch. In the CSV use the path shown in this repo, e.g. `images/merch/tee-front.jpg`—not a GitHub `/blob/` page URL. The publish job turns this into a versioned direct image URL automatically.

A direct external `https://...jpg/png/webp` image link can also be used. It must return the picture itself and allow cross-origin image use for the 3D canvas; a Google Drive sharing page or a normal website page is not an image. **Uploading here is the reliable option.** The checker confirms uploaded files exist, but cannot guarantee external-image availability or CORS. Large images slow loading; 1000–1600 pixels square is normally enough for a cover. The hard limit is 15 MB per image.

Use a new filename for a replacement and update the row. That avoids confusing cached artwork and makes rollback easier. Deleting a referenced image fails validation. You do not need to upload fonts, 3D models or the entire website project.

## Contact, social links, branding and newsletter

`socials.csv` controls the order and destinations of up to six social links. Use `INSTAGRAM`, `YOUTUBE` or `X` for their familiar icons; another short label gets a text link. Removing a row removes that social link.

`settings.json` contains the public contact email, light/dark logo paths, the wall artwork, handwritten crate/catalogue label images, and the contact/newsletter settings. Keep the quotes, braces and commas. The email is a public **mailto** address; changing it does **not** change where Formspark sends notifications.

The contact form currently uses the existing working Formspark submission URL. When handing over, create the client's own form and replace `contact.endpoint` with its public `https://submit-form.com/...` URL. Notification recipients and delivery settings are controlled inside the client's Formspark account, not by this repository. Do not paste the dashboard URL or any API key here. `contact.enabled=false` disables submission while preserving the direct email link.

The newsletter starts **disabled**, matching the current website. To enable it, create a separate Formspark form for newsletter signups, put its public submission URL in `newsletter.endpoint`, and change `newsletter.enabled` to `true`. Keep the newsletter separate from the contact form. The signup collects addresses; it does **not** send newsletter campaigns. Test a real signup and the destination inbox with the client before announcing it. `heading` and `description` control the visible newsletter text.

The room geometry, animations, camera positions, checkout provider and music-player implementation are website code—not editable content. Their redesign requires a developer. This repository does not silently enable new services, buy anything or transfer ownership.

## CSV punctuation and mistakes

Keep the header exactly as it is. Commas separate columns. **Commas inside a title/name are allowed when the whole field is quoted**, e.g. `"FRAPPE ASH, KUMAR SANU & WHEATISH BROWN"`. Inside a quoted field, write a double quote twice: `"A ""Special"" Release"`. Blank optional columns stay as commas. Do not add Markdown tables or bullet points inside a CSV.

The checker catches wrong columns, bad quotes, duplicate IDs, unknown release references, missing uploaded pictures, invalid prices, unsafe URLs and overfilled physical displays. It publishes one complete snapshot only after everything passes. It does not fact-check artist credits or choose the correct musical edition for you.

To undo a mistake, use the file's **History** to find the earlier content, copy it back into the file, and commit. Revert all affected content files together when undoing a multi-file change. The same validation/publication process runs again.

## Transfer to Akshar later

The current owner can use **Settings → General → Danger Zone → Transfer ownership** once Akshar supplies his GitHub username and accepts the transfer. Do not create another repo at the old address afterward: that can break GitHub's old-location redirects.

No personal access token or Vercel secret is needed for normal content publishing. The GitHub workflow uses its own short-lived repository token. Keep this repo public, Actions enabled, and the `main` and `published` branches intact. If Akshar's organisation restricts workflow write permissions, its administrator must allow this publisher to write the `published` branch.

After transfer, make a harmless README edit and confirm the publish run and live website still work. The website records this repo's permanent numeric ID as a recovery route if the raw URL moves. Update its one `public/data/content-source.json` URL to the new owner location during handover as well; that is a one-time developer configuration change, not a normal editing requirement. GitHub Pages is not used.

## How it works / developer notes

Edit only `content/` and `images/` for routine changes. `scripts/` and `.github/` validate and publish; leave them alone. The `published` branch's `content.json` is generated—**do not edit that branch by hand**.

On a successful main-branch commit, the workflow compiles the CSV/JSON into one snapshot. Image URLs point to that exact source commit, preventing mixed old/new artwork. The website fetches the published snapshot when opened. If GitHub is unavailable, it uses a previously validated browser copy or its bundled last-known version; that may be older, but keeps the site usable. No private GitHub token is included in the browser.

Local checks need Node.js 20+ and no installed dependencies:

```sh
node --test scripts/schema.test.mjs
node scripts/build.mjs --check
```

The publishing workflow deliberately does not run on edits to `published`; it cannot loop. Pull requests only validate. Only an accepted main-branch commit may publish. The website's base domain, hosting and Formspark inbox ownership remain separate from ownership of this content repository.

Official transfer reference: https://docs.github.com/en/repositories/creating-and-managing-repositories/transferring-a-repository
