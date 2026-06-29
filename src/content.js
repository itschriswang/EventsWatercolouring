// All site copy in one place. Written in Christopher's own voice: plain,
// warm and direct, Australian English, no em dashes. Edit here and every
// section updates.

export const HERO = {
  lines: ['Painted', 'live, while', 'you celebrate.'],
  emphasis: ['Painted', 'live'],
  linesMobile: ['Painted', 'live,', 'while you', 'celebrate.'],
  emphasisMobile: ['Painted', 'live,'],
  lede: 'I set up at your reception and paint while the party carries on. A set number of your guests go home with their own small portrait, and you get one of the two of you, painted that night. Every piece is real watercolour on cotton paper.',
}

export const MARQUEE = [
  'Event watercolour',
  'Portraits of your guests',
  'Painted by hand',
  'Real watercolour on cotton paper',
  'A keepsake to take home',
]

export const WHY = {
  label: 'Why live watercolour',
  lede: 'Entertainment for the room and a hand-painted keepsake for your guests, all in one evening. Whether it is your wedding, a corporate gala, or a private milestone, the idea stays the same.',
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
      title: 'Something to keep',
      body: 'Guests go home with a small painting of their own, and you keep a portrait or memory painted while the day is still going. It is on archival cotton paper, so it lasts.',
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
      body: 'I aim for around 9 pieces an hour. The number you book is the number I plan for, and anyone I do not reach on the night, I finish in the studio afterwards and post to you.',
    },
  ],
}

export const PATHS = {
  label: 'How it works',
  title: ['Two ways', 'to work with me.'],
  emphasis: 'to work with me.',
  items: [
    {
      no: 'Path 01',
      title: 'Live on the day',
      sub: 'I come to your wedding and paint on the day.',
      art: 'assets/art-bouquet.webp',
      steps: [
        {
          b: 'We plan it together',
          t: 'We start from one base package and build it around your day: how long I paint, roughly how many guests, and any extras. A retainer holds your date.',
        },
        {
          b: 'I paint through the night',
          t: 'I arrive early, set up, then paint a set number of your guests while the party carries on. Nobody has to pose or sit for me.',
        },
        {
          b: 'Guests get to take home a special memory',
          t: 'The guests I paint go home with their own small portrait, sleeved and ready to travel. Your couple portrait is painted on the night and stays with you. Feel free to let me know of any VIPs I should get around to on the night.',
        },
      ],
    },
    {
      no: 'Path 02',
      title: 'A studio commission',
      sub: 'From your photographs, before or after the wedding.',
      art: 'assets/art-character-girl.webp',
      steps: [
        {
          b: 'Send me your photos',
          t: 'A few clear, high-resolution photos that look like you. I will help you pick the one to paint from.',
        },
        {
          b: 'I paint in the studio',
          t: 'I work from your photos on archival cotton paper, building the portrait by hand over the following weeks.',
        },
        {
          b: 'It arrives in around four weeks',
          t: 'Your finished watercolour usually arrives within about four weeks.',
        },
      ],
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
        'Christopher painted us from our photographs after the wedding, and it has become the piece everyone stops at in our home. Our only regret is not having him there on the night — honestly, it is the reason this whole thing exists.',
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
  caption: 'Christopher Wang · Melbourne',
  body: [
    'I am Christopher. I grew up in Sydney and I am based in Melbourne now, and I have been painting in watercolour for more than ten years.',
    'Painting live at a wedding is the part I love most. A few minutes with each guest, a small portrait made by hand while the night carries on, and something real to take home at the end.',
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
    note: 'The base package, painted across your reception.',
    priceSmall: 'From',
    price: '$850',
    facts: ['3 hours live', '27 keepsakes'],
    bullets: [
      'Guest portraits painted live, A5 on archival cotton paper',
      'Each keepsake artwork can feature up to four guests',
    ],
  },
  baseNote:
    'Want more hours, more guests, or a portrait from photos instead? We build it up from the base. Some add-ons have a set price, others I quote for your day. Just tell me what you are after.',
  included: {
    title: 'Included as standard',
    sub: 'Everything below comes with the base package. You provide a table (around 100 by 60cm, at seated height, with a front-facing chair that tucks underneath) and a chair for me. I bring the rest.',
    items: [
      'All drawing and painting materials',
      'Premium 300gsm archival watercolour paper',
      'Clear sleeves for each piece',
      'Live painting across your reception',
      'Set-up about 15 minutes before I start',
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
      p: 'I stay longer across the reception, so more of your guests get painted.',
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

export const BEYOND = {
  label: 'Beyond weddings',
  title: ['For any room,', 'any occasion.'],
  emphasis: 'any occasion.',
  intro:
    'Live painting works just as well away from a wedding. I take it across Melbourne and Australia-wide, turning a few hours into something a guest walks out with. Corporate galas, brand activations, private celebrations — whatever the room, the principle is the same: guests gather, you get keepsakes.',
  cards: [
    {
      tag: 'Brand activations',
      title: 'A reason to stop and stay',
      body: 'Live portraits give people something to watch and a reason to hang around. Everyone leaves with a branded piece they actually keep, not another giveaway headed for the bin.',
    },
    {
      tag: 'Corporate events',
      title: 'Not your usual photo booth',
      body: 'For galas, launches and end-of-year nights. A quieter, more interesting alternative to a photo booth for a room that cares how things look.',
    },
    {
      tag: 'Private celebrations',
      title: 'Milestones worth keeping',
      body: 'Birthdays, anniversaries, engagements. Smaller, warmer gatherings where everyone goes home with a small painting of their own.',
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
      a: 'At least 10 pieces an hour, so a three-hour booking is 30 portraits or more. Anyone I do not get to on the night, I finish in the studio and post to you to pass on, so no guest misses out.',
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
    title: 'Thank you.',
    body: 'Your message is with me. I will read it properly and write back soon, usually within a few days.',
    sign: 'Christopher',
  },
}

export const FOOTER = {
  cta: ['Let’s make something', 'to keep.'],
  emphasis: 'to keep.',
  name: 'Christopher Wang',
  nav: [
    { href: '#why', label: 'Why' },
    { href: '#night', label: 'On the night' },
    { href: '#work', label: 'The work' },
    { href: '#painter', label: 'The painter' },
    { href: '#process', label: 'How it works' },
    { href: '#offerings', label: 'Packages' },
    { href: '#beyond', label: 'Beyond weddings' },
    { href: '#faq', label: 'Questions' },
  ],
  instagram: 'https://www.instagram.com/chriswangstudio',
}

export const NAV = [
  { href: '#why', label: 'Why' },
  { href: '#process', label: 'How it works' },
  { href: '#offerings', label: 'Packages' },
  { href: '#faq', label: 'Questions' },
]
