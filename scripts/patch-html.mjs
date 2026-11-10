import fs from 'node:fs';

const file = 'www/index.html';
let html = fs.readFileSync(file, 'utf8');

if (!html.includes('<script src="./native-audio.js"></script>')) {
  html = html.replace('<script>', '<script src="./native-audio.js"></script>\n<script>');
}

const oldSay = 'function say(t,lang="sr",rate){try{speechSynthesis.cancel();speechSynthesis.speak(utt(t,lang,rate))}catch(e){}}';
const newSay = `function say(t,lang="sr",rate){
 const native=window.UcimoNativeAudio;
 if(native&&native.isNative){native.stop().then(()=>native.speak(t,lang,rate||(lang==="ru"?.94:.82))).then(ok=>{if(!ok&&!window.__ucimoTtsErrorShown){window.__ucimoTtsErrorShown=true;alert("Не удалось запустить системную озвучку. Проверьте в настройках Android синтезатор речи и установленные голоса русского и сербского языков.")}});return}
 try{speechSynthesis.cancel();speechSynthesis.speak(utt(t,lang,rate))}catch(e){console.warn("Speech synthesis unavailable",e)}
}`;
if (html.includes(oldSay)) html = html.replace(oldSay, newSay);
else if (!html.includes('native&&native.isNative')) throw new Error('Could not locate say() for native TTS patch');

const oldSayAll = 'function sayAll(a,lang="sr"){try{speechSynthesis.cancel();a.forEach(t=>speechSynthesis.speak(utt(t,lang)))}catch(e){}}';
const newSayAll = `function sayAll(a,lang="sr"){
 const native=window.UcimoNativeAudio;
 if(native&&native.isNative){native.speakMany(a,lang).then(ok=>{if(!ok&&!window.__ucimoTtsErrorShown){window.__ucimoTtsErrorShown=true;alert("Не удалось запустить системную озвучку. Проверьте в настройках Android синтезатор речи и установленные голоса русского и сербского языков.")}});return}
 try{speechSynthesis.cancel();a.forEach(t=>speechSynthesis.speak(utt(t,lang)))}catch(e){console.warn("Speech synthesis unavailable",e)}
}`;
if (html.includes(oldSayAll)) html = html.replace(oldSayAll, newSayAll);
else if (!html.includes('native.speakMany')) throw new Error('Could not locate sayAll() for native TTS patch');

const oldHear = 'function hear(cb){const C=window.SpeechRecognition||window.webkitSpeechRecognition;if(!C)return cb(null);try{const r=new C();r.lang="sr-RS";r.maxAlternatives=3;r.onresult=e=>cb([...e.results[0]].map(a=>a.transcript));r.onerror=()=>cb(undefined);r.onnomatch=()=>cb(undefined);r.start()}catch(e){cb(null)}}';
const newHear = `function hear(cb){
 const native=window.UcimoNativeAudio;
 if(native&&native.isNative){native.listen("sr-RS").then(cb).catch(e=>cb({error:e&&e.message?e.message:"Проблема с микрофоном или распознаванием речи."}));return}
 const C=window.SpeechRecognition||window.webkitSpeechRecognition;if(!C)return cb(null);
 try{const r=new C();r.lang="sr-RS";r.maxAlternatives=3;r.onresult=e=>cb([...e.results[0]].map(a=>a.transcript));r.onerror=()=>cb(undefined);r.onnomatch=()=>cb(undefined);r.start()}catch(e){cb(null)}
}`;
if (html.includes(oldHear)) html = html.replace(oldHear, newHear);
else if (!html.includes('native.listen("sr-RS")')) throw new Error('Could not locate hear() for native speech recognition patch');

const oldFallback = 'if(r===null){$("#st").innerHTML="Распознавание речи здесь недоступно (нужен Chrome на телефоне). Оцените себя сами.";$("#mic").remove();$("#skip").parentNode.innerHTML=`<button class="btn" id="no">Не получилось</button><button class="btn pri" id="yes">Получилось</button>`;$("#no").onclick=()=>{Q[n].w=1;ex||grade(it,false);next()};$("#yes").onclick=()=>{Q[n].w=0;sc++;ex||grade(it,true);next()};return}';
const newFallback = 'const selfAssess=message=>{$("#st").textContent=message;$("#mic").remove();$("#skip").parentNode.innerHTML=`<button class="btn" id="no">Не получилось</button><button class="btn pri" id="yes">Получилось</button>`;$("#no").onclick=()=>{Q[n].w=1;ex||grade(it,false);next()};$("#yes").onclick=()=>{Q[n].w=0;sc++;ex||grade(it,true);next()}};if(r===null){selfAssess("Распознавание речи здесь недоступно. Оцените произношение самостоятельно.");return}if(r&&r.error){selfAssess(r.error);return}';
if (html.includes(oldFallback)) html = html.replace(oldFallback, newFallback);
else if (!html.includes('if(r&&r.error)')) throw new Error('Could not locate speaking fallback branch');

html = html.replace(
  'Аудио пока озвучивается синтезатором браузера, а не носителем языка.',
  'На Android аудио озвучивается системным синтезатором речи, а не записью носителя языка.'
);

fs.writeFileSync(file, html, 'utf8');
console.log('Patched WebView audio to use native Android TTS and runtime microphone recognition.');
