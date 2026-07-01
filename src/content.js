// All site copy in one place. Written in Christopher's own voice: plain,
// warm and direct, Australian English, no em dashes. Edit here and every
// section updates.

export const HERO = {
  lines: ['Live Watercolour','Illustrations'],
  emphasis: ['Watercolour'],
  linesMobile: ['The day you\'ll', 'remember,', 'painted as', 'you live it.'],
  emphasisMobile: ['remember', 'live'],
  lede: 'While you dance, laugh, and celebrate the night you have been planning for months, I am painting the people you love most. Your guests carry home a small watercolour portrait. You keep one of the two of you, painted while the night was still happening.',
}

export const MARQUEE = [
  'Event watercolour',
  'Portraits of your guests',
  'Painted by hand',
  'Real watercolour on cotton paper',
  'A keepsake to take home',
]

// Reframed from a "why choose this" pitch into the closing movement of the
// night: once the evening is over, this is what's left in people's hands. It
// reads as the resolution of the timeline above it rather than a sales
// argument, hence the declarative label and the bridge line that carries over
// from the last beat of the evening.
export const WHY = {
  label: 'What you keep',
  bridge: 'When the music stops',
  lede: 'A wedding, a gala, a quiet milestone. Whatever the evening was, it does not simply end. It goes home in your guests’ hands, painted while it was still happening.',
  emphasis: 'painted while it was still happening.',
  notes: [
    {
      no: '01',
      title: 'Something to gather around',
      body: 'Guests wander over to watch a portrait happen. The table turns into a spot people gather, and something they keep talking about long after the night is over.',
    },
    {
      no: '02',
      title: 'Made by hand, on the day',
      body: 'Every piece is an original watercolour, painted right there in the room while the day is happening around it. Each one is one of a kind.',
    },
    {
      no: '03',
      title: 'Yours to keep',
      body: 'Guests go home with a small painting of their own, and you keep a portrait of the two of you, painted while the day was still going. It is on archival cotton paper, so it lasts.',
    },
  ],
}

export const EVENING = {
  label: 'On the night',
  title: ['How the evening', 'runs.'],
  emphasis: 'runs.',
  lede: 'The first thing I paint is the two of you, while everything is fresh. After that I work through your guests.',
  beats: [
    {
      no: '01',
      title: 'I set up',
      body: 'I get there about fifteen minutes early and set up before I start. You do not need to organise much beyond a table and chair for me.',
    },
    {
      no: '02',
      title: 'No need to pose',
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
      title: 'A number you can count on',
      body: 'I aim for around 8 pieces an hour. The number you book is the number I plan for, and anyone I do not reach on the night, I finish in the studio afterwards and post to you.',
    },
  ],
}


export const WORK = {
  label: 'Selected work',
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
    {
      testimonial: true,
      feature: true,
      quote:
        'Christopher painted us from our photographs after the wedding, and it has become the piece everyone stops at in our home. Our only regret is not having him there on the night. Honestly, it is the reason this whole thing exists.',
      author: 'Clare & William',
      detail: 'Post-wedding commission',
    },
    { img: 'art-couple-vows',    ttl: 'The vows',             meta: 'Watercolour · A5', landscape: true, alt: 'Landscape watercolour of a bride in a white gown and a groom in a navy tuxedo holding hands among scattered confetti' },
    { img: 'art-couple-sage',    ttl: 'The pair, in sage',    meta: 'Watercolour · A5', alt: 'Watercolour portrait of a couple, the bride in a sage-green off-shoulder gown beside a groom in a soft brown jacket' },
    { img: 'art-character-girl', ttl: 'Little character, in green', meta: 'Studio study', alt: 'Small watercolour character portrait of a figure in a wide-brimmed hat, painted in olive green and ochre' },
    { img: 'art-couple-blush',   ttl: 'Blush & black tie',    meta: 'Watercolour · A5', alt: 'Watercolour portrait of a couple, the bride in a blush off-shoulder gown beside a groom in a black suit and glasses' },
    { img: 'art-character-boy',  ttl: 'At the palette',       meta: 'Studio study', alt: "Small watercolour character portrait with the artist's palette alongside, in warm terracotta and ochre" },
    { img: 'art-bouquet',        ttl: 'Ribbon & rose',        meta: 'Watercolour · A5' },
    { img: 'art-character-boy2',  ttl: 'Warm ochre',           meta: 'Studio study' },
    { img: 'art-character-girl', ttl: 'Olive & hat',          meta: 'Studio study', feature: true },
    { img: 'art-character-boy',  ttl: 'On cotton paper',      meta: 'Watercolour · A5' },
    { img: 'art-bouquet',        ttl: 'Forget-me-not',        meta: 'Watercolour · A5' },
    { img: 'art-character-girl', ttl: 'Quiet study',          meta: 'Studio study' },
    { img: 'art-character-boy',  ttl: 'Little portrait',      meta: 'Studio study' },
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
}

export const PATHS = {
  label: 'How it works',
  title: ['Live on the day,', 'or after it.'],
  emphasis: 'or after it.',
  items: [
    {
      no: '01',
      title: 'Live on the day',
      sub: 'I paint your guests as they mingle, quick portraits in watercolour, handed over as the night unfolds.',
      steps: [
        { b: 'Book your date', t: 'A 50% retainer holds the date. Balance due two weeks before.' },
        { b: 'I arrive early', t: 'Set-up takes about 15 minutes before the event starts.' },
        { b: 'Paint and mingle', t: 'Guests pass by; I take a quick photo and paint them live.' },
        { b: 'Keepsakes to go', t: 'Each finished portrait goes home with the guest on the night.' },
      ],
    },
    {
      no: '02',
      title: 'From your photographs',
      sub: 'A studio commission painted from photos before or after the event, ready in about four weeks.',
      steps: [
        { b: 'Share your photos', t: 'Send clear reference images after the booking is confirmed.' },
        { b: 'I paint in the studio', t: 'Work begins once the references arrive.' },
        { b: 'Review and approve', t: 'I send a photo of the finished piece before it is posted.' },
        { b: 'Posted to you', t: 'Shipped flat in a protective sleeve, ready to frame.' },
      ],
    },
  ],
}

export const FAQ = {
  label: 'Questions',
  title: 'The practical bits.',
  items: [
    {
      q: 'How far ahead should we book?',
      a: 'Right now I am booking up to about two months out, so send me your date and I will tell you what is open. Earlier is always welcome, since I only take a limited number of weddings.',
    },
    {
      q: 'Do you paint live, or from photographs?',
      a: 'Both. The base package has me at your wedding painting live through the reception, and we add to it from there. If you would rather a studio commission from your own photos, before or after the day, I do those too, priced on enquiry.',
    },
    {
      q: 'How long do you paint on the day?',
      a: 'Three hours in the base package, up to about five if you add hours, usually across the reception with short breaks. I pace myself instead of painting flat out, so the last piece gets the same care as the first.',
    },
    {
      q: 'How many guests can you paint?',
      a: 'Around 8 pieces an hour, so a three-hour booking covers roughly 24 portraits. Anyone I do not get to on the night, I finish in the studio and post to you to pass on, so no guest misses out.',
    },
    {
      q: 'What materials do you use?',
      a: 'Professional watercolours on archival 300gsm A5 cotton paper. The pigments are lightfast, so the colour holds for decades if you look after it.',
    },
    {
      q: 'When do we receive the finished work?',
      a: 'Guest portraits are done on the night and go home with your guests. Your couple portrait is painted that night too and left with you. Studio commissions from photos usually arrive within four weeks.',
    },
    {
      q: 'Do you travel?',
      a: 'Travel is included for venues within about an hour of Melbourne or Sydney metro. Further out, including regional Victoria, regional NSW, and destination weddings, I am happy to discuss it and quote travel on enquiry. Just tell me your venue.',
    },
    {
      q: 'Do you frame the work?',
      a: 'I do not frame the work. It comes to you on cotton paper, sleeved and ready for a frame.',
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
      q: 'What do you need from us on the day?',
      a: 'Not much. A table around 100 by 60cm at seated height with room for a front-facing chair underneath, a chair, and a bit of space to stand for a short break each hour. I bring everything else. A drink or a bite is always welcome but never expected.',
    },
    {
      q: 'Do you paint events other than weddings?',
      a: 'Yes. As well as weddings I do brand activations, corporate events and private parties across Melbourne and Australia-wide. It bends to fit the room, so tell me what you have in mind.',
    },
    {
      q: 'How should we send photos for a commission?',
      a: 'The clearer the photos, the better the portrait. Send a few well-lit, high-resolution shots where your faces are clear, and tell me which one feels most like you. I will take it from there.',
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
  name: 'Chris Wang',
  nav: [
    { href: '#painter', label: 'The painter' },
    { href: '#night', label: 'On the night' },
    { href: '#keep', label: 'What you keep' },
    { href: '#work', label: 'The work' },
    { href: '#offerings', label: 'Packages' },
    { href: '#faq', label: 'Questions' },
  ],
  instagram: 'https://www.instagram.com/chriswangstudio',
}

export const NAV = [
  { href: '#keep', label: 'What you keep' },
  { href: '#offerings', label: 'Packages' },
  { href: '#faq', label: 'Questions' },
]
