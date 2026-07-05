import type { FAQEntry } from '@/lib/reception-bot/faq-matcher';
import type { BotButton } from '@/lib/reception-bot/types';

// ── FAQ entries ────────────────────────────────────────────────────────────
export const FAQ_ENTRIES: FAQEntry[] = [
  {
    key: 'what_is_hype_on',
    keywords: ['what is hype on', 'what is hypeon', 'who are you', 'about you', 'tell me about'],
    variants: [
      "We're a YouTube performance agency, and we're also a content production studio. The work covers done-for-you growth: strategy, scripting, production, thumbnails and packaging, analytics, and multi-language expansion.",
      "Hype On Media is a YouTube agency with a full production studio in-house. We help creators and brands grow on YouTube end to end. Leave your email and the team will reach out to show you what that looks like in practice.",
      "We're two things in one: a YouTube performance agency and a content production studio. Drop your email and one of our analysts will walk you through the work.",
    ],
  },
  {
    key: 'what_do_you_do',
    keywords: ['what do you do', 'what exactly', 'what services', 'services do you'],
    variants: [
      "We're a YouTube performance agency, and we're also a content production studio. In practice, that means done-for-you YouTube growth: strategy, scripting, production, thumbnails and packaging, analytics, and multi-language expansion.",
      "We grow YouTube channels. That covers the full stack: strategy, scripting, production, thumbnail design, analytics, and expanding into other languages and markets. Leave your email and an analyst will map out where you'd benefit most.",
      "End-to-end YouTube growth. Strategy and scripting on one side, production and packaging on the other, with analytics and multi-language expansion built in. Drop your details and we can talk specifics.",
    ],
  },
  {
    key: 'where_based',
    keywords: ['where are you', 'where based', 'location', 'which country', 'which city'],
    variants: [
      "The agency is headquartered in Dubai. The team is distributed, and we work with clients all over the world.",
      "Dubai is home base, but we operate globally. Time zones have never been a blocker for our clients.",
      "We're based in Dubai and work remotely with channels across multiple continents.",
    ],
  },
  {
    key: 'how_long',
    keywords: ['how long have you', 'how long around', 'when did you start', 'how old is'],
    variants: [
      "The agency has been operating for several years, built on a track record that goes back much further. The team has been scaling channels since the early days of the platform.",
      "We've been running as an agency for a while, and the team behind it brings over a decade of hands-on YouTube experience. That's the foundation.",
      "The agency is relatively young. The team's YouTube experience is not.",
    ],
  },
  {
    key: 'who_behind',
    keywords: ['who is behind', 'who runs', 'founder', 'team behind', 'who made'],
    variants: [
      "We keep a faceless brand by design. What we can tell you is the team has scaled channels into the billions of views, in over 15 languages, across more than 50 channels. The work speaks for that.",
      "No names up front, by design. The team has built and scaled channels at the highest levels of the platform, and you'll hear directly from an analyst when you leave your email.",
      "The team is made up of people who've spent their careers inside the YouTube industry, not advising from the outside.",
    ],
  },
  {
    key: 'real_agency',
    keywords: ['real agency', 'solo consultant', 'one person', 'freelancer', 'are you a'],
    variants: [
      "We're a full agency. Dedicated analysts, a production team, and strategists working together. Not a one-person operation.",
      "Real agency with dedicated teams handling strategy, production, and analytics.",
      "We're a full-service agency with a production studio. Different people handle strategy, scripting, design, and analytics. Not a freelancer with a nice website.",
    ],
  },
  {
    key: 'full_production',
    keywords: ['full production', 'video production', 'produce video', 'editing'],
    variants: [
      "Yes. From scripting to final edit. We have a production studio in-house.",
      "Yes. The studio handles scripting, editing, and delivery.",
      "Full production is part of what we do. Script, produce, edit, package.",
    ],
  },
  {
    key: 'scripts',
    keywords: ['write scripts', 'scripting', 'script writing', 'do you write'],
    variants: [
      "Yes. Scripting is part of the core service, and it's built on channel strategy, not a blank page.",
      "Yes. Our writers work from a data-informed strategy, so the scripts are shaped around what the audience actually responds to.",
      "Scripting is something we handle, tied directly to the channel strategy.",
    ],
  },
  {
    key: 'thumbnails',
    keywords: ['thumbnail', 'thumbnail design', 'channel art', 'packaging'],
    variants: [
      "Yes. Thumbnails and broader channel packaging are a core part of the work. Click-through is a growth lever on its own.",
      "Yes. Thumbnail design, titles, channel art, packaging concepts. It's standard work for us, not an add-on.",
      "Thumbnails and packaging are central to what we do. We treat them as a growth mechanism, not an afterthought.",
    ],
  },
  {
    key: 'seo',
    keywords: ['youtube seo', 'seo', 'optimization', 'optimiz', 'titles', 'descriptions', 'tags'],
    variants: [
      "Yes. Analytics, SEO, and channel optimization are part of how we operate. We track what's working and adjust accordingly.",
      "Yes. Titles, descriptions, tags, and the analytics layer that tells you what's actually moving the needle. It's built into the service.",
      "Analytics and optimization come with the work. We run on data, not guesswork.",
    ],
  },
  {
    key: 'strategy',
    keywords: ['channel strategy', 'content strategy', 'strategy', 'content plan'],
    variants: [
      "Strategy is where everything starts for us. We don't produce content without a direction built on real data.",
      "Yes. Channel strategy is the foundation. It informs everything else: what to make, how to package it, who you're reaching, and how to grow.",
      "Strategy is the core of what we sell. Everything else is execution on top of it.",
    ],
  },
  {
    key: 'manage_channel',
    keywords: ['manage the channel', 'manage my channel', 'manage entire', 'full management', 'done for you'],
    variants: [
      "Yes. We offer done-for-you management where we handle the full channel, end to end.",
      "Yes. Some clients hand us the keys and we run the channel completely. Others bring us in for specific parts.",
      "Full channel management is part of what we do. Strategy, production, upload, analytics, all of it.",
    ],
  },
  {
    key: 'shorts',
    keywords: ['youtube shorts', 'shorts', 'short form', 'short-form', 'reels'],
    variants: [
      "Yes. Short-form is part of the work, whether standalone or as part of a broader channel strategy.",
      "Yes. Shorts, long-form, or both. What fits depends on the channel and the goals.",
      "Shorts are part of our toolkit. We work with creators who are short-form only, long-form only, or a combination.",
    ],
  },
  {
    key: 'multilanguage',
    keywords: ['multilanguage', 'multi-language', 'international', 'other languages', 'spanish', 'translation', 'translate', 'expand'],
    variants: [
      "Yes. Multi-language expansion is one of the things that sets us apart. The team has scaled channels across more than 15 languages.",
      "Yes, and it's a core part of the offer. We've expanded channels into 15-plus languages.",
      "Multi-language is something we've done at significant scale: over 15 languages, across dozens of channels.",
    ],
  },
  {
    key: 'analytics',
    keywords: ['analytics', 'reporting', 'data', 'metrics', 'reporting'],
    variants: [
      "Yes. Analytics and reporting are built into the service. We track what matters and act on it.",
      "Yes. We don't just produce content and disappear. The analytics layer is how we know if the strategy is working.",
      "Analytics and reporting come standard. You'll know what's moving, what isn't, and why.",
    ],
  },
  {
    key: 'gaming',
    keywords: ['gaming channel', 'gaming', 'game channel', 'esports'],
    variants: [
      "Yes, always. Gaming is one of the channel types we work with regularly, alongside finance, education, kids, lifestyle, tech, cooking, and many more.",
      "Yes. Gaming channels are part of what we handle, as well as finance, education, tech, fitness, kids and family, and plenty of others.",
      "Yes. Gaming is well within our wheelhouse.",
    ],
  },
  {
    key: 'finance',
    keywords: ['finance channel', 'finance', 'business channel', 'investing', 'money channel'],
    variants: [
      "Yes, always. Finance and business are among the niches we cover regularly, alongside gaming, education, tech, lifestyle, and more.",
      "Yes. Finance channels, investing content, business education. They're all part of what we work with.",
      "Yes. Finance and business channels are a regular part of the work.",
    ],
  },
  {
    key: 'education',
    keywords: ['education', 'educational', 'tutorial', 'explainer', 'how-to', 'how to'],
    variants: [
      "Yes, always. Education is one of the niches we work with most, across formats and audience types.",
      "Yes. Educational content, whether explainer, tutorial, or documentary-style, is in our wheelhouse.",
      "Yes. Educational channels are part of the mix.",
    ],
  },
  {
    key: 'kids',
    keywords: ['kids channel', 'family channel', 'children', 'kids content', 'family content'],
    variants: [
      "Yes, always. Kids and family channels are part of what we do, alongside gaming, education, lifestyle, tech, and many more.",
      "Yes. Kids and family content has its own set of rules and considerations, and we have real experience working within them.",
      "Yes. Kids channels come with specific platform requirements, and we know them.",
    ],
  },
  {
    key: 'free_audit',
    keywords: ['free audit', 'what is the audit', 'what is the free', 'audit', 'strategy session', 'free session'],
    variants: [
      "A 30-minute call. I walk through what I see in your data, where the open lanes are, and what the first eight weeks look like. No pitch. No deck. Just the map.",
      "It's a free 30-minute strategy session. Before the call, the team prepares a full data diagnostic of your channel, and we walk you through it live. No pitch, no obligation.",
      "A free strategy session where one of our analysts walks you through a complete, data-driven diagnostic of your channel in real time. It costs nothing, and it happens live on the call.",
    ],
  },
  {
    key: 'audit_free',
    keywords: ['really free', 'is it free', 'catch', 'no strings', 'hidden fee'],
    variants: [
      "Yes, genuinely. No hidden fees, no credit card.",
      "Really free. The session is how we both figure out if there's a good fit. There's no catch.",
      "Yes. Our analysts do this because it's how we start the conversation properly.",
    ],
  },
  {
    key: 'audit_receive',
    keywords: ['what will i receive', 'what do i get', 'what will i get', 'what comes out of', 'diagnostic'],
    variants: [
      "A complete channel diagnostic, walked through live on the call: a health score, how you compare to your niche on each axis, what's working and what isn't, your thumbnails against the category leaders, niche trends, comparable channels, and where your traffic comes from.",
      "In the session, the team walks you through a full data diagnostic: your channel's health score, how you stack up against your niche on each axis, your thumbnails versus the leaders, traffic sources, niche trends, and comparable channels.",
      "A full, data-driven read on your channel, presented during the strategy session. Health score, niche benchmarking on each axis, thumbnails against the leaders, traffic breakdown, comparables, and more.",
    ],
  },
  {
    key: 'audit_duration',
    keywords: ['how long does the audit', 'how long is the audit', 'how long does it take', 'duration'],
    variants: [
      "The session runs about 30 minutes. The team prepares the full diagnostic beforehand and walks you through it live. No pitch, no deck.",
      "Around 30 minutes on the call. We build the complete channel diagnostic ahead of time, then walk you through it together.",
      "About half an hour. The heavy analysis happens on our end before we meet, so the session itself is spent walking you through what we found.",
    ],
  },
  {
    key: 'pricing',
    keywords: ['how much', 'cost', 'price', 'pricing', 'fees', 'rate'],
    variants: [
      "Pricing depends on the scope of what you need. The strategy session is free, and from there an analyst builds a proposal specific to your channel.",
      "It depends on what you need from us. There's no flat rate, because every channel is different. The free strategy session is where the right scope becomes clear.",
      "The session is free. After that, pricing is built from what your channel actually needs, not from a fixed menu.",
    ],
  },
  {
    key: 'packages',
    keywords: ['package', 'plan', 'tier', 'fixed plan', 'monthly plan', 'subscription'],
    variants: [
      "We don't work off a fixed menu. Every engagement is scoped to the channel and what it needs. The free strategy session is where that scoping happens.",
      "We scope work to what makes sense for the channel, not a pre-built package.",
      "No preset packages. What you pay for should match what your channel actually needs, and that becomes clear after the session.",
    ],
  },
  {
    key: 'guarantee',
    keywords: ['guarantee', 'guaranteed', 'promise results', 'guarantee results'],
    variants: [
      "We don't promise specific subscriber counts or view numbers, and any agency that does should be questioned. What we do commit to is rigorous work on the right things.",
      "No outcome guarantees. YouTube doesn't work that way, and we won't pretend it does. What we can tell you is that we don't take channels we can't genuinely help.",
      "We don't make promises on numbers. We do commit to a serious, data-driven approach.",
    ],
  },
  {
    key: 'results',
    keywords: ['what results', 'what kind of results', 'proven results', 'track record', 'case studies', 'examples'],
    variants: [
      "The team has scaled channels into the billions of views, in over 15 languages, across more than 50 channels. What that means for your channel is what the session is for.",
      "The track record includes 20 billion or more views, 50-plus channels, and growth across 15-plus languages. Your analyst can walk you through relevant examples.",
      "We've grown channels from the ground up and managed them at the highest levels of the platform. The session is where we talk about what's realistic for yours specifically.",
    ],
  },
  {
    key: 'how_start',
    keywords: ['how do we get started', 'how to get started', 'how do i start', 'how to start', 'get started', 'next step'],
    variants: [
      "Leave your email here, and the team will reach out to set up your free strategy session. That's the first step.",
      "Drop your email and we'll take it from there. The team will reach out to set up the session.",
      "The first step is the free strategy session. Leave your email and an analyst will be in touch to set it up.",
    ],
  },
  {
    key: 'remote',
    keywords: ['remote', 'do you work remotely', 'online', 'virtual', 'in-person'],
    variants: [
      "Yes, entirely. Everything is done remotely. We work with clients across multiple continents and time zones.",
      "Fully remote. Our clients are all over the world.",
      "Yes. The team is distributed, and so are our clients. Location has never been an issue.",
    ],
  },
  {
    key: 'contract',
    keywords: ['contract', 'agreement', 'commitment', 'minimum commitment', 'minimum contract'],
    variants: [
      "Yes. Any ongoing work is covered by a formal agreement. The details are reviewed after the session, when we know what the scope looks like.",
      "There is. We work on a contract basis. The session comes first, then we get into that once the scope is clear.",
      "There's a formal agreement for any ongoing engagement. That comes after the session, not before.",
    ],
  },
  {
    key: 'growing',
    keywords: ['grow', 'growth', 'growing', 'subscriber', 'views', 'increase', 'expand channel'],
    variants: [
      "Growth on YouTube isn't about posting more — it's about posting smarter. Most channels we audit have the same issue: good content, poor packaging. The free strategy session is where we dig into the specifics for your channel.",
      "The right strategy moves multiple growth levers at once: packaging, SEO, cadence, and audience targeting. Leave your email and the team will map out where your channel has the most headroom.",
      "That's exactly what the free strategy session is built for. Leave your email and handle and we'll walk you through what we see in your data.",
    ],
  },
  {
    key: 'wrong_channel',
    keywords: ['wrong with my channel', "what's wrong", 'problem with', 'channel issue', 'channel problem'],
    variants: [
      "That's exactly what the free strategy session is for. Drop your email and handle and the team will walk you through it.",
      "That question has a real answer, but it lives in your data. Leave your email and handle and the team will walk you through it in your session.",
    ],
  },
];

// ── Flow responses ─────────────────────────────────────────────────────────

export const FLOW_RESPONSES = {
  OPENING: [
    "👋 Welcome to Hype On Media. We grow YouTube channels done-for-you. Tell us a little and we'll set you up with a free audit. What's your channel built for?",
  ],

  PURPOSE_ACK: {
    ad_revenue: [
      "Revenue-focused channels are where we do our best work. What's your channel handle? It looks like @yourchannelname.",
      "Got it. Ad revenue scales fast when the underlying strategy is solid. Drop your handle and we'll take a look.",
      "Makes sense. Share your YouTube handle and we'll start there.",
    ],
    lead_gen: [
      "YouTube is one of the strongest lead engines out there when it's set up right. What's your channel handle?",
      "Lead gen on YouTube takes a specific approach. Drop your handle and the team will dig in.",
      "Good foundation. The right audit will show exactly where the funnel is leaking. What's your handle?",
    ],
    brand: [
      "Brand presence on YouTube pays off across every other channel. What's your handle?",
      "Good starting point. A strong audit will show you where the visibility gaps are. Share your handle.",
      "Got it. Visibility that lasts is worth building carefully. What's your channel handle?",
    ],
    other: [
      "No problem. Every channel is its own thing. Drop your handle and the team will look at the full picture.",
      "Works for us. Share your handle and we'll figure out the right angle with fresh eyes.",
      "Fair enough. The team is good at reading channels that don't fit a clean box. What's your handle?",
    ],
  },

  HANDLE_REQUEST: [
    "What's your YouTube channel handle? It usually looks like @yourchannelname.",
    "Drop your channel handle and we'll pull it up. Format is @yourchannelname.",
    "Share your YouTube handle and the audit starts there.",
  ],

  CHANNEL_FOUND: [
    "Got it. I can see {channelName} with {subs} subscribers. The team will have a lot to work with. What's the best email to set up your free strategy session?",
    "Found it. {channelName}, {subs} subscribers. What email should we use to set up your session?",
    "{channelName} at {subs} subscribers. You're in the right place. Leave us an email and the team will reach out to set up your session.",
  ],

  CHANNEL_NOT_FOUND: [
    "I couldn't find that handle. Mind double-checking it? It should look like @yourchannelname.",
    "That handle didn't come up. Try entering it as @yourchannelname and we'll pull it right up.",
  ],

  EMAIL_REQUEST: [
    "What's the best email to set up your free strategy session?",
    "What email should the team use to reach out and set up your session?",
    "Last step. What email works for setting up your session?",
  ],

  DONE: [
    "Done. The team will reach out at {email} to set up your free strategy session and walk you through a full diagnostic of {handle}.",
    "All set. {handle} is in the queue. The team will reach out at {email} to book your free strategy session.",
    "Perfect. The team has {handle} and will reach out at {email} to set up your session and walk you through the diagnostic live.",
  ],

  DONE_NO_HANDLE: [
    "Done. The team will reach out at {email} to set up your free strategy session.",
    "All set. The team will reach out at {email} to book your free strategy session.",
    "Perfect. We have your email and the team will reach out at {email} to set up your session.",
  ],

  EMAIL_INVALID: [
    "That email doesn't look quite right. Mind double-checking it?",
    "Want to verify that email? We want to make sure the team can reach you to set up your session.",
  ],
};

// ── Capture repertoire ─────────────────────────────────────────────────────
export const CAPTURE_REPERTOIRE = [
  "Leave us your email and the team will take it from there.",
  "Our analysts can answer that directly. Drop your email and they'll follow up.",
  "That's a question worth a real conversation, not a chat reply. Leave your email.",
  "The free strategy session will cover exactly that. We just need your email and channel handle.",
  "One of our analysts is the right person to walk you through it. What's your email?",
  "We'd rather show you than tell you. Drop your email and channel handle.",
  "The numbers tell the real story. Leave your email and the team will walk you through them.",
  "Every channel is different. The diagnostic gives you the specifics. Email and handle?",
  "The team looks at your channel before they reach out. Start with your email and handle.",
  "Better if the team walks you through it personally. What email should they use?",
  "Worth a proper look. Leave your details and an analyst will be in touch.",
  "No guesswork. Leave your email and the team will analyze your channel before they contact you.",
  "Good question for an analyst. They'll have a full picture of your channel when they reach out. Email?",
  "The answer lives in your data. Leave your email and handle and we'll dig in.",
  "That conversation is better had with context. Leave your email and handle and the team will reach out prepared.",
  "Our analysts go deeper than we can here. Email and handle?",
  "That depends on your specific channel. The strategy session makes it concrete. Email and handle?",
  "Want to talk it through with an analyst? Leave your email and handle and the team will reach out to set up your session.",
  "Leave your email and channel handle. The team will have your diagnostic ready to walk you through when they reach out.",
  "The free strategy session answers most of that. Two seconds: email and channel handle?",
];

// ── Fallback repertoire ────────────────────────────────────────────────────
export const FALLBACK_REPERTOIRE = [
  "I can't give you a full answer from here, but one of our analysts can. Leave your email and they'll follow up.",
  "That's outside what I'm set up to cover. The team handles exactly this kind of question. Email and handle?",
  "Better answered by someone who can look at your channel directly. Leave your email and handle.",
  "I'm here to get you to the right person, not answer everything. Leave your details and they'll take it from there.",
  "Not my lane, but I can get you there. Email and handle?",
  "I don't have that information here. It won't take long to get you a real answer. Email?",
  "That's worth a proper conversation, not a chatbot reply. Leave your email.",
  "Short answer: the team handles that. Leave your details and they'll reach out to set up your session.",
  "The honest answer depends on a lot that's specific to your channel. The free strategy session covers it. Email and handle?",
  "I'll route that to the team. What email should they use?",
  "That question deserves a real answer. Leave your email and someone will follow up.",
  "There's a longer answer to that, and it'll be more useful once the team has looked at your channel. Email and handle?",
  "I'm keeping this focused, but the analysts won't be. Leave your email and handle.",
  "Leave your email and the team will reach out. They can go into as much detail as you need in the session.",
  "The free strategy session actually covers a lot of that ground. Email and channel handle to get started.",
  "That's a topic the analysts address in the session. Email and channel handle?",
  "I'm set up for one thing: connecting you with the right people. Leave your details and they'll handle the rest.",
  "Not something I go into here. Our analysts can, though. Email?",
  "The team is better positioned to answer that. Drop your email and channel handle.",
  "That's a real question and it deserves a real answer. Leave your email and handle and the team will reach out.",
];

// ── Unavailable responses ──────────────────────────────────────────────────
export const UNAVAILABLE_RESPONSES = [
  "The team isn't available to process new requests right now. Leave your email and channel handle and we'll follow up as soon as possible.",
  "We're at capacity at the moment. Drop your email and handle here and the team will be in touch.",
  "No one available to take this right now. Leave your email and your YouTube handle and we'll reach out when we're back.",
  "We're temporarily paused on new sessions. Leave your email and handle and you'll be first in line when we reopen.",
  "Fully booked for the moment. Leave your email and channel handle here and the team will reach out when there's an opening.",
];

// ── Purpose buttons ────────────────────────────────────────────────────────
export const PURPOSE_BUTTONS: BotButton[] = [
  { label: 'Ad revenue', value: 'ad_revenue' },
  { label: 'Lead generation', value: 'lead_gen' },
  { label: 'Brand / awareness', value: 'brand' },
  { label: 'Something else', value: 'other' },
];
