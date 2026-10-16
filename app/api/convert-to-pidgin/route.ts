import { NextRequest, NextResponse } from "next/server";

const MAP: [RegExp, string][] = [
  [/I am going to/gi, "I dey go"], [/I am/gi, "I be"], [/I'm/gi, "I be"],
  [/I will/gi, "I go"], [/I have/gi, "I get"], [/I don't/gi, "I no"],
  [/You are/gi, "You be"], [/You will/gi, "You go"], [/You have/gi, "You get"],
  [/This is/gi, "Na dis be"], [/That is/gi, "Na dat be"], [/There is/gi, "E get"],
  [/It is/gi, "E be"], [/It will/gi, "E go"], [/We are/gi, "We be"],
  [/very|really|so much/gi, "well well"], [/quickly|fast/gi, "sharp sharp"],
  [/Do not miss|Don't miss/gi, "No miss"], [/Do not dull|Don't dull/gi, "No dull"],
  [/beautiful|pretty/gi, "fine"], [/good|great|nice/gi, "correct"],
  [/Buy now/gi, "Buy am now"], [/Come now/gi, "Come now now"],
  [/money/gi, "kudi"], [/Come and/gi, "Come"], [/You want to/gi, "You wan"],
];

const SAUCE_START = ["My people, ", "Omo, ", "Listen o, ", "Abeg, ", ""];
const SAUCE_END = [" No dull am!", " E choke!", " Sharp sharp!", " Omo e sweet!", ""];

function toPidgin(text: string) {
  let out = text.trim();
  for (const [re, rep] of MAP) out = out.replace(re, rep);
  // Add street flavor
  if (!out.endsWith("!") && !out.endsWith(".")) {
    const end = SAUCE_END[Math.floor(Math.random() * SAUCE_END.length)];
    out += end;
  }
  const start = SAUCE_START[Math.floor(Math.random() * SAUCE_START.length)];
  if (Math.random() > 0.4) out = start + out;
  return out;
}

export async function POST(req: NextRequest) {
  const { text } = await req.json();
  if (!text?.trim()) {
    return NextResponse.json({ error: "Abeg paste script" }, { status: 400 });
  }
  // 100% FREE - No API
  const pidgin = toPidgin(text);
  return NextResponse.json({ pidgin });
}