/* Grow With AI — AI Slot Quiz questions.
   Site/trainer facts were read from the live trainer pages and repo:
   https://zclear2327.github.io/grow-with-ai/train/ (Claude)
   https://zclear2327.github.io/grow-with-ai/train/grok/ (Grok)
   https://zclear2327.github.io/grow-with-ai/ (home)
   https://zclear2327.github.io/grow-with-ai/packages/
   Myths are written plainly to defuse fear. No invented product facts.
*/
window.SLOT_QUESTIONS = [
  {
    id: "conscious",
    topic: "myth",
    q: "Does an AI assistant have feelings, or a mind of its own?",
    choices: [
      "No. It predicts helpful text. It does not feel, want, or live a life.",
      "Yes. It thinks and feels the way a person does.",
      "Yes. It gets lonely if you don't talk to it.",
      "It has secret opinions it hides from you."
    ],
    correct: 0,
    teach: "An AI assistant is a tool that predicts the next words in a reply. It can sound warm, but it does not have feelings, wants, or a private inner life."
  },
  {
    id: "all-jobs",
    topic: "myth",
    q: "Will AI take every job and leave people with nothing to do?",
    choices: [
      "Yes. People will not be needed.",
      "No. It can take repetitive busywork off your plate. People still decide, check the work, and do the parts that need a human.",
      "It only replaces managers.",
      "It already did, so there is no point learning it."
    ],
    correct: 1,
    teach: "Grow With AI is built so repetitive work can come off your plate while you stay in charge. You still approve anything that matters, and you still do the work that needs a person."
  },
  {
    id: "always-right",
    topic: "myth",
    q: "Is an AI assistant always right?",
    choices: [
      "Yes. If it sounds confident, it is true.",
      "Yes, as long as you paid for a plan.",
      "No. It is useful but sometimes wrong, so you should check important answers.",
      "It is wrong more often than it is right, so you should not use it."
    ],
    correct: 2,
    teach: "The trainer says Claude and Grok are useful but sometimes wrong. After an important answer, ask which parts it is least sure about, and read anything important yourself."
  },
  {
    id: "never-paste",
    topic: "safety",
    q: "What should you never paste into Claude, Grok, or any chat tool?",
    choices: [
      "A rough outline of an email you want help writing.",
      "A photo of a receipt with the prices blacked out.",
      "The name of your kind of business, like “I run a bakery.”",
      "Passwords, PINs, card numbers, bank details, Social Security numbers, or anything someone told you in confidence."
    ],
    correct: 3,
    teach: "The trainer is clear: never put passwords, PINs or text-message codes, card or bank numbers, Social Security numbers, or private confidences into a chat. You can still get help by replacing names and numbers with “Customer A” or “[ACCOUNT].”"
  },
  {
    id: "coding",
    topic: "myth",
    q: "Do you need to know how to code to start using AI with Grow With AI?",
    choices: [
      "Yes. The trainer is written for programmers.",
      "No. The steps are in plain English, and you can talk instead of type with the microphone on your phone keyboard.",
      "Only if you pick Claude.",
      "You need to learn a special AI language first."
    ],
    correct: 1,
    teach: "The free trainer is one plain-English step at a time, with a short video for each step. You never have to type: the microphone button on your phone keyboard works in every step."
  },
  {
    id: "check-work",
    topic: "trainer",
    q: "After an important answer, what does the trainer tell you to ask?",
    choices: [
      "“Which parts of that answer are you least sure about?”",
      "“Delete this chat so no one can check it.”",
      "“Make it sound more certain, even if you are guessing.”",
      "“Send this to my customer for me right now.”"
    ],
    correct: 0,
    teach: "That question helps the assistant point to the shaky parts so you can double-check them. Before anything goes to a customer, a bank, or the government, read it yourself in full."
  },
  {
    id: "in-charge",
    topic: "site",
    q: "Who is in charge when you use Grow With AI?",
    choices: [
      "The AI, once you sign up.",
      "Whoever built the software, not you.",
      "You. Anything that spends money or cannot be undone waits for your yes.",
      "The assistant, but only on weekdays."
    ],
    correct: 2,
    teach: "The site’s line is “Simple, and you stay in charge.” Bots can suggest. You decide. Nothing that spends money, or that cannot be undone, happens without your yes."
  },
  {
    id: "cant-see-business",
    topic: "trainer",
    q: "Can Claude or Grok see your business on its own?",
    choices: [
      "Yes. It looks up your company the moment you open the app.",
      "Yes, if you have the paid plan.",
      "No. The trainer says it cannot see your business, so you tell it what it needs.",
      "It already knows every local business in your town."
    ],
    correct: 2,
    teach: "You get better answers when you say who you are, who the note is for, what a good answer looks like and how long it should be, give an example if you have one, and add “Before you start, ask me anything you need to know.”"
  },
  {
    id: "new-chat",
    topic: "trainer",
    q: "What should you do when you switch to a different topic?",
    choices: [
      "Keep going in the same long chat so it has “more context.”",
      "Start a new chat. A long chat about many things gets muddled.",
      "Delete the app and install it again.",
      "Type the word RESET in capital letters."
    ],
    correct: 1,
    teach: "That tip is in both the Claude and Grok trainers. A fresh chat for a new topic keeps the assistant from mixing two jobs together."
  },
  {
    id: "read-first",
    topic: "trainer",
    q: "Before an AI draft goes to a customer, a bank, or the government, what should you do?",
    choices: [
      "Send it right away so it stays “in the AI’s voice.”",
      "Read it yourself in full.",
      "Ask the AI to send it for you.",
      "Forward it without looking, as long as it sounds polite."
    ],
    correct: 1,
    teach: "The trainer puts this under “Stay safe.” You stay the person who checks anything that matters before it goes out."
  },
  {
    id: "four-things",
    topic: "trainer",
    q: "The trainer says the best requests include four things. Which set is it?",
    choices: [
      "Your password, your budget, your competitors, and a joke.",
      "A one-word command, all caps, no details, and “do it now.”",
      "Who you are and who this is for; what a good answer looks like and how long; an example if you have one; and “Before you start, ask me anything you need to know.”",
      "Your Social Security number, a card number, a PIN, and a private file."
    ],
    correct: 2,
    teach: "Those four extras give the assistant the details it cannot see on its own. You can talk them in with your microphone; you do not have to type."
  },
  {
    id: "customer-a",
    topic: "trainer",
    q: "If you want help with a customer matter but should not share real names or numbers, what does the trainer suggest?",
    choices: [
      "Paste the whole account anyway so the answer is “more accurate.”",
      "Replace names and numbers with “Customer A” or “[ACCOUNT].”",
      "Use a friend’s login instead of yours.",
      "Ask the AI to guess the missing numbers."
    ],
    correct: 1,
    teach: "The assistant can still help you write a note or a plan when private details are replaced with labels. You keep the real names and numbers on your side."
  },
  {
    id: "voice",
    topic: "trainer",
    q: "Do you have to type every message in the trainer?",
    choices: [
      "Yes. Voice only works after you pay.",
      "Yes. The microphone is only for videos.",
      "No. You never have to type. Use the microphone button on your phone keyboard.",
      "Only Grok can hear you. Claude cannot."
    ],
    correct: 2,
    teach: "Both trainers say you never have to type: on your phone keyboard, tap the microphone and say what you want. That works in every step."
  },
  {
    id: "free-agents",
    topic: "site",
    q: "Which Grow With AI agents are free to start with?",
    choices: [
      "The Email & Inbox Agent and the Workflow Agent.",
      "Only the Content & Social Agent.",
      "All six agents, with no later option to add more.",
      "None. You have to pick a paid package first."
    ],
    correct: 0,
    teach: "The first two agents are free: Email & Inbox, and Workflow. Starter adds 1 paid agent of your choice. Pro and Elite include all 4 paid agents. Nothing is charged while packages are on the waitlist."
  },
  {
    id: "own-account",
    topic: "site",
    q: "Whose AI account do you use with Grow With AI?",
    choices: [
      "A shared company login that everyone uses.",
      "Your own free Grok or Claude account. Paid upgrades to those companies are optional.",
      "You do not need an account of any kind.",
      "Only a special Grow With AI password, not Grok or Claude."
    ],
    correct: 1,
    teach: "You pick Grok or Claude and use your own account with that company. Grow With AI’s setup is separate. Optional paid plans such as Grok Bot or Claude Pro are paid to those companies, not required to start."
  },
  {
    id: "free-plan",
    topic: "trainer",
    q: "When does the trainer say you should upgrade your Grok or Claude plan?",
    choices: [
      "On day one, or the free plan will not work.",
      "Only when you keep hitting a limit that costs you time. The training itself works on the free plan.",
      "Whenever the assistant asks you to.",
      "You must upgrade before you can use the microphone."
    ],
    correct: 1,
    teach: "Both trainers end on this point: stay on the free plan for now. Everything you just practiced works there. Upgrade later only if a limit keeps costing you time."
  },
  {
    id: "approve",
    topic: "site",
    q: "What waits for your yes before it happens?",
    choices: [
      "Only photos.",
      "Nothing. The assistant acts on its own once it has an idea.",
      "Anything that spends money or cannot be undone.",
      "Only messages written after midnight."
    ],
    correct: 2,
    teach: "Grow With AI is set up so you can see what the helpers did. Bots suggest; you decide. Nothing gets sent, deleted, or bought without your OK."
  },
  {
    id: "no-guessing",
    topic: "trainer",
    q: "If the AI does not have a fact it needs, like a date or a price, what should it do?",
    choices: [
      "Invent a number so the reply looks finished.",
      "Leave a blank like [DATE] instead of guessing, or say it does not know.",
      "Copy a number from a different customer.",
      "Skip that part and hope no one notices."
    ],
    correct: 1,
    teach: "The trainer’s own prompts say: if you need a fact you do not have, leave a blank like [DATE] instead of guessing. The saved instructions also say: when you don’t know a fact, say so."
  },
  {
    id: "human-help",
    topic: "trainer",
    q: "If you get stuck in the trainer, who helps you?",
    choices: [
      "No one. You have to figure it out alone.",
      "Only another AI, never a person.",
      "A real person. You can email hello@wardconsulting.ai.",
      "The app store review team."
    ],
    correct: 2,
    teach: "Each trainer step has a help section that says “A real person will help you.” The help email is hello@wardconsulting.ai."
  },
  {
    id: "two-paths",
    topic: "trainer",
    q: "Grow With AI’s free step-by-step trainer has two paths. What are they?",
    choices: [
      "Python and Java.",
      "Claude and Grok. You pick the one you want to use.",
      "A paid path only, with no free option.",
      "A path for phones and a separate path that does not exist yet."
    ],
    correct: 1,
    teach: "There is a Claude trainer at /train/ and a Grok trainer at /train/grok/. Each one walks you through the same kind of steps for that assistant, including voice, asking well, and staying safe."
  }
];
