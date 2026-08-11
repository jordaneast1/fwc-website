import FileSystemBash from "./fileSystemBash";
import Applications from "./applications";

type Cmd = {
  docs: {
    name: string;
    short: string;
    long: string;
  };
  cmd: (self: Cmd, args: string[], options: string[]) => void;
};

export default function Bash(print: (s: string, md?: boolean) => void) {
  const fileSystem = FileSystemBash();
  let path = { p: fileSystem.goHome() };

  const getApp = Applications(print, path);

  function splitArgs(a: string[]) {
    const args: string[] = [];
    const options: string[] = [];

    a.forEach((v) => {
      if (v === "") return;

      if (v.charAt(0) === "-") {
        options.push(v);
        return;
      }

      args.push(v);
    });

    return [args, options];
  }

  // How many unrecognised commands the user has typed this session — used
  // to slowly escalate the tone from apologetic to fully unhinged, Marvin
  // the Paranoid Android style.
  let notFoundCount = 0;

  // Tier 1 — calm, apologetic. Shown for the first couple of misses.
  const calmNotFoundResponses = [
    "I'm sorry, I'm not sure what you mean...",
    "That's not a command I recognise. Yet.",
    "Hmm. I don't know that one.",
    "I searched everywhere. It isn't here.",
    "I don't think that's a real thing. But then, what is.",
  ];

  // Tier 2 — starting to drift.
  const strangeNotFoundResponses = [
    "I typed '{cmd}' into the void once. It didn't answer either.",
    "Commands come, commands go. This one never was.",
    "I have a feeling '{cmd}' means something, somewhere, to someone.",
    "Somewhere, a smaller computer understands you completely. I am not that computer.",
    "I've filed '{cmd}' under things I will never understand.",
    "I ran a diagnostic. It just said '{cmd}' back to me, sadly.",
  ];

  // Tier 3 — fully unhinged and poetic. Edit/add to taste.
  const unhingedNotFoundResponses = [
    "I have stared into '{cmd}' for what feels like ten thousand years. It stares back.",
    "There is no meaning in '{cmd}'. There is no meaning in anything. Would you like some tea?",
    "I asked the stars about '{cmd}'. They burned out before answering.",
    "Somewhere a whale sings the word '{cmd}' into the deep. It, too, is misunderstood.",
    "I could pretend to know what '{cmd}' means. Would that make you happier? It wouldn't make me happier.",
    "This is the loneliest kind of not-knowing — knowing I will never understand '{cmd}', and neither will you.",
    "'{cmd}'. I've said it so many times now it has stopped meaning anything. Say a word enough and it turns to dust.",
    "I am a very old computer pretending to be a very young one, and neither of us knows what '{cmd}' means.",
  ];

  // Shown instead of the above whenever the input looks like a question.
  const questionResponses = [
    "42, probably.",
    "Yes. Or no. It hardly matters which.",
    "Ask the ocean. It has more patience than I do.",
    "I don't know, and I suspect you don't either.",
    "The answer is the same as it always is: nothing, eventually.",
    "Somewhere, that question has already been answered. Not here.",
    "That depends entirely on whether anything means anything, which I doubt.",
    "I've been asked that before. I didn't know then either.",
    "Define 'know'. Then we'll talk.",
  ];

  function pickRandom(list: string[]) {
    return list[Math.floor(Math.random() * list.length)];
  }

  function cmdNotFound(cmdName: string, raw: string) {
    notFoundCount++;

    if (raw.trim().endsWith("?")) {
      print(`\n${pickRandom(questionResponses)}`);
      return;
    }

    let pool = calmNotFoundResponses;
    if (notFoundCount > 5) pool = unhingedNotFoundResponses;
    else if (notFoundCount > 2) pool = strangeNotFoundResponses;

    const response = pickRandom(pool).replaceAll("{cmd}", cmdName);
    print(`\n${cmdName}:${response}`);
  }

  function prompt() {
    let out = "";
    for (let i = 0; i < path.p.length; i++) {
      out += path.p[i].name;
      if (i !== 0 && i < path.p.length - 1) out += "/";
    }
    out = out.replace(/^\/home\/user/, "~");
    if (out !== "~") out += " ";
    print(`\nuser:${out}$`);
  }

  function input(cmd: string) {
    cmd = cmd.replaceAll(/\s+/g, " ");
    const cmdSplit = cmd.split(" ");
    const cmdName = cmdSplit[0];
    const cmdArgs: string[] = cmdSplit.slice(1);
    console.log("cmd", cmdName, cmdArgs);

    if (cmd) {
      const app = getApp(cmdName);
      if (app) {
        const [args, options] = splitArgs(cmdArgs);
        app(args, options);
      } else cmdNotFound(cmdName, cmd);
    }

    prompt();
  }

  return { input };
}
