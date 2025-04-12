import sys
import whisper
import tempfile
import os


def transcribe_audio():
    model = whisper.load_model("base")

    with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as temp_audio:
        temp_audio.write(sys.stdin.buffer.read())
        temp_audio_path = temp_audio.name

    result = model.transcribe(temp_audio_path)
    print(result["text"])

    os.remove(temp_audio_path)


if __name__ == "__main__":
    transcribe_audio()
