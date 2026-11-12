import fs from 'node:fs';

const file = 'www/index.html';
let html = fs.readFileSync(file, 'utf8');

if (!html.includes('<script src="./native-audio.js"></script>')) {
  if (!html.includes('<script>')) throw new Error('Could not locate the app inline script');
  html = html.replace('<script>', '<script src="./native-audio.js"></script>\n<script>');
}

function replaceFunctionLine(name, replacement) {
  const lines = html.split('\n');
  const prefix = 'function ' + name + '(';
  const index = lines.findIndex(line => line.trimStart().startsWith(prefix));
  if (index < 0) throw new Error('Could not locate ' + name + '() for native audio patch');
  lines[index] = replacement;
  html = lines.join('\n');
}

replaceFunctionLine('say', [
  'function say(t,lang="sr",rate){',
  ' const textForSpeech=lang==="ru"?russianSpeechOnly(t):t;',
  ' const native=window.UcimoNativeAudio;',
  ' if(native&&native.isNative){native.stop().then(()=>native.speak(textForSpeech,lang,rate||(lang==="ru"?.94:.82))).then(ok=>{if(!ok&&!window.__ucimoTtsErrorShown){window.__ucimoTtsErrorShown=true;alert("Не удалось запустить системную озвучку. Проверьте в настройках Android синтезатор речи и установленные голоса русского и сербского языков.")}});return}',
  ' try{speechSynthesis.cancel();speechSynthesis.speak(utt(textForSpeech,lang,rate))}catch(e){console.warn("Speech synthesis unavailable",e)}',
  '}'
].join('\n'));

replaceFunctionLine('sayAll', [
  'function sayAll(a,lang="sr"){',
  ' const textItems=lang==="ru"?a.map(russianSpeechOnly):a;',
  ' const native=window.UcimoNativeAudio;',
  ' if(native&&native.isNative){native.speakMany(textItems,lang).then(ok=>{if(!ok&&!window.__ucimoTtsErrorShown){window.__ucimoTtsErrorShown=true;alert("Не удалось запустить системную озвучку. Проверьте в настройках Android синтезатор речи и установленные голоса русского и сербского языков.")}});return}',
  ' try{speechSynthesis.cancel();textItems.forEach(t=>speechSynthesis.speak(utt(t,lang)))}catch(e){console.warn("Speech synthesis unavailable",e)}',
  '}'
].join('\n'));

replaceFunctionLine('hear', [
  'function hear(cb){',
  ' const native=window.UcimoNativeAudio;',
  ' if(native&&native.isNative){native.listen("sr-RS").then(cb).catch(e=>cb({error:e&&e.message?e.message:"Проблема с микрофоном или распознаванием речи."}));return}',
  ' const C=window.SpeechRecognition||window.webkitSpeechRecognition;if(!C)return cb(null);',
  ' try{const r=new C();r.lang="sr-RS";r.maxAlternatives=3;r.onresult=e=>cb([...e.results[0]].map(a=>a.transcript));r.onerror=()=>cb(undefined);r.onnomatch=()=>cb(undefined);r.start()}catch(e){cb(null)}',
  '}'
].join('\n'));

const errorAnchor = 'hear(r=>{';
const errorHandler = 'hear(r=>{if(r&&r.error){const msg=r.error;$("#st").textContent=msg;$("#mic").remove();$("#skip").parentNode.innerHTML=\'<button class="btn" id="no">Не получилось</button><button class="btn pri" id="yes">Получилось</button>\';$("#no").onclick=()=>{Q[n].w=1;ex||grade(it,false);next()};$("#yes").onclick=()=>{Q[n].w=0;sc++;ex||grade(it,true);next()};return}';
if (!html.includes('if(r&&r.error)')) {
  if (!html.includes(errorAnchor)) throw new Error('Could not locate speaking exercise callback');
  html = html.replace(errorAnchor, errorHandler);
}

html = html.replace('Аудио пока озвучивается синтезатором браузера, а не носителем языка.', 'На Android аудио озвучивается системным синтезатором речи, а не записью носителя языка.');
fs.writeFileSync(file, html, 'utf8');
console.log('Patched WebView HTML: native TTS, Russian-only speech text, and runtime speech recognition.');
