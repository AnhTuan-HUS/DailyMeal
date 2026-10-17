#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
DAILYMEAL - DATA PIPELINE: CRAWL -> LEVEL 1 DEDUP -> LEVEL 2 DEEP DEDUP & 1-SERVING NORMALIZATION
Bản quyền: Đội ngũ phát triển DailyMeal / SmartKitchen (2026)

Kiến trúc Pipeline chuẩn mực:
1. Đọc dữ liệu từ data/recipes/raw/<cooking_method>/<recipe_id>.json (Hỗ trợ chạy tăng dần - Incremental).
2. Level 1 Dedup (Khử trùng lặp mức 1):
   - Loại bỏ các công thức không có định lượng số.
   - Chuẩn hóa tên (xóa stop words, mã rác, chuẩn hóa từ đồng nghĩa, viết hoa chuẩn).
   - Gộp các công thức trùng khớp 100% tên chuẩn trong cùng cooking_method.
3. Level 2 Deep Dedup (Khử trùng lặp sâu & Chuẩn hóa 1 phần ăn):
   - Gom cụm tương đồng mờ (Fuzzy Token Sort Ratio >= 85%).
   - Chấm điểm Quality Score để chọn bản ghi đại diện tốt nhất cho cụm.
   - Bóc tách / Ước lượng số suất gốc (dựa trên mốc chuẩn 100g đạm tươi).
   - Quy đổi danh sách nguyên liệu về 1 suất ăn (servings: '1 phần ăn').
   - Làm mượt câu chữ các bước nấu (Action-oriented text), khử số lượng cứng, bảo toàn số phút hẹn giờ.
4. Lưu trữ:
   - Ghi ra data/recipes/processed/<cooking_method>/<recipe_id>.json.
   - Định dạng giữ nguyên 100% các trường như raw data, không lưu đường dẫn máy tính tuyệt đối.
"""

import os
import re
import json
import unicodedata
from pathlib import Path
from difflib import SequenceMatcher
from collections import defaultdict
from typing import Any

# ==============================================================================
# HẰNG SỐ & ĐƯỜNG DẪN TƯƠNG ĐỐI
# ==============================================================================

BASE_DIR = Path(__file__).resolve().parent
RAW_DIR = BASE_DIR / "raw"
PROCESSED_DIR = BASE_DIR / "processed"
CATALOG_FILE = PROCESSED_DIR / "catalog.json"

SIMILARITY_THRESHOLD = 0.85
PROTEIN_BASELINE_GRAMS = 100.0

STOP_WORDS = [
    "cách làm", "hướng dẫn", "món", "thơm ngon", "chuẩn vị",
    "siêu ngon", "đơn giản", "dễ làm", "tại nhà", "bữa cơm gia đình",
    "ngon mê ly", "cực đỉnh", "đậm đà", "chuẩn mẹ nấu", "nhanh gọn",
    "siêu tốc", "ngon tuyệt", "đưa cơm", "hấp dẫn", "ngon lành",
    "cực ngon", "ngon chuẩn vị"
]

SYNONYMS = {
    "thịt xay": "thịt băm",
    "thịt bằm": "thịt băm",
    "ba rọi": "ba chỉ",
    "thịt rọi": "ba chỉ",
    "bắp ngọt": "ngô ngọt",
    "bắp mỹ": "ngô ngọt",
    "bắp": "ngô",
    "hột vịt": "trứng vịt",
    "hột gà": "trứng gà",
    "trái": "quả",
    "bông cải xanh": "súp lơ xanh",
    "bông cải trắng": "súp lơ trắng",
    "cà chua bi": "cà chua",
    "hành lá": "hành hoa",
    "nấm đông cô": "nấm hương",
}

STALL_MAPPING = {
    "thịt": "meat_seafood", "sườn": "meat_seafood", "ba chỉ": "meat_seafood",
    "bò": "meat_seafood", "heo": "meat_seafood", "lợn": "meat_seafood",
    "gà": "meat_seafood", "vịt": "meat_seafood", "cá": "meat_seafood",
    "tôm": "meat_seafood", "mực": "meat_seafood", "cua": "meat_seafood",
    "ngao": "meat_seafood", "ốc": "meat_seafood", "lươn": "meat_seafood",
    "chả": "meat_seafood", "giò": "meat_seafood", "trứng": "egg_tofu",
    "đậu phụ": "egg_tofu", "đậu hũ": "egg_tofu", "đậu": "egg_tofu",
    "rau": "produce", "cải": "produce", "muống": "produce", "ngót": "produce",
    "mồng tơi": "produce", "mướp": "produce", "bí": "produce", "bầu": "produce",
    "cà rốt": "produce", "khoai": "produce", "cà chua": "produce", "dưa": "produce",
    "nấm": "produce", "ngô": "produce", "hành": "produce", "tỏi": "produce",
    "gừng": "produce", "sả": "produce", "ớt": "produce", "chanh": "produce"
}

UNIT_CONVERSIONS = {
    "kg": ("g", 1000.0), "kí": ("g", 1000.0), "lạng": ("g", 100.0),
    "gr": ("g", 1.0), "gram": ("g", 1.0), "g": ("g", 1.0),
    "lít": ("ml", 1000.0), "lit": ("ml", 1000.0), "l": ("ml", 1000.0), "ml": ("ml", 1.0),
    "muỗng canh": ("ml", 15.0), "thìa canh": ("ml", 15.0),
    "muỗng cà phê": ("ml", 5.0), "thìa cà phê": ("ml", 5.0), "mcp": ("ml", 5.0),
    "muỗng cf": ("ml", 5.0), "thìa cf": ("ml", 5.0),
    "bát": ("ml", 250.0), "chén": ("ml", 250.0)
}


# ==============================================================================
# LỚP 1: XỬ LÝ & LÀM SẠCH TIÊU ĐỀ
# ==============================================================================

class TitleCleaner:
    @staticmethod
    def normalize_text(text: str) -> str:
        if not text:
            return ""
        text = unicodedata.normalize("NFC", text)
        return " ".join(text.strip().split())

    @classmethod
    def clean(cls, title: str) -> str:
        text = cls.normalize_text(title)
        text = re.sub(r"^SP\.\d+\s*[-–:]\s*", "", text, flags=re.IGNORECASE)
        text = re.sub(r"\[.*?\]|\(.*?\)", "", text)
        text = re.sub(r"^[-–#*•]+\s*", "", text)
        text = text.lower()

        for sw in STOP_WORDS:
            text = re.sub(rf"\b{re.escape(sw)}\b", "", text)

        for k, v in SYNONYMS.items():
            text = re.sub(rf"\b{re.escape(k)}\b", v, text)

        text = re.sub(r"[,:;!?.~`\'\"/\\|]", " ", text)
        cleaned = cls.normalize_text(text)
        if cleaned:
            return cleaned[0].upper() + cleaned[1:]
        return title.strip()


# ==============================================================================
# LỚP 2: BÓC TÁCH & QUY ĐỔI NGUYÊN LIỆU VỀ 1 SUẤT
# ==============================================================================

class IngredientParser:
    @staticmethod
    def parse_fraction(val_str: str) -> float | None:
        val_str = val_str.strip().replace(",", ".")
        if "/" in val_str:
            parts = val_str.split("/")
            if len(parts) == 2:
                try:
                    num, den = float(parts[0].strip()), float(parts[1].strip())
                    return num / den if den != 0 else None
                except ValueError:
                    return None
        try:
            return float(val_str)
        except ValueError:
            return None

    @classmethod
    def clean_ingredient_text(cls, line: str) -> str:
        clean = TitleCleaner.normalize_text(line).lstrip("-*• ")
        clean = re.sub(r"\(\s*(?:khoảng|tầm|chừng)?\s*\d+\s*(?:g|kg|gr|ml)\s*\)", "", clean, flags=re.IGNORECASE)
        clean = re.sub(r"^\s*1\s+ít\s+", "Ít ", clean, flags=re.IGNORECASE)
        clean = re.sub(r"^\s*một\s+ít\s+", "Ít ", clean, flags=re.IGNORECASE)
        return re.sub(r"\s+", " ", clean).strip()

    @classmethod
    def parse_raw_line(cls, line: str) -> dict[str, Any]:
        clean_line = cls.clean_ingredient_text(line)
        amount = None
        unit = "tùy ý"
        name = clean_line

        pattern = r"^(\d+(?:[.,]\d+)?(?:\s*/\s*\d+)?(?:\s*[-–]\s*\d+(?:[.,]\d+)?)?)\s*([a-zA-ZÀ-ỹ]+)?\s+(.*)$"
        m = re.match(pattern, clean_line)

        if m:
            num_str = m.group(1)
            potential_unit = m.group(2).strip().lower() if m.group(2) else ""
            rest_name = m.group(3).strip() if m.group(3) else ""

            if "-" in num_str or "–" in num_str:
                parts = re.split(r"[-–]", num_str)
                v1, v2 = cls.parse_fraction(parts[0]), cls.parse_fraction(parts[1])
                amount = (v1 + v2) / 2.0 if v1 is not None and v2 is not None else None
            else:
                amount = cls.parse_fraction(num_str)

            matched_unit = None
            for u in UNIT_CONVERSIONS:
                if potential_unit == u or potential_unit.startswith(u + " "):
                    matched_unit = u
                    break

            if matched_unit:
                target_unit, mult = UNIT_CONVERSIONS[matched_unit]
                amount = amount * mult if amount is not None else None
                unit = target_unit
                name = rest_name
            elif potential_unit in ["quả", "trứng", "củ", "tép", "nhánh", "cây", "bó", "miếng", "con"]:
                unit = potential_unit
                name = rest_name
            else:
                name = f"{potential_unit} {rest_name}".strip()
        else:
            m_comp = re.match(r"^(\d+(?:[.,]\d+)?)\s*(g|kg|gr|ml|l)\s+(.*)$", clean_line, re.IGNORECASE)
            if m_comp:
                num_val = float(m_comp.group(1).replace(",", "."))
                u_comp = m_comp.group(2).lower()
                name = m_comp.group(3).strip()
                if u_comp in UNIT_CONVERSIONS:
                    target_unit, mult = UNIT_CONVERSIONS[u_comp]
                    amount = num_val * mult
                    unit = target_unit

        stall = "spices_dry"
        name_lower = name.lower()
        for kw, s in STALL_MAPPING.items():
            if kw in name_lower:
                stall = s
                break

        return {
            "name": name if name else clean_line,
            "raw_amount": amount,
            "unit": unit,
            "stall": stall
        }

    @classmethod
    def scale_and_format_line(cls, raw_line: str, servings: float) -> str:
        parsed = cls.parse_raw_line(raw_line)
        amt, unit, name = parsed["raw_amount"], parsed["unit"], parsed["name"]

        if amt is None or servings <= 0:
            return raw_line.strip().lstrip("-*• ")

        scaled = amt / servings
        if scaled.is_integer():
            scaled_str = f"{int(scaled)}"
        elif scaled >= 1.0:
            scaled_str = f"{scaled:.1f}".rstrip("0").rstrip(".")
        else:
            scaled_str = f"{scaled:.2f}".rstrip("0").rstrip(".")

        if unit in ["g", "ml"]:
            return f"{scaled_str}{unit} {name}"
        elif unit in ["quả", "trứng", "củ", "tép", "nhánh", "cây", "bó", "miếng", "con"]:
            return f"{scaled_str} {unit} {name}"
        elif unit != "tùy ý":
            return f"{scaled_str} {unit} {name}"
        return f"{scaled_str} {name}"


# ==============================================================================
# LỚP 3: LÀM MƯỢT VĂN BẢN CÁC BƯỚC NẤU (ACTION-ORIENTED STEP SANITIZER)
# ==============================================================================

class StepSanitizer:
    @staticmethod
    def sanitize(text: str) -> str:
        if not text:
            return ""

        # 1. Bảo vệ các mốc thời gian và nhiệt độ (VD: 15 phút, 2p, 180 độ C, 20-30s)
        time_tokens = []
        def save_time(m):
            time_tokens.append(m.group(0))
            return f"__TIME_TOKEN_{len(time_tokens)-1}__"

        time_pattern = r"(\b\d+(?:[.,]\d+)?\s*(?:[-–]\s*\d+(?:[.,]\d+)?\s*)?(?:phút|giây|tiếng|giờ|p|s|h|độ\s*C|°C)\b)"
        text = re.sub(time_pattern, save_time, text, flags=re.IGNORECASE)

        # 2. Xóa các con số định lượng nguyên liệu cứng
        qty_pattern = (
            r"\b\d+(?:[.,]\d+)?(?:\s*/\s*\d+)?(?:\s*[-–]\s*\d+(?:[.,]\d+)?)?\s*"
            r"(?:kg|g|gr|gram|lạng|lít|lit|l|ml|muỗng\s+canh|thìa\s+canh|muỗng\s+cà\s+phê|"
            r"thìa\s+cà\s+phê|mcp|thìa\s+cf|muỗng\s+cf|thìa|muỗng|bát|chén|quả|trứng|củ|tép|"
            r"nhánh|cây|bó|miếng|con|lát)\s*(?:của\s+)?"
        )
        text = re.sub(qty_pattern, "", text, flags=re.IGNORECASE)

        # 3. Phục hồi lại các mốc thời gian
        for i, token in enumerate(time_tokens):
            text = text.replace(f"__TIME_TOKEN_{i}__", token)

        # 4. Làm sạch dấu câu và khoảng trắng
        text = re.sub(r"\s*,\s*,+", ", ", text)
        text = re.sub(r"\(\s*\)", "", text)
        text = re.sub(r"\s+", " ", text).strip()
        return text


# ==============================================================================
# LỚP 4: ƯỚC LƯỢNG SUẤT ĂN & CHẤM ĐIỂM CHẤT LƯỢNG
# ==============================================================================

class ServingEstimator:
    @staticmethod
    def estimate(raw_servings: str | None, parsed_ings: list[dict], method: str) -> float:
        if raw_servings:
            text = raw_servings.strip().lower()
            m_range = re.search(r"(\d+)\s*[-–]\s*(\d+)", text)
            if m_range:
                return max(1.0, (float(m_range.group(1)) + float(m_range.group(2))) / 2.0)
            m_single = re.search(r"(\d+)", text)
            if m_single:
                val = float(m_single.group(1))
                if "tô" in text or "bát" in text:
                    return max(1.0, val * 1.5)
                return max(1.0, val)

        total_meat = sum(i["raw_amount"] for i in parsed_ings if i["stall"] == "meat_seafood" and i["unit"] == "g" and i["raw_amount"])
        total_eggs = sum(i["raw_amount"] for i in parsed_ings if i["stall"] == "egg_tofu" and i["unit"] in ["quả", "trứng"] and i["raw_amount"])
        total_veg = sum(i["raw_amount"] for i in parsed_ings if i["stall"] == "produce" and i["unit"] == "g" and i["raw_amount"])

        if total_meat >= 80:
            return max(1.0, round(total_meat / PROTEIN_BASELINE_GRAMS))
        elif total_eggs >= 2:
            return max(1.0, round(total_eggs / 1.0))
        elif total_veg >= 130:
            return max(1.0, round(total_veg / 130.0))

        if method in ["braised", "pan_fried", "stewed"]:
            return 4.0
        elif method in ["stir_fried", "boiled_soup"]:
            return 3.0
        return 2.0


class QualityScorer:
    @staticmethod
    def score(recipe: dict, parsed_ings: list[dict]) -> float:
        sc = 0.0
        if recipe.get("image") and recipe["image"].startswith("http"):
            sc += 2.0
        steps = recipe.get("steps") or []
        if len(steps) >= 3:
            sc += 3.0
        elif len(steps) >= 1:
            sc += 1.5
        if parsed_ings:
            valid_cnt = sum(1 for i in parsed_ings if i["raw_amount"] is not None)
            sc += (valid_cnt / len(parsed_ings)) * 4.0
        if recipe.get("cook_time"):
            sc += 1.0
        return round(sc, 2)


# ==============================================================================
# LỚP 5: PHÂN LOẠI VAI TRÒ MÓN ĂN TRONG MÂM CƠM (DISH TYPE CLASSIFIER)
# ==============================================================================

class DishTypeClassifier:
    SOUP_WORDS = ["canh", "súp", "soup", "cháo", "lẩu", "tiềm", "hầm củ", "nước lèo"]
    APPETIZER_WORDS = ["dưa chua", "dưa góp", "cà pháo", "kim chi", "muối chua", "dưa muối", "củ kiệu", "dưa leo muối"]
    DESSERT_WORDS = ["chè ", "thạch ", "sinh tố", "tráng miệng", "chè bưởi", "chè đỗ", "sữa chua"]
    STAPLE_WORDS = ["cơm chiên", "cơm rang", "xôi ", "phở ", "bún bò", "bún riêu", "bún ốc", "miến gà"]
    MEAT_WORDS = [
        "thịt", "sườn", "ba chỉ", "bò", "heo", "lợn", "gà", "vịt", "cá", "tôm",
        "mực", "cua", "ngao", "ốc", "lươn", "chả", "giò", "nem", "cánh gà",
        "đùi gà", "chân gà", "trứng", "hải sản"
    ]
    VEG_WORDS = [
        "rau", "muống", "cải", "ngót", "mồng tơi", "mướp", "bí", "bầu", "su su",
        "bắp cải", "đậu cô ve", "hoa thiên lý", "khoai", "củ quả", "nấm", "giá đỗ",
        "măng", "dọc mùng", "ngọn bí", "súp lơ", "cà tím"
    ]

    @classmethod
    def classify(cls, title: str, method: str) -> str:
        t = title.lower()

        if any(k in t for k in cls.DESSERT_WORDS):
            return "dessert"
        if any(k in t for k in cls.APPETIZER_WORDS):
            return "appetizer_condiment"
        if any(k in t for k in cls.STAPLE_WORDS):
            return "staple"
        if any(k in t for k in cls.SOUP_WORDS):
            return "soup"

        # Nếu phương pháp là boiled_soup
        if method == "boiled_soup":
            # Nếu tên có từ chiên, rán, nướng, kho và có thịt -> sửa thành main
            if any(k in t for k in ["chiên", "rán", "nướng", "kho"]) and any(k in t for k in cls.MEAT_WORDS):
                return "main"
            return "soup"

        has_meat = any(k in t for k in cls.MEAT_WORDS)
        has_veg = any(k in t for k in cls.VEG_WORDS)

        if method in ["braised", "grilled", "pan_fried", "stewed"]:
            if not has_meat and (has_veg or "đậu phụ" in t or "đậu hũ" in t):
                return "side"
            return "main"

        if method == "stir_fried":
            if has_meat and not has_veg:
                return "main"
            elif has_veg and not has_meat:
                return "side"
            elif has_meat and has_veg:
                return "main"
            return "side"

        if method == "boiled_steamed":
            if has_meat:
                return "main"
            return "side"

        if method == "tossed_salad":
            return "side"

        return "main" if has_meat else "side"


# ==============================================================================
# LỚP 5: BỘ ĐIỀU PHỐI PIPELINE CHÍNH (INCREMENTAL RECIPE PIPELINE)
# ==============================================================================

class RecipePipeline:
    def __init__(self, raw_dir: Path = RAW_DIR, processed_dir: Path = PROCESSED_DIR):
        self.raw_dir = raw_dir
        self.processed_dir = processed_dir
        self.catalog_file = CATALOG_FILE

    def get_already_processed_ids(self) -> set[str]:
        """Đọc danh sách toàn bộ các recipe_id thô đã từng được xử lý hoặc đã gộp."""
        if self.catalog_file.exists():
            try:
                with open(self.catalog_file, "r", encoding="utf-8") as fp:
                    data = json.load(fp)
                    handled = set(data.get("all_handled_raw_ids", []))
                    if handled:
                        return handled
            except Exception:
                pass

        processed_ids = set()
        if not self.processed_dir.exists():
            return processed_ids
        for p in self.processed_dir.glob("*/*.json"):
            if p.name not in ["catalog.json", "processing_report.json"]:
                processed_ids.add(p.stem)
        return processed_ids

    def run(self, force_all: bool = False):
        print("=" * 70)
        print("🚀 BẮT ĐẦU PIPELINE XỬ LÝ: CRAWL -> DEDUP L1 -> DEEP DEDUP L2 -> 1-SERVING")
        print("=" * 70)

        self.processed_dir.mkdir(parents=True, exist_ok=True)
        if force_all and self.processed_dir.exists():
            import shutil
            for item in self.processed_dir.iterdir():
                if item.is_dir():
                    shutil.rmtree(item)
                elif item.name in ["catalog.json", "processing_report.json"]:
                    item.unlink()

        already_processed_ids = set() if force_all else self.get_already_processed_ids()
        print(f"📦 Số món đã từng được xử lý trong 'processed/': {len(already_processed_ids)}")

        raw_files = list(self.raw_dir.glob("*/*.json"))
        print(f"📂 Quét thấy tổng cộng {len(raw_files)} file trong 'raw/'.")

        # 1. Tải các file cần xử lý (bỏ qua nếu đã xử lý)
        candidates = []
        for rf in raw_files:
            recipe_id = rf.stem
            if recipe_id in already_processed_ids:
                continue

            try:
                with open(rf, "r", encoding="utf-8") as fp:
                    data = json.load(fp)
                    if not data.get("title") or not data.get("ingredients"):
                        continue
                    candidates.append(data)
            except Exception:
                continue

        print(f"🆕 Số công thức mới cần xử lý trong phiên này: {len(candidates)}")
        if not candidates:
            print("✨ Toàn bộ công thức đều đã được xử lý. Không có món mới!")
            return

        # 2. Tiền xử lý & Level 1 Dedup
        print("\n🔹 GIAI ĐOẠN 1: Chuẩn hóa tiêu đề & Khử trùng lặp mức 1...")
        valid_items = []
        dropped_no_quantity = 0

        for r in candidates:
            raw_ings = r.get("ingredients") or []
            parsed_ings = [IngredientParser.parse_raw_line(line) for line in raw_ings]

            # Loại bỏ ngay công thức không có định lượng số
            if not any(i["raw_amount"] is not None for i in parsed_ings):
                dropped_no_quantity += 1
                continue

            method = r.get("cooking_method") or "other"
            cleaned_t = TitleCleaner.clean(r["title"])
            servings = ServingEstimator.estimate(r.get("servings"), parsed_ings, method)
            q_score = QualityScorer.score(r, parsed_ings)

            valid_items.append({
                "raw_recipe": r,
                "cleaned_title": cleaned_t,
                "cooking_method": method,
                "detected_servings": servings,
                "quality_score": q_score
            })

        print(f"   - Loại bỏ {dropped_no_quantity} công thức thiếu định lượng số.")
        print(f"   - Còn lại {len(valid_items)} công thức hợp lệ.")

        # Gom trùng khớp 100% tiêu đề làm sạch trong cùng cooking_method
        level1_groups = defaultdict(list)
        for it in valid_items:
            key = (it["cooking_method"], it["cleaned_title"].lower())
            level1_groups[key].append(it)

        after_level1 = []
        l1_dups_count = 0
        for _, group in level1_groups.items():
            group.sort(key=lambda x: x["quality_score"], reverse=True)
            best = group[0]
            after_level1.append(best)
            l1_dups_count += (len(group) - 1)

        print(f"   - Khử lặp mức 1 đã loại bỏ: {l1_dups_count} công thức trùng tên 100%.")
        print(f"   - Số công thức chuyển sang mức 2: {len(after_level1)}")

        # 3. Level 2 Deep Dedup (Fuzzy Clustering 85%) & Chuẩn hóa 1 suất
        print("\n🔹 GIAI ĐOẠN 2: Khử trùng lặp sâu (Fuzzy 85%) & Quy đổi 1 suất ăn...")
        by_method = defaultdict(list)
        for it in after_level1:
            by_method[it["cooking_method"]].append(it)

        canonical_results = []
        l2_dups_count = 0

        for method, items in by_method.items():
            items.sort(key=lambda x: x["quality_score"], reverse=True)
            clusters = []

            for it in items:
                matched_cl = None
                for cl in clusters:
                    rep = cl["rep"]
                    # Token sort ratio so sánh
                    s1 = " ".join(sorted(it["cleaned_title"].lower().split()))
                    s2 = " ".join(sorted(rep["cleaned_title"].lower().split()))
                    ratio = SequenceMatcher(None, s1, s2).ratio()
                    if ratio >= SIMILARITY_THRESHOLD:
                        matched_cl = cl
                        break

                if matched_cl is not None:
                    matched_cl["members"].append(it["raw_recipe"].get("recipe_id"))
                    l2_dups_count += 1
                else:
                    clusters.append({
                        "rep": it,
                        "members": [it["raw_recipe"].get("recipe_id")]
                    })

            for cl in clusters:
                best_item = cl["rep"]
                canonical_results.append(best_item)

        print(f"   - Khử lặp sâu mức 2 đã loại bỏ: {l2_dups_count} công thức tương tự.")
        print(f"   - Tổng số món ăn chuẩn hóa cuối cùng: {len(canonical_results)}")

        # 4. Chuyển đổi định dạng y hệt raw data & Lưu vào processed/
        print("\n🔹 GIAI ĐOẠN 3: Lưu trữ theo cấu trúc thư mục processed/...")
        saved_count = 0
        catalog_entries = []

        for item in canonical_results:
            raw = item["raw_recipe"]
            method = item["cooking_method"]
            servings = item["detected_servings"]
            cleaned_title = item["cleaned_title"]

            # Bẻ danh sách nguyên liệu về 1 suất
            raw_ings = raw.get("ingredients") or []
            normalized_ings = [
                IngredientParser.scale_and_format_line(line, servings)
                for line in raw_ings
            ]

            # Làm mượt các bước nấu
            raw_steps = raw.get("steps") or []
            sanitized_steps = []
            for st in raw_steps:
                sanitized_steps.append({
                    "step": st.get("step"),
                    "text": StepSanitizer.sanitize(st.get("text") or ""),
                    "image": st.get("image")
                })

            # Xác định vai trò món ăn trong mâm cơm (dish_type)
            dish_type = DishTypeClassifier.classify(cleaned_title, method)

            # Định dạng y hệt raw data, chỉ thay đổi các trường đã chuẩn hóa
            processed_data = {
                "recipe_id": raw.get("recipe_id"),
                "dish_type": dish_type,
                "cooking_method": method,
                "title": cleaned_title,
                "cook_time": raw.get("cook_time"),
                "servings": "1 phần ăn",
                "image": raw.get("image"),
                "source_url": raw.get("source_url"),
                "ingredients": normalized_ings,
                "steps": sanitized_steps
            }

            # Thư mục đích
            target_method_dir = self.processed_dir / method
            target_method_dir.mkdir(parents=True, exist_ok=True)
            target_file = target_method_dir / f"{raw.get('recipe_id')}.json"

            with open(target_file, "w", encoding="utf-8") as fp:
                json.dump(processed_data, fp, ensure_ascii=False, indent=2)

            saved_count += 1
            # Đường dẫn tương đối chuẩn từ gốc dự án
            rel_path = f"data/recipes/processed/{method}/{raw.get('recipe_id')}.json"
            catalog_entries.append({
                "recipe_id": raw.get("recipe_id"),
                "dish_type": dish_type,
                "title": cleaned_title,
                "cooking_method": method,
                "relative_path": rel_path
            })

        # Thu thập toàn bộ ID thô đã được xử lý (cả món được chọn và món trùng lặp đã gộp)
        all_handled_ids = list(already_processed_ids | {r.get('recipe_id') for r in candidates if r.get('recipe_id')})

        # Ghi file catalog tương đối
        catalog_data = {
            "total_canonical_recipes": len(canonical_results),
            "similarity_threshold": SIMILARITY_THRESHOLD,
            "all_handled_raw_ids": all_handled_ids,
            "recipes": catalog_entries
        }
        with open(self.catalog_file, "w", encoding="utf-8") as fp:
            json.dump(catalog_data, fp, ensure_ascii=False, indent=2)

        # In báo cáo thống kê trực tiếp ra Terminal (không tạo thêm file thừa)
        dish_type_counts = defaultdict(int)
        for c in catalog_entries:
            dish_type_counts[c["dish_type"]] += 1

        print("\n" + "=" * 70)
        print("🎉 HOÀN THÀNH TOÀN BỘ PIPELINE XỬ LÝ DỮ LIỆU CHUẨN!")
        print(f"💾 Đã lưu {saved_count} món ăn vào: data/recipes/processed/<cooking_method>/")
        print(f"📋 File mục lục tương đối: data/recipes/processed/catalog.json")
        print("\n📊 Phân bổ theo vai trò món ăn (dish_type):")
        for dt, count in sorted(dish_type_counts.items(), key=lambda x: -x[1]):
            print(f"   • {dt:20}: {count:4} món ({count/saved_count*100:.1f}%)")
        print("=" * 70)


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="DailyMeal Recipe Data Processing Pipeline")
    parser.add_argument("--force", action="store_true", help="Chạy lại toàn bộ, ghi đè tất cả các món đã xử lý")
    args = parser.parse_args()

    pipeline = RecipePipeline()
    pipeline.run(force_all=args.force)
