/* Fills the three legal pages with the copy that is written into
   privacy.html, terms.html and disclaimer.html, so the client opens a filled
   form rather than a blank one and edits what is actually on the site.

   GENERATED. The copy lives in one place and this file is written from it, so
   the documents and the HTML fallbacks cannot drift apart. Re-generating it is
   how you change it.

   Safe to re-run only on a fresh dataset: it createOrReplaces all three and
   will DISCARD the client's edits, like every other seed here.

     cd studio && npx sanity exec scripts/seed-legal.mjs --with-user-token

   NOTE: this copy is a drafted starting point, not legal advice, and it carries
   [bracketed blanks] where it needs facts only the client has - the registered
   entity, the CIN, the registered office, RERA numbers, the Grievance Officer
   and the jurisdiction city. It wants a lawyer's eye before launch. */
import {getCliClient} from 'sanity/cli'

const client = getCliClient()

const PAGES = [
  {
    "_id": "legal-privacy",
    "label": "Legal",
    "title": "Privacy Policy",
    "updated": "2026-11-02",
    "intro": "This policy explains what personal information Raajlaxmi Group collects through this website, why we collect it, who we share it with and what you can ask us to do about it. It applies to this website and to enquiries that reach us through it.",
    "sections": [
      {
        "heading": "Who we are",
        "body": "Raajlaxmi Group (\"we\", \"us\", \"our\") is a real-estate developer operating along the Western line in the Mumbai Metropolitan Region. The entity responsible for the information described in this policy is [registered entity name], a company registered in India under CIN [CIN], with its registered office at [registered office address].\n\nFor any question about this policy, write to us at info@raajlaxmigroup.com."
      },
      {
        "heading": "What we collect",
        "body": "We collect only what you give us and a small amount of technical information that any website receives.\n\nInformation you give us: your name, telephone number, email address and the locality, configuration or budget you are interested in, when you submit the enquiry form, the callback form or contact us by phone, email or WhatsApp.\n\nInformation we receive automatically: your IP address, browser and device type, the pages you visit and the time of your visit. This is ordinary server and analytics data and we do not use it to identify you.\n\nWe do not ask for, and ask you not to send us, financial account details, identity-document numbers or any sensitive personal data through this website."
      },
      {
        "heading": "Why we collect it, and your consent",
        "body": "We use your information to respond to your enquiry, arrange a site visit, send you project information you have asked for, and keep a record of what was discussed. We process it on the basis of the consent you give when you submit a form, and for the limited purposes described here, as contemplated by the Digital Personal Data Protection Act, 2023.\n\nBy submitting an enquiry you agree that we, our sales team and our authorised channel partners may contact you about it by telephone, SMS, email or WhatsApp. This consent operates notwithstanding any registration you may hold on the National Do Not Call Registry, and you may withdraw it at any time by writing to info@raajlaxmigroup.com."
      },
      {
        "heading": "Who we share it with",
        "body": "We share your information only with: our own employees and sales team; the authorised channel partners handling the project you enquired about; and service providers who host this site, send our email or run our analytics, who may process it only on our instructions.\n\nWe also disclose information where the law requires it, or where it is necessary to establish or defend a legal claim.\n\nWe do not sell your personal information, and we do not share it with anyone for their own marketing."
      },
      {
        "heading": "Cookies and analytics",
        "body": "This website uses a small number of cookies and similar storage to remember your preferences within a visit — for example, so the opening animation does not replay on every page. We also use analytics to understand which pages are read and how visitors arrive.\n\nYou can block or delete cookies in your browser settings. The site is built to work without them, though some conveniences will reset on each page."
      },
      {
        "heading": "How long we keep it",
        "body": "We keep enquiry records for as long as the enquiry is live and for a reasonable period afterwards, so that we can answer questions about what was discussed and meet our legal and accounting obligations. Where you have become a customer, we keep records for the period required by the Real Estate (Regulation and Development) Act, 2016 and by tax and company law. After that we delete them or remove anything that identifies you."
      },
      {
        "heading": "How we protect it",
        "body": "We take reasonable technical and organisational measures to protect your information, including access control and encrypted transmission. No method of transmission or storage is completely secure, and we cannot guarantee absolute security — but we will tell you and the authorities about a breach where the law requires it."
      },
      {
        "heading": "Your rights",
        "body": "You may ask us to give you a copy of the information we hold about you, correct anything inaccurate or incomplete, delete it where we no longer need it, or withdraw consent you have given. You may also nominate another person to exercise these rights if you are unable to.\n\nWrite to info@raajlaxmigroup.com and we will respond within the period the law allows. We may need to verify who you are before we act."
      },
      {
        "heading": "Children",
        "body": "This website is not directed at children, and we do not knowingly collect information from anyone under 18. If you believe a child has given us information, write to us and we will delete it."
      },
      {
        "heading": "Changes to this policy",
        "body": "We may update this policy as our practices or the law change. The date at the top of this page is when it was last revised; the current version is always the one published here."
      },
      {
        "heading": "Grievance Officer",
        "body": "If you are unhappy with how we have handled your information, you may contact our Grievance Officer, appointed under the Digital Personal Data Protection Act, 2023 and the Information Technology Act, 2000:\n\n[Grievance Officer name]\nRaajlaxmi Group, Shanti Niwas, Opp. Saraswati School, Station Road, Virar West\nEmail: [grievance officer email]\nTelephone: +91 77740 00939\n\nWe will acknowledge your complaint and respond within the period prescribed by law. If you remain dissatisfied you may approach the Data Protection Board of India."
      }
    ],
    "noteTitle": "Questions about your information",
    "noteBody": "Write to info@raajlaxmigroup.com and we will answer. If you would rather speak to someone, the number on this site reaches our office during business hours."
  },
  {
    "_id": "legal-terms",
    "label": "Legal",
    "title": "Terms of Use",
    "updated": "2026-11-02",
    "intro": "These terms govern your use of this website. By browsing it or sending us an enquiry through it, you accept them. If you do not accept them, please do not use the site.",
    "sections": [
      {
        "heading": "Nothing on this website is an offer",
        "body": "The information on this website is published for general information only. It is not an offer, an invitation to offer, or a contract of any kind, and no part of it should be relied on as the basis of a booking, a payment or any other commitment.\n\nYour rights and ours in respect of any apartment or unit arise only under the Agreement for Sale executed between us and registered under the Real Estate (Regulation and Development) Act, 2016, together with the allotment letter and the sanctioned plans. Where anything on this website differs from those documents, those documents prevail."
      },
      {
        "heading": "Accuracy, and RERA registration",
        "body": "We take care to keep this website current, but project information changes and some of what is shown is indicative. See the Disclaimer, which forms part of these terms.\n\nOur projects are registered with the Maharashtra Real Estate Regulatory Authority where registration is required. Registration numbers are available on request and at [https://maharera.maharashtra.gov.in]. Please verify the registration of any project before you commit to it."
      },
      {
        "heading": "Enquiries and how we contact you",
        "body": "When you submit an enquiry you confirm that the details you give are your own and are accurate, and you agree that we and our authorised channel partners may contact you about it by telephone, SMS, email or WhatsApp, notwithstanding any National Do Not Call registration. How we handle those details is set out in our Privacy Policy."
      },
      {
        "heading": "Intellectual property",
        "body": "The design of this website, its text, photographs, drawings, plans, logos and the Raajlaxmi name are owned by us or used by us under licence, and are protected by copyright and trade-mark law.\n\nYou may read the site and print or save pages for your own personal, non-commercial use. You may not copy, republish, adapt or use any part of it for any other purpose without our written permission.\n\nThird-party names and logos shown on this site — including those of the brands and suppliers used in our buildings — remain the property of their owners and are shown to describe the specification, not to claim any association or endorsement."
      },
      {
        "heading": "What you may not do",
        "body": "You may not use this website to break the law, to interfere with its operation or security, to collect data from it by automated means, to misrepresent yourself, or to transmit anything harmful. We may withdraw access to anyone who does."
      },
      {
        "heading": "Links to other sites",
        "body": "Where we link to another website — a regulator, a map provider, a social network — we do so for convenience. We do not control those sites, we are not responsible for their content, and a link is not an endorsement."
      },
      {
        "heading": "Availability",
        "body": "We do not promise that this website will be available without interruption or free of errors. We may change, suspend or withdraw any part of it at any time without notice."
      },
      {
        "heading": "Limitation of liability",
        "body": "To the extent permitted by law, we are not liable for any indirect or consequential loss, or for any loss of profit, opportunity or data, arising from your use of this website or your reliance on anything published on it.\n\nNothing in these terms limits any liability that cannot be limited under Indian law, or any right you have under the Real Estate (Regulation and Development) Act, 2016 or the Consumer Protection Act, 2019."
      },
      {
        "heading": "Changes to these terms",
        "body": "We may revise these terms from time to time. The date at the top of this page is when they were last revised, and the version published here is the one that applies."
      },
      {
        "heading": "Governing law and jurisdiction",
        "body": "These terms are governed by the laws of India. The courts at [city], Maharashtra have exclusive jurisdiction over any dispute arising out of this website or these terms, without prejudice to any remedy available to you under the Real Estate (Regulation and Development) Act, 2016."
      },
      {
        "heading": "Contact",
        "body": "Questions about these terms can be sent to info@raajlaxmigroup.com, or to Raajlaxmi Group, Shanti Niwas, Opp. Saraswati School, Station Road, Virar West."
      }
    ],
    "noteTitle": "The documents that actually bind us",
    "noteBody": "Nothing on this website creates rights or obligations. Those come from the Agreement for Sale registered under RERA, the allotment letter and the sanctioned plans — and where this site and those documents differ, those documents win."
  },
  {
    "_id": "legal-disclaimer",
    "label": "Legal",
    "title": "Disclaimer",
    "updated": "2026-11-02",
    "intro": "Please read this before relying on anything shown on this website. It applies to every page, every image and every figure published here, and it forms part of our Terms of Use.",
    "sections": [
      {
        "heading": "Images are artist’s impressions",
        "body": "Photographs, renders, elevations and interior views on this website are artist’s impressions created for illustration. They are not photographs of a completed unit unless expressly captioned as such.\n\nFurniture, fittings, appliances, landscaping, decorative items and vehicles shown in them are for presentation only and are not part of what is sold. Colours, finishes and textures reproduce differently on a screen and should be verified against the sample flat and the specification schedule."
      },
      {
        "heading": "Plans, specifications and amenities may change",
        "body": "Layouts, floor plans, dimensions, specifications and amenities shown here are tentative and subject to change — by us, by the architect, or as required by the competent authorities while approvals are granted or revised.\n\nAmenities described may be planned, under construction or proposed, and their provision, timing and operation may depend on approvals, on the formation of the society or association, or on arrangements with third parties."
      },
      {
        "heading": "Area, and what it means",
        "body": "Where an area is given, it is the carpet area as defined by the Real Estate (Regulation and Development) Act, 2016 unless stated otherwise. Built-up and super built-up figures, where shown, are indicative and are not the basis of sale. Minor variations between the stated area and the area on completion are dealt with as provided in the Agreement for Sale and under that Act."
      },
      {
        "heading": "Prices and charges",
        "body": "Prices shown on this website are indicative, are exclusive of applicable taxes, and may change without notice. Unless expressly stated, they do not include GST, stamp duty, registration charges, maintenance deposits, development or infrastructure charges, club or parking charges, or any other statutory levy.\n\nA price shown here is not a quotation and does not bind us."
      },
      {
        "heading": "Location maps and distances",
        "body": "Maps, location plans and distances to stations, highways, schools and other landmarks are indicative, are not to scale, and are given for orientation only. Travel times depend on traffic, route and mode. Please verify any distance that matters to your decision."
      },
      {
        "heading": "RERA registration",
        "body": "Our projects are registered with the Maharashtra Real Estate Regulatory Authority where registration is required under the Real Estate (Regulation and Development) Act, 2016. The registration number for a project, and the details filed with it, are available on request and on the Authority’s website at [https://maharera.maharashtra.gov.in].\n\nNothing on this website should be taken as a representation that a project is registered, or as an invitation to book a unit in an unregistered project."
      },
      {
        "heading": "Verify before you rely",
        "body": "Before making any decision or payment, please inspect the site, read the sanctioned plans, the title documents, the approvals and the Agreement for Sale, and satisfy yourself independently. We encourage you to take your own legal and financial advice.\n\nNo employee, agent or channel partner has authority to give any warranty or make any representation on our behalf beyond what is written in those documents."
      },
      {
        "heading": "Third-party brands",
        "body": "Brand names and logos of materials, fittings and suppliers shown on this website are the property of their respective owners. They are shown to describe the specification we intend to use, which may be substituted with an equivalent, and their appearance does not imply any association, sponsorship or endorsement."
      },
      {
        "heading": "No liability",
        "body": "This website is provided on an \"as is\" basis. To the extent permitted by law we accept no liability for any loss arising from reliance on anything published here. This does not affect your rights under the Real Estate (Regulation and Development) Act, 2016, the Consumer Protection Act, 2019, or the Agreement for Sale."
      }
    ],
    "noteTitle": "Before you commit",
    "noteBody": "Inspect the site, read the sanctioned plans and the Agreement for Sale, check the project's RERA registration, and take your own legal and financial advice. We are happy to put every document in front of you — write to info@raajlaxmigroup.com."
  }
]

for (const page of PAGES) {
  await client.createOrReplace({
    _id: page._id,
    _type: 'legalPage',
    label: page.label,
    title: page.title,
    updated: page.updated,
    intro: page.intro,
    sections: page.sections.map((s, i) => ({
      _key: `s${i}`,
      _type: 'object',
      heading: s.heading,
      body: s.body,
    })),
    noteTitle: page.noteTitle,
    noteBody: page.noteBody,
  })
  console.log(`seeded ${page._id} - ${page.title} (${page.sections.length} clauses)`)
}

console.log('\ndone. Three documents, under "Legal pages" in the sidebar.')
console.log('The same copy is written into the three HTML files as the offline')
console.log('fallback - change one and change the other, or they drift.')
