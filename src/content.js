// All site copy in one place. Reproduced verbatim from legacy/index.html
// (the user's own refined, non-plagiarised text), except `evening` whose
// prose is reworded/enriched from the "Additional Content to Consider" source.

export const HERO = {
  lines: ['Painted', 'live, while', 'you celebrate.'],
  emphasis: 'live',
  linesMobile: ['Painted', 'live,', 'while you', 'celebrate.'],
  emphasisMobile: 'live,',
  lede: 'I set up at your reception and paint as the night moves. A selected number of your guests leave with a small keepsake of their own, and the two of you with one portrait painted on the night, all in pigment on cotton-rag paper.',
}

export const MARQUEE = [
  'Live wedding watercolour',
  'Individual guest portraits',
  'Painted by hand',
  'Pigment on cotton rag',
  'A keepsake to treasure',
]

export const WHY = {
  label: 'Why live watercolour',
  lede: 'Live entertainment and a hand-painted keepsake for every guest all in one evening.',
  notes: [
    {
      no: '01',
      title: 'A quiet centre of the room',
      body: 'Guests drift over to watch a portrait find its shape. The table becomes a gentle gathering point, and a talking point that lasts long after the night.',
    },
    {
      no: '02',
      title: 'Made by hand, in the moment',
      body: 'Not a print or a photo off a phone. Each piece is an original painted in the room, on the day, carrying the feeling of your wedding while it happens.',
    },
    {
      no: '03',
      title: 'Something to keep',
      body: 'Many of your guests leave with a small painting of their own, and the two of you with a portrait made while the day is still unfolding. Painted on archival cotton-rag paper, it is made to last.',
    },
  ],
}

// "How the evening unfolds" — reworded and enriched from the additional content.
export const EVENING = {
  label: 'On the night',
  title: ['How the evening', 'unfolds.'],
  emphasis: 'unfolds.',
  lede: 'The first thing I paint is the two of you on A4, while the energy is fresh. It is bigger and more detailed, the one you will want to frame. Then the night takes over.',
  beats: [
    {
      no: '01',
      title: 'Quietly set up',
      body: 'I slip in about fifteen minutes ahead and lay everything out, brushes, paper and pigment already in their places. There is nothing for you to arrange and nothing for you to think about.',
    },
    {
      no: '02',
      title: 'No need to pose',
      body: 'Your guests carry on with the celebration, uninterrupted. A quick photo is taken and a name noted, gently and in passing, so no one has to stop or sit still for me.',
    },
    {
      no: '03',
      title: 'The painting begins',
      body: 'Each piece takes around five to ten minutes. As the first finished portraits appear a quiet buzz starts to spread, and guests drift over to watch the next one come to life.',
    },
    {
      no: '04',
      title: 'Sleeved to take home',
      body: 'Every painting slides into a clear protective sleeve, ready to travel home safely, just as the champagne starts to flow a little more freely.',
    },
    {
      no: '05',
      title: 'A guaranteed number',
      body: 'I commit to a minimum of 10 pieces per hour. Anyone not reached on the night is finished in the studio and posted to you to hand on — so the number you book is the number you get.',
    },
  ],
}

export const PATHS = {
  label: 'How it works',
  title: ['Two ways in.', 'Both unhurried.'],
  emphasis: 'Both unhurried.',
  items: [
    {
      no: 'Path 01',
      title: 'Live on the day',
      sub: 'I come to your wedding and paint as it happens.',
      art: 'assets/art-bouquet.webp',
      steps: [
        {
          b: 'We shape the day together',
          t: 'We start from one base package and build it around your wedding: how long I paint, roughly how many guests, and any extras. A deposit holds your date.',
        },
        {
          b: 'I paint through the night',
          t: 'I arrive early and set up quietly, then paint a selected number of your guests as the celebration carries on around them. No posing, no interruption.',
        },
        {
          b: 'Keepsakes to take home',
          t: 'The guests I paint leave with a small portrait of their own, sleeved and ready to travel. Your couple portrait is painted on the night and left with you.',
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
          t: 'A few well-lit, high-resolution images that look like you. I will help you choose the one to paint from.',
        },
        {
          b: 'I paint in the studio',
          t: 'I work from your images on archival cotton watercolour paper, building the portrait by hand over the weeks that follow.',
        },
        {
          b: 'It arrives within four weeks',
          t: 'Your finished watercolour is delivered with a high-resolution scan for your records.',
        },
      ],
    },
  ],
}

export const WORK = {
  label: 'Selected work',
  title: ['Pigment on', 'cotton archival watercolour paper.'],
  emphasis: 'cotton rag.',
  note: 'Painted by hand on 300gsm A5 watercolour pads.',
  // ── Gallery wall — simple to edit ─────────────────────────────────────────
  // One entry per image. `img` is the asset base name; it loads both
  // assets/<img>.webp and assets/<img>.jpg automatically, so you only name it
  // once. Reorder entries to change placement. Set `feature: true` to make a
  // piece fill a 2×2 block on wide screens (and stand taller on mobile).
  // Add as many as you like — the layout flows to fit.
  gallery: [
    { img: 'art-bouquet',        ttl: 'The bouquet',          meta: 'Watercolour · A5', feature: true, alt: 'Watercolour study of a bridal bouquet, with rust ribbon, orange roses and forget-me-not blue, painted on cotton-rag paper' },
    { img: 'art-character-girl', ttl: 'Little character, in green', meta: 'Studio study', alt: 'Small watercolour character portrait of a figure in a wide-brimmed hat, painted in olive green and ochre' },
    { img: 'art-character-boy',  ttl: 'At the palette',       meta: 'Studio study', alt: "Small watercolour character portrait with the artist's palette alongside, in warm terracotta and ochre" },
    { img: 'art-bouquet',        ttl: 'Ribbon & rose',        meta: 'Watercolour · A5' },
    { img: 'art-character-boy',  ttl: 'Warm ochre',           meta: 'Studio study' },
    { img: 'art-character-girl', ttl: 'Olive & hat',          meta: 'Studio study', feature: true },
    { img: 'art-character-boy',  ttl: 'On cotton rag',        meta: 'Watercolour · A5' },
    { img: 'art-bouquet',        ttl: 'Forget-me-not',        meta: 'Watercolour · A5' },
    { img: 'art-character-girl', ttl: 'Quiet study',          meta: 'Studio study' },
    { img: 'art-character-boy',  ttl: 'Little portrait',      meta: 'Studio study' },
  ],
}

export const MOTION = {
  label: 'In motion',
  title: ['Watch a piece', 'come together.'],
  emphasis: 'come together.',
  body: 'A couple of short films of the paint going down. Between weddings I also paint little character portraits, in the soft, wistful spirit of the art-toy world. It keeps my hand loose and my eye on character.',
  films: [
    {
      src: 'assets/reel-painting-1.mp4',
      poster: 'assets/reel-painting-1.webp',
      caption: 'Painting in progress',
    },
    {
      src: 'assets/reel-painting-2.mp4',
      poster: 'assets/reel-painting-2.webp',
      caption: 'Laying in the wash',
    },
  ],
  instagram: [
    'https://www.instagram.com/reel/DUzCi-LEvAc/',
    'https://www.instagram.com/reel/DU38HYjk_T1/',
    'https://www.instagram.com/reel/DU9hsOjiOXt/',
    'https://www.instagram.com/reel/DVQIr0KiJql/',
  ],
}

export const PAINTER = {
  label: 'The painter',
  title: ['The hand', 'behind the brush.'],
  emphasis: 'behind the brush.',
  portrait: 'assets/portrait-christopher.jpg',
  portraitWebp: 'assets/portrait-christopher.webp',
  body: [
    'I am Christopher, a Sydney-born artist now based in Melbourne, who fell in love with watercolour over a decade ago.',
    'Painting live at a wedding is the truest test of that, and the part I love most. A few quiet minutes with each guest, a small portrait made by hand while the night carries on around us, and something real to take home at the end of it.',
  ],
  
}

export const PACKAGES = {
  label: 'Packages',
  title: ['One base package,', 'shaped around your day.'],
  emphasis: 'shaped around your day.',
  intro:
    'Everything is painted at your wedding on 300gsm cotton paper, with a couple portrait painted on the night and left with you.',
  base: {
    title: 'Live on the day',
    note: 'The base package, painted through your reception.',
    priceSmall: 'From',
    price: '$1,000',
    facts: ['3 hours live', '30 keepsakes', '~30 guests'],
    bullets: [
      'Live guest keepsakes, A5 archival cotton paper',
      'A couple portrait, painted on the night and left with you',
      'Each piece sleeved, ready to take home',
      'Travel within about 1.5 hours of the Melbourne CBD included',
    ],
  },
  baseNote:
    'Want longer, more guests, or a portrait from photographs instead? We build it from the base. Some pieces have a set price, others I quote for your day, so just tell me what you have in mind.',
  included: {
    title: 'Included as standard',
    sub: 'Everything below comes with the base package. You provide one table (around 100 × 60 cm, at seated height, with a front-facing chair able to tuck underneath) and a chair for me. Everything else I bring.',
    items: [
      'All drawing and painting materials',
      'Premium 300gsm achival watercolour paper',
      'Sealable clear sleeves for every piece',
      'Live painting through your reception',
      'Set-up about 15 minutes before I start',
      'Public liability insurance',
      'Travel within about 1.5 hours of the Melbourne CBD',
    ],
  },
  addonsHead: { title: 'Add-ons', note: 'Priced on enquiry' },
  addons: [
    {
      h: 'After-Event Service',
      p: 'Any shortfall against the guaranteed minimum is finished in the studio and posted to you to hand on. Additional guests beyond the guaranteed count can also be added at this rate.',
      tag: '$30 / guest',
      small: 'From',
    },
    {
      h: 'Family portrait, A3',
      p: 'The two of you with your immediate family, painted larger on A3 from photographs you provide after the day.',
      tag: '$500',
    },
    {
      h: 'Bridal party, A3',
      p: 'A group portrait of the bridal party on A3, commemorating the people closest to you on the day.',
      tag: '$500',
    },
    {
      h: 'Spot illustrations',
      p: 'Small paintings of the details: the venue, the cake, glasses raised, quiet corners of the night.',
      tag: '$120 / each',
    },
    {
      h: 'Extra live hours',
      p: 'Stay longer through the reception, for more of the night and more guests painted.',
      tag: 'On enquiry',
    },
    {
      h: 'Studio commission',
      p: 'A portrait from your photographs, before or after the wedding, within about four weeks.',
      tag: 'On enquiry',
    },
    {
      h: 'Stationery licensing',
      p: 'A digital file of your portrait, licensed for save-the-dates, invitations and thank-you cards.',
      tag: 'On enquiry',
    },
    {
      h: 'Travel further afield',
      p: 'Regional Victoria and destination weddings beyond metropolitan Melbourne, gladly discussed.',
      tag: 'On enquiry',
    },
    {
      h: 'Wedding bouquet illustration',
      p: 'Your bouquet in full bloom, painted from photographs after the day. A floral keepsake on A3 cotton-rag paper; A2 available on request.',
      tag: '$550',
      small: 'A3 from',
      extra: '· A2 on enquiry',
    },
  ],
  licence:
    'A note on style. My work is an interpretation, not a literal likeness, and my style keeps evolving, so no two pieces are exact replicas. Booking assumes you are happy with that creative freedom. A 50% deposit holds your date, with the balance due two weeks before the day.',
}

export const BEYOND = {
  label: 'Beyond weddings',
  title: ['The same hand,', 'for any room.'],
  emphasis: 'for any room.',
  intro:
    'Live painting is just as at home away from a wedding. I work across Melbourne and Australia-wide, turning a few hours into keepsakes guests carry out the door.',
  cards: [
    {
      tag: 'Brand activations',
      title: 'A drawcard that lingers',
      body: 'Live portraits give people a reason to stop, watch and stay. Each guest leaves with a branded keepsake rather than another giveaway destined for the bin.',
    },
    {
      tag: 'Corporate events',
      title: 'Memorable, not corporate',
      body: 'Galas, launches and end-of-year nights. A quiet, elegant alternative to a photo booth that suits a considered room.',
    },
    {
      tag: 'Private celebrations',
      title: 'Milestones worth keeping',
      body: 'Birthdays, anniversaries and engagements. Smaller, warmer gatherings where guests go home with a small painting of their own.',
    },
  ],
}

export const FAQ = {
  label: 'Questions',
  title: 'The practical bits.',
  items: [
    {
      q: 'How far ahead should we book?',
      a: 'I am taking bookings up to about two months out for now, so reach out with your date and I will let you know what I have open. Earlier is always welcome, as I only take a limited number of weddings.',
    },
    {
      q: 'Do you paint live, or from photographs?',
      a: 'Both. The base package has me at your wedding, painting live through the reception, and we build on it with add-ons to suit your day. If you would rather a studio commission from your own photographs, before or after the day, I am glad to do that too, priced on enquiry.',
    },
    {
      q: 'How long do you paint on the day?',
      a: 'Three hours in the base package, and longer if you add hours, up to about five, usually through the reception with short breaks built in. I pace myself rather than paint flat out, so every piece stays as considered as the first.',
    },
    {
      q: 'How many guests can you paint?',
      a: 'I work to a minimum of 10 pieces per hour. For a three-hour booking that is at least 30 keepsakes. Any I do not reach on the night are finished in the studio and posted to you to hand on, so no guest misses out.',
    },
    {
      q: 'What materials do you use?',
      a: 'Professional watercolours on archival 300gsm A5 cotton paper, with lightfast pigments that hold their colour for decades when cared for. Everything is made to last.',
    },
    {
      q: 'When do we receive the finished work?',
      a: 'Guest keepsakes are finished on the night and go home with your guests. Your couple portrait is painted on the night too and left with you as I finish. Studio commissions from photographs arrive within four weeks.',
    },
    {
      q: 'Do you travel?',
      a: 'Travel is included for venues within about 1.5 hours of the Melbourne CBD. Anywhere further, including regional Victoria and destination weddings, I am glad to discuss, with travel quoted on enquiry. Just include your venue and I will let you know.',
    },
    {
      q: 'Do you frame the work?',
      a: 'I do not frame pieces. Everything comes to you on beautiful cotton-rag paper, sleeved and ready for a framer you love. I am happy to suggest framers if that helps.',
    },
    {
      q: 'Do we get a digital copy?',
      a: 'Yes. Every couple receives a high-resolution scan of their portrait to keep and reprint, for thank-you cards and the like. If you would like a file licensed specifically for stationery, just ask.',
    },
    {
      q: 'How do we secure our date?',
      a: 'A 50% deposit holds your date, with the balance due two weeks before the wedding. I only confirm a booking once the deposit is received, so your date is yours from that point.',
    },
    {
      q: 'What if we need to postpone or cancel?',
      a: 'Weddings move, and I understand that. Cancel more than two months ahead and your deposit is refunded in full. More than two weeks ahead, half the deposit is refunded. Within two weeks of the day, the deposit is non-refundable, as it reserves time I turn away other couples to hold. If you would rather postpone, your deposit transfers to a new date subject to my availability. Full terms are set out in your booking agreement.',
    },
    {
      q: 'What do you need from us on the day?',
      a: 'Very little. One table around 100 by 60cm at seated height with room for a front-facing chair underneath, one chair, and somewhere I can stand for a short break each hour. I bring everything else. Light refreshments are always welcome but never expected.',
    },
    {
      q: 'Do you paint events other than weddings?',
      a: 'Yes. Alongside weddings I take on brand activations, corporate events and private celebrations across Melbourne and Australia-wide. The format flexes to the room, so tell me what you have in mind and I will shape it to suit.',
    },
    {
      q: 'How should we send photos for a commission?',
      a: 'The clearer the photographs, the better the portrait. Send a few well-lit, high-resolution images that show your faces clearly, and let me know which one feels most like you. I will guide you from there.',
    },
  ],
}

export const ENQUIRY = {
  label: 'Enquire',
  title: ['Tell me about', 'your day.'],
  emphasis: 'your day.',
  intro:
    'A few details to start. I read and reply to every enquiry myself, usually within a few days.',
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
    body: 'Your enquiry is with me. I will read it properly and write back soon, usually within a few days.',
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
  instagram: 'https://www.instagram.com/christopherwangpaints',
}

export const NAV = [
  { href: '#why', label: 'Why' },
  { href: '#process', label: 'How it works' },
  { href: '#offerings', label: 'Packages' },
  { href: '#faq', label: 'Questions' },
]
