import { Capacitor } from '@capacitor/core';
import { TextToSpeech } from '@capacitor-community/text-to-speech';
import { SpeechRecognition } from '@capacitor-community/speech-recognition';

const isNative = Capacitor.isNativePlatform();
const voiceCache = new Map();

function localeFor(lang) {
  return lang === 'ru' ? 'ru-RU' : 'sr-RS';
}

async function selectVoice(locale) {
  if (voiceCache.has(locale)) return voiceCache.get(locale);
  try {
    const { voices = [] } = await TextToSpeech.getSupportedVoices();
    const base = locale.slice(0, 2).toLowerCase();
    const candidates = voices
      .map((voice, index) => ({ voice, index }))
      .filter(({ voice }) => (voice.lang || '').toLowerCase().startsWith(base));
    const female = candidates.find(({ voice }) =>
      /female|woman|girl|жен|milica|jovana|ana|sara|sophia|katja/i.test(voice.name || '')
    );
    const chosen = (female || candidates[0])?.index;
    voiceCache.set(locale, chosen);
    return chosen;
  } catch (error) {
    console.warn('[Učimo srpski] Voice list unavailable:', error);
    return undefined;
  }
}

async function speak(text, lang = 'sr', rate = 0.85, queueStrategy = 0) {
  if (!isNative) return false;
  const locale = localeFor(lang);
  try {
    const voice = await selectVoice(locale);
    await TextToSpeech.speak({
      text: String(text || ''),
      lang: locale,
      rate: Math.max(0.5, Math.min(1.5, Number(rate) || 0.85)),
      pitch: 1.0,
      volume: 1.0,
      ...(voice === undefined ? {} : { voice }),
      queueStrategy,
    });
    return true;
  } catch (error) {
    console.error('[Učimo srpski] Native speech failed:', error);
    return false;
  }
}

async function stop() {
  if (!isNative) return;
  try { await TextToSpeech.stop(); } catch (error) { console.warn(error); }
}

async function listen(lang = 'sr-RS') {
  if (!isNative) throw new Error('Распознавание речи доступно только в Android-приложении.');
  let permission;
  try {
    permission = await SpeechRecognition.checkPermissions();
    if (permission.speechRecognition !== 'granted') {
      permission = await SpeechRecognition.requestPermissions();
    }
  } catch (error) {
    throw new Error('Не удалось запросить доступ к микрофону. Проверьте разрешения приложения в настройках Android.');
  }
  if (permission.speechRecognition !== 'granted') {
    throw new Error('Доступ к микрофону не разрешён. Откройте Настройки Android → Приложения → Učimo srpski → Разрешения → Микрофон.');
  }
  const availability = await SpeechRecognition.available();
  if (!availability.available) {
    throw new Error('На устройстве не найден сервис распознавания речи. Установите или включите Службы распознавания речи Google.');
  }
  try {
    const result = await SpeechRecognition.start({
      language: lang,
      maxResults: 3,
      prompt: 'Повторите фразу на сербском языке',
      partialResults: false,
      popup: true,
    });
    return Array.isArray(result.matches) ? result.matches : [];
  } catch (error) {
    console.error('[Učimo srpski] Speech recognition failed:', error);
    throw new Error('Не удалось распознать речь. Проверьте настройки микрофона и сервис распознавания Google.');
  }
}

window.UcimoNativeAudio = {
  isNative,
  speak,
  speakMany: async (items, lang = 'sr') => {
    if (!isNative) return false;
    await stop();
    for (const item of items || []) {
      const ok = await speak(item, lang, 0.85, 1);
      if (!ok) return false;
    }
    return true;
  },
  stop,
  listen,
};
