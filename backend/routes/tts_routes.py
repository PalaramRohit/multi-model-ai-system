from flask import Blueprint, request, jsonify
from services.tts_service import tts_service

tts_bp = Blueprint('tts', __name__)

@tts_bp.route('/generate', methods=['POST'])
def generate_speech():
    data = request.json
    text = data.get('text')
    language = data.get('language', 'en')

    if not text:
        return jsonify({'error': 'No text provided'}), 400

    import os
    
    # Smart Switching: Use ElevenLabs if Key exists, else gTTS
    if os.getenv('ELEVENLABS_API_KEY'):
        audio_url = tts_service.generate_audio_elevenlabs(text, language)
    
    # Fallback to gTTS if ElevenLabs failed or Key missing
    if not audio_url:
        print("ElevenLabs failed or unavailable, falling back to gTTS")
        audio_url = tts_service.generate_audio_gtts(text, language)

    if audio_url:
        # Return the full URL (assuming localhost for now, ideally updated with domain)
        full_url = f"http://localhost:5000{audio_url}"
        return jsonify({'audio_url': full_url})
    else:
        return jsonify({'error': 'Failed to generate audio'}), 500
