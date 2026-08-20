// All site copy in one place. Written in Chris's own voice: plain,
// warm and direct, Australian English, no em dashes. Edit here and every
// section updates.

export const HERO = {
  lines: ['Memories', 'painted as they', 'happen'],
  linesMobile: ['Memories', 'painted as they', 'happen'],
  emphasis: 'painted',
  emphasisMobile: 'painted',
  lede: 'Your guests, painted live in watercolour while the night carries on. Everyone I paint takes their portrait home with them the same night.',
  note: 'Every enquiry answered personally, usually within a few days.',
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
      body: 'I get there about fifteen minutes early and set up before I start. You do not need to organise much beyond a table and chair for me.',
    },
    {
      no: '02',
      title: 'No need to keep still',
      body: 'Your guests keep enjoying the night. I take a quick photo and note their name as they pass, so nobody has to stop or sit still for me.',
    },
    {
      no: '03',
      title: 'I start painting',
      body: 'Each piece takes about five to ten minutes. Once the first few are done, word gets around and guests start coming over to watch the next one.',
    },
    {
      no: '04',
      title: 'Sleeved to take home',
      body: 'Every painting goes into a clear sleeve so it gets home in one piece, right about when the champagne starts flowing a little more freely.',
    },
    {
      no: '05',
      title: 'About eight an hour',
      body: 'I aim for around 8 pieces an hour. The number you book is the number I plan for. Want more covered? Extra live hours or the after-event service add more pieces.',
    },
  ],
}


export const WORK = {
  label: 'The keepsakes',
  zoomHint: 'Tap any piece to enlarge.',
  title: ['Real watercolour, on', 'cotton paper.'],
  emphasis: 'cotton paper.',
  note: 'Painted by hand on 300gsm A5 cotton paper.',
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
  // There is a ready-to-fill template commented out below; add real client
  // words as they come in and the wall lays them out automatically.
  groups: [
    {
      key: 'live',
      label: 'Painted live, at weddings',
      items: [
        { img: 'art-couple-vows',  ttl: 'The vows',          meta: 'Watercolour · A5', landscape: true, venue: '', alt: 'Landscape watercolour of a bride in a white gown and a groom in a navy tuxedo holding hands among scattered confetti' },
        { img: 'art-couple-sage',  ttl: 'The pair, in sage', meta: 'Watercolour · A5', venue: '', alt: 'Watercolour portrait of a couple, the bride in a sage-green off-shoulder gown beside a groom in a soft brown jacket' },
        { img: 'art-couple-blush', ttl: 'Blush & black tie', meta: 'Watercolour · A5', venue: '', alt: 'Watercolour portrait of a couple, the bride in a blush off-shoulder gown beside a groom in a black suit and glasses' },
        { img: 'art-couple-hanbok', ttl: 'Hanbok traditions', meta: 'Watercolour · A5', venue: '', alt: 'Watercolour portrait of a couple in traditional Korean hanbok attire, the bride in a blue jeogori and skirt and the groom in traditional jacket and pants' },
        { img: 'art-toast-friends', ttl: 'The toast', meta: 'Watercolour · A5', landscape: true, venue: '', alt: 'Landscape watercolour of five friends in formal wear laughing together and clinking wine glasses in a toast' },
        {
          img: 'art-toast-video-poster',
          video: 'art-toast-video',
          ttl: 'Brush in hand',
          meta: 'Watercolour · A5 · video',
          venue: '',
          alt: 'Video of a watercolour portrait being painted live by hand, brush loaded with warm ochre pigment',
        },
        // Template — swap in a real client quote, then uncomment:
        // {
        //   testimonial: true,
        //   quote: 'Short, real words from a couple about the night.',
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
        { img: 'art-character-boy',  ttl: 'At the palette',             meta: 'Studio study', alt: "Small watercolour character portrait with the artist's palette alongside, in warm rust and ochre" },
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
    'Painting live at a wedding is the part I love most. I get a minute or two with each guest, and they get a small portrait made by hand to take home at the end of it.',
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
    { id: 'tubes', name: 'The paint', note: 'Professional lightfast pigment, so the colour holds for decades.' },
    { id: 'eraser', name: 'The eraser', note: 'Barely used, honestly. The pencil lines vanish under the wash.' },
    { id: 'palette', name: 'Travel palette', note: 'Every colour I use, in one tin that fits in a coat pocket.' },
  ],
}

export const PACKAGES = {
  label: 'Packages',
  title: ['One base package,', 'built around your day.'],
  emphasis: 'built around your day.',
  intro:
    'Everything is painted live on 300gsm cotton paper. Whether it is your wedding, a corporate event, or a private celebration, the base package starts the same and builds from there.',
  base: {
    title: 'Live on the day',
    note: 'The base package, painted across your event.',
    priceSmall: 'From',
    price: '$1000',
    facts: ['3 hours live', '24 keepsakes'],
    bullets: [
      'Guest portraits painted live, on 300gsm A5 archival watercolour paper',
      'Usually two guests to a keepsake, up to four if a group wants to share one',
      'You and any VIPs painted first, the rest as they pass by',
      'Every piece sleeved to take home on the night',
      'Public liability insurance',
      'Travel within about an hour of Melbourne or Sydney metro',
    ],
  },
  addonsHead: { title: 'Add-ons', note: 'Priced on enquiry' },
  addons: [
    {
      h: 'After-event service',
      p: 'Add this and guests beyond the booked pieces are painted in the studio afterwards and posted to you to pass on, at a per-portrait rate we agree before the day.',
      tag: 'Per portrait',
    },
    {
      h: 'Family portrait, A3',
      p: 'You and your immediate family, painted larger on A3 from photos you send after the day.',
    },
    {
      h: 'Bridal party, A3',
      p: 'A group portrait of the bridal party on A3, the people closest to you on the day.',
    },

    {
      h: 'Extra live hours',
      p: 'I stay longer across the event, so more of your guests get painted.',
    },
    {
      h: 'Studio commission',
      p: 'A portrait from your photos, before or after the wedding, in a classic likeness or the stylised character style shown in the studio studies. Ready in about four weeks.',
    },
    {
      h: 'Stationery licensing',
      p: 'A digital file of your portrait, licensed for save-the-dates, invitations, and thank-you cards.',
    },
    {
      h: 'Travel further afield',
      p: 'Regional Victoria and destination weddings further out. Happy to talk it through.',
    },
    {
      h: 'Wedding bouquet illustration',
      p: 'Your bouquet painted from photos after the day, on A3 cotton paper. A2 on request.',
    },
  ],
  // Split into label + body so the bold lead-in is structured, not sliced off
  // the body string at render time (see Packages.jsx).
  licenceLabel: 'A note on style.',
  licenceBody:
    'What I paint is my interpretation, not a photo-exact likeness, and my style evolves over time, so no two pieces are the same. Booking means you are comfortable with that approach and my style. A 50% retainer holds your date, with the balance due two weeks before your big day.',
  planner: {
    title: 'What does a booking cover?',
    lede: 'Pick your hours. I paint around 8 pieces an hour, usually two guests to a piece, up to four when a group shares one.',
    hoursLabel: 'Hours booked',
    piecesUnit: 'keepsakes painted live',
    coversUnit: 'Room for around',
    coversTail: 'guests on them at two to a piece, more when groups of up to four share one',
    more: 'Want more covered? Add live hours, or the after-event service adds studio-painted pieces at a per-portrait rate.',
    small: 'Numbers to plan around, not a stopwatch. Groups and pacing vary on the night.',
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
  categories: [
    {
      id: 'faq-painting',
      label: 'What I paint',
      items: [
        {
          q: 'Do you paint live, or from photographs?',
          a: 'Both. The base package has me at your wedding painting live through the reception, and we add to it from there. If you would rather a studio commission from your own photos, before or after the day, I do those too, priced on enquiry.',
        },
        {
          q: 'Do you paint events other than weddings?',
          a: 'Yes. As well as weddings I do brand activations, corporate events, and private parties across Melbourne and Australia-wide. It bends to fit the room, so tell me what you have in mind.',
        },
        {
          q: 'How should we send photos for a commission?',
          a: 'The clearer the photos, the better the portrait. Send a few well-lit, high-resolution shots where your faces are clear, and tell me which one feels most like you. I will take it from there.',
        },
      ],
    },
    {
      id: 'faq-booking',
      label: 'Booking and dates',
      items: [
        {
          q: 'How far ahead should we book?',
          a: 'Right now I am booking up to about two months out, so send me your date and I will tell you what is open. Earlier is always welcome, since I only take a limited number of weddings.',
        },
        {
          q: 'How do we secure our date?',
          a: 'A 50% retainer holds your date, with the balance due two weeks before your big day. I only confirm once the retainer is in, and then the date is yours.',
        },
        {
          q: 'What if we need to postpone or cancel?',
          a: 'Weddings move, and I get that. If you need to cancel or postpone, just let me know as early as you can. I try to be fair and reasonable, and the details depend on timing and whether I am able to rebook the date. Full terms sit in your booking agreement.',
        },
        {
          q: 'Do you travel?',
          a: 'Travel is included for venues within about an hour of Melbourne or Sydney metro. Further out, including regional Victoria, regional NSW, and destination weddings, I am happy to discuss it and quote travel on enquiry. Just tell me your venue.',
        },
      ],
    },
    {
      id: 'faq-night',
      label: 'On the night',
      items: [
        {
          q: 'How long do you paint on the day?',
          a: 'Three hours in the base package, up to about five if you add hours, usually across the reception with short breaks. I pace myself instead of painting flat out, so the last piece gets the same care as the first.',
        },
        {
          q: 'How many guests can you paint?',
          a: 'Around 8 pieces an hour, so a three-hour booking covers roughly 24 portraits. I usually paint two guests to a piece and can fit up to four, so how far that goes depends on how your guests pair up, not the size of your list. The number of pieces you book is the number I paint. If you want more covered, add live hours, or add the after-event service and I paint extra pieces in the studio and post them to you to pass on.',
        },
        {
          q: 'What do you need from us on the day?',
          a: 'Not much. A table around 100 by 60cm at seated height with room for a front-facing chair underneath, a chair, and a bit of space to stand for a short break each hour. I bring everything else. A drink or a bite is always welcome but never expected.',
        },
      ],
    },
    {
      id: 'faq-keep',
      label: 'What you keep',
      items: [
        {
          q: 'When do we receive the finished work?',
          a: 'Guest portraits are done on the night and go home with your guests. Your couple portrait is painted that night too and left with you. Studio commissions from photos usually arrive within four weeks.',
        },
        {
          q: 'Do you frame the work?',
          a: 'I do not frame the work. It comes to you on cotton paper, sleeved and ready for a frame.',
        },
        {
          q: 'What materials do you use?',
          a: 'Professional watercolours on archival 300gsm A5 cotton paper. The pigments are lightfast, so the colour holds for decades if you look after it.',
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
  packageOptions: [
    'Live on the day',
    'Corporate event or brand activation',
    'Private celebration',
    'Studio commission',
    'Not sure yet',
  ],
  // The reply card asks its questions a step at a time (see EnquireForm.jsx)
  // — one tap-question per sheet, contact details last.
  steps: {
    back: 'Back',
    next: 'Continue',
    what: {
      q: 'What are you after?',
      hint: 'Pick whatever is closest. You can say more in a moment.',
    },
    when: {
      q: 'When, and where?',
      hint: 'A rough idea is plenty. Skip what you do not know yet.',
    },
    who: {
      q: 'Where do I send my reply?',
      hint: 'Just a name and an email. Everything else is optional.',
    },
    notSure: 'Not sure yet',
  },
  confirm: {
    // `title` is composed with the sender's first name in EnquireForm, e.g.
    // "Thank you, Sarah." — so it carries no trailing full stop here.
    title: 'Thank you',
    body: 'Your message is with me. I will read it properly and write back soon.',
    sign: 'Chris',
    // The confirmation arrives as a mailed postcard (see Postcard.jsx):
    // stamped with one of the keepsakes, postmarked with today's date.
    postcard: {
      toLabel: 'To',
      stamp: 'art-couple-blush',
      stampAlt: 'A postage stamp printed with one of the keepsake paintings',
      country: 'AUSTRALIA',
      ringTop: 'CHRIS WANG STUDIO',
      ringBottom: 'MELBOURNE',
      delivered: 'Sealed, stamped, and with me.',
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
  lines: ['The activation', 'guests queue for'],
  emphasis: 'queue',
  lede: 'I paint your guests live in watercolour, right in the room. People stop to watch, and everyone I paint leaves with a portrait to keep.',
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
    title: ['What it does', 'in the room.'],
    emphasis: 'in the room.',
    cards: [
      {
        h: 'It gathers a crowd',
        p: 'Guests wander over to see what is happening, then stay to watch a piece finish. By the third or fourth one there is usually a small group around the table waiting for a turn.',
      },
      {
        h: 'The keepsake stays',
        p: 'Most event merch is in a drawer by Monday. A hand-painted portrait tends to end up on a desk or a fridge instead, still there months later.',
      },
      {
        h: 'I bring the rest',
        p: 'All I need is a table, a chair and a corner of the room. I arrive before doors with everything else and keep a steady pace across the booking. Public liability insurance included.',
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
    note: 'Something else in mind? Tell me what you are planning and I will let you know if it fits.',
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
        p: 'Each piece takes five to ten minutes, around 8 an hour, usually two guests to a piece. Once the first few are done, word gets around the room.',
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
      facts: ['3 hours live', '24 keepsakes'],
      bullets: [
        'Guest portraits painted live on 300gsm A5 archival cotton paper',
        'Usually two guests to a keepsake, up to four for a group',
        'Every piece sleeved to take home on the night',
        'Public liability insurance',
        'Travel within about an hour of Melbourne or Sydney metro',
      ],
    },
    scale: {
      h: 'Scaling up',
      items: [
        {
          h: 'Extra live hours',
          p: 'Longer events or bigger guest lists. I stay across the event so more people get painted.',
        },
        {
          h: 'After-event service',
          p: 'Guests beyond the booked pieces painted in the studio afterwards and posted to you to pass on, at a per-portrait rate agreed before the day.',
        },
        {
          h: 'Multi-day activations',
          p: 'Campaigns, expos and store runs across several days, quoted as one engagement.',
        },
        {
          h: 'Travel further afield',
          p: 'Regional and interstate events are welcome. Tell me the venue and I will quote travel with the booking.',
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
  nav: [
    { href: '/#night', label: 'On the night' },
    { href: '/#work', label: 'The work' },
    { href: '/#painter', label: 'The painter' },
    { href: '/#offerings', label: 'Packages' },
    { href: '/corporate/', label: 'Corporate' },
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
export const NAV = [
  { href: '/#work', label: 'Gallery' },
  { href: '/#painter', label: 'About' },
  { href: '/#offerings', label: 'Packages' },
  { href: '/corporate/', label: 'Corporate' },
  { href: '/faq/', label: 'FAQ' },
]
