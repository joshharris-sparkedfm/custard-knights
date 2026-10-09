"""Synthetic PCM fixtures only; these tests do not audition any soundtrack."""
import hashlib
import importlib.util
import json
from pathlib import Path
import struct
import subprocess
import sys
import tempfile
import unittest

SCRIPT = Path(__file__).resolve().parents[1] / "scripts" / "inspect-soundtrack.py"
spec = importlib.util.spec_from_file_location("inspect_soundtrack", SCRIPT)
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)


def wav_bytes(samples, bits=16, channels=1, rate=10, extensible=False, encoding=1):
    width = bits // 8
    fmt = struct.pack("<HHIIHH", 0xFFFE if extensible else encoding, channels, rate, rate * channels * width, channels * width, bits)
    if extensible:
        fmt += struct.pack("<HHI", 22, bits, 0) + module.PCM_GUID
    pcm = b"".join(bytes([sample + 128]) if width == 1 else sample.to_bytes(width, "little", signed=True) for sample in samples)
    body = b"WAVE" + b"fmt " + struct.pack("<I", len(fmt)) + fmt + b"data" + struct.pack("<I", len(pcm)) + pcm
    if len(pcm) & 1:
        body += b"\0"
    return b"RIFF" + struct.pack("<I", len(body)) + body


class InspectorTests(unittest.TestCase):
    def setUp(self):
        self.directory = tempfile.TemporaryDirectory(prefix="ck-wav-inspection-")
        self.addCleanup(self.directory.cleanup)
        self.file = Path(self.directory.name) / "test.wav"

    def inspect(self, data):
        self.file.write_bytes(data)
        return module.inspect_wav(self.file)

    def test_pcm_widths_peak_silence_hash_and_nonmutation(self):
        for bits in (8, 16, 24, 32):
            with self.subTest(bits=bits):
                maximum = (1 << (bits - 1)) - 1
                data = wav_bytes([0, 0, maximum, -maximum - 1, 0], bits=bits)
                report = self.inspect(data)
                self.assertEqual(report["duration_seconds"], 0.5)
                self.assertEqual(report["leading_silence_seconds"], 0.2)
                self.assertEqual(report["trailing_silence_seconds"], 0.1)
                self.assertEqual(report["peak_dbfs"], 0)
                self.assertEqual(report["full_scale_samples"], 2)
                self.assertTrue(report["possible_clipping"])
                self.assertFalse(report["loop_verified"])
                self.assertEqual(report["sha256"], hashlib.sha256(data).hexdigest())
                self.assertEqual(self.file.read_bytes(), data)

    def test_extensible_stereo_uses_activity_in_either_channel(self):
        report = self.inspect(wav_bytes([0, 0, 0, 16384, 0, 0], channels=2, extensible=True))
        self.assertEqual(report["channels"], 2)
        self.assertEqual(report["frames"], 3)
        self.assertEqual(report["leading_silence_seconds"], 0.1)
        self.assertEqual(report["trailing_silence_seconds"], 0.1)
        self.assertFalse(report["possible_clipping"])

    def test_silence_has_finite_json_and_no_false_loop_claim(self):
        report = self.inspect(wav_bytes([0] * 10))
        self.assertTrue(report["all_below_silence_threshold"])
        self.assertEqual(report["leading_silence_seconds"], 1)
        self.assertEqual(report["trailing_silence_seconds"], 1)
        self.assertIsNone(report["peak_dbfs"])
        json.dumps(report, allow_nan=False)

    def test_truncation_float_encoding_and_empty_audio_rejected(self):
        for data in (wav_bytes([1, 2])[:-1], wav_bytes([0], bits=32, encoding=3), wav_bytes([])):
            with self.subTest(data=data):
                with self.assertRaises(ValueError):
                    self.inspect(data)

    def test_cli_reports_success_and_failure_without_changing_files(self):
        self.file.write_bytes(wav_bytes([0, 1000, 0]))
        result = subprocess.run([sys.executable, str(SCRIPT), str(self.file), str(self.file.with_name("missing.wav"))], capture_output=True, text=True)
        self.assertEqual(result.returncode, 1)
        output = json.loads(result.stdout)
        self.assertEqual(len(output["files"]), 1)
        self.assertEqual(len(output["errors"]), 1)


if __name__ == "__main__":
    unittest.main()
