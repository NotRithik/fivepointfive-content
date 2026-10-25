# Content field reference

For everyday steps, start with the [README](../README.md).

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

Example shape — replace these example values with your real release and uploaded image:

```csv
5.5-NEW,NEW SINGLE,"ARTIST ONE, ARTIST TWO",SINGLE,2026,https://open.spotify.com/track/REPLACE_ME,images/covers/new-single.jpg,yes,,,,
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

The contact form uses the Formspark submission URL in `contact.endpoint`. To use another inbox, create or select your Formspark form and put its public `https://submit-form.com/...` URL here. Notification recipients and delivery settings are controlled inside your Formspark account, not by this repository. Do not paste the dashboard URL or any API key here. `contact.enabled=false` disables submission while preserving the direct email link.

Newsletter signup is disabled until you configure and enable it. To enable it, create a separate Formspark form for newsletter signups, put its public submission URL in `newsletter.endpoint`, and change `newsletter.enabled` to `true`. Keep the newsletter separate from the contact form. The signup collects addresses; it does **not** send newsletter campaigns. Check that a real signup reaches your intended inbox before announcing it. `heading` and `description` control the visible newsletter text.

The room geometry, animations, camera positions, checkout provider and music-player implementation are website code—not editable content. Their redesign requires a developer. Changing content does not change your hosting account or checkout service.

## CSV punctuation and mistakes

Keep the header exactly as it is. Commas separate columns. **Commas inside a title/name are allowed when the whole field is quoted**, e.g. `"FRAPPE ASH, KUMAR SANU & WHEATISH BROWN"`. Inside a quoted field, write a double quote twice: `"A ""Special"" Release"`. Blank optional columns stay as commas. Do not add Markdown tables or bullet points inside a CSV.

The checker catches wrong columns, bad quotes, duplicate IDs, unknown release references, missing uploaded pictures, invalid prices, unsafe URLs and overfilled physical displays. It publishes one complete snapshot only after everything passes. It does not fact-check artist credits or choose the correct musical edition for you.

To undo a mistake, use the file's **History** to find the earlier content, copy it back into the file, and commit. Revert all affected content files together when undoing a multi-file change. The same validation/publication process runs again.

