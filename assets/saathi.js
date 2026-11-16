/* =====================================================================
   SAATHI — a rule-based assistant for the Raajlaxmi site
   =====================================================================
   Saathi (साथी, "companion") answers the questions this site already has
   answers to. It is a KEYWORD MATCHER AND NOTHING MORE: no model, no API,
   no key, no network call of its own. That is the whole design, and it is
   why it keeps working with Sanity unreachable and with the network off
   once the page has loaded.

   THE FALLBACK IS THE MOST IMPORTANT ANSWER IN HERE. A matcher only knows
   what it has been taught, so everything it has not been taught has to end
   somewhere useful: the telephone number and a link to book a visit. It
   never guesses, never invents a price and never claims a property is
   available.

   WHAT IT DELIBERATELY DOES NOT SAY. No figures, no project names, no
   counts, no availability. All four change in the Studio without anyone
   touching this file, and a bot confidently quoting last month's price is
   worse than one that says "the team will confirm". Questions of that kind
   are routed to a human on purpose, not by omission.

   The telephone number and email are read from `site-settings` through the
   page's own memoised RL.get, so they cannot drift from the footer. The
   constants below are only the offline fallback.
   ===================================================================== */
(function () {
  'use strict';

  var PHONE = '+91 77740 00939';
  var EMAIL = 'info@raajlaxmigroup.com';
  var TYPING_MS = 420;       /* see .sa-typing in saathi.css for why */
  var KEEP = 40;             /* transcript messages kept per tab session */

  var telHref = function (p) { return 'tel:+' + String(p).replace(/\D/g, ''); };

  /* ------------------------------------------------------------------
     THE CORPUS.  Each intent is {id, k:[keywords], a:answer, act:[actions],
     chips:[follow-ups]}.  Keywords are matched on word boundaries, so "oc"
     cannot match "location" — that is the one thing to preserve if this is
     ever rewritten.  Hinglish spellings sit beside the English ones because
     this is Vasai-Virar and people type "ghar" and "kitna" as readily as
     "home" and "how much".
     ------------------------------------------------------------------ */
  var FAQ = [
    { id: 'greet',
      k: ['hi', 'hii', 'hey', 'hello', 'helo', 'namaste', 'namaskar', 'good morning',
          'good afternoon', 'good evening'],
      a: 'Namaste. I am Saathi, and I can answer the usual questions about Raajlaxmi Group — where we build, what we offer, how a booking works.\n\nWhat would you like to know?',
      chips: ['What can you do?', 'Where do you build?', 'Book a site visit', 'Talk to someone'] },

    /* ------------------------------------------------------------------
       SMALL TALK, AND WHY A PROPERTY BOT NEEDS IT. The first thing a lot of
       people type into a chat window is not about property at all - "how are
       you", "are you a bot", "what can you do" - and answering those with
       "that one is beyond me, here is a telephone number" is a cold start
       that makes the rest of the conversation less likely to happen.

       EVERY ONE OF THESE STILL ENDS BY OFFERING SOMETHING USEFUL. They are
       one civil exchange, not a personality; the bot gets back to what it is
       for in the same breath. None of them invents a fact about the company.
       ------------------------------------------------------------------ */
    { id: 'howareyou',
      k: ['how are you', 'how are u', 'how r u', 'how do you do', 'hows it going',
          'how is it going', 'how have you been', 'how you doing', 'you doing well',
          'kaise ho', 'kaise hain', 'kya haal', 'kya haal hai', 'whats up',
          'what is up', 'wassup'],
      exact: ['sup'],
      a: 'Very well, thank you for asking — and ready when you are.\n\nI know the usual questions about Raajlaxmi Group: where we build, what we offer, and how a booking works. What can I find for you?',
      chips: ['What can you do?', 'Where do you build?', 'Book a site visit'] },

    { id: 'identity',
      k: ['who are you', 'about you', 'what is your name', 'whats your name',
          'your name', 'who am i talking to', 'who is this', 'what are you called',
          'saathi', 'naam kya hai', 'tumhara naam', 'introduce yourself'],
      a: 'I am Saathi — साथी, which means companion. I am the assistant on Raajlaxmi Group\'s website, here to answer the straightforward questions so nothing has to wait for office hours.\n\nFor anything I cannot answer, our team is one call away.',
      chips: ['What can you do?', 'About Raajlaxmi', 'Talk to someone'] },

    { id: 'bot',
      k: ['are you a bot', 'are you bot', 'is this a bot', 'are you human',
          'are you real', 'are you a robot', 'are you a person', 'you a real person',
          'are you a real', 'r u a bot', 'r u human',
          'are you ai', 'artificial intelligence', 'chatgpt', 'automated', 'machine',
          'robot', 'am i talking to a human', 'bot'],
      a: 'A bot, and a simple one — I match what you type against a list of questions I have been taught, and that is the whole of it. There is no cleverness behind the curtain.\n\nSo please do not take my word for anything that matters. On price, availability and paperwork, our team is the authority and I am not.',
      chips: ['Talk to someone', 'What can you do?', 'Book a site visit'] },

    { id: 'capabilities',
      k: ['what can you do', 'what can u do', 'what do you know', 'what can you help',
          'how can you help', 'how can u help', 'what can i ask', 'what should i ask',
          'what all can you', 'your options', 'show options', 'menu', 'capabilities',
          'help me'],
      a: 'A fair number of the ordinary ones. I can tell you about:\n\n•  where we build, and what sizes we offer\n•  how a site visit or a booking works\n•  what to expect on price, and the EMI calculator\n•  our office address and opening hours\n•  RERA, possession and redevelopment\n•  amenities, brochures and client reviews\n\nAnything past that I hand straight to our team rather than guess at it.',
      chips: ['Where do you build?', 'Price range?', 'Book a site visit', 'Talk to someone'] },

    /* MATCHED ONLY AS A WHOLE MESSAGE, never as keywords - see `exact` in
       match(). "no" on its own is an answer; "no parking" is a question about
       parking, and a keyword list cannot tell those apart. */
    { id: 'ack',
      k: [],
      exact: ['ok', 'okay', 'k', 'kk', 'yes', 'yeah', 'yep', 'yup', 'no', 'nope',
              'hmm', 'hmmm', 'hm', 'achha', 'acha', 'theek hai', 'thik hai', 'sure',
              'fine', 'alright', 'all right', 'got it', 'understood', 'right',
              'cool', 'nice', 'great', 'done'],
      a: 'Right. Anything else I can look up for you?',
      chips: ['Where do you build?', 'Book a site visit', 'Talk to someone'] },

    { id: 'present',
      k: ['are you there', 'are u there', 'you there', 'anyone there', 'still there',
          'are you online', 'are you available', 'hello hello'],
      a: 'Still here. Ask away.',
      chips: ['What can you do?', 'Where do you build?', 'Book a site visit'] },

    { id: 'joke',
      k: ['!joke', '!jokes', '!funny', 'make me laugh', 'entertain me',
          'something funny', 'tell me a joke', 'crack a joke'],
      exact: ['lol', 'haha', 'hehe', 'hahaha', 'lmao', 'rofl'],
      a: 'I would make a poor comedian — I only know houses.\n\nThough we are rather good at the part where you get the keys.',
      chips: ['Where do you build?', 'Book a site visit'] },

    { id: 'maker',
      k: ['who made you', 'who built you', 'who created you', 'who developed you',
          'who made this', 'who built this', 'who designed', 'your developer',
          'your creator'],
      a: 'I was built for Raajlaxmi Group, to sit on this site and answer the questions that come up most often.\n\nIf something I say here is wrong or out of date, telling the team is the quickest way to get it put right.',
      chips: ['Talk to someone', 'What can you do?'] },

    { id: 'language',
      k: ['do you speak', 'speak hindi', 'speak marathi', 'speak english', 'in hindi',
          'hindi me', 'marathi', 'which language', 'language', 'samajhte',
          'samajh aata'],
      a: 'I read English, and Hinglish along with it — type "ghar", "kitna" or "kahan" and I will usually follow.\n\nOur team speaks Hindi, Marathi and English, so a call is easy in whichever suits you.',
      chips: ['Talk to someone', 'Book a site visit'] },

    { id: 'callme',
      k: ['call me', 'call me back', 'callback', 'call back', 'can you call',
          'ring me', 'phone me', 'give me a call', 'reach out to me', 'contact me',
          'get in touch with me'],
      a: 'Gladly. Leave your name and number on the enquiry form and the team will ring you back.\n\nIf you would rather not wait, the number below reaches them directly.',
      act: [['Request a call back', 'contact.html#ctForm'],
            ['Call ' + PHONE, telHref(PHONE), 'tel']],
      chips: ['Book a site visit', 'Where do you build?'] },

    { id: 'browsing',
      k: ['just looking', 'just browsing', 'only looking', 'just checking',
          'nothing for now', 'maybe later', 'not now', 'no thanks', 'not interested'],
      a: 'Of course — look as long as you like, there is nobody waiting to pounce.\n\nI will be here if a question comes up.',
      chips: ['Browse properties', 'Where do you build?'] },

    { id: 'complaint',
      k: ['complaint', 'complain', 'grievance', 'problem with', 'issue with',
          'unhappy', 'disappointed', 'poor service', 'bad service', 'not happy',
          'cheated', 'fraud', 'delay in possession'],
      a: 'I am sorry to hear it, and I am the wrong one to fix it — this wants a person who can actually act on it.\n\nPlease call ' + PHONE + ', or send the details through the enquiry form so there is a written record of them.',
      act: [['Call ' + PHONE, telHref(PHONE), 'tel'],
            ['Put it in writing', 'contact.html#ctForm']],
      chips: ['Where is your office?'] },

    { id: 'rude',
      k: ['stupid', 'useless', 'rubbish', 'nonsense', 'idiot', 'shut up', 'worst',
          'terrible', 'hate you', 'you suck', 'waste of time'],
      a: 'That is fair enough — I am limited, and I would rather hand you to someone who is not.\n\nOur team is on ' + PHONE + ' and will do better than I can.',
      act: [['Call ' + PHONE, telHref(PHONE), 'tel'],
            ['Request a call back', 'contact.html#ctForm']],
      chips: ['Talk to someone'] },

    { id: 'projects',
      k: ['project', 'projects', 'property', 'properties', 'flat', 'flats', 'home',
          'homes', 'ghar', 'apartment', 'apartments', 'building', 'scheme', 'listing',
          'what do you have', 'show me'],
      a: 'We build along the Western line, and our properties are listed in three groups — completed, ongoing and redevelopment.\n\nThe collection page lets you filter by town, configuration and budget, which is the quickest way to find something that fits.',
      act: [['Browse all properties', 'projects.html'],
            ['Ongoing projects', 'projects-ongoing.html']],
      chips: ['Where do you build?', 'What sizes do you offer?', 'Book a site visit'] },

    { id: 'location',
      k: ['where', 'where do you build', 'where do you', 'location', 'locations', 'area',
          'areas', 'which area', 'which areas', 'kahan', 'kaha', 'town', 'towns',
          'city', '!vasai', '!virar', 'nallasopara', 'nalasopara', 'saphale', 'western line',
          'which place', 'locality', 'build', 'building in', 'operate', 'based'],
      a: 'Four towns along the Western line: Vasai, Nallasopara, Virar and Saphale.\n\nYou can filter the collection by any one of them.',
      act: [['See properties by town', 'projects.html']],
      chips: ['What sizes do you offer?', 'Book a site visit', 'Where is your office?'] },

    { id: 'price',
      k: ['!price', '!prices', '!cost', '!costs', '!rate', '!rates', 'budget', 'kitna', 'kitne',
          'kimat', 'keemat', 'paisa', 'expensive', 'cheap', 'affordable', 'crore', 'cr',
          'lacs', 'lakh', 'lakhs', 'how much', 'quotation', 'quote'],
      a: 'Prices differ by project and by configuration, and they move — so I would rather not quote you a figure that has gone stale.\n\nEvery listing shows its own starting price, and you can filter the collection by budget band. For a firm number on a particular flat, our team is the right place to ask.',
      act: [['Filter by budget', 'projects.html'],
            ['Work out the EMI', 'emi.html']],
      chips: ['Talk to someone', 'Book a site visit', 'Home loan / EMI'] },

    { id: 'config',
      k: ['!bhk', 'one bhk', 'two bhk', 'three bhk', 'carpet',
          'carpet area', '!size', '!sizes', 'sq ft', 'sqft', 'square feet', 'configuration',
          'layout', 'rooms', 'bedroom', 'bedrooms', 'kamra', 'jodi', 'shop', 'shops',
          'office space'],
      a: 'Mostly 1, 2 and 3 BHK homes, and a few projects also carry shops and office units.\n\nEach listing prints the carpet area against each configuration, so you can see exactly what a 1 BHK measures in that particular building.',
      act: [['See the configurations', 'projects.html']],
      chips: ['Price range?', 'Book a site visit', 'Download a brochure'] },

    { id: 'visit',
      k: ['!visit', 'site visit', 'viewing', 'appointment', 'schedule', 'book', 'booking',
          'meet', 'meeting', 'tour', 'see the flat', 'see the property', 'come', 'dekhna',
          'consultation', 'site'],
      a: 'Gladly — a site visit is the best way to judge a home.\n\nLeave your details on the enquiry form and our team will call to fix a time that suits you. You can also ring us directly.',
      act: [['Schedule a visit', 'contact.html#ctForm'],
            ['Call ' + PHONE, telHref(PHONE), 'tel']],
      chips: ['Where do you build?', 'Where is your office?'] },

    { id: 'brochure',
      k: ['!brochure', 'brochures', '!pdf', 'catalogue', 'catalog', 'floor plan', 'floorplan',
          'plan', 'plans', 'drawing', 'layout plan', 'details', 'specification',
          'specifications'],
      a: 'Each property page carries its own brochure. Open the project you are interested in and use the brochure button — we ask for a name and a number first so the team knows who to follow up with.',
      act: [['Find a property', 'projects.html']],
      chips: ['Book a site visit', 'Talk to someone'] },

    { id: 'emi',
      k: ['!emi', '!loan', 'loans', 'home loan', 'finance', 'financing', 'bank', 'banks',
          'instalment', 'installment', 'interest', 'interest rate', 'mortgage',
          'down payment', 'downpayment', 'tenure', 'monthly payment', 'kist',
          'calculator', 'calculate', 'repayment'],
      a: 'There is an EMI calculator on the site — put in a price, a deposit, a rate and a tenure and it gives you the monthly instalment.\n\nIt is an estimate only: it leaves out stamp duty, registration, GST and bank charges. For what a bank will actually sanction, our team can point you at the lenders we work with.',
      act: [['Open the EMI calculator', 'emi.html'],
            ['Talk to the team', 'contact.html#ctForm']],
      chips: ['Price range?', 'Book a site visit'] },

    { id: 'contact',
      k: ['contact', '!phone', 'number', 'mobile', '!call', 'calling', 'email', 'mail',
          'reach', 'reach you', 'talk', 'speak', 'whatsapp', 'enquiry', 'inquiry',
          'get in touch'],
      a: 'You can reach us on ' + PHONE + ', or write to ' + EMAIL + '.\n\nIf it is easier, leave your details on the enquiry form and we will call you back.',
      act: [['Call ' + PHONE, telHref(PHONE), 'tel'],
            ['Send an enquiry', 'contact.html#ctForm']],
      chips: ['Where is your office?', 'Book a site visit'] },

    { id: 'office',
      k: ['office', 'address', 'head office', '!timing', '!timings', '!hours', 'open',
          'opening', 'closed', 'closing', 'when are you open', 'working hours', 'sunday',
          'monday', 'saturday', 'directions', 'reach office'],
      a: 'Our office is at Building No. 1, Kala Kutir, Office 1 & 2, Dongarpada Road, Y. K. Nagar, Virar (West), Vasai-Virar, Maharashtra 401303.\n\nMonday to Saturday, 10:00 AM to 7:00 PM. Visitors are welcome — an appointment simply means we can give you our full attention.',
      act: [['Directions and map', 'contact.html'],
            ['Call ahead', telHref(PHONE), 'tel']],
      chips: ['Book a site visit', 'Where do you build?'] },

    { id: 'about',
      /* `who are you` and `about you` went to the `identity` intent on
         16 Nov: in a chat window those are questions about the bot, not about
         the developer. `about raajlaxmi` and the company words stay here. */
      k: ['about', 'who is', 'company', 'group', 'builder',
          'developer', 'experience', 'history', 'background', 'trust', 'reliable',
          'kaun', 'raajlaxmi', 'rajlaxmi'],
      a: 'Raajlaxmi Group builds homes along the Vasai-Virar belt — residential projects, and society redevelopment.\n\nThe about section on the home page covers the work and the track record better than I can in a chat bubble.',
      act: [['About Raajlaxmi', 'index.html#about'],
            ['What clients say', 'testimonials.html']],
      chips: ['Where do you build?', 'Is it RERA registered?'] },

    { id: 'rera',
      k: ['!rera', 'maharera', 'legal', 'legality', 'approval', 'approved', 'approvals',
          'registration', 'registered', 'document', 'documents', 'documentation',
          'paperwork', 'credai', 'clearance', 'title', 'genuine'],
      a: 'Our projects are MahaRERA registered and we are a CREDAI-MCHI member.\n\nThe RERA number for any particular project, and the title and approval papers behind it, are things our team will give you in writing — please ask them directly rather than taking it from me.',
      act: [['Ask for the papers', 'contact.html#ctForm'],
            ['Call ' + PHONE, telHref(PHONE), 'tel']],
      chips: ['Book a site visit', 'About Raajlaxmi'] },

    { id: 'possession',
      k: ['possession', 'ready', 'ready to move', 'move in', 'handover', 'hand over',
          '!oc', 'occupancy', 'occupancy certificate', 'completion', 'when ready',
          'delivery', 'kab milega', 'timeline'],
      a: 'It depends on the project: the completed ones are ready to move into, and the ongoing ones each have their own schedule.\n\nEach listing is filed under completed, ongoing or redevelopment so you can see at a glance. For a date on a particular building, our team will give you the current position.',
      act: [['Completed projects', 'projects.html?status=completed'],
            ['Ongoing projects', 'projects-ongoing.html']],
      chips: ['Book a site visit', 'Talk to someone'] },

    { id: 'soldout',
      k: ['!sold', 'sold out', 'available', 'availability', 'left', 'remaining', 'vacant',
          'booked', 'in stock', 'khali', 'bacha'],
      a: 'Some of our completed projects are sold out, and the cards on the collection page say so.\n\nAvailability changes quickly though, so for what is genuinely free in a particular building today, please ask the team — I would rather you heard it from them than from me.',
      act: [['See the collection', 'projects.html'],
            ['Call ' + PHONE, telHref(PHONE), 'tel']],
      chips: ['Book a site visit', 'Where do you build?'] },

    { id: 'redevelopment',
      k: ['redevelopment', 'redevelop', 'society', 'societies', 'old building',
          'tenant', 'tenants', 'member', 'committee', 'self redevelopment', 'punarvikas'],
      a: 'Yes — society redevelopment is a large part of what we do, and there is a dedicated listing for it.\n\nIf you are on a society committee weighing it up, the right next step is a conversation rather than a chat window.',
      act: [['Redevelopment projects', 'projects-redevelopment.html'],
            ['Speak to the team', 'contact.html#ctForm']],
      chips: ['About Raajlaxmi', 'Talk to someone'] },

    { id: 'amenities',
      k: ['amenity', 'amenities', 'facility', 'facilities', '!parking', '!lift', 'elevator',
          '!gym', '!garden', 'security', 'playground', 'play area', '!pool', 'clubhouse',
          'power backup', 'water', 'cctv'],
      a: 'Amenities differ from building to building — parking, lifts, power backup, landscaped space, security and play areas are the usual ones.\n\nEach property page lists what that particular project has, which is more reliable than a general answer.',
      act: [['See a property', 'projects.html']],
      chips: ['Book a site visit', 'Download a brochure'] },

    { id: 'reviews',
      k: ['review', 'reviews', 'testimonial', 'testimonials', 'feedback', 'rating',
          'ratings', 'google review', 'customer', 'customers', 'client', 'clients',
          'what people say'],
      a: 'There is a page of client reviews, and they are genuine Google reviews with links back to the originals.',
      act: [['Read the reviews', 'testimonials.html']],
      chips: ['About Raajlaxmi', 'Book a site visit'] },

    { id: 'services',
      k: ['service', 'services', 'what do you do', 'what do you offer', 'offer', 'help',
          'process', 'procedure', 'how does it work', 'steps', 'after sales', 'support'],
      a: 'We handle the whole path: consultation, site visits, investment advice, the documentation, and support after you have the keys.\n\nThe services page sets out each step in order.',
      act: [['Our services', 'services.html']],
      chips: ['Book a site visit', 'Home loan / EMI'] },

    { id: 'human',
      /* `bot` is gone from this list - the intent of that name answers it
         honestly now, and still offers a person. `real person` stays, because
         "talk to a real person" belongs here while "are you a real person"
         is matched by a phrase on `bot`, which sits earlier and takes ties. */
      k: ['human', 'person', 'agent', 'executive', 'someone', 'somebody', 'real person',
          'talk to someone', 'talk to a human', 'customer care', 'support team',
          'sales', 'manager', 'advisor'],
      a: 'Of course — I am only a simple assistant, and a person will serve you better.\n\nCall ' + PHONE + ' and the team will pick up, or leave your details and they will ring you back.',
      act: [['Call ' + PHONE, telHref(PHONE), 'tel'],
            ['Request a call back', 'contact.html#ctForm']],
      chips: ['Book a site visit', 'Where is your office?'] },

    { id: 'thanks',
      k: ['thank', 'thanks', 'thankyou', 'thank you', 'shukriya', 'dhanyavad', 'dhanyawad',
          'great', 'nice', 'helpful', 'ok thanks'],
      a: 'My pleasure. If anything else comes up, I am here — and the team is on ' + PHONE + ' whenever you would rather speak to a person.',
      chips: ['Book a site visit', 'Browse properties'] },

    { id: 'bye',
      k: ['!bye', 'goodbye', 'good bye', 'see you', 'later', 'alvida', 'chalta hu',
          'that is all', 'nothing else'],
      exact: ['bye', 'byee', 'ok bye', 'bye bye', 'tata'],
      a: 'Thank you for visiting. Do call ' + PHONE + ' whenever you are ready — we would be glad to show you around.',
      chips: ['Book a site visit'] }
  ];

  /* A CHIP RESOLVES TO ITS INTENT DIRECTLY AND NEVER THROUGH THE MATCHER.
     This is not an optimisation. The first cut routed a tapped chip back
     through match() like any typed sentence, and "Where do you build?" —
     a chip this file itself offers — scored one point and fell through to
     "that one is beyond me". A suggestion the bot makes and then cannot
     answer is the worst thing a rule-based bot can do, so the label and
     the answer are bound here rather than hoping the keywords cover it.
     Typed text still goes through the matcher, which is what the keyword
     lists are for. Every label used in a `chips` array above must appear
     here; anything missing falls back to matching and will probably work,
     but should be added. */
  var CHIP = {
    'Where do you build?': 'location',
    'Book a site visit': 'visit',
    'Home loan / EMI': 'emi',
    'Talk to someone': 'human',
    'What sizes do you offer?': 'config',
    'Price range?': 'price',
    'Where is your office?': 'office',
    'Download a brochure': 'brochure',
    'About Raajlaxmi': 'about',
    'Is it RERA registered?': 'rera',
    'Browse properties': 'projects',
    'What can you do?': 'capabilities'
  };

  function byId(id) {
    for (var i = 0; i < FAQ.length; i++) if (FAQ[i].id === id) return FAQ[i];
    return null;
  }

  /* The answer for everything the corpus does not cover. The brief for this
     bot in one paragraph: never guess, hand it to a person. */
  function fallback() {
    return {
      a: 'That one is beyond me, I am afraid — I only know the general questions about our projects and how a booking works.\n\nOur team will answer it properly. Call ' + PHONE + ', or schedule a visit and they will take you through it.',
      act: [['Call ' + PHONE, telHref(PHONE), 'tel'],
            ['Schedule a visit', 'contact.html#ctForm']],
      chips: ['Where do you build?', 'Price range?', 'Home loan / EMI']
    };
  }

  /* ------------------------------------------------------------------
     MATCHING.  Keywords are compiled once into boundary-anchored regexes;
     building 200-odd of them on every keystroke would be wasteful and this
     corpus never changes at runtime.  A multi-word phrase scores highest
     because it is the strongest evidence of intent, then a long word, then
     a short one — which is what stops "home loan" being answered by the
     projects intent merely because it contains "home".
     ------------------------------------------------------------------ */
  var rxEsc = function (s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); };

  FAQ.forEach(function (it) {
    it._rx = (it.k || []).map(function (w) {
      /* A LEADING "!" MARKS A KEYWORD THAT IS STRONG ON ITS OWN. Length is
         a poor proxy for how much a word tells you: "emi", "bhk", "oc" and
         "rera" are three or four letters and are the most specific things
         a visitor can type, while plenty of six-letter words are vague.
         Scored by length alone, "emi calculator" and "what sizes do you
         have" both fell through to the fallback on the live site. */
      var strong = w.charAt(0) === '!';
      if (strong) w = w.slice(1);
      return {
        re: new RegExp('(^|[^a-z0-9])' + rxEsc(w) + '([^a-z0-9]|$)', 'i'),
        w: strong ? 3 : (w.indexOf(' ') > -1 ? 4 : (w.length >= 6 ? 2 : 1))
      };
    });
  });

  function match(raw) {
    var t = ' ' + String(raw).toLowerCase().replace(/[^a-z0-9\s]/g, ' ')
                             .replace(/\s+/g, ' ').trim() + ' ';
    if (!t.trim()) return null;
    /* AN EXACT WHOLE-MESSAGE MATCH WINS OUTRIGHT, before any scoring. It is
       the only way to answer "no" without also answering "no parking": a
       one-word reply is an acknowledgement, the same word inside a sentence
       is not. Keyword scoring could never tell those apart, and marking such
       words strong would have made it worse. */
    var whole = t.trim();
    for (var e = 0; e < FAQ.length; e++) {
      if (FAQ[e].exact && FAQ[e].exact.indexOf(whole) > -1) return FAQ[e];
    }
    var best = null, bestScore = 0;
    FAQ.forEach(function (it) {
      var s = 0;
      it._rx.forEach(function (r) { if (r.re.test(t)) s += r.w; });
      if (s > bestScore) { bestScore = s; best = it; }
    });
    /* A single short keyword is not enough on its own: "ok" or "no" would
       otherwise pull an answer out of whichever intent happened to list a
       two-letter word. Two points is one long word, or two short ones. */
    return bestScore >= 2 ? best : null;
  }

  /* ---------------------------------------------------------------- DOM */
  var root = document.documentElement;
  /* The client's own robot mark, supplied as artwork. It is a FINISHED
     CIRCULAR BUTTON — a blue disc with the robot knocked out of it — so it
     is sized to fill the launcher rather than sat inside it as a glyph, and
     the launcher's navy ground only shows in the open state behind the
     cross. It was cropped to the disc and given a real alpha channel; the
     white ground could not simply be keyed out, because the robot itself is
     white. See CLAUDE.md, *Saathi, the rule-based assistant*.
     `alt` is empty and it is aria-hidden on purpose: the button already has
     an accessible name, and a second one would be read twice. */
  var ICON_CHAT = '<img src="assets/saathi-icon.png" alt="" aria-hidden="true" ' +
                  'width="192" height="192" decoding="async">';
  var ICON_X = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';
  var ICON_AV = '<img src="assets/saathi-icon.png" alt="" aria-hidden="true" ' +
                'width="192" height="192" decoding="async">';
  var ICON_SEND = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12l16-8-6 16-2.4-6.2z"/></svg>';

  var launch = document.createElement('button');
  launch.type = 'button';
  launch.className = 'sa-launch';
  launch.id = 'saathiLaunch';
  launch.setAttribute('aria-label', 'Chat with Saathi');
  launch.setAttribute('aria-expanded', 'false');
  launch.setAttribute('aria-controls', 'saathiPanel');
  launch.innerHTML = '<span class="sa-chat">' + ICON_CHAT + '</span>'
                   + '<span class="sa-x">' + ICON_X + '</span>'
                   + '<span class="sa-dot"></span>';

  var panel = document.createElement('div');
  panel.className = 'sa-panel';
  panel.id = 'saathiPanel';
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-label', 'Saathi — Raajlaxmi assistant');
  panel.innerHTML =
    '<div class="sa-head">'
  +   '<span class="sa-av">' + ICON_AV + '</span>'
  +   '<div><div class="sa-name">Saathi</div>'
  +   '<div class="sa-sub"><i></i>Here to help</div></div>'
  + '</div>'
  + '<div class="sa-log" id="saathiLog" role="log" aria-live="polite" aria-atomic="false"></div>'
  + '<div class="sa-chips" id="saathiChips"></div>'
  + '<form class="sa-form" id="saathiForm">'
  +   '<input class="sa-in" id="saathiIn" type="text" autocomplete="off"'
  +        ' placeholder="Ask me something…" aria-label="Ask Saathi a question">'
  +   '<button class="sa-send" type="submit" aria-label="Send">' + ICON_SEND + '</button>'
  + '</form>';

  document.body.appendChild(launch);
  document.body.appendChild(panel);

  var log = panel.querySelector('#saathiLog');
  var chipRow = panel.querySelector('#saathiChips');
  var form = panel.querySelector('#saathiForm');
  var input = panel.querySelector('#saathiIn');

  /* -------------------------------------------------------------- storage
     The transcript survives a page change, because several answers link
     somewhere else on the site and losing the thread on arrival would make
     the bot feel broken. Session, not local: this visit's conversation, not
     a standing record. Every access is wrapped, as the rest of the site's
     storage is — private mode throws rather than returning null. */
  function load(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } }
  function save(k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} }

  var history = [];
  try { history = JSON.parse(load('rl-saathi') || '[]') || []; } catch (e) { history = []; }
  if (load('rl-saathi-seen')) root.classList.add('sa-seen');

  function remember(who, text) {
    history.push([who, text]);
    if (history.length > KEEP) history = history.slice(-KEEP);
    save('rl-saathi', JSON.stringify(history));
  }

  /* ------------------------------------------------------------ rendering
     NOTHING IS EVER WRITTEN AS MARKUP. Message bodies go in through
     textContent and actions are built as elements, so a visitor typing a
     tag sees a tag. The only innerHTML in this file is the static chrome
     above and the inline icons, none of which carries input. */
  function bubble(who, text) {
    var el = document.createElement('div');
    el.className = 'sa-msg ' + (who === 'me' ? 'sa-me' : 'sa-bot');
    el.textContent = text;
    log.appendChild(el);
    return el;
  }

  function actions(list) {
    if (!list || !list.length) return;
    var wrap = document.createElement('div');
    wrap.className = 'sa-chips';
    wrap.style.padding = '0';
    list.forEach(function (a) {
      var el = document.createElement('a');
      el.className = 'sa-chip';
      el.textContent = a[0];
      el.href = a[1];
      if (a[2] !== 'tel') el.rel = 'noopener';
      wrap.appendChild(el);
    });
    log.appendChild(wrap);
  }

  function chips(list) {
    chipRow.textContent = '';
    (list || []).forEach(function (label) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'sa-chip';
      b.textContent = label;
      b.addEventListener('click', function () { ask(label, CHIP[label]); });
      chipRow.appendChild(b);
    });
  }

  function toBottom() { log.scrollTop = log.scrollHeight; }

  var slow = window.matchMedia && window.matchMedia('(prefers-reduced-motion:reduce)');

  function reply(hit) {
    var dots = document.createElement('div');
    dots.className = 'sa-typing';
    dots.innerHTML = '<span></span><span></span><span></span>';
    log.appendChild(dots);
    toBottom();
    var wait = (slow && slow.matches) ? 0 : TYPING_MS;
    setTimeout(function () {
      dots.remove();
      bubble('bot', hit.a);
      remember('bot', hit.a);
      actions(hit.act);
      chips(hit.chips);
      toBottom();
    }, wait);
  }

  function ask(text, intentId) {
    var q = String(text || '').trim();
    if (!q) return;
    bubble('me', q);
    remember('me', q);
    chips([]);
    toBottom();
    reply((intentId && byId(intentId)) || match(q) || fallback());
  }

  /* --------------------------------------------------------------- opening */
  var GREET = FAQ[0];

  function paintHistory() {
    log.textContent = '';
    history.forEach(function (m) { bubble(m[0], m[1]); });
  }

  function open() {
    root.classList.add('sa-open', 'sa-seen');
    save('rl-saathi-seen', '1');
    launch.setAttribute('aria-expanded', 'true');
    launch.setAttribute('aria-label', 'Close Saathi');
    if (!history.length) {
      bubble('bot', GREET.a);
      remember('bot', GREET.a);
      chips(GREET.chips);
    } else if (!chipRow.children.length) {
      chips(GREET.chips);
    }
    toBottom();
    /* Focus the field, but not on a phone: the on-screen keyboard would
       take half the panel the moment it opened, before anything is read. */
    if (!window.matchMedia('(max-width:620px)').matches) {
      setTimeout(function () { input.focus(); }, 320);
    }
  }

  function close() {
    root.classList.remove('sa-open');
    launch.setAttribute('aria-expanded', 'false');
    launch.setAttribute('aria-label', 'Chat with Saathi');
    launch.focus();
  }

  paintHistory();

  launch.addEventListener('click', function () {
    root.classList.contains('sa-open') ? close() : open();
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var v = input.value;
    input.value = '';
    ask(v);
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && root.classList.contains('sa-open')) close();
  });

  /* A click outside closes it, as the hero capsule and the owner panel both
     do. pointerdown rather than click so it cannot race the launcher's own
     click, and the launcher is excluded or the two would cancel out. */
  document.addEventListener('pointerdown', function (e) {
    if (!root.classList.contains('sa-open')) return;
    if (panel.contains(e.target) || launch.contains(e.target)) return;
    close();
  });

  /* -------------------------------------------------- the live telephone
     Read from the same site-settings document the footer and the WhatsApp
     button read, through the page's own memoised RL.get — so this shares
     their request rather than making a thirteenth. The constants above are
     the offline fallback and the answers are rebuilt only if the CMS
     actually carries something different. */
  try {
    if (window.RL && RL.q && RL.q.settings && typeof RL.get === 'function') {
      RL.get(RL.q.settings).then(function (r) {
        var d = r && r.result;
        if (!d) return;
        var p = typeof d.phone === 'string' ? d.phone.trim() : '';
        var m = typeof d.email === 'string' ? d.email.trim() : '';
        if ((!p || p === PHONE) && (!m || m === EMAIL)) return;
        var oldP = PHONE, oldE = EMAIL;
        if (p) PHONE = p;
        if (m) EMAIL = m;
        /* The number is written into several answers, so they are patched
           rather than re-authored: a replace over the two old strings keeps
           this to one place and cannot miss one. */
        FAQ.forEach(function (it) {
          it.a = it.a.split(oldP).join(PHONE).split(oldE).join(EMAIL);
          (it.act || []).forEach(function (a) {
            a[0] = a[0].split(oldP).join(PHONE);
            if (a[2] === 'tel') a[1] = telHref(PHONE);
          });
        });
      }).catch(function () { /* keep the built-in number */ });
    }
  } catch (e) { /* keep the built-in number */ }
})();
