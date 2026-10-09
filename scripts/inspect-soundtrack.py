#!/usr/bin/env python3
"""Read-only integer PCM RIFF/WAVE inspection; never edits or resamples audio."""
import argparse
import hashlib
import json
import math
from pathlib import Path
import struct

PCM_GUID = bytes.fromhex("0100000000001000800000aa00389b71")


def inspect_wav(filename, silence_db=-60.0):
    if not math.isfinite(silence_db) or silence_db > 0:
        raise ValueError("Silence threshold must be finite and no greater than 0 dBFS")
    source = Path(filename)
    digest = hashlib.sha256()
    with source.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
        file_bytes = handle.tell()
        handle.seek(0)
        header = handle.read(12)
        if len(header) != 12 or header[:4] != b"RIFF" or header[8:] != b"WAVE":
            raise ValueError("Expected a little-endian RIFF/WAVE file")
        riff_end = struct.unpack_from("<I", header, 4)[0] + 8
        if riff_end > file_bytes:
            raise ValueError("Truncated RIFF container")
        fmt, data = None, None
        while handle.tell() + 8 <= riff_end:
            chunk_id, size = struct.unpack("<4sI", handle.read(8))
            offset = handle.tell()
            if offset + size > riff_end:
                raise ValueError("Truncated WAVE chunk")
            if chunk_id == b"fmt ":
                if fmt is not None or size < 16:
                    raise ValueError("Invalid WAVE format chunk")
                fmt = handle.read(min(size, 40))
            elif chunk_id == b"data":
                if data is not None:
                    raise ValueError("Multiple audio data chunks are not supported")
                data = (offset, size)
            handle.seek(offset + size + (size & 1))
        if fmt is None or data is None:
            raise ValueError("WAVE format or audio data chunk is missing")
        encoding, channels, rate, byte_rate, alignment, bits = struct.unpack_from("<HHIIHH", fmt)
        valid_bits = bits
        if encoding == 0xFFFE:
            if len(fmt) < 40 or struct.unpack_from("<H", fmt, 16)[0] < 22 or fmt[24:40] != PCM_GUID:
                raise ValueError("Only integer PCM WAVE_EXTENSIBLE is supported")
            valid_bits = struct.unpack_from("<H", fmt, 18)[0] or bits
        elif encoding != 1:
            raise ValueError("Only integer PCM WAV is supported; no conversion was performed")
        width = bits // 8
        if bits not in (8, 16, 24, 32) or not 0 < valid_bits <= bits or channels < 1 or rate < 1:
            raise ValueError("Unsupported PCM channel, sample-rate or bit-depth fields")
        if alignment != channels * width or byte_rate != rate * alignment or data[1] % alignment:
            raise ValueError("Invalid PCM frame alignment or byte rate")
        frame_count = data[1] // alignment
        if not frame_count:
            raise ValueError("WAV contains no audio frames")
        minimum, maximum = -(1 << (valid_bits - 1)), (1 << (valid_bits - 1)) - 1
        padding = bits - valid_bits
        silence_threshold = 10 ** (silence_db / 20)
        peak, full_scale_samples = 0.0, 0
        first_active, last_active, frame_at = None, None, 0
        handle.seek(data[0])
        remaining = data[1]
        while remaining:
            raw = handle.read(min(65536 * alignment, remaining))
            if not raw or len(raw) % alignment:
                raise ValueError("Truncated PCM audio data")
            remaining -= len(raw)
            for frame_offset in range(0, len(raw), alignment):
                frame_peak = 0.0
                for channel in range(channels):
                    offset = frame_offset + channel * width
                    value = (raw[offset] - 128) if width == 1 else int.from_bytes(raw[offset:offset + width], "little", signed=True)
                    value >>= padding
                    magnitude = abs(value) / (maximum if value > 0 else -minimum)
                    frame_peak = max(frame_peak, magnitude)
                    if value == minimum or value == maximum:
                        full_scale_samples += 1
                peak = max(peak, frame_peak)
                if frame_peak > silence_threshold:
                    if first_active is None:
                        first_active = frame_at
                    last_active = frame_at
                frame_at += 1
        all_silent = first_active is None
        return {
            "path": str(source.resolve()), "sha256": digest.hexdigest(), "file_bytes": file_bytes,
            "encoding": "integer PCM", "sample_rate_hz": rate, "channels": channels,
            "container_bits": bits, "valid_bits": valid_bits, "frames": frame_count,
            "duration_seconds": frame_count / rate, "peak_fraction": peak,
            "peak_dbfs": 20 * math.log10(peak) if peak else None,
            "full_scale_samples": full_scale_samples,
            "possible_clipping": full_scale_samples > 0,
            "silence_threshold_dbfs": silence_db, "all_below_silence_threshold": all_silent,
            "leading_silence_seconds": (frame_count if all_silent else first_active) / rate,
            "trailing_silence_seconds": (frame_count if all_silent else frame_count - last_active - 1) / rate,
            "loop_verified": False,
            "notes": "Full-scale samples flag possible clipping, not proof of distortion. Silence is threshold-based. No loudness, musical-loop or listening assessment was performed."
        }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("files", nargs="+", help="Original PCM .wav files to inspect")
    parser.add_argument("--silence-db", type=float, default=-60.0, help="Silence threshold in dBFS (default -60)")
    args = parser.parse_args()
    results, errors = [], []
    for filename in args.files:
        try:
            results.append(inspect_wav(filename, args.silence_db))
        except (OSError, ValueError, struct.error) as error:
            errors.append({"path": filename, "error": str(error)})
    print(json.dumps({"files": results, "errors": errors}, indent=2, allow_nan=False))
    return 1 if errors else 0


if __name__ == "__main__":
    raise SystemExit(main())
