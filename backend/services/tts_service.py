import os
import uuid
try:
    from gtts import gTTS
    GTTS_AVAILABLE = True
except ImportError:
    GTTS_AVAILABLE = False

class TTSService:
    def __init__(self):
        # Use /tmp on Vercel (only writable dir in serverless), fallback to local static
        self.output_dir = '/tmp/audio' if os.getenv('VERCEL') else os.path.join(os.getcwd(), 'static', 'audio')
        try:
            os.makedirs(self.output_dir, exist_ok=True)
        except Exception:
            self.output_dir = '/tmp/audio'
            os.makedirs(self.output_dir, exist_ok=True)


    def generate_audio_gtts(self, text, language='en'):
        """
        Generates an MP3 file using gTTS (Free Google TTS API).
        """
        try:
            # Map languages to gTTS codes
            lang_map = {
                'en': 'en',
                'hi': 'hi',
                'te': 'te'
            }
            target_lang = lang_map.get(language, 'en')

            # Generate filename
            filename = f"speech_{uuid.uuid4()}.mp3"
            filepath = os.path.join(self.output_dir, filename)

            # Create gTTS object
            tts = gTTS(text=text, lang=target_lang, slow=False)
            tts.save(filepath)

            # Return the relative URL path to be served by Flask
            return f"/static/audio/{filename}"

        except Exception as e:
            print(f"gTTS Error: {e}")
            return None

    def generate_audio_elevenlabs(self, text, language='en'):
        """
        Generates audio using ElevenLabs API (Ultra Realistic).
        """
        try:
            api_key = os.getenv('ELEVENLABS_API_KEY')
            if not api_key:
                print("ElevenLabs Error: No API Key found.")
                return None

            import requests
            
            # Voice ID (Example: 'Josh' - deep narration voice, good for mentors)
            # You can change this to other voice IDs from ElevenLabs
            voice_id = "TxGEqnHWrfWFTfGW9XjX" 
            
            url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}"
            
            headers = {
                "Accept": "audio/mpeg",
                "Content-Type": "application/json",
                "xi-api-key": api_key
            }
            
            data = {
                "text": text,
                "model_id": "eleven_multilingual_v2",
                "voice_settings": {
                    "stability": 0.5,
                    "similarity_boost": 0.5
                }
            }
            
            response = requests.post(url, json=data, headers=headers)
            
            if response.status_code != 200:
                print(f"ElevenLabs API Error: {response.text}")
                return None
                
            # Save file
            filename = f"speech_eleven_{uuid.uuid4()}.mp3"
            filepath = os.path.join(self.output_dir, filename)
            
            with open(filepath, 'wb') as f:
                for chunk in response.iter_content(chunk_size=1024):
                    if chunk:
                        f.write(chunk)
                        
            return f"/static/audio/{filename}"

        except Exception as e:
            print(f"ElevenLabs Service Error: {e}")
            return None

tts_service = TTSService()
