import { Language } from '../types';

export type SpeechAudioState = 'idle' | 'playing' | 'paused' | 'loading';

class EnhancedSpeechNarrator {
  private currentState: SpeechAudioState = 'idle';
  private currentCardId: string | null = null;
  private currentAudioElement: HTMLAudioElement | null = null;
  private currentText: string = '';
  private currentLanguage: Language = 'en';
  private listeners: Array<(state: SpeechAudioState, cardId: string | null) => void> = [];

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = () => {};
    }
  }

  public subscribe(listener: (state: SpeechAudioState, cardId: string | null) => void): () => void {
    this.listeners.push(listener);
    listener(this.currentState, this.currentCardId);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify(state: SpeechAudioState, cardId: string | null = this.currentCardId) {
    this.currentState = state;
    this.currentCardId = cardId;
    this.listeners.forEach(l => l(state, cardId));
  }

  public async play(cardId: string, text: string, language: Language = 'en') {
    // If already playing this card and paused, resume
    if (this.currentCardId === cardId && this.currentState === 'paused') {
      this.resume();
      return;
    }

    this.stop();
    this.currentCardId = cardId;
    this.currentText = text;
    this.currentLanguage = language;
    this.notify('loading', cardId);

    try {
      // 1. Attempt Server-side high quality Gemini TTS
      const res = await fetch('/api/synthesize-speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, language })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.audioBase64) {
          const audioSrc = `data:${data.mimeType || 'audio/wav'};base64,${data.audioBase64}`;
          const audio = new Audio(audioSrc);
          this.currentAudioElement = audio;

          audio.onplay = () => this.notify('playing', cardId);
          audio.onpause = () => {
            if (this.currentState === 'playing') {
              this.notify('paused', cardId);
            }
          };
          audio.onended = () => {
            this.notify('idle', null);
            this.currentAudioElement = null;
          };
          audio.onerror = () => {
            console.warn('Audio element playback error, falling back to browser synthesis');
            this.fallbackBrowserSpeech(text, language, cardId);
          };

          await audio.play();
          return;
        }
      }
    } catch (err) {
      console.warn('Server TTS unavailable, using browser speech engine:', err);
    }

    // 2. Fallback to Browser SpeechSynthesis
    this.fallbackBrowserSpeech(text, language, cardId);
  }

  private fallbackBrowserSpeech(text: string, language: Language, cardId: string) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      this.notify('idle', null);
      return;
    }

    window.speechSynthesis.cancel();

    const cleanText = text
      .replace(/₹/g, 'Rupees ')
      .replace(/[*_#`]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = language === 'hi' ? 0.9 : 0.95;
    utterance.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();
    if (language === 'hi') {
      const hindiVoice = voices.find(v => v.lang.startsWith('hi') || v.name.includes('Hindi'));
      if (hindiVoice) utterance.voice = hindiVoice;
      utterance.lang = 'hi-IN';
    } else {
      const indianVoice = voices.find(v => v.lang === 'en-IN' || v.name.includes('India'));
      if (indianVoice) utterance.voice = indianVoice;
      utterance.lang = 'en-IN';
    }

    utterance.onstart = () => this.notify('playing', cardId);
    utterance.onend = () => {
      this.notify('idle', null);
    };
    utterance.onerror = () => {
      this.notify('idle', null);
    };

    window.speechSynthesis.speak(utterance);
  }

  public pause() {
    if (this.currentAudioElement && !this.currentAudioElement.paused) {
      this.currentAudioElement.pause();
      this.notify('paused', this.currentCardId);
    } else if (typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis.speaking) {
      window.speechSynthesis.pause();
      this.notify('paused', this.currentCardId);
    }
  }

  public resume() {
    if (this.currentAudioElement && this.currentAudioElement.paused) {
      this.currentAudioElement.play();
      this.notify('playing', this.currentCardId);
    } else if (typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      this.notify('playing', this.currentCardId);
    } else if (this.currentCardId && this.currentText) {
      this.play(this.currentCardId, this.currentText, this.currentLanguage);
    }
  }

  public toggle(text: string, language: Language = 'en', cardId: string = 'global') {
    if (this.currentState === 'playing') {
      this.pause();
    } else if (this.currentState === 'paused') {
      this.resume();
    } else {
      this.play(cardId, text, language);
    }
  }

  public replay(cardId: string, text: string, language: Language = 'en') {
    this.stop();
    this.play(cardId, text, language);
  }

  public stop() {
    if (this.currentAudioElement) {
      this.currentAudioElement.pause();
      this.currentAudioElement.currentTime = 0;
      this.currentAudioElement = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    this.notify('idle', null);
  }
}

export const speechNarrator = new EnhancedSpeechNarrator();

// Voice Recorder Helper with Server-Side Gemini 3.5 Transcribe
export class VoiceRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private stream: MediaStream | null = null;

  public async startRecording(): Promise<void> {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('Microphone recording is not supported in this browser.');
    }

    this.audioChunks = [];
    this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    
    // Choose best supported mime type
    let mimeType = 'audio/webm';
    if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
      mimeType = 'audio/webm;codecs=opus';
    } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
      mimeType = 'audio/mp4';
    }

    this.mediaRecorder = new MediaRecorder(this.stream, { mimeType });

    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        this.audioChunks.push(event.data);
      }
    };

    this.mediaRecorder.start(250); // Slice chunks every 250ms
  }

  public async stopRecordingAndTranscribe(language: Language = 'hi'): Promise<{ transcript: string; error?: string }> {
    return new Promise((resolve) => {
      if (!this.mediaRecorder) {
        return resolve({ transcript: '', error: 'Recorder not initialized' });
      }

      this.mediaRecorder.onstop = async () => {
        try {
          const audioBlob = new Blob(this.audioChunks, { type: this.mediaRecorder?.mimeType || 'audio/webm' });

          // Convert blob to base64
          const reader = new FileReader();
          reader.readAsDataURL(audioBlob);
          reader.onloadend = async () => {
            const base64Data = reader.result as string;

            try {
              const res = await fetch('/api/transcribe-audio', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  audioBase64: base64Data,
                  mimeType: audioBlob.type,
                  language
                })
              });

              if (res.ok) {
                const data = await res.json();
                resolve({ transcript: data.transcript || '' });
              } else {
                resolve({ transcript: '', error: 'Transcription server error' });
              }
            } catch (err: any) {
              resolve({ transcript: '', error: err.message || 'Failed to reach speech service' });
            } finally {
              this.cleanup();
            }
          };
        } catch (e: any) {
          this.cleanup();
          resolve({ transcript: '', error: e.message });
        }
      };

      this.mediaRecorder.stop();
    });
  }

  public cancelRecording() {
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }
    this.cleanup();
  }

  private cleanup() {
    if (this.stream) {
      this.stream.getTracks().forEach(t => t.stop());
      this.stream = null;
    }
    this.mediaRecorder = null;
    this.audioChunks = [];
  }
}
