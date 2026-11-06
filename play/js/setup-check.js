/* Setup Check — deterministic guidance from the trainer pages.
   This is not a live assistant. Every line below is taken from a step in
   /train/ (Claude) or /train/grok/ (Grok). Step numbers are 1-based and
   match the STEPS arrays on those pages. ?step=N opens that step.
   Neither trainer has a Gmail connection or a "first agent" step.

   FORM ENDPOINT — the site is static, so the button only opens a mail draft.
   Leave SETUP_FORM_ENDPOINT null. To replace the draft later, set this to a
   Formspree URL ("https://formspree.io/f/xxxxxxxx") or a Google Form response
   URL and post `payload` from deliverSetupCheck(). Do not describe that post
   as already sending. Keep saveSetupCheck() either way.
*/
window.SETUP_FORM_ENDPOINT = null;
window.SETUP_WARD_EMAIL = "hello@wardconsulting.ai";
window.SETUP_STORAGE_KEY = "gwa_setup_check";

var SETUP_TITLES = {
  claude: {
    1: "Put Claude on your computer",
    2: "Talk instead of type",
    3: "Open Claude",
    4: "Sign in",
    5: "Open the email from Claude",
    6: "Finish signing up",
    7: "Install the Claude app",
    8: "Sign in on the app",
    9: "Say hello to Claude",
    10: "Answer its questions",
    11: "Ask for a change",
    13: "Try it on a real job",
    14: "Ask about a photo",
    15: "Tell Claude about you, once",
    16: "Answer a customer email",
    17: "Plan your week",
    18: "Check its work"
  },
  grok: {
    1: "Get Grok on your computer",
    2: "Talk instead of type",
    3: "Open Grok",
    4: "Sign in",
    5: "Check your email",
    6: "Finish signing up",
    7: "Install the Grok app",
    8: "Sign in on the app",
    9: "Say hello to Grok",
    10: "Answer its questions",
    11: "Ask for a change",
    13: "Try it on a real job",
    14: "Ask about a photo",
    15: "Tell Grok about you, once",
    16: "Answer a customer email",
    17: "Plan your week",
    18: "Check its work"
  }
};

function setupStepHref(tool, step) {
  var base = tool === "grok" ? "../train/grok/" : "../train/";
  return base + "?step=" + step;
}

function setupGuide(tool, choice) {
  if (!choice || !choice.guide || !choice.guide[tool]) return null;
  var g = choice.guide[tool];
  var titles = SETUP_TITLES[tool] || {};
  return {
    title: titles[g.step] || "Training step",
    step: g.step,
    href: setupStepHref(tool, g.step),
    body: g.body,
    mode: choice.outcome === "assist" ? "assist" : "trouble"
  };
}

function choice(id, text, outcome, extra) {
  var row = { id: id, text: text, outcome: outcome };
  if (extra) {
    Object.keys(extra).forEach(function (k) { row[k] = extra[k]; });
  }
  return row;
}

function guide(step, body) {
  return { step: step, body: body };
}

/* Shared choice lists are built per tool inside the catalog so a Claude
   check never offers an X sign-in, and a Grok check never offers a download. */
var SETUP_CATALOG = [
  {
    id: "platform",
    label: "Training to check",
    q: "Which training should this check follow?",
    choices: [
      choice("grok", "Grok", "ok")
    ]
  },
  {
    id: "computer",
    label: "Opening it on a computer",
    q: "Where are you with opening it on a computer?",
    byTool: {
      claude: [
        choice("open", "Claude is open on my computer", "ok"),
        choice("phone", "Skipped it. I only use my phone", "skipped"),
        choice("stuck", "Could not get Claude open on my computer", "trouble", {
          guide: {
            claude: guide(1, "This step is a download. Watch the short video on the step, then do the same on your computer. The button on that step opens claude.com/download. If you only use a phone, the step says to skip it.")
          }
        })
      ],
      grok: [
        choice("open", "Grok is open in my browser", "ok"),
        choice("phone", "Skipped it. I only use my phone", "skipped"),
        choice("stuck", "Could not get Grok open in the browser", "trouble", {
          guide: {
            grok: guide(1, "Grok works in the web browser, so there is nothing to download. Watch the short video on the step, then open grok.com. If you only use a phone, the step says to skip it.")
          }
        })
      ]
    }
  },
  {
    id: "signin",
    label: "Sign-in",
    q: "How did sign-in go?",
    byTool: {
      claude: [
        choice("google", "Signed in with Google", "ok"),
        choice("email", "Signed in with email", "ok"),
        choice("existing", "Already had an account, and signed in", "ok"),
        choice("email-stuck", "The email link did not get me in", "trouble", {
          guide: {
            claude: guide(5, "Skip this if you used Google. Otherwise open your email and tap the sign-in link Claude sent you. You are done with that step when Claude opens and shows the next sign-up screen.")
          }
        }),
        choice("screens", "Stopped on the last sign-up screens", "trouble", {
          guide: {
            claude: guide(6, "Answer the last few sign-up screens. If it asks to check your phone number, do it. You are done when you see an empty message box.")
          }
        }),
        choice("stuck", "Could not sign in", "trouble", {
          guide: {
            claude: guide(4, "Tap Continue with Google if you use Google. If not, type your email address and tap Continue with email. The training says there is no Claude password. If anyone asks you for a Claude password, don't give them anything.")
          }
        })
      ],
      grok: [
        choice("google", "Signed in with Google", "ok"),
        choice("email", "Signed in with email", "ok"),
        choice("x", "Signed in with an X account", "ok"),
        choice("existing", "Already had an account, and signed in", "ok"),
        choice("email-stuck", "The email code or link did not get me in", "trouble", {
          guide: {
            grok: guide(5, "Skip this if you used Google or X. Otherwise open your email, find the message from Grok, and use the code or the link inside it.")
          }
        }),
        choice("screens", "Stopped on the last sign-up screens", "trouble", {
          guide: {
            grok: guide(6, "Answer the last few sign-up screens. You are done when you see an empty message box, ready for you.")
          }
        }),
        choice("stuck", "Could not sign in", "trouble", {
          guide: {
            grok: guide(4, "Tap the Google button if you use Google. If you have an X account, you can use that. Or type your email address and follow the steps. If it asks for a password, you make it yourself, on Grok's page only. If anyone else asks for it, don't give them anything.")
          }
        })
      ]
    }
  },
  {
    id: "mic",
    label: "Microphone",
    q: "How did the microphone go?",
    choices: [
      choice("heard", "The microphone on my phone keyboard heard me", "ok", { step: 2 }),
      choice("typed", "I typed instead", "ok", { step: 2 }),
      choice("later", "I have not tried the microphone", "later", { step: 2 }),
      choice("stuck", "I tried it and it did not hear me", "trouble", {
        guide: {
          claude: guide(2, "You never have to type. On your phone keyboard, tap the microphone button and say what you want. The training says that works in every step after this one."),
          grok: guide(2, "You never have to type. On your phone keyboard, tap the microphone button and say what you want. The training says that works in every step after this one.")
        }
      })
    ]
  },
  {
    id: "app",
    label: "Phone app",
    q: "Where are you with the phone app?",
    byTool: {
      claude: [
        choice("in", "The Claude app is installed and I am signed in", "ok"),
        choice("skip", "I skipped the phone app", "skipped"),
        choice("find", "Could not find it in the App Store or Google Play", "trouble", {
          guide: {
            claude: guide(7, "On your phone, open the App Store (iPhone) or Google Play (Android). Search for Claude by Anthropic and install it. Check that the maker shown is Anthropic before you install.")
          }
        }),
        choice("signin", "The app is installed, but I could not sign in", "trouble", {
          guide: {
            claude: guide(8, "Open the Claude app and sign in the same way you did on the computer. You are done when you see the same empty message box in the app.")
          }
        })
      ],
      grok: [
        choice("in", "The Grok app is installed and I am signed in", "ok"),
        choice("skip", "I skipped the phone app", "skipped"),
        choice("find", "Could not find it in the App Store or Google Play", "trouble", {
          guide: {
            grok: guide(7, "On your phone, open the App Store (iPhone) or Google Play (Android). Search for Grok, then tap Get or Install. It's free. Check it's the official Grok app, with the same icon you see on grok.com, before you install.")
          }
        }),
        choice("signin", "The app is installed, but I could not sign in", "trouble", {
          guide: {
            grok: guide(8, "Open the Grok app and sign in the same way you just did. You are done when you see the same empty message box in the app.")
          }
        })
      ]
    }
  },
  {
    id: "hello",
    label: "First conversation",
    q: "Where are you with the first conversation, the one where you say hello?",
    byTool: {
      claude: [
        choice("done", "It asked about my business and suggested three tasks", "ok"),
        choice("later", "I have not done that step", "later", { step: 9 }),
        choice("send", "I could not send the message", "trouble", {
          guide: {
            claude: guide(9, "Tap the message box, then tap the microphone and say the words on the step, or copy them and paste them in. Then send. The step's words ask it to ask five questions about your business, one at a time, and then suggest three tasks.")
          }
        }),
        choice("hard", "I sent it, but the reply was hard to use", "trouble", {
          guide: {
            claude: guide(10, "Answer each question the way you would answer a text message. Short is fine. If you want a change after that, the next step says to pick one answer and ask: Make that shorter.")
          }
        })
      ],
      grok: [
        choice("done", "It asked about my business and suggested three tasks", "ok"),
        choice("later", "I have not done that step", "later", { step: 9 }),
        choice("send", "I could not send the message", "trouble", {
          guide: {
            grok: guide(9, "Tap the message box, then tap the microphone and say the words on the step, or copy them and paste them in. Then send. The step's words ask it to ask five questions about your business, one at a time, and then suggest three tasks.")
          }
        }),
        choice("hard", "I sent it, but the reply was hard to use", "trouble", {
          guide: {
            grok: guide(10, "Answer each question the way you would answer a text message. Short is fine. If you want a change after that, the next step says to pick one answer and ask: Make that shorter.")
          }
        })
      ]
    }
  },
  {
    id: "photo",
    label: "Photo of a receipt or note",
    q: "Where are you with a photo of a receipt or a note?",
    byTool: {
      claude: [
        choice("done", "It typed out what was in the photo", "ok"),
        choice("later", "I have not tried a photo", "later", { step: 14 }),
        choice("stuck", "I could not add a photo", "trouble", {
          guide: {
            claude: guide(14, "In the Claude app, tap the + next to the message box and take a photo of a receipt or a note. Then send: Type out what's on this as a simple list. Button names can look a little different between app versions.")
          }
        })
      ],
      grok: [
        choice("done", "It typed out what was in the photo", "ok"),
        choice("later", "I have not tried a photo", "later", { step: 14 }),
        choice("stuck", "I could not add a photo", "trouble", {
          guide: {
            grok: guide(14, "In the Grok app, tap the button to add a photo and take a photo of a receipt or a note. Then send: Type out what's on this as a simple list. Button names can look a little different between app versions.")
          }
        })
      ]
    }
  },
  {
    id: "remember",
    label: "Saved note about the business",
    q: "Where are you with saving a note so it knows your business?",
    byTool: {
      claude: [
        choice("saved", "I saved it", "ok"),
        choice("later", "I have not done that", "later", { step: 15 }),
        choice("find", "I could not find the setting", "trouble", {
          guide: {
            claude: guide(15, "Fill in the blank on the step and tap Copy my prompt. Then tap your initials, then Settings. Find Instructions for Claude, paste it in, and save. The training says this applies to every chat from now on.")
          }
        }),
        choice("save", "I found the setting, but I could not save", "trouble", {
          guide: {
            claude: guide(15, "After you tap Copy my prompt, tap your initials, then Settings. Find Instructions for Claude, paste the note in, and save. You are done when the instructions are saved.")
          }
        })
      ],
      grok: [
        choice("saved", "I saved it", "ok"),
        choice("later", "I have not done that", "later", { step: 15 }),
        choice("find", "I could not find the setting", "trouble", {
          guide: {
            grok: guide(15, "Fill in the blank on the step and tap Copy my prompt. Then look for the setting called Customize Grok, paste it in, and save. Grok moves this setting around between versions. If you can't find it, paste the same note at the start of a new chat instead.")
          }
        }),
        choice("save", "I found the setting, but I could not save", "trouble", {
          guide: {
            grok: guide(15, "The setting is called Customize Grok. Paste the copied note in and save. If that setting will not save, the training says to paste the same note at the start of a new chat instead.")
          }
        })
      ]
    }
  },
  {
    id: "job",
    label: "A real job from the training",
    q: "Where are you with a real job from the training?",
    choices: [
      choice("done", "I have done a payment email, a customer reply, or a week plan", "ok"),
      choice("later", "Not yet", "later", { step: 13 }),
      choice("stuck", "I tried and got stuck", "branch")
    ]
  },
  {
    id: "job-which",
    label: "Which real job",
    q: "Which real job stopped you?",
    when: function (answers) {
      return setupChoiceId(answers, "job") === "stuck";
    },
    choices: [
      choice("payment", "The payment email, about a customer who owes money", "trouble", {
        guide: {
          claude: guide(13, "Fill in the blanks on the step. Tap Copy my prompt, then paste it into Claude and send it. The job is a short email, under 120 words, about a customer who owes you for last month and has paid late before. The step says to let it ask you anything it needs before it writes."),
          grok: guide(13, "Fill in the blanks on the step. Tap Copy my prompt, then paste it into Grok and send it. The job is a short email, under 120 words, about a customer who owes you for last month and has paid late before. The step says to let it ask you anything it needs before it writes.")
        }
      }),
      choice("customer", "A reply to a customer email", "trouble", {
        guide: {
          claude: guide(16, "Fill in the blanks, including a real customer email. Tap Copy my prompt, then paste it into Claude and send it. If it needs a fact it does not have, such as a date or a price, the step says to leave a blank like [DATE] instead of guessing."),
          grok: guide(16, "Fill in the blanks, including a real customer email. Tap Copy my prompt, then paste it into Grok and send it. If it needs a fact it does not have, such as a date or a price, the step says to leave a blank like [DATE] instead of guessing.")
        }
      }),
      choice("week", "Planning the week", "trouble", {
        guide: {
          claude: guide(17, "Fill in the blanks: things to get done, fixed appointments with day and time, working hours, and the most important goal this week. Tap Copy my prompt, paste it into Claude, and send it. The step asks for a simple day-by-day table and a list of anything that will not fit."),
          grok: guide(17, "Fill in the blanks: things to get done, fixed appointments with day and time, working hours, and the most important goal this week. Tap Copy my prompt, paste it into Grok, and send it. The step asks for a simple day-by-day table and a list of anything that will not fit.")
        }
      }),
      choice("unsure", "I am not sure which one", "trouble", {
        guide: {
          claude: guide(13, "The training's first real job is Try it on a real job. Fill in the blanks, tap Copy my prompt, paste it into Claude, and send it. That one is the short payment email."),
          grok: guide(13, "The training's first real job is Try it on a real job. Fill in the blanks, tap Copy my prompt, paste it into Grok, and send it. That one is the short payment email.")
        }
      })
    ]
  },
  {
    id: "ready",
    label: "Ready for a real job",
    q: "How ready do you feel to do a real job on your own?",
    choices: [
      choice("ready", "Ready to try one", "ok"),
      choice("near", "I want a person nearby the first time", "assist", {
        guide: {
          claude: guide(16, "The training page has Stuck, then Email for help. That reaches a real person. This check does not email them. When you want a practice job, the step Answer a customer email has the blanks to copy."),
          grok: guide(16, "The training page has Stuck, then Email for help. That reaches a real person. This check does not email them. When you want a practice job, the step Answer a customer email has the blanks to copy.")
        }
      })
    ]
  },
  {
    id: "note",
    kind: "text",
    label: "Note",
    q: "Anything else about the setup?",
    hint: "Optional. Do not type passwords, PINs, codes from text messages, card numbers, bank account numbers, or Social Security numbers. The training says those never go in a chat or a note.",
    placeholder: "What should change in the setup steps?"
  }
];

function setupChoiceId(answers, qid) {
  var i;
  for (i = 0; i < answers.length; i++) {
    if (answers[i].id === qid) return answers[i].choiceId || "";
  }
  return "";
}

function materialize(def, tool) {
  var choices = def.choices;
  if (def.byTool) {
    if (!tool || !def.byTool[tool]) return null;
    choices = def.byTool[tool];
  }
  return {
    id: def.id,
    label: def.label,
    q: def.q,
    kind: def.kind || "choice",
    hint: def.hint || "",
    placeholder: def.placeholder || "",
    choices: choices || []
  };
}

window.setupCatalog = function (tool, answers) {
  var list = [];
  SETUP_CATALOG.forEach(function (def) {
    if (def.id === "platform" && window.SETUP_ONBOARD_PROFILE && (window.SETUP_ONBOARD_PROFILE.platform === "claude" || window.SETUP_ONBOARD_PROFILE.platform === "grok")) return;
    if (def.id !== "platform" && !tool) return;
    if (def.when && !def.when(answers || [])) return;
    var q = materialize(def, tool);
    if (q) list.push(q);
  });
  return list;
};

window.setupGuideFor = function (tool, question, choice) {
  return setupGuide(tool, choice);
};

window.makeSetupRow = function (tool, question, choice, outcome, guideInfo) {
  var step = (guideInfo && guideInfo.step) || (choice && choice.step) || null;
  var titles = SETUP_TITLES[tool] || {};
  var href = step ? setupStepHref(tool, step) : "";
  return {
    id: question.id,
    label: question.label,
    q: question.q,
    choiceId: choice ? choice.id : "",
    answer: choice ? choice.text : "",
    outcome: outcome,
    step: step,
    stepTitle: step ? (titles[step] || "") : "",
    href: href,
    guide: guideInfo ? guideInfo.body : ""
  };
};

window.setupNextAction = function (tool, answers, profile) {
  var unresolved = [];
  var later = {};
  answers.forEach(function (row) {
    if (row.outcome === "unresolved") unresolved.push(row);
    if (row.outcome === "later") later[row.id] = row;
  });
  if (unresolved.length && unresolved[0].href) {
    return {
      kind: "resume",
      title: unresolved[0].stepTitle || unresolved[0].label,
      body: "Start with the step that is still open. The words on that page are the training, not a new set of instructions.",
      href: unresolved[0].href,
      link: "Open " + (unresolved[0].stepTitle || "that step")
    };
  }
  var task = profile && profile.firstTask;
  var jobDone = false;
  var helloLater = false;
  answers.forEach(function (row) {
    if (row.id === "job" && row.outcome === "ok") jobDone = true;
    if (row.id === "hello" && row.outcome === "later") helloLater = true;
  });
  if (task && task.step && !jobDone && (task.diag === "hello" || !helloLater)) {
    var blocked = false;
    answers.forEach(function (row) {
      if (row.id === task.diag && row.outcome === "ok") blocked = true;
    });
    if (!blocked) {
      return {
        kind: "next",
        title: task.title,
        body: task.why + " This is a training step, not a change made to your account.",
        href: setupStepHref(tool, task.step),
        link: "Open " + task.title
      };
    }
  }
  var order = ["hello", "photo", "remember", "job"];
  var i;
  for (i = 0; i < order.length; i++) {
    if (later[order[i]] && later[order[i]].href) {
      return {
        kind: "next",
        title: later[order[i]].stepTitle,
        body: "Nothing failed. This step from the training is still undone.",
        href: later[order[i]].href,
        link: "Open " + later[order[i]].stepTitle
      };
    }
  }
  var name = tool === "grok" ? "Grok" : "Claude";
  return {
    kind: "practice",
    title: SETUP_TITLES[tool][18],
    body: "You reported the setup steps as done or skipped. The training's next practice is Check its work. " + name + " is useful but sometimes wrong. After an important answer, ask which parts it is least sure about. Before anything goes to a customer, a bank, or the government, read it yourself in full.",
    href: setupStepHref(tool, 18),
    link: "Open Check its work"
  };
};

window.saveSetupCheck = function (payload) {
  try {
    localStorage.setItem(window.SETUP_STORAGE_KEY, JSON.stringify(payload));
  } catch (e) {}
};

function linesFor(rows) {
  if (!rows.length) return ["None", ""];
  var out = [];
  rows.forEach(function (row) {
    out.push("- " + (row.label || row.id) + ": " + (row.answer || ""));
    if (row.stepTitle) out.push("  Step: " + row.stepTitle + (row.href ? " (" + row.href + ")" : ""));
    if (row.guide) out.push("  From the training: " + row.guide);
  });
  out.push("");
  return out;
}

window.deliverSetupCheck = function (payload) {
  var toolName = payload.tool === "grok" ? "Grok" : (payload.tool === "claude" ? "Claude" : "Not chosen");
  var lines = [
    "Setup Check draft",
    "Opening this draft does not send mail. You send it yourself.",
    "The notes come from the written training steps. This is not a live assistant.",
    "",
    "Training checked: " + toolName,
    "Opened from: " + (payload.openedFrom || "direct"),
    ""
  ];
  lines.push("Still need help:");
  lines = lines.concat(linesFor(payload.unresolved || []));
  lines.push("Fixed in this check:");
  lines = lines.concat(linesFor(payload.fixed || []));
  lines.push("Not tried yet:");
  lines = lines.concat(linesFor(payload.later || []));
  lines.push("Went fine:");
  lines = lines.concat(linesFor(payload.ok || []));
  lines.push("Next:");
  if (payload.next) {
    lines.push(payload.next.title || "");
    lines.push(payload.next.body || "");
    if (payload.next.href) lines.push(payload.next.href);
  }
  lines.push("");
  lines.push("Note:");
  lines.push(payload.note || "None");
  lines.push("");
  lines.push("Do not add passwords, PINs, card numbers, bank numbers, or Social Security numbers.");
  var body = lines.join("\n");
  var mailto = "mailto:" + window.SETUP_WARD_EMAIL +
    "?subject=" + encodeURIComponent("Setup Check draft") +
    "&body=" + encodeURIComponent(body);
  /* SETUP_FORM_ENDPOINT stays unused until a Formspree or Google Form URL is set.
     A later change can POST payload there. This function still returns the draft. */
  return {
    sent: "mailto",
    endpoint: window.SETUP_FORM_ENDPOINT || null,
    mailto: mailto,
    payload: payload
  };
};
