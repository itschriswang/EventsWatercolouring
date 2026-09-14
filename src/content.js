// All site copy in one place. Written in Chris's own voice: plain,
// warm and direct, Australian English, no em dashes. Edit here and every
// section updates.

export const HERO = {
  lines: ['Memories', 'painted as they', 'happen'],
  linesMobile: ['Memories', 'painted as they', 'happen'],
  emphasis: 'painted',
  emphasisMobile: 'painted',
  // The eyebrow row — the first words on the page, and the two facts a stranger
  // is scanning for before they read anything else. Both were hard-coded in
  // Hero.jsx (twice each, desktop and mobile) until they had to change.
  //
  // It read 'Live event watercolour keepsakes', which never said "wedding" —
  // so the word most of this site's visitors arrive searching for lived only in
  // index.html's meta description and the no-JS fallback, i.e. it was legible to
  // crawlers and not to a couple. Same character count, so the mobile row still
  // fits on one line beside its rule. "Keepsakes" is what the gallery section
  // below is called, so the page does not lose the word.
  eyebrow: 'Live wedding & event watercolour',
  place: 'Melbourne · Sydney',
  lede: 'Your guests, painted live in watercolour while the night carries on. Each painting is finished on the spot and goes home with the guests in it.',
  // Price first, then the reply promise. The number was only in the Packages
  // section, a long scroll down, and a couple comparing vendors decides between
  // "from $1000" and "contact us for pricing" well before they get there. Two
  // lines on a phone either way, so the price costs no height.
  // Split in two so the price can be set apart from the promise around it
  // (Hero.jsx bolds the first half in full ink). One string could only be one
  // weight, and at the footnote size it used to render at, the number a couple
  // is actually scanning for was the same whisper as the sentence carrying it.
  notePrice: 'From $1000.',
  noteReply: 'Every enquiry answered personally, usually within a few days.',
}

// The one quote that does the selling — pulled up between the hero and the
// story so it is the first full sentence a visitor reads after the headline.
export const PULLQUOTE = {
  quote: 'It has become the piece everyone stops at in our home. Our only regret is not having him there on the night.',
  author: 'Clare & William',
  detail: 'Post-wedding commission',
  // The quiet link under the attribution — the one place the quote offers a
  // next step, kept small so the moment stays a held breath, not a banner.
  cta: 'Have me there for yours',
}

export const EVENING = {
  label: 'On the night',
  title: ['How the evening', 'runs.'],
  emphasis: 'runs.',
  lede: 'The first thing I paint is the two of you, while everything is fresh. After that I work through your guests. Here is how the night runs, start to finish.',
  beats: [
    {
      no: '01',
      title: 'I set up',
      // Was "You do not need to organise much beyond a table and chair for
      // me", which spent nine words getting to the two nouns that matter. The
      // sizing that used to live only in the FAQ moves up here as a `note`:
      // it is the one thing a venue coordinator has to action, and it was two
      // pages away from the step that asks for it.
      body: 'I arrive about fifteen minutes early and set up before I start. All I need is a table and chair.',
      note: 'A standard 1.8m trestle table is ideal. The smallest I can work on is 120cm wide by 60cm deep, at normal seated height. For anything over about five hours, a meal for me is appreciated.',
    },
    {
      no: '02',
      title: 'No need to keep still',
      body: 'Your guests keep enjoying the night. I take a quick photo and note their name as they pass, so nobody has to stop or sit still for me.',
    },
    {
      no: '03',
      title: 'I start painting',
      // Who ends up in a painting was the single most-asked thing this section
      // never answered: couples are the default everyone assumes, and a table
      // of four friends walking up did not know they were allowed.
      body: 'Each painting takes about five to ten minutes. Couples are what most people ask for, but I can put any group of up to four people in one painting, so friends and families work just as well.',
    },
    {
      no: '04',
      title: 'Sleeved to take home',
      body: 'Every painting goes into a clear sleeve so it gets home in one piece, right about when the champagne starts flowing a little more freely.',
    },
    {
      no: '05',
      title: 'Around 16 guests an hour',
      // The old title was "About eight an hour", eight of a thing the beat
      // never named, next to a package promising 24 and a planner counting to
      // 48. Three numbers, one unit between them, and the reader left to work
      // out that they agree. Counting in GUESTS states the number they are
      // actually buying and makes the arithmetic visible in one line.
      body: 'I finish about 8 paintings an hour with two guests in most of them, so three hours covers roughly 48 of your guests. You will know the number I am planning around before the day.',
    },
  ],
}


export const WORK = {
  label: 'The keepsakes',
  // Two spellings of one hint: the wall opens on click or tap, and naming the
  // gesture the visitor has not got is a small wrongness they notice. Chosen in
  // SelectedWork.jsx off `(pointer: coarse)` rather than a width breakpoint —
  // a narrow desktop window still has a mouse, and a large tablet still does not.
  zoomHint: 'Click any painting to enlarge.',
  zoomHintTouch: 'Tap any painting to enlarge.',
  title: ['Real watercolour, on', 'cotton paper.'],
  emphasis: 'cotton paper.',
  note: 'Painted by hand on 300gsm A5 cotton paper.',
  // ── Gallery wall — simple to edit ─────────────────────────────────────────
  // The wall is curated into groups so the wedding pieces and the studio
  // studies read as two rooms of one show, not a mixed pile. Each group has
  // a small label and its own row of tiles.
  //
  // One entry per image. `img` is the asset base name; it loads both
  // assets/<img>.webp and assets/<img>.jpg automatically, so you only name it
  // once. Reorder entries to change placement within a group.
  //
  // The wall shows no captions — `ttl`, `meta` and `alt` are still worth filling
  // in: they label the lightbox and read out to screen readers.
  //
  // `landscape: true` gives a piece the wide slot in its row.
  //
  // `venue: 'Coombe Yarra Valley'` (optional) adds a "Painted live at …" line
  // under the piece in the lightbox. Fill these in as pieces come from real
  // venues — couples recognise their shortlist. Leave '' to show nothing.
  //
  // A testimonial slots into a group like any other tile — give it
  // `testimonial: true` with `quote`, `author` and `detail` instead of `img`.
  // Templates are commented out among the items below; add real client words as
  // they come in and the wall lays them out automatically.
  //
  // **A quote earns its tile by answering a worry, not by being kind.** Ten
  // lines saying the night was lovely are ten compliments, and a couple
  // comparing three painters discounts all of them, because every shortlist has
  // a wall of them. What sells is a sentence that closes a question the visitor
  // arrived with — did it interrupt the reception, did the guests actually care,
  // is this a keepsake or clutter — said by someone with nothing to gain. Those
  // read as proof rather than praise.
  //
  // So each slot below names the worry it is there to answer, and a line that
  // does not answer one belongs on Instagram rather than here. The ask that
  // produces these is in the business repo's `testimonial-request.md`: it asks
  // a couple six specific questions instead of "would you mind writing a few
  // words", because a blank page comes back as "thanks again, we loved it".
  //
  // Keep them SHORT. A quote card is a masonry tile beside the paintings, so it
  // sets its own type at clamp(0.6rem, 1.4vw, 0.75rem) — one sentence fits, two
  // crowds the card, three overruns it.
  groups: [
    {
      key: 'live',
      label: 'Painted live, at weddings',
      items: [
        { img: 'art-couple-hanbok', ttl: 'Hanbok traditions', meta: 'Watercolour · A5', venue: '', alt: 'Watercolour portrait of a couple in traditional Korean hanbok attire, the bride in a blue jeogori and skirt and the groom in traditional jacket and pants' },
        { img: 'art-toast-friends', ttl: 'The toast', meta: 'Watercolour · A5', landscape: true, venue: '', alt: 'Landscape watercolour of five friends in formal wear laughing together and clinking wine glasses in a toast' },
        {
          img: 'art-toast-video-poster',
          video: 'art-toast-video',
          ttl: 'Brush in hand',
          meta: 'Watercolour · A5 · video',
          venue: '',
          alt: 'Video of a watercolour portrait being painted live by hand, brush loaded with warm ochre pigment',
        },
        // Templates. The `quote` lines are the SHAPE to look for, written here
        // as a target and not as anybody's words — swap in what a couple
        // actually sent, verbatim, then uncomment. Never tidy a real quote into
        // one of these; the slightly awkward phrasing is what makes a stranger
        // believe a person wrote it.
        //
        // The wall wants two, three at the outside, spread through the row
        // rather than banked together. Take them in this order: the first is the
        // worry nothing on this site can answer without sounding defensive,
        // because it is my own event I would be vouching for.
        //
        // Worry: will this hijack our reception, or hold up the speeches?
        // {
        //   testimonial: true,
        //   quote: 'He fit into the night without us having to plan around him.',
        //   author: 'First & First',
        //   detail: 'Married at <venue>',
        // },
        //
        // Worry: will guests actually care, or is it a gimmick?
        // {
        //   testimonial: true,
        //   quote: 'Our guests are still talking about their portraits.',
        //   author: 'First & First',
        //   detail: 'Married at <venue>',
        // },
        //
        // Worry: is this worth it next to a photo booth?
        // {
        //   testimonial: true,
        //   quote: 'It turned out to be the thing people remember from the night.',
        //   author: 'First & First',
        //   detail: 'Married at <venue>',
        // },
      ],
    },
    {
      key: 'studio',
      label: 'Studio studies, between events',
      note: 'This stylised character style is also available as a studio commission, painted from your own photos.',
      items: [
        { img: 'art-character-girl', ttl: 'Little character, in green', meta: 'Studio study', alt: 'Small watercolour character portrait of a figure in a wide-brimmed hat, painted in olive green and ochre' },
        { img: 'art-character-boy',  ttl: 'At the palette',             meta: 'Studio study', alt: "Small watercolour character portrait with the artist’s palette alongside, in warm rust and ochre" },
        { img: 'art-character-boy2', ttl: 'Warm ochre',                 meta: 'Studio study', alt: 'Small watercolour character portrait of a seated figure in warm ochre tones, holding a jar' },
      ],
    },
  ],
  // ── Before & after ────────────────────────────────────────────────────────
  // The reveal strip in the studio row: drag the handle to wipe between the
  // piece on the easel and the finished keepsake. When you have a couple's
  // reference photo you are allowed to show, swap it in as `before` — photo
  // to painting is the strongest version of this.
  reveal: {
    ttl: 'The bouquet, easel to keepsake',
    hint: 'Drag to reveal',
    before: { img: 'art-bouquet', ext: 'jpg', label: 'On the easel', alt: 'The bouquet piece photographed while still on the sketchbook at the desk' },
    after:  { img: 'art-bouquet_transparent', ext: 'png', label: 'The keepsake', alt: 'The finished bouquet painting on clean cotton paper' },
  },
}



export const PAINTER = {
  label: 'The painter',
  title: ['A bit', 'about me.'],
  emphasis: 'about me.',
  body: [
    'I am Chris. I grew up in Sydney and I am based in Melbourne now, and I have been painting in watercolour for more than ten years.',
    'Painting live at a wedding is the part I love most. I get a minute or two with each guest, and they get a small painting made by hand to take home at the end of it.',
    'I travel across Melbourne and Australia-wide for weddings, corporate events, brand activations, and private celebrations.',
  ],
  signature: 'Chris',
}

// The desk, unpacked — the closing beat of "about me" (no heading of its own).
// The art supplies fan out from behind the easel as the visitor scrolls, and
// re-stack when they scroll back up; the easel itself holds the portrait. `id`
// doubles as the asset slot: drop a cut-out photo at assets/kit/<id>.webp + .png
// and it replaces the painted illustration automatically.
export const KIT = {
  items: [
    { id: 'brushes', name: 'The brushes', note: 'A round for faces, a flat for washes. Ten years old and going strong.' },
    { id: 'spritzer', name: 'Water spritzer', note: 'Keeps the pans wet so the colour lifts fast between guests.' },
    { id: 'pencil', name: 'The pencil', note: 'A light sketch first, five lines at most, then straight to paint.' },
    { id: 'tubes', name: 'The paint', note: 'Professional lightfast pigment, the kind that holds its colour for decades.' },
    { id: 'eraser', name: 'The eraser', note: 'Barely used, honestly. The pencil lines vanish under the wash.' },
    { id: 'palette', name: 'Travel palette', note: 'Every colour I use, in one tin that fits in a coat pocket.' },
  ],
}

export const PACKAGES = {
  label: 'Packages',
  title: ['One base package,', 'built around your day.'],
  emphasis: 'built around your day.',
  intro:
    'Weddings, corporate events and private celebrations all start from the same base package. What changes is the hours you book and what you add to it.',
  base: {
    title: 'Live on the day',
    note: 'The base package, painted across your event.',
    priceSmall: 'From',
    price: '$1000',
    // Guests first, on both pills. "24 keepsakes" made the reader do the
    // conversion into the only number they actually shop on, and half of them
    // read it as "24 guests" instead.
    facts: ['3 hours of live painting', 'About 48 guests painted'],
    bullets: [
      'Around 48 of your guests painted live across three hours',
      'That is about 24 paintings, with two guests in most of them',
      'Up to four people can go in one painting, so groups of friends and families fit',
      'You and anyone you want painted first, then guests as they pass by',
      'Painted on 300gsm A5 archival cotton paper and sleeved to take home that night',
      'Public liability insurance',
      'Travel within about an hour of Melbourne or Sydney metro',
    ],
  },
  addonsHead: { title: 'Add-ons', note: 'Priced on enquiry' },
  addons: [
    {
      h: 'More guests, painted afterwards',
      p: 'Guests I do not get to on the night are painted in the studio afterwards and posted to you to pass on, at a per-guest rate we agree before the day.',
      tag: 'Per guest',
    },
    {
      h: 'Family painting, A3',
      p: 'You and your immediate family, painted larger on A3 from photos you send after the day.',
    },
    {
      h: 'Bridal party, A3',
      p: 'The bridal party together on A3, the people closest to you on the day.',
    },

    {
      h: 'Extra live hours',
      p: 'I stay longer across the event. Each extra hour is roughly another 16 guests painted.',
    },
    {
      h: 'Studio commission',
      p: 'A painting from your photos, before or after the wedding, in a classic likeness or the stylised character style shown in the studio studies. Ready in about four weeks.',
    },
    {
      h: 'Stationery licensing',
      p: 'A digital file of your painting, licensed for save-the-dates, invitations, and thank-you cards.',
    },
    {
      h: 'Travel further afield',
      p: 'Regional Victoria and destination weddings further out. Happy to talk it through.',
    },
    {
      h: 'Wedding bouquet, A3',
      p: 'Your bouquet painted from photos after the day, on A3 cotton paper. A2 on request.',
    },
  ],
  // Split into label + body so the bold lead-in is structured, not sliced off
  // the body string at render time (see Packages.jsx).
  // The section's own ask. Packages sold the thing and then handed the visitor
  // to the FAQ, with the nearest Enquire back up in the header.
  cta: 'Enquire about your event',
  ctaNote: 'Tell me your date, your venue and roughly how many guests you would like painted, and I will come back with a straightforward quote.',
  licenceLabel: 'A note on style.',
  licenceBody:
    'What I paint is my interpretation, not a photo-exact likeness, and my style evolves over time, so no two paintings are the same. Booking means you are comfortable with that approach and my style. A 50% retainer holds your date, with the balance due two weeks before your big day.',
  planner: {
    // Declarative, like every other heading on the page. It was "What does a
    // booking cover?", but a heading that poses a question it then answers is
    // a hook, and the FAQ below is the one place questions belong.
    title: 'What a booking covers.',
    lede: 'Pick your hours. I paint about 8 paintings an hour with two guests in most of them, so roughly 16 of your guests are painted every hour.',
    hoursLabel: 'Hours booked',
    // The headline figure is GUESTS now, not paintings. It was the other way
    // round, which asked a couple comparing quotes to convert the one number
    // they shop on out of a number only the painter counts in — and put the
    // conversion ("room for around 48 guests on them") in the small print
    // under it. The paintings line stays, one rung down, because it is what
    // explains the guest figure rather than competing with it.
    guestsUnit: 'guests painted live',
    piecesLead: 'That is around',
    piecesTail: 'paintings, most with two guests in them and up to four when a group of friends shares one.',
    keepLine: 'Every guest I paint takes their own painting home on the night.',
    more: 'Want more of your guests covered? Add live hours, or add the after-event service and I paint the rest in the studio afterwards and post them to you to pass on.',
    small: 'Rough numbers to plan around. Groups and pacing vary on the night.',
    // The planner's own next step — carries the chosen hours into the
    // enquiry form so nobody has to retype their own maths.
    cta: 'Enquire with these hours',
  },
}

// The questions, grouped the way someone actually reads them: what the thing
// is, then how to book it, then what happens on the night, then what they are
// left with holding. Each group is a filing drawer on the page (see Faq.jsx) —
// its cards stack among themselves and release when the drawer ends, so the
// pile never grows thirteen deep.
//
// `id` is the in-page anchor for the jump nav, prefixed `faq-` so nothing here
// can collide with the homepage's load-bearing anchors (#night, #work, …).
//
// The Q&A text is mirrored as FAQPage JSON-LD in faq/index.html. Grouping does
// not affect it (schema.org has no notion of category order here), but any edit
// to a question or answer needs to land in both places.
export const FAQ = {
  label: 'Questions',
  title: 'The practical bits.',
  // Shown above the jump nav, so the row of categories reads as an offer to
  // skip ahead rather than as decoration.
  jumpLabel: 'Jump to',
  // Every answer carries somewhere to go next. `links` names verbatim phrases
  // inside `a` to turn into in-site anchors, painted with the site's own
  // hand-drawn underline (see `withLinks` in Underline.jsx) so a link reads as
  // the same offer the rest of the page makes rather than as blue text.
  //
  // KEEP EACH PHRASE SHORT — around twenty characters, never a whole clause.
  // The underline is an absolutely-positioned SVG inside an `inline-block`
  // span, which is what lets it span the phrase; an inline-block cannot break
  // across lines, so a long phrase is one unbreakable word as far as the line
  // breaker is concerned, and on a 320px card it overflows the tile rather
  // than wrapping. Two to four words always fits.
  //
  // The rule this list is kept to: no answer is a dead end. It either points at
  // the section that shows the thing it describes, or it offers the enquiry.
  // A visitor who reads one answer and stops has nowhere to go, and the FAQ is
  // the page most of this site's search traffic lands on first.
  categories: [
    {
      id: 'faq-painting',
      label: 'What I paint',
      items: [
        {
          q: 'Do you paint live, or from photographs?',
          a: 'Both. The base package has me at your wedding painting live through the reception, and we add to it from there. If you would rather a studio commission from your own photos, before or after the day, I do those too, priced on enquiry. Send me a note and I will price it for you.',
          links: [
            { phrase: 'studio commission', href: '/#offerings' },
            { phrase: 'Send me a note', href: '/#enquiry' },
          ],
        },
        {
          q: 'Do you paint events other than weddings?',
          a: 'Yes. As well as weddings I do brand activations, corporate events, and private parties across Melbourne and Australia-wide. It bends to fit the room. If yours is something else again, ask.',
          links: [
            { phrase: 'corporate events', href: '/corporate/' },
            { phrase: 'ask', href: '/#enquiry' },
          ],
        },
        {
          q: 'How should we send photos for a commission?',
          a: 'The clearer the photos, the better the painting. Send a few well-lit, high-resolution shots where your faces are clear, and tell me which one feels most like you. You can see the style a studio commission is painted in on the gallery wall, and I take it from there.',
          links: [
            { phrase: 'studio commission', href: '/#offerings' },
            { phrase: 'gallery wall', href: '/#work' },
          ],
        },
      ],
    },
    {
      id: 'faq-booking',
      label: 'Booking and dates',
      items: [
        {
          q: 'How far ahead should we book?',
          a: 'As early as you can. I only take a limited number of weddings, so dates fill up. Enquire now with your date and I will tell you what is open.',
          links: [{ phrase: 'Enquire now', href: '/#enquiry' }],
        },
        {
          // Sits before "how do we secure our date" on purpose: it is the
          // question a couple has while their finger is over the button, and
          // it is also where the detail that would swamp the homepage
          // actually lives. Saying so is the point — a couple who knows the
          // numbers are coming by email does not need them on the page.
          q: 'What happens after we enquire?',
          a: 'You get a note on screen straight away so you know it arrived, and then a reply from me within a few days. That reply has what I have open on your date, pricing worked out for your hours and your venue, the add-ons with real numbers against them, and what I need from the room. If you would rather talk it through, say so and we will find a time. Nothing is locked in until you are ready: a 50% retainer and a booking agreement is what makes the date yours.',
          links: [{ phrase: 'after we enquire', href: '/#enquiry' }],
        },
        {
          q: 'How do we secure our date?',
          a: 'A 50% retainer holds your date, with the balance due two weeks before your big day. I only confirm once the retainer is in, and then the date is yours. Send me your date and I will come back with the paperwork.',
          links: [{ phrase: 'Send me your date', href: '/#enquiry' }],
        },
        {
          q: 'What if we need to postpone or cancel?',
          a: 'Weddings move, and I get that. If you need to cancel or postpone, just let me know as early as you can. I try to be fair and reasonable, and the details depend on timing and whether I am able to rebook the date. Full terms sit in your booking agreement, and I am happy to walk you through them before you commit.',
          links: [{ phrase: 'walk you through them', href: '/#enquiry' }],
        },
        {
          q: 'Do you travel?',
          a: 'Travel is included for venues within about an hour of Melbourne or Sydney metro. Further out, including regional Victoria, regional NSW, and destination weddings, I am happy to discuss it and quote travel on enquiry. Just tell me your venue.',
          links: [{ phrase: 'tell me your venue', href: '/#enquiry' }],
        },
      ],
    },
    {
      id: 'faq-night',
      label: 'On the night',
      items: [
        {
          q: 'How long do you paint on the day?',
          a: 'Three hours in the base package, up to about five if you add hours, usually across the reception with short breaks. I pace myself instead of painting flat out, so the last painting gets the same care as the first. You can see how the evening runs, step by step, on the homepage.',
          links: [{ phrase: 'how the evening runs', href: '/#night' }],
        },
        {
          q: 'How many guests can you paint?',
          a: 'About 8 paintings an hour, with two guests in most of them, so around 16 of your guests an hour. A three-hour booking covers roughly 48 guests. Groups of up to four can share one painting, so a table of friends counts as one sitting rather than two. If you want more of your guests covered, add live hours, or add the after-event service and I paint the rest in the studio and post them to you to pass on. There is a planner in the packages section that does the maths for your own hours.',
          links: [
            { phrase: 'packages section', href: '/#offerings' },
          ],
        },
        {
          q: 'What do you need from us on the day?',
          a: 'Not much. A table and a chair, facing out into the room. A standard 1.8m trestle table is ideal, and the smallest I can work on is 120cm wide by 60cm deep at normal seated height. Somewhere to stand up and stretch for a few minutes each hour helps too, and if I am painting for more than about five hours a meal is appreciated. I bring everything else. It is all on the homepage under On the night too.',
          links: [{ phrase: 'On the night', href: '/#night' }],
        },
      ],
    },
    {
      id: 'faq-keep',
      label: 'What you keep',
      items: [
        {
          q: 'When do we receive the finished work?',
          a: 'Guests take their painting home with them on the night, sleeved and dry. Yours is painted that night too and left with you. Studio commissions from photos usually arrive within four weeks.',
          links: [{ phrase: 'Studio commissions', href: '/#offerings' }],
        },
        {
          q: 'Do you frame the work?',
          a: 'I do not frame the work. It comes to you on cotton paper, sleeved and ready for a frame. You can see the sizes and the paper on the gallery wall.',
          links: [{ phrase: 'gallery wall', href: '/#work' }],
        },
        {
          q: 'What materials do you use?',
          a: 'Professional watercolours on archival 300gsm A5 cotton paper. The pigments are lightfast, so the colour holds for decades if you look after it. Have a look at the paintings, or enquire now and I will send more detail.',
          links: [
            { phrase: 'the paintings', href: '/#work' },
            { phrase: 'enquire now', href: '/#enquiry' },
          ],
        },
      ],
    },
  ],
}

export const ENQUIRY = {
  label: 'Enquire',
  title: ['Tell me about', 'your day.'],
  emphasis: 'your day.',
  intro:
    'Just a few details to start. It comes straight to my inbox and I answer every one myself.',
  // Every live option says LIVE PAINTING and names the event. It read
  // "Live on the day / Corporate event or brand activation / Private
  // celebration / Studio commission", where only the first option mentioned
  // live painting at all — so the other two looked like event types that came
  // without it, and the one that did never said what event it was on the day
  // of. Now the axis is what happens (live at your event, or in the studio
  // from photos) and the event type rides along inside it.
  //
  // `deepLink` is the ?event= value the nav's Book an event menu passes to
  // preselect this option (see EnquireForm's URL preselect). Options without
  // one are simply not linkable from the nav.
  packageOptions: [
    { label: 'Live painting at our wedding', deepLink: 'wedding' },
    { label: 'Live painting at a corporate event or brand activation', deepLink: 'corporate' },
    { label: 'Live painting at a private celebration', deepLink: 'private' },
    { label: 'A studio commission from photos', deepLink: 'studio' },
    { label: 'Not sure yet' },
  ],
  // The reply card asks its questions a step at a time (see EnquireForm.jsx)
  // — one tap-question per sheet, contact details last.
  steps: {
    back: 'Back',
    next: 'Continue',
    // Each sheet that asks for an answer carries the line it says when you
    // try to move on without one. Both are gentle and both point at the way
    // out: every question here has a "Not sure yet", so nobody is ever stuck,
    // they just have to say so on purpose rather than by walking past it.
    what: {
      q: 'What are you after?',
      hint: 'Pick whatever is closest. You can say more in a moment.',
      error: 'Pick whichever is closest before you go on. "Not sure yet" is a real answer.',
    },
    when: {
      q: 'When, and where?',
      // Was "Skip what you do not know yet", which now undersells what the
      // sheet asks: the date wants an answer, even if that answer is "not
      // sure". The venue is still genuinely optional, so the reassurance
      // moves onto the thing it is still true of.
      hint: 'A rough idea is plenty. Leave the venue blank if you do not know it yet.',
      error: 'Add a date, or tap "Not sure yet" if the day is not locked in.',
    },
    who: {
      q: 'Where do I send my reply?',
      hint: 'Just a name and an email. Everything else is optional.',
    },
    notSure: 'Not sure yet',
  },
  // The planner's hand-off (NightPlanner.jsx -> EnquireForm.jsx). "Enquire
  // with these hours" used to spend its whole promise on a scroll: the number
  // went into the message box two sheets away, where nobody saw it land. It
  // now arrives as its own answer, read back on the sheet the visitor lands
  // on. Composed from parts, the way the planner's own readout is, so both
  // say the numbers in one voice.
  fromPlanner: {
    label: 'From the planner',
    hoursTail: 'hours live',
    piecesLead: 'about',
    // Reads back the figure the planner led with, which is now guests.
    piecesTail: 'guests painted on the night',
    // Fallback for a hand-off that only carried the painting count.
    piecesTailPaintings: 'paintings on the night',
    sent: 'Sent with your enquiry.',
    clear: 'Clear',
    clearLabel: 'Clear the hours carried over from the planner',
  },
  confirm: {
    // `title` is composed with the sender's first name in EnquireForm, e.g.
    // "Thank you, Sarah." — so it carries no trailing full stop here.
    title: 'Thank you',
    // Names what comes back, and roughly when. It said "write back soon",
    // which is the same nothing as "contact us for pricing" — the moment a
    // visitor is wondering whether their message went anywhere is the one
    // place a vague promise costs the most. The timeframe is the same one the
    // hero note and the FAQ make, so all three have to move together.
    body: 'Your message is with me. I will read it properly and write back within a few days, with pricing for your date and the practical bits.',
    sign: 'Chris',
    // The confirmation arrives as a mailed postcard (see Postcard.jsx):
    // stamped with one of the keepsakes, postmarked with today's date.
    // `stamp` has to name a painting still in public/assets — the Stamp
    // component prints it straight into the SVG, so a retired piece leaves an
    // empty perforated frame rather than falling back to anything.
    postcard: {
      toLabel: 'To',
      stamp: 'art-couple-hanbok',
      stampAlt: 'A postage stamp printed with one of the keepsake paintings',
      country: 'AUSTRALIA',
      ringTop: 'CHRIS WANG STUDIO',
      ringBottom: 'MELBOURNE',
      delivered: 'Stamped, and with me.',
    },
  },
}

// The corporate landing page (/corporate/). Same voice, different room:
// planners and marketers skimming for what it does for their event, so the
// copy leads with the effect on the room and the keepsake that leaves with
// people, not the romance. Kept off the main nav so the wedding journey
// stays wedding-first; reached via search, the footer, and direct links.
export const CORPORATE = {
  eyebrow: 'Live event watercolour · corporate & brands',
  lines: ['Your guests, painted', 'while they mingle'],
  emphasis: 'painted',
  lede: 'I paint your guests live in watercolour, right in the room. People stop to watch, and every painting is handed over before anyone leaves.',
  note: 'Based in Melbourne, regularly in Sydney, travelling Australia-wide.',
  cta: 'Enquire about your event',

  // The borrowed portrait-and-kit stage from the homepage — introduced here
  // with its own label and a line, so it does not appear as an unexplained
  // section between the hero and the argument.
  painter: {
    label: 'The painter',
    line: 'The same hands and the same kit as every wedding I paint, set up in your room.',
  },

  // The reply card on this page speaks to planners, not couples.
  enquiryTitle: ['Tell me about', 'your event.'],
  mailSubject: 'Live event watercolour enquiry',

  why: {
    label: 'Why it works',
    title: ['What it adds', 'to your event.'],
    emphasis: 'to your event.',
    cards: [
      {
        h: 'It gathers a crowd',
        p: 'Guests wander over to see what is happening, then stay to watch a painting finish. By the third or fourth one there is usually a small group around the table waiting for a turn.',
      },
      {
        h: 'The keepsake stays',
        p: 'A hand-painted keepsake tends to end up on a desk or a fridge, still there months after the branded merch has gone into a drawer.',
      },
      {
        h: 'I bring the rest',
        p: 'All I need is a table and chair. A standard 1.8m trestle is ideal, and 120 by 60cm is the smallest I can work on. I turn up before doors and set up in about fifteen minutes. Public liability insurance included.',
      },
    ],
  },

  occasions: {
    label: 'Where it fits',
    title: ['Any room with', 'people in it.'],
    emphasis: 'people',
    items: [
      'Brand activations and product launches',
      'Client and VIP dinners',
      'End of year and milestone parties',
      'Conference dinners and expo stands',
      'Store openings and pop-ups',
      'Private functions',
    ],
    note: 'If yours is not on the list, it probably still fits. The setup is the same wherever it goes.',
  },

  how: {
    label: 'On the night',
    title: ['How it runs.'],
    emphasis: 'runs.',
    steps: [
      {
        no: '01',
        h: 'I set up before doors',
        p: 'I arrive early and set up at my table. No AV and no power needed, so there is nothing extra for your venue or your run sheet.',
      },
      {
        no: '02',
        h: 'Guests keep mingling',
        p: 'Nobody has to sit still. I take a quick photo and a name as people pass, and they carry on with the event while I paint.',
      },
      {
        no: '03',
        h: 'Painted through the event',
        p: 'Each painting takes five to ten minutes, about 8 an hour with two guests in most of them, so roughly 16 of your guests an hour. Groups of up to four can share one. Once the first few are done, word gets around the room.',
      },
      {
        no: '04',
        h: 'Sleeved and taken home',
        p: 'Every painting goes into a clear sleeve on the spot, so it gets home flat and dry rather than folded into a bag.',
      },
    ],
  },

  offer: {
    label: 'The engagement',
    title: ['One base package,', 'built out from there.'],
    emphasis: 'built out from there.',
    base: {
      title: 'Live at your event',
      priceSmall: 'From',
      price: '$1000',
      // Guests first, matching the homepage package (see PACKAGES.base).
      facts: ['3 hours of live painting', 'About 48 guests painted'],
      bullets: [
        'Around 48 of your guests painted live across three hours',
        'That is about 24 paintings, with two guests in most of them',
        'Up to four people can go in one painting, so a group counts as one sitting',
        'Painted on 300gsm A5 archival cotton paper and sleeved to take home that night',
        'Public liability insurance',
        'Travel within about an hour of Melbourne or Sydney metro',
      ],
    },
    scale: {
      h: 'Scaling up',
      items: [
        {
          h: 'Extra live hours',
          p: 'Longer events or bigger guest lists. Each extra hour is roughly another 16 guests painted.',
        },
        {
          h: 'More guests, painted afterwards',
          p: 'Guests I do not get to on the night are painted in the studio afterwards and posted to you to pass on, at a per-guest rate agreed before the day.',
        },
        {
          h: 'Multi-day activations',
          p: 'Campaigns, expos and store runs across several days, quoted as one engagement.',
        },
        {
          h: 'Travel further afield',
          p: 'Regional and interstate events are welcome. Travel is quoted with the booking.',
        },
      ],
    },
    note: 'Every event is a little different, so tell me the shape of yours and I will put a straightforward quote together. A 50% retainer holds the date.',
  },
}

export const FOOTER = {
  // “Let’s” keeps its contraction deliberately: the house style writes
  // contractions out in explanatory copy, but “Let us make something” reads
  // as a butler, not a painter. A rallying CTA is the one place it stays.
  cta: ['Let’s make something', 'to keep.'],
  emphasis: 'to keep.',
  name: 'chris wang',
  // Mirrors the header: the flat "Corporate" link is replaced by the three
  // event types the Book an event menu offers, so a visitor who scrolled all
  // the way down can still self-select without going back up.
  nav: [
    { href: '/#night', label: 'On the night' },
    { href: '/#work', label: 'The work' },
    { href: '/#painter', label: 'The painter' },
    { href: '/#offerings', label: 'Packages' },
    { href: '/?event=wedding#enquiry', label: 'Book a wedding' },
    { href: '/corporate/', label: 'Brands & corporate' },
    { href: '/?event=private#enquiry', label: 'Private celebrations' },
    { href: '/faq/', label: 'FAQ' },
  ],
  instagram: 'https://www.instagram.com/chriswangstudio',
  instagramHandle: '@chriswangstudio',
}

// Root-relative hrefs (`/#offerings`, not `#offerings`) so the same nav
// works unchanged from the homepage (same-document hash scroll) and from
// the /faq/ subpage (a normal navigation back to that homepage anchor).
// Kept in step with MobileNav's DOCK_ITEMS so desktop and mobile agree on
// which sections are worth a direct link (Enquire is a CTA, not a nav item,
// on both).
// The homepage's top-level sections in document order, each with the name it
// actually prints on the page and the accent its own eyebrow carries.
//
// SiteHeader observes these to name the section you are currently reading (see
// the "you are here" marker there). It is deliberately NOT derived from NAV:
// NAV is an edited shortlist of destinations — it has no entry for the evening
// timeline or the enquiry form, so a visitor sitting in either had no lit nav
// item at all — and its labels are chosen for a nav bar ("Gallery", "About")
// rather than matching the words printed at the top of the section. Reusing
// the sections' own labels means the header always says back exactly what the
// page says, which is what makes the two read as the same place.
// `pigment` names the paint each chapter is mixed from, out of the box in
// lib/watercolour.js — not a second copy of the hexes beside it. ChapterBar's
// palette paints its pans by running the Kubelka-Munk model on these, so a
// chapter's swatch is that paint at a thickness rather than a colour someone
// picked to look like it. Each one is the nearest paint to the accent its
// section already wears, so the palette and the page agree.
export const SECTIONS = [
  { id: 'night', label: EVENING.label, gradient: ['#EFEFA0', '#B0AC42'], pigment: 'butter' },
  { id: 'work', label: WORK.label, gradient: ['#E3B7C8', '#96385A'], pigment: 'rose' },
  { id: 'painter', label: PAINTER.label, gradient: ['#FFCDA1', '#E89B63'], pigment: 'apricot' },
  { id: 'offerings', label: PACKAGES.label, gradient: ['#D8DB7A', '#9BA03E'], pigment: 'lemonlime' },
  { id: 'enquiry', label: ENQUIRY.label, gradient: ['#F2A6C1', '#DB6E97'], pigment: 'blossom' },
]

// A nav item with `items` renders as a menu rather than a link (see
// SiteHeader's BookMenu). "Corporate" used to sit here as a flat link, which
// asked a visitor to recognise their own event in a word aimed at one third of
// them: a couple and someone booking a 40th both read past it. The menu names
// all three event types instead, and each one lands on the booking form with
// that type already chosen (`?event=` — see EnquireForm's URL preselect), so
// self-selecting and starting the enquiry are the same click.
export const NAV = [
  { href: '/#work', label: 'Gallery' },
  { href: '/#painter', label: 'About' },
  { href: '/#offerings', label: 'Packages' },
  {
    label: 'Book an event',
    // The menu's own destination for anyone who activates the top-level item
    // (and the href it keeps for no-JS and middle-click).
    href: '/#enquiry',
    items: [
      { href: '/?event=wedding#enquiry', label: 'Weddings' },
      { href: '/corporate/', label: 'Brands & corporate events' },
      { href: '/?event=private#enquiry', label: 'Private celebrations' },
    ],
  },
  { href: '/faq/', label: 'FAQ' },
]
