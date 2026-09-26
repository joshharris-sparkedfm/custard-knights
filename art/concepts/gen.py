"""
Custard Knights concept exploration on the local ComfyUI (RTX 5090).
Only Apache-2.0 models are used so every output is safe for commercial reference:
  - Qwen-Image 2512 (fp8)   : strong at clean flat illustration, turnarounds, text
  - FLUX.1 schnell (fp8)    : fast, 4 steps
Concepts are reference for hand-built game art, not shipped assets.
Usage: python gen.py <batch-name>   (batches defined at the bottom)
"""
import json, os, sys, time, urllib.request, urllib.parse, uuid

COMFY = "http://127.0.0.1:8188"
HERE = os.path.dirname(os.path.abspath(__file__))


def qwen_wf(prompt, seed, w, h, steps=28, cfg=3.0, prefix="ck", neg=""):
    return {
        "1": {"class_type": "UNETLoader", "inputs": {"unet_name": "qwen_image_2512_fp8.safetensors", "weight_dtype": "default"}},
        "2": {"class_type": "CLIPLoader", "inputs": {"clip_name": "qwen_2.5_vl_7b_fp8_scaled.safetensors", "type": "qwen_image"}},
        "3": {"class_type": "VAELoader", "inputs": {"vae_name": "qwen_image_vae.safetensors"}},
        "4": {"class_type": "ModelSamplingAuraFlow", "inputs": {"model": ["1", 0], "shift": 3.1}},
        "5": {"class_type": "CLIPTextEncode", "inputs": {"text": prompt, "clip": ["2", 0]}},
        "6": {"class_type": "CLIPTextEncode", "inputs": {"text": neg, "clip": ["2", 0]}},
        "7": {"class_type": "EmptySD3LatentImage", "inputs": {"width": w, "height": h, "batch_size": 1}},
        "8": {"class_type": "KSampler", "inputs": {"model": ["4", 0], "seed": seed, "steps": steps, "cfg": cfg,
              "sampler_name": "euler", "scheduler": "simple", "positive": ["5", 0], "negative": ["6", 0],
              "latent_image": ["7", 0], "denoise": 1.0}},
        "9": {"class_type": "VAEDecode", "inputs": {"samples": ["8", 0], "vae": ["3", 0]}},
        "10": {"class_type": "SaveImage", "inputs": {"images": ["9", 0], "filename_prefix": prefix}},
    }


def schnell_wf(prompt, seed, w, h, prefix="ck"):
    return {
        "1": {"class_type": "CheckpointLoaderSimple", "inputs": {"ckpt_name": "flux1-schnell-fp8.safetensors"}},
        "2": {"class_type": "CLIPTextEncode", "inputs": {"text": prompt, "clip": ["1", 1]}},
        "3": {"class_type": "CLIPTextEncode", "inputs": {"text": "", "clip": ["1", 1]}},
        "5": {"class_type": "EmptySD3LatentImage", "inputs": {"width": w, "height": h, "batch_size": 1}},
        "6": {"class_type": "KSampler", "inputs": {"model": ["1", 0], "seed": seed, "steps": 4, "cfg": 1.0,
              "sampler_name": "euler", "scheduler": "simple", "positive": ["2", 0], "negative": ["3", 0],
              "latent_image": ["5", 0], "denoise": 1.0}},
        "7": {"class_type": "VAEDecode", "inputs": {"samples": ["6", 0], "vae": ["1", 2]}},
        "8": {"class_type": "SaveImage", "inputs": {"images": ["7", 0], "filename_prefix": prefix}},
    }


def post(wf):
    data = json.dumps({"prompt": wf, "client_id": str(uuid.uuid4())}).encode()
    req = urllib.request.Request(COMFY + "/prompt", data=data, headers={"Content-Type": "application/json"})
    try:
        return json.loads(urllib.request.urlopen(req).read())["prompt_id"]
    except urllib.error.HTTPError as e:
        raise RuntimeError(e.read().decode()[:1500])


def wait(pid, timeout=900):
    end = time.time() + timeout
    while time.time() < end:
        h = json.loads(urllib.request.urlopen(COMFY + "/history/" + pid).read())
        if pid in h:
            st = h[pid].get("status", {})
            if st.get("status_str") == "error":
                raise RuntimeError(json.dumps(st)[:1500])
            return [im for node in h[pid]["outputs"].values() for im in node.get("images", [])]
        time.sleep(1.5)
    raise TimeoutError(pid)


def fetch(im, dest):
    q = urllib.parse.urlencode({"filename": im["filename"], "subfolder": im.get("subfolder", ""), "type": im.get("type", "output")})
    with urllib.request.urlopen(COMFY + "/view?" + q) as r, open(dest, "wb") as f:
        f.write(r.read())


def run(batch, jobs):
    out = os.path.join(HERE, batch); os.makedirs(out, exist_ok=True)
    t0 = time.time()
    for i, j in enumerate(jobs, 1):
        dest = os.path.join(out, j["name"] + ".png")
        if os.path.exists(dest):
            print(f"[{i}/{len(jobs)}] skip {j['name']}"); continue
        if j.get("model") == "schnell":
            wf = schnell_wf(j["prompt"], j["seed"], j.get("w", 1024), j.get("h", 1024), prefix=j["name"])
        else:
            wf = qwen_wf(j["prompt"], j["seed"], j.get("w", 1328), j.get("h", 1328), prefix=j["name"], neg=j.get("neg", NEG))
        fetch(wait(post(wf))[0], dest)
        print(f"[{i}/{len(jobs)}] {j['name']}  ({time.time()-t0:.0f}s)", flush=True)


NEG = "photo, photorealistic, 3d render, realistic armour, grim, blood, gore, text, watermark, logo, signature, blurry, noisy, muddy colours, extra limbs"

KNIGHT = ("a small chunky cartoon knight mascot character for a party video game, chibi proportions with a big round steel helmet "
          "and a stubby body, bright red tabard with a cream star emblem, round red shoulder pads, stubby legs with brown boots, "
          "a short broad sword and a heater shield, big expressive cartoon eyes glowing through the visor slit, "
          "a glossy dollop of yellow vanilla custard sitting on top of the helmet with drips running down, a red feather plume")
STYLES = {
    "castlecrashers": "in the style of a hand-drawn 2D cartoon game like Castle Crashers, thick black ink outlines, flat bold colours, simple cel shading",
    "cuphead": "in a playful modern animated cartoon style, thick clean ink linework, bouncy rubber-hose appeal, bright saturated flat colours with one shadow tone",
    "brawlstars": "in a polished modern mobile party game style like Brawl Stars and Fall Guys, chunky shapes, clean cel shading with soft rim light, vivid palette",
    "knightsquad": "in a crisp top-down arena brawler game art style like Knight Squad, bold dark outlines, flat colours, readable silhouette",
    "rayman": "in a lush painterly cartoon style like Rayman Legends, bright colours, soft painted shading, clean silhouette",
    "sticker": "as a clean vector sticker illustration, thick uniform outline, flat colours with cel shadows and a white highlight, very readable",
}

BATCHES = {
    # one hero knight across six art directions
    "styles": [dict(name=f"style_{k}_{s}", prompt=f"{KNIGHT}, full body, three-quarter front view, standing in a confident heroic pose, plain light cream background, {v}", seed=s)
               for k, v in STYLES.items() for s in (11, 12)],
    # a turnaround for the chosen style (filled in after review)
    "turnaround": [],
}

if __name__ == "__main__":
    b = sys.argv[1] if len(sys.argv) > 1 else "styles"
    run(b, BATCHES[b])
