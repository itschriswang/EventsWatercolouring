// All site copy in one place. Written in Christopher's own voice: plain,
// warm and direct, Australian English, no em dashes. Edit here and every
// section updates.

export const HERO = {
  lines: ['Memories', 'painted as they', 'happen'],
  linesMobile: ['Memories', 'painted as they', 'happen'],
  emphasis: 'painted',
  emphasisMobile: 'painted',
  lede: 'Your guests, painted live in watercolour while the night carries on. Everyone takes home something real, and they talk about it long after.',
  note: 'Every enquiry answered personally, usually within a few days.',
}

// The one quote that does the selling — pulled up between the hero and the
// story so it is the first full sentence a visitor reads after the headline.
export const PULLQUOTE = {
  quote: 'It has become the piece everyone stops at in our home. Our only regret is not having him there on the night.',
  author: 'Clare & William',
  detail: 'Post-wedding commission',
}

export const EVENING = {
  label: 'On the night',
  title: ['How the evening', 'runs.'],
  emphasis: 'runs.',
  lede: 'The first thing I paint is the two of you, while everything is fresh. After that I work through your guests. Say your reception kicks off at seven, here is how the night goes.',
  beats: [
    {
      no: '01',
      time: '6:45pm',
      title: 'I set up',
      body: 'I get there about fifteen minutes early and set up before I start. You do not need to organise much beyond a table and chair for me.',
    },
    {
      no: '02',
      time: '7:00pm',
      title: 'No need to pose',
      body: 'Your guests keep enjoying the night. I take a quick photo and note their name as they pass, so nobody has to stop or sit still for me.',
    },
    {
      no: '03',
      time: '7:20pm',
      title: 'I start painting',
      body: 'Each piece takes about five to ten minutes. Once the first few are done, word gets around and guests start coming over to watch the next one.',
    },
    {
      no: '04',
      time: '9:30pm',
      title: 'Sleeved to take home',
      body: 'Every painting goes into a clear sleeve so it gets home in one piece, right about when the champagne starts flowing a little more freely.',
    },
    {
      no: '05',
      time: 'The week after',
      title: 'A number you can count on',
      body: 'I aim for around 8 pieces an hour. The number you book is the number I plan for, and anyone I do not reach on the night, I finish in the studio afterwards and post to you.',
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
  // One entry per image. `img` is the asset base name; it loads both
  // assets/<img>.webp and assets/<img>.jpg automatically, so you only name it
  // once. Reorder entries to change placement. Set `feature: true` to make a
  // piece fill a 2×2 block on wide screens (and stand taller on mobile).
  // Add as many as you like — the layout flows to fit.
  //
  // The wall shows no captions — `ttl`, `meta` and `alt` are still worth filling
  // in: they label the lightbox and read out to screen readers.
  //
  // Most pieces are upright (3:4). A landscape-orientation painting reads badly
  // in a portrait tile, so flag it `landscape: true` and it takes the same wide
  // 2×1 block a testimonial uses — letterbox shape, no awkward crop.
  //
  // A testimonial slots into the wall like any other tile — give it
  // `testimonial: true` with `quote`, `author` and `detail` instead of `img`.
  // The attribution sits inside the quote card. `feature: true` gives a longer
  // quote the room it needs (a 2×2 block); use `wide: true` instead for a short
  // one-liner in a 2×1 block.
  gallery: [
    { img: 'art-bouquet',        ttl: 'The bouquet',          meta: 'Watercolour · A5', feature: true, alt: 'Watercolour study of a bridal bouquet, with rust ribbon, orange roses and forget-me-not blue, painted on cotton-rag paper' },
    { img: 'art-couple-vows',    ttl: 'The vows',             meta: 'Watercolour · A5', landscape: true, alt: 'Landscape watercolour of a bride in a white gown and a groom in a navy tuxedo holding hands among scattered confetti' },
    { img: 'art-couple-sage',    ttl: 'The pair, in sage',    meta: 'Watercolour · A5', alt: 'Watercolour portrait of a couple, the bride in a sage-green off-shoulder gown beside a groom in a soft brown jacket' },
    { img: 'art-character-girl', ttl: 'Little character, in green', meta: 'Studio study', alt: 'Small watercolour character portrait of a figure in a wide-brimmed hat, painted in olive green and ochre' },
    { img: 'art-couple-blush',   ttl: 'Blush & black tie',    meta: 'Watercolour · A5', alt: 'Watercolour portrait of a couple, the bride in a blush off-shoulder gown beside a groom in a black suit and glasses' },
    { img: 'art-character-boy',  ttl: 'At the palette',       meta: 'Studio study', alt: "Small watercolour character portrait with the artist's palette alongside, in warm terracotta and ochre" },
    { img: 'art-character-boy2', ttl: 'Warm ochre',           meta: 'Studio study', alt: 'Small watercolour character portrait of a seated figure in warm ochre tones, holding a jar' },
  ],
}



export const PAINTER = {
  label: 'The painter',
  title: ['A bit', 'about me.'],
  emphasis: 'about me.',
  portrait: 'assets/portrait-christopher.jpg',
  portraitWebp: 'assets/portrait-christopher.webp',
  caption: 'Chris Wang',
  body: [
    'I am Christopher. I grew up in Sydney and I am based in Melbourne now, and I have been painting in watercolour for more than ten years.',
    'Painting live at a wedding is the part I love most. Special moments with each guest, a small portrait made by hand while the night carries on, and something real to take home at the end.',
    'I travel across Melbourne and Australia-wide for weddings, corporate events, brand activations, and private celebrations.',
  ],
  signature: '',
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
    price: '$850',
    facts: ['3 hours live', '24 keepsakes'],
    bullets: [
      'Guest portraits painted live, on 300gsm A5 archival watercolour paper',
      'Each keepsake can feature up to four guests',
      'You and any VIPs painted first, the rest as they pass by',
      'Every piece sleeved to take home on the night',
      'Public liability insurance',
      'Travel within about an hour of Melbourne or Sydney metro',
    ],
  },
  addonsHead: { title: 'Add-ons', note: 'Priced on enquiry' },
  addons: [
    {
      h: 'Guests I finish afterwards',
      p: 'Anyone I do not reach on the night gets finished in the studio and posted to you to pass on. You can also add guests beyond the booked number at this rate.',
      tag: 'Per portrait · on enquiry',
    },
    {
      h: 'Family portrait, A3',
      p: 'You and your immediate family, painted larger on A3 from photos you send after the day.',
      tag: '$400',
    },
    {
      h: 'Bridal party, A3',
      p: 'A group portrait of the bridal party on A3, the people closest to you on the day.',
      tag: '$400',
    },

    {
      h: 'Extra live hours',
      p: 'I stay longer across the event, so more of your guests get painted.',
      tag: 'On enquiry',
    },
    {
      h: 'Studio commission',
      p: 'A portrait from your photos, before or after the wedding, ready in about four weeks.',
      tag: 'On enquiry',
    },
    {
      h: 'Stationery licensing',
      p: 'A digital file of your portrait, licensed for save-the-dates, invitations and thank-you cards.',
      tag: 'On enquiry',
    },
    {
      h: 'Travel further afield',
      p: 'Regional Victoria and destination weddings further out. Happy to talk it through.',
      tag: 'On enquiry',
    },
    {
      h: 'Wedding bouquet illustration',
      p: 'Your bouquet painted from photos after the day, on A3 cotton paper. A2 on request.',
      tag: '$500',
      small: 'A3 from',
      extra: '· A2 on enquiry',
    },
  ],
  licence:
    'A note on style. What I paint is my interpretation, not a photo-exact likeness, and my style evolves over time, so no two pieces are the same. Booking means you are comfortable with that approach and my style. A 50% retainer holds your date, with the balance due two weeks before your big day.',
  planner: {
    title: 'Will everyone get painted?',
    lede: 'Slide to your guest list and pick your hours. I paint around 8 pieces an hour, and each piece can hold up to four guests.',
    guestsLabel: 'Your guest list',
    hoursLabel: 'Hours booked',
    piecesUnit: 'keepsakes painted live',
    coversUnit: 'Room for up to',
    coversTail: 'guests on them, four to a piece',
    fits: 'Everyone can be on a piece before the night is out.',
    overflow: 'I paint through the night, then finish the rest in the studio and post them to you, so no guest misses out.',
    small: 'Numbers to plan around, not a stopwatch. Groups and pacing vary on the night.',
  },
}

export const FAQ = {
  label: 'Questions',
  title: 'The practical bits.',
  items: [
    {
      q: 'Do you paint live, or from photographs?',
      a: 'Both. The base package has me at your wedding painting live through the reception, and we add to it from there. If you would rather a studio commission from your own photos, before or after the day, I do those too, priced on enquiry.',
    },
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
      q: 'How long do you paint on the day?',
      a: 'Three hours in the base package, up to about five if you add hours, usually across the reception with short breaks. I pace myself instead of painting flat out, so the last piece gets the same care as the first.',
    },
    {
      q: 'Do you travel?',
      a: 'Travel is included for venues within about an hour of Melbourne or Sydney metro. Further out, including regional Victoria, regional NSW, and destination weddings, I am happy to discuss it and quote travel on enquiry. Just tell me your venue.',
    },
    {
      q: 'When do we receive the finished work?',
      a: 'Guest portraits are done on the night and go home with your guests. Your couple portrait is painted that night too and left with you. Studio commissions from photos usually arrive within four weeks.',
    },
    {
      q: 'How many guests can you paint?',
      a: 'Around 8 pieces an hour, so a three-hour booking covers roughly 24 portraits. Anyone I do not get to on the night, I finish in the studio and post to you to pass on, so no guest misses out.',
    },
    {
      q: 'Do you frame the work?',
      a: 'I do not frame the work. It comes to you on cotton paper, sleeved and ready for a frame.',
    },
    {
      q: 'How should we send photos for a commission?',
      a: 'The clearer the photos, the better the portrait. Send a few well-lit, high-resolution shots where your faces are clear, and tell me which one feels most like you. I will take it from there.',
    },
    {
      q: 'What materials do you use?',
      a: 'Professional watercolours on archival 300gsm A5 cotton paper. The pigments are lightfast, so the colour holds for decades if you look after it.',
    },
    {
      q: 'What do you need from us on the day?',
      a: 'Not much. A table around 100 by 60cm at seated height with room for a front-facing chair underneath, a chair, and a bit of space to stand for a short break each hour. I bring everything else. A drink or a bite is always welcome but never expected.',
    },
    {
      q: 'Do you paint events other than weddings?',
      a: 'Yes. As well as weddings I do brand activations, corporate events and private parties across Melbourne and Australia-wide. It bends to fit the room, so tell me what you have in mind.',
    },
  ],
}

export const ENQUIRY = {
  label: 'Enquire',
  title: ['Tell me about', 'your day.'],
  emphasis: 'your day.',
  intro:
    'Just a few details to start. I read and answer every enquiry myself, usually within a few days.',
  packageOptions: [
    'Live on the day (base package)',
    'Live on the day, with add-ons',
    'After-Event Service for guests',
    'Studio commission from photographs',
    'Corporate event or brand activation',
    'Private celebration',
    'Not sure yet',
  ],
  confirm: {
    // `title` is composed with the sender's first name in EnquireForm, e.g.
    // "Thank you, Sarah." — so it carries no trailing full stop here.
    title: 'Thank you',
    body: 'Your message is with me. I will read it properly and write back soon, usually within a few days.',
    sign: 'Chris',
  },
}

export const FOOTER = {
  cta: ['Let’s make something', 'to keep.'],
  emphasis: 'to keep.',
  name: 'chris wang',
  nav: [
    { href: '/#night', label: 'On the night' },
    { href: '/#work', label: 'The work' },
    { href: '/#painter', label: 'The painter' },
    { href: '/#offerings', label: 'Packages' },
    { href: '/faq/', label: 'Questions' },
  ],
  instagram: 'https://www.instagram.com/chriswangstudio',
  instagramHandle: '@chriswangstudio',
}

// Root-relative hrefs (`/#offerings`, not `#offerings`) so the same nav
// works unchanged from the homepage (same-document hash scroll) and from
// the /faq/ subpage (a normal navigation back to that homepage anchor).
export const NAV = [
  { href: '/#offerings', label: 'Packages' },
  { href: '/faq/', label: 'Questions' },
]
