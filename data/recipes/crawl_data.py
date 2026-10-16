import urllib.request
import re
import json

HEADERS = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}


def get_cookpad_recipe(recipe_url: str):
    req = urllib.request.Request(recipe_url, headers=HEADERS)
    with urllib.request.urlopen(req, timeout=10) as resp:
        html = resp.read().decode("utf-8")

    # Tìm đoạn JSON-LD trong HTML
    ld_jsons = re.findall(
        r'<script type="application/ld\+json">(.*?)</script>', html, re.DOTALL
    )
    for block in ld_jsons:
        if '"@type":"Recipe"' in block or '"@type": "Recipe"' in block:
            data = json.loads(block.strip())
            return {
                "title": data.get("name"),
                "servings": data.get("recipeYield"),
                "ingredients": data.get("recipeIngredient"),
                "steps": [
                    step.get("text") for step in data.get("recipeInstructions", [])
                ],
                "image": data.get("image"),
                "source_url": recipe_url,
            }
    return None


# Thử nghiệm với 1 món cụ thể
recipe = get_cookpad_recipe("https://cookpad.com/vn/cong-thuc/26621272")
print(json.dumps(recipe, ensure_ascii=False, indent=2))
