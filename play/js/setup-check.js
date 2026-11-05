/* Setup Check — questions for someone who just finished a trainer.
   Grounded in the step titles and actions on:
     /train/       Claude (download, Continue with Google or email, phone check,
                   App Store / Google Play, Instructions for Claude)
     /train/grok/  Grok (browser, nothing to download, Google or X or email,
                   email code or link, Customize Grok)
   Neither trainer has a Gmail-connection step or a "first agent" step.
   The first use of the assistant is the "Say hello" conversation.
*/
window.SETUP_QUESTIONS = [
  {
    id: "which-training",
    label: "Training just finished",
    q: "Which training did you just finish?",
    choices: [
      "The Claude training",
      "The Grok training",
      "Some of both",
      "I'm not sure"
    ]
  },
  {
    id: "hardest",
    label: "Hardest part",
    q: "Which part was the hardest?",
    choices: [
      "Getting it open on my computer",
      "Making the account and signing in",
      "Talking with the microphone instead of typing",
      "Installing the phone app and signing in there",
      "The first conversation, where I said hello",
      "A later step, like the photo, the saved instructions, or a real job",
      "None of them. It went fine."
    ]
  },
  {
    id: "stuck",
    label: "Where they got stuck",
    q: "Where did you get stuck?",
    choices: [
      "I did not get stuck",
      "Signing in, the email link or code, or the last sign-up screens",
      "The microphone button on my phone keyboard",
      "Finding the app in the App Store or Google Play, or signing in on the app",
      "Copying a prompt and pasting it in",
      "I skipped the step where I got stuck"
    ]
  },
  {
    id: "account",
    label: "Account and sign-in",
    q: "Did making the account work?",
    choices: [
      "Yes. I signed in with Google.",
      "Yes. I used my email and the link or code it sent.",
      "Yes. On Grok, I signed in with an X account.",
      "I already had an account, and sign-in worked.",
      "No. I could not finish signing up."
    ]
  },
  {
    id: "mic",
    label: "Microphone",
    q: "Did the microphone work when you talked instead of typed?",
    choices: [
      "Yes. I tapped the microphone on my phone keyboard and it heard me.",
      "I tried, and it did not work.",
      "I typed instead.",
      "I have not tried it yet."
    ]
  },
  {
    id: "app",
    label: "Phone app",
    q: "Did the phone app work?",
    choices: [
      "Yes. It is on my phone and I am signed in.",
      "I installed it, but I could not sign in.",
      "I could not find it in the App Store or Google Play.",
      "I skipped the phone steps and stayed on the computer."
    ]
  },
  {
    id: "hello",
    label: "First conversation",
    q: "Did the first conversation work? That is the step where you say hello, it asks about your business, and it suggests three tasks.",
    choices: [
      "Yes. It asked about my business and suggested tasks.",
      "I sent it, but the reply was confusing.",
      "I could not send the message.",
      "I skipped that step."
    ]
  },
  {
    id: "remember",
    label: "Saved instructions",
    q: "Did you save the note that tells it about you? On Claude that is Instructions for Claude, under your initials and Settings. On Grok that is Customize Grok.",
    choices: [
      "Yes. I pasted it in and saved.",
      "I found the setting, but I could not save.",
      "I could not find that setting.",
      "I skipped it."
    ]
  },
  {
    id: "confidence",
    label: "Confidence",
    q: "How confident do you feel using it on a real job now?",
    choices: [
      "Ready. I can try a real job on my own.",
      "Mostly ready. I would like someone nearby the first time.",
      "Unsure. I finished the steps, but I would freeze alone.",
      "Not confident. I need help before I use it for real."
    ]
  },
  {
    id: "confusing",
    label: "What was confusing",
    q: "Was anything confusing?",
    choices: [
      "No. The steps were clear.",
      "Signing up",
      "The microphone or the phone app",
      "Filling in the blanks and copying a prompt",
      "The photo, the saved instructions, or checking its work",
      "More than one thing"
    ]
  },
  {
    id: "next-help",
    label: "Help wanted next",
    q: "What do you want help with next?",
    choices: [
      "The account and signing in",
      "The microphone",
      "The phone app",
      "The first conversation",
      "A real job: a customer email, a payment email, or planning my week",
      "Saving the instructions so it remembers me",
      "Nothing right now"
    ]
  },
  {
    id: "note",
    kind: "text",
    label: "Note for Ward",
    q: "Anything else Ward should change or fix for you?",
    hint: "Optional. A sentence or two is enough. You can leave it blank.",
    placeholder: "What should Ward fix in the setup for you?"
  }
];

/* Ward's inbox for the static site. The Send to Ward button is a mailto. */
window.SETUP_WARD_EMAIL = "hello@wardconsulting.ai";

/* localStorage key for the latest answers, including a partial run. */
window.SETUP_STORAGE_KEY = "gwa_setup_check";

/* FORM ENDPOINT — replace the mailto later.
   Leave this null while the site is static. The Send to Ward button opens
   a prefilled email to SETUP_WARD_EMAIL.
   To switch later, set this to a Formspree endpoint
   ("https://formspree.io/f/xxxxxxxx") or a Google Form response URL, then
   post `payload` there from deliverSetupCheck() instead of using mailto.
   Keep saveSetupCheck() either way so the answers stay on this browser. */
window.SETUP_FORM_ENDPOINT = null;

window.saveSetupCheck = function (payload) {
  try {
    localStorage.setItem(window.SETUP_STORAGE_KEY, JSON.stringify(payload));
  } catch (e) {}
};

window.setupCheckPayload = function (tool, answers, done) {
  return {
    savedAt: new Date().toISOString(),
    openedFrom: tool || "direct",
    done: !!done,
    answers: answers
  };
};

window.deliverSetupCheck = function (payload) {
  var lines = [
    "Setup Check",
    "Opened from: " + (payload.openedFrom || "direct"),
    "Saved: " + (payload.savedAt || ""),
    ""
  ];
  (payload.answers || []).forEach(function (row) {
    lines.push(row.label || row.q || row.id);
    lines.push(row.answer || "");
    lines.push("");
  });
  var body = lines.join("\n");
  var mailto = "mailto:" + window.SETUP_WARD_EMAIL +
    "?subject=" + encodeURIComponent("Setup Check from Grow With AI") +
    "&body=" + encodeURIComponent(body);

  /* When SETUP_FORM_ENDPOINT is set, post `payload` to that Formspree or
     Google Form URL here and return { sent: "endpoint" }. Until then the
     button uses the mailto link. */
  if (window.SETUP_FORM_ENDPOINT) {
    return { sent: "endpoint", endpoint: window.SETUP_FORM_ENDPOINT, mailto: mailto, payload: payload };
  }
  return { sent: "mailto", endpoint: null, mailto: mailto, payload: payload };
};
